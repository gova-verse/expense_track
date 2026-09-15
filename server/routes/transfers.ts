import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { db } from '@/db'
import { transactions, accounts } from '@/db/schema'
import { eq, desc, and } from 'drizzle-orm'
import { insertTransferSchema, updateTransferSchema } from '@/lib/validations'
import { checkSufficientBalance, insufficientBalanceError, getAccountBalance } from '../lib/balance'

const app = new Hono<{ Variables: { user: any } }>()


app.get('/', async (c) => {
  const user = c.get('user') as any
  const userId = user.id

  const data = await db.query.transactions.findMany({
    where: and(
      eq(transactions.type, 'transfer'),
      eq(transactions.userId, userId)
    ),
    with: {
      account: { columns: { name: true, type: true } },
      destinationAccount: { columns: { name: true, type: true } },
    },
    orderBy: [desc(transactions.date), desc(transactions.createdAt)],
  })

  return c.json(data)
})


app.post('/', zValidator('json', insertTransferSchema), async (c) => {
  const user = c.get('user') as any
  const userId = user.id
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


app.put('/:id', zValidator('json', updateTransferSchema), async (c) => {
  const user = c.get('user') as any
  const userId = user.id
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


app.delete('/:id', async (c) => {
  const user = c.get('user') as any
  const userId = user.id
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
