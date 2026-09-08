import { createMiddleware } from 'hono/factory'
import { jwtVerify } from 'jose'
import { getCookie } from 'hono/cookie'

const secretKey = process.env.JWT_SECRET || 'default_super_secret_key_change_me_in_prod'
const key = new TextEncoder().encode(secretKey)

// Extend Hono context variables
type AuthVariables = {
  userId: number
}

/**
 * Verifies the session JWT cookie and injects `userId` into the Hono context.
 * Returns 401 if the session is missing or invalid.
 */
export const authMiddleware = createMiddleware<{ Variables: AuthVariables }>(
  async (c, next) => {
    const sessionCookie = getCookie(c, 'session')

    if (!sessionCookie) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    try {
      const { payload } = await jwtVerify(sessionCookie, key, {
        algorithms: ['HS256'],
      })

      if (!payload.userId || typeof payload.userId !== 'number') {
        return c.json({ error: 'Unauthorized' }, 401)
      }

      c.set('userId', payload.userId)
      await next()
    } catch {
      return c.json({ error: 'Unauthorized' }, 401)
    }
  }
)
