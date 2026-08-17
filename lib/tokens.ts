import "server-only"
import crypto from "crypto"
import { db } from "@/db"
import { authTokens } from "@/db/schema"
import { eq, and } from "drizzle-orm"

/**
 * Generate a cryptographically secure random token.
 * Returns a 64-character hex string (32 random bytes).
 */
export function generateToken(): string {
  return crypto.randomBytes(32).toString("hex")
}

/**
 * Hash a raw token using SHA-256.
 * Only the hash is stored in the database.
 */
export function hashToken(rawToken: string): string {
  return crypto.createHash("sha256").update(rawToken).digest("hex")
}

/**
 * Create an auth token for a user.
 * Invalidates any existing tokens of the same type for the user first.
 * Returns the RAW token (to be sent via email). Only the hash is stored.
 */
export async function createAuthToken(
  userId: number,
  type: "email_verification" | "password_reset",
  expiryHours: number
): Promise<string> {
  // Invalidate existing tokens of this type for this user
  await invalidateTokens(userId, type)

  const rawToken = generateToken()
  const tokenHash = hashToken(rawToken)
  const expiresAt = new Date(Date.now() + expiryHours * 60 * 60 * 1000)

  await db.insert(authTokens).values({
    userId,
    tokenHash,
    type,
    expiresAt,
  })

  return rawToken
}

/**
 * Verify an auth token.
 * Returns the userId if valid, null if invalid or expired.
 * Deletes the token after successful verification (single-use).
 */
export async function verifyAuthToken(
  rawToken: string,
  type: "email_verification" | "password_reset"
): Promise<number | null> {
  const tokenHash = hashToken(rawToken)

  const results = await db
    .select()
    .from(authTokens)
    .where(
      and(
        eq(authTokens.tokenHash, tokenHash),
        eq(authTokens.type, type)
      )
    )
    .limit(1)

  if (results.length === 0) {
    return null
  }

  const token = results[0]

  // Check expiration
  if (new Date() > token.expiresAt) {
    // Clean up expired token
    await db.delete(authTokens).where(eq(authTokens.id, token.id))
    return null
  }

  // Delete the token (single-use)
  await db.delete(authTokens).where(eq(authTokens.id, token.id))

  return token.userId
}

/**
 * Invalidate all tokens of a given type for a user.
 */
export async function invalidateTokens(
  userId: number,
  type: "email_verification" | "password_reset"
): Promise<void> {
  await db
    .delete(authTokens)
    .where(
      and(
        eq(authTokens.userId, userId),
        eq(authTokens.type, type)
      )
    )
}
