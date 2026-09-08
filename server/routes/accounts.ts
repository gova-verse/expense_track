import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { db } from '@/db'
import { accounts, transactions } from '@/db/schema'
import { eq, sql, or, and } from 'drizzle-orm'
import { insertAccountSchema, updateAccountSchema } from '@/lib/validations'
import { authMiddleware } from '../middleware/auth'

type Variables = { userId: number }

const app = new Hono<{ Variables: Variables }>()

app.use('*', authMiddleware)

// GET /api/accounts
app.get('/', async (c) => {
  const userId = c.get('userId')
  const data = await db
    .select()
    .from(accounts)
    .where(eq(accounts.userId, userId))
    .orderBy(accounts.name)
  return c.json(data)
})

// GET /api/accounts/with-balance
app.get('/with-balance', async (c) => {
  const userId = c.get('userId')

  const accountsData = await db
    .select()
    .from(accounts)
    .where(eq(accounts.userId, userId))
    .orderBy(accounts.name)

  const balanceAggs = await db
    .select({
      accountId: transactions.accountId,
      totalIncome: sql<string>`COALESCE(SUM(CASE WHEN ${transactions.type} = 'income' THEN ${transactions.amount} ELSE 0 END), '0')`,
      totalExpense: sql<string>`COALESCE(SUM(CASE WHEN ${transactions.type} = 'expense' THEN ${transactions.amount} ELSE 0 END), '0')`,
      totalOutgoingTransfers: sql<string>`COALESCE(SUM(CASE WHEN ${transactions.type} = 'transfer' THEN ${transactions.amount} ELSE 0 END), '0')`,
    })
    .from(transactions)
    .where(and(sql`${transactions.accountId} IS NOT NULL`, eq(transactions.userId, userId)))
    .groupBy(transactions.accountId)

  const incomingTransferAggs = await db
    .select({
      destinationAccountId: transactions.destinationAccountId,
      totalIncomingTransfers: sql<string>`COALESCE(SUM(${transactions.amount}), '0')`,
    })
    .from(transactions)
    .where(
      and(
        sql`${transactions.type} = 'transfer' AND ${transactions.destinationAccountId} IS NOT NULL`,
        eq(transactions.userId, userId)
      )
    )
    .groupBy(transactions.destinationAccountId)

  const result = accountsData.map((acc) => {
    const agg = balanceAggs.find((a) => a.accountId === acc.id)
    const incomingAgg = incomingTransferAggs.find((a) => a.destinationAccountId === acc.id)
    const openingBal = parseFloat(acc.openingBalance)
    let currentBalance = openingBal

    if (agg) {
      currentBalance += parseFloat(agg.totalIncome)
      currentBalance -= parseFloat(agg.totalExpense)
      currentBalance -= parseFloat(agg.totalOutgoingTransfers)
    }
    if (incomingAgg) {
      currentBalance += parseFloat(incomingAgg.totalIncomingTransfers)
    }

    return { ...acc, currentBalance }
  })

  return c.json(result)
})

// POST /api/accounts
app.post('/', zValidator('json', insertAccountSchema), async (c) => {
  const userId = c.get('userId')
  const body = c.req.valid('json')

  await db.insert(accounts).values({
    ...body,
    openingBalance: body.openingBalance.toString(),
    userId,
  })

  return c.json({ success: true }, 201)
})

// PUT /api/accounts/:id
app.put('/:id', zValidator('json', updateAccountSchema), async (c) => {
  const userId = c.get('userId')
  const id = Number(c.req.param('id'))
  const body = c.req.valid('json')

  const existing = await db
    .select()
    .from(accounts)
    .where(and(eq(accounts.id, id), eq(accounts.userId, userId)))
    .limit(1)

  if (existing.length === 0) {
    return c.json({ success: false, error: 'Account not found.' }, 404)
  }

  await db
    .update(accounts)
    .set({
      ...body,
      openingBalance: body.openingBalance !== undefined ? body.openingBalance.toString() : undefined,
      updatedAt: new Date(),
    })
    .where(eq(accounts.id, id))

  return c.json({ success: true })
})

// DELETE /api/accounts/:id
app.delete('/:id', async (c) => {
  const userId = c.get('userId')
  const id = Number(c.req.param('id'))

  const existing = await db
    .select()
    .from(accounts)
    .where(and(eq(accounts.id, id), eq(accounts.userId, userId)))
    .limit(1)

  if (existing.length === 0) {
    return c.json({ success: false, error: 'Account not found.' }, 404)
  }

  const referencedTx = await db
    .select()
    .from(transactions)
    .where(or(eq(transactions.accountId, id), eq(transactions.destinationAccountId, id)))
    .limit(1)

  if (referencedTx.length > 0) {
    return c.json({ success: false, error: 'Cannot delete account that contains transactions.' }, 409)
  }

  await db.delete(accounts).where(eq(accounts.id, id))

  return c.json({ success: true })
})

export { app as accounts }
