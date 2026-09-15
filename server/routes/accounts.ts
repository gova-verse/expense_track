import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { db } from '@/db'
import { accounts, transactions } from '@/db/schema'
import { eq, sql, or, and, getTableColumns } from 'drizzle-orm'
import { insertAccountSchema, updateAccountSchema } from '@/lib/validations'

const app = new Hono<{ Variables: { user: any } }>()


app.get('/', async (c) => {
  const user = c.get('user') as any
  const userId = user.id
  const data = await db
    .select()
    .from(accounts)
    .where(eq(accounts.userId, userId))
    .orderBy(accounts.name)
  return c.json(data)
})


app.get('/with-balance', async (c) => {
  const user = c.get('user') as any
  const userId = user.id

  const accountsWithBalance = await db
    .select({
      ...getTableColumns(accounts),
      balance: sql<number>`COALESCE(SUM(
        CASE WHEN ${transactions.type} = 'income' THEN ${transactions.amount} 
             WHEN ${transactions.type} = 'expense' THEN -${transactions.amount} 
             WHEN ${transactions.type} = 'transfer' AND ${transactions.accountId} = ${accounts.id} THEN -${transactions.amount} 
             WHEN ${transactions.type} = 'transfer' AND ${transactions.destinationAccountId} = ${accounts.id} THEN ${transactions.amount} 
             ELSE 0 END
      ), 0)`,
    })
    .from(accounts)
    .leftJoin(transactions, or(eq(accounts.id, transactions.accountId), eq(accounts.id, transactions.destinationAccountId)))
    .where(eq(accounts.userId, userId))
    .groupBy(accounts.id)

  const result = accountsWithBalance.map((acc) => {
    return { ...acc, currentBalance: parseFloat(acc.openingBalance) + Number(acc.balance) }
  })

  return c.json(result)
})


app.post('/', zValidator('json', insertAccountSchema), async (c) => {
  const user = c.get('user') as any
  const userId = user.id
  const body = c.req.valid('json')

  await db.insert(accounts).values({
    ...body,
    openingBalance: body.openingBalance.toString(),
    userId,
  })

  return c.json({ success: true }, 201)
})


app.put('/:id', zValidator('json', updateAccountSchema), async (c) => {
  const user = c.get('user') as any
  const userId = user.id
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


app.delete('/:id', async (c) => {
  const user = c.get('user') as any
  const userId = user.id
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
