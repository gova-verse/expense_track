import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { db } from '@/db'
import { userPreferences, user, budgets, transactions, accounts, categories, session, account } from '@/db/schema'
import { deleteCookie } from 'hono/cookie'

import { eq } from 'drizzle-orm'
import {
  updateProfileSchema,
  notificationPreferencesSchema,
} from '@/lib/validations'
import { z } from 'zod'

const app = new Hono<{ Variables: { user: any } }>()

const settingsSchema = z.object({
  theme: z.string().optional(),
  colorTheme: z.string().optional(),
  currency: z.string().optional(),
  numberFormat: z.string().optional(),
  dateFormat: z.string().optional(),
  timezone: z.string().optional(),
})

// Helper: get or create preferences for the current user
async function getOrCreatePreferences(userId: string) {
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
  const cUser = c.get('user') as any
  const userId = cUser.id

  const result = await db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      emailVerifiedAt: user.emailVerified,
      createdAt: user.createdAt,
    })
    .from(user)
    .where(eq(user.id, userId))
    .limit(1)

  if (result.length === 0) return c.json({ error: 'User not found' }, 404)
  return c.json(result[0])
})

// GET /api/settings/preferences
app.get('/preferences', async (c) => {
  const cUser = c.get('user') as any
  const userId = cUser.id
  const prefs = await getOrCreatePreferences(userId)
  return c.json(prefs)
})

// PATCH /api/settings/preferences
app.patch('/preferences', zValidator('json', settingsSchema), async (c) => {
  const cUser = c.get('user') as any
  const userId = cUser.id
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
  const cUser = c.get('user') as any
  const userId = cUser.id
  const { name } = c.req.valid('json')

  await db.update(user).set({ name, updatedAt: new Date() }).where(eq(user.id, userId))

  return c.json({ success: true })
})

// POST /api/settings/change-password
// With better-auth, password management should ideally be done through authClient.changePassword
// We leave this returning an error instructing the client to use Better Auth.
app.post('/change-password', async (c) => {
  return c.json({ success: false, error: 'Password changes are now managed by Better Auth. Please update the client to use authClient.changePassword().' }, 400)
})

// PATCH /api/settings/notifications
app.patch(
  '/notifications',
  zValidator('json', notificationPreferencesSchema),
  async (c) => {
    const cUser = c.get('user') as any
    const userId = cUser.id
    const body = c.req.valid('json')

    const prefs = await getOrCreatePreferences(userId)

    await db
      .update(userPreferences)
      .set({ ...body, updatedAt: new Date() })
      .where(eq(userPreferences.id, prefs.id))

    return c.json({ success: true })
  }
)

// DELETE /api/settings/account - permanently delete the user's account and all data
app.delete('/account', async (c) => {
  const cUser = c.get('user') as any
  const userId = cUser.id

  // Delete in order to respect foreign key constraints
  await db.delete(userPreferences).where(eq(userPreferences.userId, userId))
  await db.delete(budgets).where(eq(budgets.userId, userId))
  await db.delete(transactions).where(eq(transactions.userId, userId))
  await db.delete(accounts).where(eq(accounts.userId, userId))
  await db.delete(categories).where(eq(categories.userId, userId))
  
  // Delete Better Auth specific tables for the user
  await db.delete(session).where(eq(session.userId, userId))
  await db.delete(account).where(eq(account.userId, userId))
  
  await db.delete(user).where(eq(user.id, userId))
  
  return c.json({ success: true })
})

export { app as settings }
