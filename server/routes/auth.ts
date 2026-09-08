import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { setCookie, deleteCookie } from 'hono/cookie'
import { SignJWT, jwtVerify } from 'jose'
import { db } from '@/db'
import { users, userPreferences } from '@/db/schema'
import { eq } from 'drizzle-orm'
import {
  loginSchema,
  signupSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from '@/lib/validations'
import { createAuthToken, verifyAuthToken, invalidateTokens } from '@/lib/tokens'
import { sendVerificationEmail, sendPasswordResetEmail } from '@/lib/email'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

const secretKey = process.env.JWT_SECRET || 'default_super_secret_key_change_me_in_prod'
const key = new TextEncoder().encode(secretKey)

async function createSessionCookie(userId: number) {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  const token = await new SignJWT({ userId, expiresAt: expiresAt.toISOString() })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(key)
  return { token, expiresAt }
}

const app = new Hono()

// POST /api/auth/signup
app.post('/signup', zValidator('json', signupSchema), async (c) => {
  const { name, email, password } = c.req.valid('json')

  const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1)
  if (existingUser.length > 0) {
    return c.json({ success: false, error: 'Email is already registered' }, 409)
  }

  const hashedPassword = await bcrypt.hash(password, 10)

  const [newUser] = await db
    .insert(users)
    .values({ name, email, password: hashedPassword })
    .returning({ id: users.id })

  await db.insert(userPreferences).values({ userId: newUser.id })

  try {
    const token = await createAuthToken(newUser.id, 'email_verification', 24)
    await sendVerificationEmail(email, name, token)
  } catch (error) {
    console.error('Failed to send verification email:', error)
  }

  return c.json({ success: true, requiresVerification: true }, 201)
})

// POST /api/auth/login
app.post('/login', zValidator('json', loginSchema), async (c) => {
  const { email, password } = c.req.valid('json')

  const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1)
  if (existingUser.length === 0 || !existingUser[0].password) {
    return c.json({ success: false, error: 'Invalid email or password' }, 401)
  }

  const isPasswordValid = await bcrypt.compare(password, existingUser[0].password)
  if (!isPasswordValid) {
    return c.json({ success: false, error: 'Invalid email or password' }, 401)
  }

  if (!existingUser[0].emailVerifiedAt) {
    return c.json(
      {
        success: false,
        error: 'Please verify your email before signing in.',
        requiresVerification: true,
        email: existingUser[0].email,
      },
      403
    )
  }

  const { token, expiresAt } = await createSessionCookie(existingUser[0].id)

  setCookie(c, 'session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    expires: expiresAt,
    sameSite: 'Lax',
    path: '/',
  })

  return c.json({ success: true })
})

// POST /api/auth/logout
app.post('/logout', (c) => {
  deleteCookie(c, 'session', { path: '/' })
  return c.json({ success: true })
})

// POST /api/auth/verify-email
app.post('/verify-email', zValidator('json', z.object({ token: z.string().min(1) })), async (c) => {
  const { token } = c.req.valid('json')

  const userId = await verifyAuthToken(token, 'email_verification')
  if (!userId) {
    return c.json({ success: false, error: 'Verification link is invalid or has expired.' }, 400)
  }

  await db.update(users).set({ emailVerifiedAt: new Date() }).where(eq(users.id, userId))

  return c.json({ success: true })
})

// POST /api/auth/resend-verification
app.post(
  '/resend-verification',
  zValidator('json', z.object({ email: z.string().email() })),
  async (c) => {
    const { email } = c.req.valid('json')

    const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1)
    if (existingUser.length === 0 || existingUser[0].emailVerifiedAt) {
      // Don't reveal if user exists
      return c.json({ success: true })
    }

    const user = existingUser[0]
    try {
      const token = await createAuthToken(user.id, 'email_verification', 24)
      await sendVerificationEmail(user.email, user.name || '', token)
    } catch (error) {
      console.error('Failed to resend verification email:', error)
      return c.json({ success: false, error: 'Something went wrong. Please try again.' }, 500)
    }

    return c.json({ success: true })
  }
)

// POST /api/auth/forgot-password
app.post('/forgot-password', zValidator('json', forgotPasswordSchema), async (c) => {
  const { email } = c.req.valid('json')

  const genericResponse = {
    success: true,
    message: "If an account exists for this email address, you'll receive a password reset link shortly.",
  }

  const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1)
  if (existingUser.length === 0) {
    return c.json(genericResponse)
  }

  const user = existingUser[0]
  try {
    const token = await createAuthToken(user.id, 'password_reset', 1)
    await sendPasswordResetEmail(user.email, user.name || '', token)
  } catch (error) {
    console.error('Failed to send password reset email:', error)
  }

  return c.json(genericResponse)
})

// POST /api/auth/reset-password
app.post('/reset-password', zValidator('json', resetPasswordSchema), async (c) => {
  const { token, password } = c.req.valid('json')

  const userId = await verifyAuthToken(token, 'password_reset')
  if (!userId) {
    return c.json({ success: false, error: 'Reset link is invalid or has expired.' }, 400)
  }

  const hashedPassword = await bcrypt.hash(password, 10)

  await db
    .update(users)
    .set({ password: hashedPassword, updatedAt: new Date() })
    .where(eq(users.id, userId))

  await invalidateTokens(userId, 'password_reset')

  return c.json({ success: true })
})

// GET /api/auth/logout — clears session cookie and redirects to login
app.get('/logout', (c) => {
  deleteCookie(c, 'session', { path: '/' })
  return c.redirect('/login')
})
// GET /api/auth/google — Redirects the user to Google's login page
app.get('/google', (c) => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;

  if (!clientId || !redirectUri) {
    return c.text('Google OAuth configuration is missing', 500);
  }

  const scope = 'openid email profile';
  const responseType = 'code';

  // Construct the Google OAuth URL
  const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=${responseType}&scope=${scope}`;

  // Redirect the user
  return c.redirect(googleAuthUrl);
});

// GET /api/auth/google/callback — Handles the response from Google
app.get('/google/callback', async (c) => {
  const code = c.req.query('code');
  const error = c.req.query('error');

  if (error) {
    return c.redirect('/login?error=google_auth_failed');
  }

  if (!code) {
    return c.text('Authorization code missing', 400);
  }

  try {
    // 1. Exchange the code for an access token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: process.env.GOOGLE_REDIRECT_URI!,
        grant_type: 'authorization_code',
      }),
    });

    const tokenData = await tokenResponse.json();
    if (!tokenResponse.ok) {
      console.error('Token exchange failed:', JSON.stringify(tokenData))
      throw new Error('Failed to get token')
    }

    // 2. Use the access token to get the user's profile info
    const profileResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    const profileData = await profileResponse.json();
    if (!profileResponse.ok) {
      console.error('Profile fetch failed:', JSON.stringify(profileData))
      throw new Error('Failed to get profile')
    }

    // 3. Check if user exists in your database
    const existingUser = await db.select().from(users).where(eq(users.email, profileData.email)).limit(1);

    let userId;

    if (existingUser.length > 0) {
      // User exists - update their googleId if they don't have one
      userId = existingUser[0].id;
      if (!existingUser[0].googleId) {
        await db.update(users).set({ googleId: profileData.id }).where(eq(users.id, userId));
      }
    } else {
      // New user - create them in the database
      const [newUser] = await db.insert(users).values({
        email: profileData.email,
        name: profileData.name,
        googleId: profileData.id,
        emailVerifiedAt: new Date(), // Google emails are already verified
      }).returning({ id: users.id });

      userId = newUser.id;

      // Create default preferences for the new user
      await db.insert(userPreferences).values({ userId });
    }

    // 4. Log the user in (Create Session)
    const { token, expiresAt } = await createSessionCookie(userId);

    setCookie(c, 'session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      expires: expiresAt,
      sameSite: 'Lax',
      path: '/',
    });

    // 5. Redirect to the dashboard
    return c.redirect('/dashboard');

  } catch (err) {
    console.error('Google Auth Error (full):', err instanceof Error ? err.message : err);
    return c.redirect('/login?error=google_auth_failed');
  }
});

export { app as auth }
