"use server"

import { db } from "@/db"
import { users, userPreferences } from "@/db/schema"
import { eq } from "drizzle-orm"
import { loginSchema, signupSchema, forgotPasswordSchema, resetPasswordSchema } from "@/lib/validations"
import { createSession, deleteSession } from "@/lib/auth"
import { createAuthToken, verifyAuthToken, invalidateTokens } from "@/lib/tokens"
import { sendVerificationEmail, sendPasswordResetEmail } from "@/lib/email"
import bcrypt from "bcryptjs"
import { z } from "zod"

export async function signup(data: z.infer<typeof signupSchema>) {
  const parsed = signupSchema.safeParse(data)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message }
  }

  const { name, email, password } = parsed.data

  const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1)
  if (existingUser.length > 0) {
    return { success: false, error: "Email is already registered" }
  }

  const hashedPassword = await bcrypt.hash(password, 10)

  const [newUser] = await db.insert(users).values({
    name,
    email,
    password: hashedPassword,
  }).returning({ id: users.id })

  await db.insert(userPreferences).values({
    userId: newUser.id,
  })

  // Generate verification token and send email
  try {
    const token = await createAuthToken(newUser.id, "email_verification", 24)
    await sendVerificationEmail(email, name, token)
  } catch (error) {
    console.error("Failed to send verification email:", error)
    // User is created but email failed — they can resend later
  }

  // Do NOT create a session — user must verify email first
  return { success: true, requiresVerification: true }
}

export async function login(data: z.infer<typeof loginSchema>) {
  const parsed = loginSchema.safeParse(data)
  if (!parsed.success) {
    return { success: false, error: "Invalid credentials" }
  }

  const { email, password } = parsed.data

  const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1)
  if (existingUser.length === 0 || !existingUser[0].password) {
    return { success: false, error: "Invalid email or password" }
  }

  const isPasswordValid = await bcrypt.compare(password, existingUser[0].password)
  if (!isPasswordValid) {
    return { success: false, error: "Invalid email or password" }
  }

  // Check email verification
  if (!existingUser[0].emailVerifiedAt) {
    return {
      success: false,
      error: "Please verify your email before signing in.",
      requiresVerification: true,
      email: existingUser[0].email,
    }
  }

  await createSession(existingUser[0].id)
  return { success: true }
}

export async function logout() {
  await deleteSession()
}

export async function verifyEmail(token: string) {
  if (!token) {
    return { success: false, error: "Invalid verification link." }
  }

  const userId = await verifyAuthToken(token, "email_verification")
  if (!userId) {
    return { success: false, error: "Verification link is invalid or has expired." }
  }

  // Mark email as verified
  await db
    .update(users)
    .set({ emailVerifiedAt: new Date() })
    .where(eq(users.id, userId))

  return { success: true }
}

export async function resendVerification(email: string) {
  if (!email) {
    return { success: false, error: "Email is required." }
  }

  const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1)
  if (existingUser.length === 0) {
    // Do not reveal whether the email exists
    return { success: true }
  }

  const user = existingUser[0]

  // If already verified, no need to resend
  if (user.emailVerifiedAt) {
    return { success: true }
  }

  try {
    const token = await createAuthToken(user.id, "email_verification", 24)
    await sendVerificationEmail(user.email, user.name || "", token)
  } catch (error) {
    console.error("Failed to resend verification email:", error)
    return { success: false, error: "Something went wrong. Please try again." }
  }

  return { success: true }
}

export async function forgotPassword(data: z.infer<typeof forgotPasswordSchema>) {
  const parsed = forgotPasswordSchema.safeParse(data)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message }
  }

  const { email } = parsed.data

  // Always return the same generic message to prevent email enumeration
  const genericResponse = {
    success: true,
    message: "If an account exists for this email address, you\u2019ll receive a password reset link shortly.",
  }

  const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1)
  if (existingUser.length === 0) {
    return genericResponse
  }

  const user = existingUser[0]

  try {
    const token = await createAuthToken(user.id, "password_reset", 1)
    await sendPasswordResetEmail(user.email, user.name || "", token)
  } catch (error) {
    console.error("Failed to send password reset email:", error)
    // Still return generic response to prevent enumeration
  }

  return genericResponse
}

export async function resetPassword(data: z.infer<typeof resetPasswordSchema>) {
  const parsed = resetPasswordSchema.safeParse(data)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message }
  }

  const { token, password } = parsed.data

  const userId = await verifyAuthToken(token, "password_reset")
  if (!userId) {
    return { success: false, error: "Reset link is invalid or has expired." }
  }

  const hashedPassword = await bcrypt.hash(password, 10)

  await db
    .update(users)
    .set({ password: hashedPassword, updatedAt: new Date() })
    .where(eq(users.id, userId))

  // Invalidate any remaining password reset tokens for this user
  await invalidateTokens(userId, "password_reset")

  return { success: true }
}
