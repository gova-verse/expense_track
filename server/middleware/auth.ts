import { createMiddleware } from 'hono/factory'
import { auth } from '@/lib/auth'
import { fromNodeHeaders } from 'better-auth/node'
import type { Context } from 'hono'

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
