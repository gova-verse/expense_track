import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { db } from '@/db'
import { transactions, accounts } from '@/db/schema'
import { eq, sql, and } from 'drizzle-orm'
import { insertTransferSchema, updateTransferSchema } from '@/lib/validations'
import { authMiddleware } from '../middleware/auth'
import { checkSufficientBalance, insufficientBalanceError, getAccountBalance } from '../lib/balance'

type Variables = { userId: number }

const app = new Hono<{ Variables: Variables }>()

app.use('*', authMiddleware)

// GET /api/transfers
app.get('/', async (c) => {
  const userId = c.get('userId')

  const data = await db.execute(sql`
    SELECT 
      t.id,
      t.type,
      t.amount,
      t.date,
      t.description,
      t.notes,
      t.account_id as "accountId",
      sa.name as "accountName",
      t.destination_account_id as "destinationAccountId",
      da.name as "destinationAccountName",
      t.created_at as "createdAt"
    FROM transactions t
    LEFT JOIN accounts sa ON t.account_id = sa.id
    LEFT JOIN accounts da ON t.destination_account_id = da.id
    WHERE t.type = 'transfer' AND t.user_id = ${userId}
    ORDER BY t.date DESC, t.created_at DESC
  `)

  return c.json(data.rows)
})

// POST /api/transfers
app.post('/', zValidator('json', insertTransferSchema), async (c) => {
  const userId = c.get('userId')
  const { amount, date, accountId, destinationAccountId, description, notes } = c.req.valid('json')

  const sourceAccount = await db
    .select()
    .from(accounts)
    .where(and(eq(accounts.id, accountId), eq(accounts.userId, userId)))
    .limit(1)
  if (sourceAccount.length === 0) {
    return c.json({ success: false, error: 'Source account not found.' }, 404)
  }

  const destAccount = await db
    .select()
    .from(accounts)
    .where(and(eq(accounts.id, destinationAccountId), eq(accounts.userId, userId)))
    .limit(1)
  if (destAccount.length === 0) {
    return c.json({ success: false, error: 'Destination account not found.' }, 404)
  }

  // Balance check — skips credit card accounts
  const balanceCheck = await checkSufficientBalance(accountId, amount)
  if (!balanceCheck.ok) {
    return c.json({ success: false, error: insufficientBalanceError(balanceCheck.available, balanceCheck.accountName) }, 400)
  }

  await db.insert(transactions).values({
    type: 'transfer',
    amount: amount.toString(),
    date: new Date(date),
    description,
    accountId,
    destinationAccountId,
    notes,
    userId,
  })

  return c.json({ success: true }, 201)
})

// PUT /api/transfers/:id
app.put('/:id', zValidator('json', updateTransferSchema), async (c) => {
  const userId = c.get('userId')
  const id = Number(c.req.param('id'))
  const body = c.req.valid('json')

  const existingTx = await db
    .select()
    .from(transactions)
    .where(and(eq(transactions.id, id), eq(transactions.type, 'transfer'), eq(transactions.userId, userId)))
    .limit(1)

  if (existingTx.length === 0) {
    return c.json({ success: false, error: 'Transfer not found.' }, 404)
  }

  const existing = existingTx[0]
  const newAccountId = body.accountId ?? existing.accountId
  const newDestAccountId = body.destinationAccountId ?? existing.destinationAccountId
  const newAmount = body.amount ?? parseFloat(existing.amount)

  if (newAccountId === newDestAccountId) {
    return c.json({ success: false, error: 'Source and destination accounts must be different.' }, 400)
  }

  if (newAccountId) {
    const sourceAccount = await db
      .select()
      .from(accounts)
      .where(and(eq(accounts.id, newAccountId), eq(accounts.userId, userId)))
      .limit(1)
    if (sourceAccount.length === 0) {
      return c.json({ success: false, error: 'Source account not found.' }, 404)
    }
  }

  if (newDestAccountId) {
    const destAccount = await db
      .select()
      .from(accounts)
      .where(and(eq(accounts.id, newDestAccountId), eq(accounts.userId, userId)))
      .limit(1)
    if (destAccount.length === 0) {
      return c.json({ success: false, error: 'Destination account not found.' }, 404)
    }
  }

  if (newAccountId) {
    const currentSourceBalance = await getAccountBalance(newAccountId)
    let adjustedBalance = currentSourceBalance
    if (existing.accountId === newAccountId) {
      adjustedBalance += parseFloat(existing.amount)
    }
    // Use the shared check (skips credit accounts)
    const sourceAcc = await db.select().from(accounts).where(eq(accounts.id, newAccountId)).limit(1)
    const isStrict = sourceAcc.length > 0 && ['cash', 'bank', 'wallet', 'savings'].includes(sourceAcc[0].type)
    if (isStrict && adjustedBalance < newAmount) {
      return c.json(
        {
          success: false,
          error: insufficientBalanceError(adjustedBalance, sourceAcc[0].name),
        },
        400
      )
    }
  }

  await db
    .update(transactions)
    .set({
      amount: body.amount !== undefined ? body.amount.toString() : undefined,
      date: body.date ? new Date(body.date) : undefined,
      accountId: body.accountId,
      destinationAccountId: body.destinationAccountId,
      description: body.description,
      notes: body.notes,
      updatedAt: new Date(),
    })
    .where(eq(transactions.id, id))

  return c.json({ success: true })
})

// DELETE /api/transfers/:id
app.delete('/:id', async (c) => {
  const userId = c.get('userId')
  const id = Number(c.req.param('id'))

  const existingTx = await db
    .select()
    .from(transactions)
    .where(and(eq(transactions.id, id), eq(transactions.type, 'transfer'), eq(transactions.userId, userId)))
    .limit(1)

  if (existingTx.length === 0) {
    return c.json({ success: false, error: 'Transfer not found.' }, 404)
  }

  await db.delete(transactions).where(eq(transactions.id, id))

  return c.json({ success: true })
})

export { app as transfers }
