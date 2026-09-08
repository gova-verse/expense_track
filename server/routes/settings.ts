import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { db } from '@/db'
import { userPreferences, users, authTokens, budgets, transactions, accounts, categories } from '@/db/schema'
import { deleteCookie } from 'hono/cookie'

import { eq } from 'drizzle-orm'
import { authMiddleware } from '../middleware/auth'
import {
  updateProfileSchema,
  changePasswordSchema,
  notificationPreferencesSchema,
} from '@/lib/validations'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

type Variables = { userId: number }

const app = new Hono<{ Variables: Variables }>()

app.use('*', authMiddleware)

const settingsSchema = z.object({
  theme: z.string().optional(),
  colorTheme: z.string().optional(),
  currency: z.string().optional(),
  numberFormat: z.string().optional(),
  dateFormat: z.string().optional(),
  timezone: z.string().optional(),
})

// Helper: get or create preferences for the current user
async function getOrCreatePreferences(userId: number) {
  let prefs = await db
    .select()
    .from(userPreferences)
    .where(eq(userPreferences.userId, userId))
    .limit(1)

  if (prefs.length === 0) {
    const inserted = await db
      .insert(userPreferences)
      .values({
        userId,
        theme: 'system',
        colorTheme: 'default',
        currency: 'INR',
        numberFormat: 'en-IN',
        dateFormat: 'DD/MM/YYYY',
        timezone: 'Asia/Kolkata',
      })
      .returning()
    prefs = inserted
  }

  return prefs[0]
}

// GET /api/settings/me  — authenticated user info
app.get('/me', async (c) => {
  const userId = c.get('userId')

  const result = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      emailVerifiedAt: users.emailVerifiedAt,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)

  if (result.length === 0) return c.json({ error: 'User not found' }, 404)
  return c.json(result[0])
})

// GET /api/settings/preferences
app.get('/preferences', async (c) => {
  const userId = c.get('userId')
  const prefs = await getOrCreatePreferences(userId)
  return c.json(prefs)
})

// PATCH /api/settings/preferences
app.patch('/preferences', zValidator('json', settingsSchema), async (c) => {
  const userId = c.get('userId')
  const body = c.req.valid('json')

  const prefs = await getOrCreatePreferences(userId)

  await db
    .update(userPreferences)
    .set({ ...body, updatedAt: new Date() })
    .where(eq(userPreferences.id, prefs.id))

  return c.json({ success: true })
})

// PATCH /api/settings/profile
app.patch('/profile', zValidator('json', updateProfileSchema), async (c) => {
  const userId = c.get('userId')
  const { name } = c.req.valid('json')

  await db.update(users).set({ name, updatedAt: new Date() }).where(eq(users.id, userId))

  return c.json({ success: true })
})

// POST /api/settings/change-password
app.post('/change-password', zValidator('json', changePasswordSchema), async (c) => {
  const userId = c.get('userId')
  const { currentPassword, newPassword } = c.req.valid('json')

  const userResult = await db.select().from(users).where(eq(users.id, userId)).limit(1)
  if (userResult.length === 0 || !userResult[0].password) {
    return c.json({ success: false, error: 'Something went wrong. Please try again.' }, 500)
  }

  const isValid = await bcrypt.compare(currentPassword, userResult[0].password)
  if (!isValid) {
    return c.json({ success: false, error: 'Current password is incorrect.' }, 400)
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10)
  await db
    .update(users)
    .set({ password: hashedPassword, updatedAt: new Date() })
    .where(eq(users.id, userId))

  return c.json({ success: true })
})

// PATCH /api/settings/notifications
app.patch(
  '/notifications',
  zValidator('json', notificationPreferencesSchema),
  async (c) => {
    const userId = c.get('userId')
    const body = c.req.valid('json')

    const prefs = await getOrCreatePreferences(userId)

    await db
      .update(userPreferences)
      .set({ ...body, updatedAt: new Date() })
      .where(eq(userPreferences.id, prefs.id))

    return c.json({ success: true })
  }
)
//delete api/settings/account-permanently delete the user,s account and all data
app.delete('/account', async (c) => {
  const userId = c.get('userId')

  // Delete in order to respect foreign key constraints
  await db.delete(userPreferences).where(eq(userPreferences.userId, userId))
  await db.delete(authTokens).where(eq(authTokens.userId, userId))
  await db.delete(budgets).where(eq(budgets.userId, userId))
  await db.delete(transactions).where(eq(transactions.userId, userId))
  await db.delete(accounts).where(eq(accounts.userId, userId))
  await db.delete(categories).where(eq(categories.userId, userId))
  await db.delete(users).where(eq(users.id, userId))
  
  deleteCookie(c, 'session', { path: '/' })
  return c.json({ success: true })
})

export { app as settings }
