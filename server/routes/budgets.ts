import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { db } from '@/db'
import { budgets, transactions, categories } from '@/db/schema'
import { eq, and, gte, lte, sql, or } from 'drizzle-orm'
import { authMiddleware } from '../middleware/auth'
import {
  budgetSchema,
  type BudgetInput,
  getActivePeriodRange,
  calculateBudgetMetrics,
  type BudgetPeriod,
} from '@/lib/budget-utils'
import { z } from 'zod'

type Variables = { userId: number }

const app = new Hono<{ Variables: Variables }>()

app.use('*', authMiddleware)

// GET /api/budgets
app.get('/', async (c) => {
  const userId = c.get('userId')

  const allBudgets = await db
    .select({
      id: budgets.id,
      name: budgets.name,
      amount: budgets.amount,
      period: budgets.period,
      categoryId: budgets.categoryId,
      categoryName: categories.name,
      categoryIcon: categories.icon,
      categoryColor: categories.color,
      startDate: budgets.startDate,
    })
    .from(budgets)
    .leftJoin(categories, eq(budgets.categoryId, categories.id))
    .where(eq(budgets.userId, userId))
    .orderBy(budgets.createdAt)

  const results = await Promise.all(
    allBudgets.map(async (b) => {
      const { from, to } = getActivePeriodRange(b.period as BudgetPeriod)

      const conditions = [
        eq(transactions.type, 'expense'),
        gte(transactions.date, from),
        lte(transactions.date, to),
        eq(transactions.userId, userId),
      ] as Parameters<typeof and>

      if (b.categoryId) {
        conditions.push(eq(transactions.categoryId, b.categoryId))
      }

      const [{ spent }] = await db
        .select({
          spent: sql<number>`COALESCE(SUM(${transactions.amount}), 0)`,
        })
        .from(transactions)
        .where(and(...conditions))

      const metrics = calculateBudgetMetrics(Number(b.amount), Number(spent))

      return {
        ...b,
        amount: Number(b.amount),
        spent: metrics.spent,
        remaining: metrics.remaining,
        usage: metrics.usage,
        status: metrics.status,
        activeFrom: from,
        activeTo: to,
      }
    })
  )

  return c.json(results)
})

// POST /api/budgets
app.post('/', zValidator('json', budgetSchema), async (c) => {
  const userId = c.get('userId')
  const parsed = c.req.valid('json')

  if (parsed.categoryId) {
    const [cat] = await db
      .select({ type: categories.type })
      .from(categories)
      .where(
        and(
          eq(categories.id, parsed.categoryId),
          or(eq(categories.userId, userId), sql`${categories.userId} IS NULL`)
        )
      )
    if (!cat || cat.type !== 'expense') {
      return c.json({ success: false, error: 'Category must be a valid expense category.' }, 400)
    }
  }

  await db.insert(budgets).values({
    name: parsed.name,
    amount: parsed.amount.toString(),
    period: parsed.period,
    categoryId: parsed.categoryId || null,
    startDate: new Date(),
    userId,
  })

  return c.json({ success: true }, 201)
})

// PUT /api/budgets/:id
app.put('/:id', zValidator('json', budgetSchema), async (c) => {
  const userId = c.get('userId')
  const id = Number(c.req.param('id'))
  const parsed = c.req.valid('json')

  if (parsed.categoryId) {
    const [cat] = await db
      .select({ type: categories.type })
      .from(categories)
      .where(
        and(
          eq(categories.id, parsed.categoryId),
          or(eq(categories.userId, userId), sql`${categories.userId} IS NULL`)
        )
      )
    if (!cat || cat.type !== 'expense') {
      return c.json({ success: false, error: 'Category must be a valid expense category.' }, 400)
    }
  }

  await db
    .update(budgets)
    .set({
      name: parsed.name,
      amount: parsed.amount.toString(),
      period: parsed.period,
      categoryId: parsed.categoryId || null,
      updatedAt: new Date(),
    })
    .where(and(eq(budgets.id, id), eq(budgets.userId, userId)))

  return c.json({ success: true })
})

// DELETE /api/budgets/:id
app.delete('/:id', async (c) => {
  const userId = c.get('userId')
  const id = Number(c.req.param('id'))

  await db.delete(budgets).where(and(eq(budgets.id, id), eq(budgets.userId, userId)))

  return c.json({ success: true })
})

export { app as budgets }
