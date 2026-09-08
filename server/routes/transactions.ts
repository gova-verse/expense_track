import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { db } from '@/db'
import { transactions, categories, accounts } from '@/db/schema'
import { eq, desc, sql, and, or } from 'drizzle-orm'
import { insertTransactionSchema, updateTransactionSchema } from '@/lib/validations'
import { authMiddleware } from '../middleware/auth'
import { checkSufficientBalance, insufficientBalanceError } from '../lib/balance'
import { z } from 'zod'

type Variables = { userId: number }

const app = new Hono<{ Variables: Variables }>()

// Apply auth to all routes
app.use('*', authMiddleware)

// GET /api/transactions
app.get('/', async (c) => {
  const userId = c.get('userId')

  const data = await db.execute(sql`
    SELECT 
      t.id,
      t.type,
      t.amount,
      t.date,
      t.description,
      t.payment_method as "paymentMethod",
      t.notes,
      t.category_id as "categoryId",
      c.name as "categoryName",
      c.icon as "categoryIcon",
      c.color as "categoryColor",
      t.account_id as "accountId",
      sa.name as "accountName",
      t.destination_account_id as "destinationAccountId",
      da.name as "destinationAccountName"
    FROM transactions t
    LEFT JOIN categories c ON t.category_id = c.id
    LEFT JOIN accounts sa ON t.account_id = sa.id
    LEFT JOIN accounts da ON t.destination_account_id = da.id
    WHERE t.user_id = ${userId}
    ORDER BY t.date DESC, t.created_at DESC
  `)

  return c.json(data.rows)
})

// GET /api/transactions/recent?limit=5
app.get('/recent', async (c) => {
  const userId = c.get('userId')
  const limit = Number(c.req.query('limit') ?? '5')

  const data = await db.execute(sql`
    SELECT 
      t.id,
      t.type,
      t.amount,
      t.date,
      t.description,
      t.payment_method as "paymentMethod",
      t.category_id as "categoryId",
      c.name as "categoryName",
      c.icon as "categoryIcon",
      c.color as "categoryColor",
      t.account_id as "accountId",
      sa.name as "accountName",
      t.destination_account_id as "destinationAccountId",
      da.name as "destinationAccountName"
    FROM transactions t
    LEFT JOIN categories c ON t.category_id = c.id
    LEFT JOIN accounts sa ON t.account_id = sa.id
    LEFT JOIN accounts da ON t.destination_account_id = da.id
    WHERE t.user_id = ${userId}
    ORDER BY t.date DESC, t.created_at DESC
    LIMIT ${limit}
  `)

  return c.json(data.rows)
})

// POST /api/transactions
app.post('/', zValidator('json', insertTransactionSchema), async (c) => {
  const userId = c.get('userId')
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
  const userId = c.get('userId')
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
    // If the account is the same, add back old amount to get true available balance
    let adjustedAmount = finalAmount
    if (existingTx[0].accountId === finalAccountId && existingTx[0].type === 'expense') {
      // The old expense is already deducted from the balance, so we only need to check the delta
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
  const userId = c.get('userId')
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
