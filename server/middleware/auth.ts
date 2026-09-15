import { createMiddleware } from 'hono/factory'
import { auth } from '@/lib/auth'
import { fromNodeHeaders } from 'better-auth/node'
import type { Context } from 'hono'

/**
 * Better Auth session middleware for Hono.
 * Validates the session via Better Auth and injects the `user` object into context.
 * Returns 401 if the session is missing or invalid.
 */
export const authMiddleware = createMiddleware<{ Variables: { user: any } }>(
  async (c, next) => {
    const session = await auth.api.getSession({
      headers: c.req.raw.headers,
    })

    if (!session?.user) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    c.set('user', session.user)
    await next()
  }
)
