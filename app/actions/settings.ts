"use server"

import { db } from "@/db"
import { userPreferences, users } from "@/db/schema"
import { eq } from "drizzle-orm"
import { verifySession } from "@/lib/auth"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { updateProfileSchema, changePasswordSchema, notificationPreferencesSchema } from "@/lib/validations"
import bcrypt from "bcryptjs"

const settingsSchema = z.object({
  theme: z.string().optional(),
  colorTheme: z.string().optional(),
  currency: z.string().optional(),
  numberFormat: z.string().optional(),
  dateFormat: z.string().optional(),
  timezone: z.string().optional(),
})

export type SettingsUpdate = z.infer<typeof settingsSchema>

export async function getAuthenticatedUser() {
  const session = await verifySession()
  if (!session) throw new Error("Unauthorized")

  const result = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      emailVerifiedAt: users.emailVerifiedAt,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(eq(users.id, session.userId))
    .limit(1)

  if (result.length === 0) throw new Error("User not found")
  return result[0]
}

export async function getUserPreferences() {
  const session = await verifySession()
  if (!session) throw new Error("Unauthorized")

  let prefs = await db.select().from(userPreferences).where(eq(userPreferences.userId, session.userId)).limit(1)
  
  if (prefs.length === 0) {
    // Create default preferences
    const insertedPrefs = await db.insert(userPreferences).values({
      userId: session.userId,
      theme: 'system',
      colorTheme: 'default',
      currency: 'INR',
      numberFormat: 'en-IN',
      dateFormat: 'DD/MM/YYYY',
      timezone: 'Asia/Kolkata',
    }).returning()
    
    prefs = insertedPrefs
  }
  
  return prefs[0]
}

export async function updateSettings(data: SettingsUpdate) {
  const session = await verifySession()
  if (!session) throw new Error("Unauthorized")

  const prefs = await getUserPreferences()
  
  await db.update(userPreferences)
    .set({
      ...data,
      updatedAt: new Date()
    })
    .where(eq(userPreferences.id, prefs.id))
    
  revalidatePath("/")
  
  return { success: true }
}

export async function updateProfile(data: z.infer<typeof updateProfileSchema>) {
  const session = await verifySession()
  if (!session) throw new Error("Unauthorized")

  const parsed = updateProfileSchema.safeParse(data)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message }
  }

  await db
    .update(users)
    .set({ name: parsed.data.name, updatedAt: new Date() })
    .where(eq(users.id, session.userId))

  revalidatePath("/")
  return { success: true }
}

export async function changePassword(data: z.infer<typeof changePasswordSchema>) {
  const session = await verifySession()
  if (!session) throw new Error("Unauthorized")

  const parsed = changePasswordSchema.safeParse(data)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message }
  }

  const { currentPassword, newPassword } = parsed.data

  // Fetch current user
  const userResult = await db.select().from(users).where(eq(users.id, session.userId)).limit(1)
  if (userResult.length === 0 || !userResult[0].password) {
    return { success: false, error: "Something went wrong. Please try again." }
  }

  // Verify current password
  const isValid = await bcrypt.compare(currentPassword, userResult[0].password)
  if (!isValid) {
    return { success: false, error: "Current password is incorrect." }
  }

  // Hash new password
  const hashedPassword = await bcrypt.hash(newPassword, 10)

  await db
    .update(users)
    .set({ password: hashedPassword, updatedAt: new Date() })
    .where(eq(users.id, session.userId))

  return { success: true }
}

export async function updateNotificationPreferences(data: z.infer<typeof notificationPreferencesSchema>) {
  const session = await verifySession()
  if (!session) throw new Error("Unauthorized")

  const parsed = notificationPreferencesSchema.safeParse(data)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message }
  }

  const prefs = await getUserPreferences()

  await db.update(userPreferences)
    .set({
      ...parsed.data,
      updatedAt: new Date(),
    })
    .where(eq(userPreferences.id, prefs.id))

  revalidatePath("/dashboard/settings/notifications")
  return { success: true }
}
