import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { db } from '@/db'
import { categories, transactions } from '@/db/schema'
import { eq, and, count, or, sql } from 'drizzle-orm'
import { insertCategorySchema, updateCategorySchema } from '@/lib/validations'

const app = new Hono<{ Variables: { user: any } }>()

// GET /api/categories          → all categories for the user
// GET /api/categories?type=expense|income → filtered
app.get('/', async (c) => {
  const user = c.get('user') as any
  const userId = user.id
  const type = c.req.query('type') as 'expense' | 'income' | undefined

  if (type && type !== 'expense' && type !== 'income') {
    return c.json({ error: 'type must be "expense" or "income"' }, 400)
  }

  const whereClause = type
    ? and(
        eq(categories.type, type),
        or(eq(categories.userId, userId), sql`${categories.userId} IS NULL`)
      )
    : or(eq(categories.userId, userId), sql`${categories.userId} IS NULL`)

  const data = await db
    .select()
    .from(categories)
    .where(whereClause)
    .orderBy(categories.id)

  return c.json(data)
})

// POST /api/categories
app.post('/', zValidator('json', insertCategorySchema), async (c) => {
  const user = c.get('user') as any
  const userId = user.id
  const { name, type, icon, color, isDefault } = c.req.valid('json')

  // Check for duplicate name within the same type
  const existing = await db
    .select()
    .from(categories)
    .where(and(eq(categories.name, name), eq(categories.type, type), eq(categories.userId, userId)))
    .limit(1)

  if (existing.length > 0) {
    return c.json({ success: false, error: `A ${type} category named "${name}" already exists.` }, 409)
  }

  await db.insert(categories).values({
    name,
    type,
    icon,
    color,
    isDefault: isDefault ?? false,
    userId,
  })

  return c.json({ success: true }, 201)
})

// PUT /api/categories/:id
app.put('/:id', zValidator('json', updateCategorySchema), async (c) => {
  const user = c.get('user') as any
  const userId = user.id
  const id = Number(c.req.param('id'))
  const body = c.req.valid('json')

  const existingCategory = await db
    .select()
    .from(categories)
    .where(and(eq(categories.id, id), eq(categories.userId, userId)))
    .limit(1)

  if (existingCategory.length === 0) {
    return c.json({ success: false, error: 'Category not found or cannot be modified.' }, 404)
  }

  const type = body.type || existingCategory[0].type
  const name = body.name || existingCategory[0].name

  // Check duplicate
  const duplicate = await db
    .select()
    .from(categories)
    .where(and(eq(categories.name, name), eq(categories.type, type), eq(categories.userId, userId)))
    .limit(1)

  if (duplicate.length > 0 && duplicate[0].id !== id) {
    return c.json({ success: false, error: `A ${type} category named "${name}" already exists.` }, 409)
  }

  await db
    .update(categories)
    .set({ ...body, updatedAt: new Date() })
    .where(eq(categories.id, id))

  return c.json({ success: true })
})

// DELETE /api/categories/:id
app.delete('/:id', async (c) => {
  const user = c.get('user') as any
  const userId = user.id
  const id = Number(c.req.param('id'))

  const existingCategory = await db
    .select()
    .from(categories)
    .where(and(eq(categories.id, id), eq(categories.userId, userId)))
    .limit(1)

  if (existingCategory.length === 0) {
    return c.json({ success: false, error: 'Category not found or cannot be deleted.' }, 404)
  }

  const [{ value }] = await db
    .select({ value: count() })
    .from(transactions)
    .where(and(eq(transactions.categoryId, id), eq(transactions.userId, userId)))

  if (value > 0) {
    return c.json({ success: false, error: 'Cannot delete category because it is referenced by transactions.' }, 409)
  }

  await db.delete(categories).where(and(eq(categories.id, id), eq(categories.userId, userId)))

  return c.json({ success: true })
})

export { app as categories }
