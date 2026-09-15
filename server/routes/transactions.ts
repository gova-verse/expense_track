import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { db } from '@/db'
import { transactions, categories, accounts } from '@/db/schema'
import { eq, desc, and, or, sql } from 'drizzle-orm'
import { insertTransactionSchema, updateTransactionSchema } from '@/lib/validations'
import { checkSufficientBalance, insufficientBalanceError } from '../lib/balance'

const app = new Hono<{ Variables: { user: any } }>()

// GET /api/transactions
app.get('/', async (c) => {
  const user = c.get('user') as any
  const userId = user.id

  const data = await db.query.transactions.findMany({
    where: eq(transactions.userId, userId),
    with: {
      category: { columns: { name: true, icon: true, color: true } },
      account: { columns: { name: true, type: true } },
      destinationAccount: { columns: { name: true } },
    },
    orderBy: [desc(transactions.date), desc(transactions.createdAt)],
  })

  // Format data to match old shape if necessary, or let frontend handle the nested objects.
  // Phase 5 introduces Shared Types, so frontend will expect nested `category` and `account` objects instead of flattened ones.
  return c.json(data)
})

// GET /api/transactions/recent?limit=5
app.get('/recent', async (c) => {
  const user = c.get('user') as any
  const userId = user.id
  const limit = Number(c.req.query('limit') ?? '5')

  const data = await db.query.transactions.findMany({
    where: eq(transactions.userId, userId),
    with: {
      category: { columns: { name: true, icon: true, color: true } },
      account: { columns: { name: true, type: true } },
      destinationAccount: { columns: { name: true } },
    },
    orderBy: [desc(transactions.date), desc(transactions.createdAt)],
    limit: limit,
  })

  return c.json(data)
})

// POST /api/transactions
app.post('/', zValidator('json', insertTransactionSchema), async (c) => {
  const user = c.get('user') as any
  const userId = user.id
  const body = c.req.valid('json')

  const { type, amount, date, description, categoryId, accountId, destinationAccountId, paymentMethod, notes } = body

  if (type === 'transfer') {
    return c.json({ success: false, error: 'Use /api/transfers for transfer transactions.' }, 400)
  }

  if (!categoryId) {
    return c.json({ success: false, error: 'Category is required.' }, 400)
  }

  const cat = await db
    .select()
    .from(categories)
    .where(and(eq(categories.id, categoryId), or(eq(categories.userId, userId), sql`${categories.userId} IS NULL`)))
    .limit(1)

  if (cat.length === 0) {
    return c.json({ success: false, error: 'Category not found.' }, 404)
  }
  if (cat[0].type !== type) {
    return c.json({ success: false, error: `Cannot use a ${cat[0].type} category for a ${type} transaction.` }, 400)
  }

  // Balance check for expense transactions (non-credit accounts)
  if (type === 'expense' && accountId) {
    const balanceCheck = await checkSufficientBalance(accountId, amount)
    if (!balanceCheck.ok) {
      return c.json({ success: false, error: insufficientBalanceError(balanceCheck.available, balanceCheck.accountName) }, 400)
    }
  }

  await db.insert(transactions).values({
    type,
    amount: amount.toString(),
    date: new Date(date),
    description,
    categoryId,
    accountId,
    destinationAccountId,
    paymentMethod,
    notes,
    userId,
  })

  return c.json({ success: true }, 201)
})

// PUT /api/transactions/:id
app.put('/:id', zValidator('json', updateTransactionSchema), async (c) => {
  const user = c.get('user') as any
  const userId = user.id
  const id = Number(c.req.param('id'))
  const body = c.req.valid('json')

  const existingTx = await db
    .select()
    .from(transactions)
    .where(and(eq(transactions.id, id), eq(transactions.userId, userId)))
    .limit(1)

  if (existingTx.length === 0) {
    return c.json({ success: false, error: 'Transaction not found.' }, 404)
  }

  const type = body.type || existingTx[0].type
  const categoryId = body.categoryId !== undefined ? body.categoryId : existingTx[0].categoryId

  if (type === 'transfer') {
    return c.json({ success: false, error: 'Transfers are not supported here.' }, 400)
  }

  if (categoryId) {
    const cat = await db
      .select()
      .from(categories)
      .where(and(eq(categories.id, categoryId), or(eq(categories.userId, userId), sql`${categories.userId} IS NULL`)))
      .limit(1)
    if (cat.length > 0 && cat[0].type !== type) {
      return c.json({ success: false, error: `Cannot use a ${cat[0].type} category for a ${type} transaction.` }, 400)
    }
  }

  // Balance check for expense transactions when amount or account changed
  const finalType = body.type || existingTx[0].type
  const finalAccountId = body.accountId !== undefined ? body.accountId : existingTx[0].accountId
  const finalAmount = body.amount !== undefined ? body.amount : parseFloat(existingTx[0].amount)

  if (finalType === 'expense' && finalAccountId) {
    let adjustedAmount = finalAmount
    if (existingTx[0].accountId === finalAccountId && existingTx[0].type === 'expense') {
      const oldAmount = parseFloat(existingTx[0].amount)
      adjustedAmount = Math.max(0, finalAmount - oldAmount)
    }
    if (adjustedAmount > 0) {
      const balanceCheck = await checkSufficientBalance(finalAccountId, adjustedAmount)
      if (!balanceCheck.ok) {
        return c.json({ success: false, error: insufficientBalanceError(balanceCheck.available, balanceCheck.accountName) }, 400)
      }
    }
  }

  await db
    .update(transactions)
    .set({
      ...body,
      amount: body.amount !== undefined ? body.amount.toString() : undefined,
      date: body.date ? new Date(body.date) : undefined,
      updatedAt: new Date(),
    })
    .where(eq(transactions.id, id))

  return c.json({ success: true })
})

// DELETE /api/transactions/:id
app.delete('/:id', async (c) => {
  const user = c.get('user') as any
  const userId = user.id
  const id = Number(c.req.param('id'))

  const existingTx = await db
    .select()
    .from(transactions)
    .where(and(eq(transactions.id, id), eq(transactions.userId, userId)))
    .limit(1)

  if (existingTx.length === 0) {
    return c.json({ success: false, error: 'Transaction not found.' }, 404)
  }

  await db.delete(transactions).where(and(eq(transactions.id, id), eq(transactions.userId, userId)))

  return c.json({ success: true })
})

export { app as transactions }
