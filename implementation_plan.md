# Architectural Rewrite — Expense Tracker

Complete restructure to eliminate raw SQL, duplicate middleware, manual auth, and self-fetch patterns. Every recommendation references official documentation only.

---

## User Review Required

> [!IMPORTANT]
> **Database Migration**: Better Auth will create its own `user`, `session`, `account`, and `verification` tables. Your existing `users` table has custom columns (`password`, `emailVerifiedAt`, `verificationToken`). You'll need a data migration to move existing users into Better Auth's schema. Should we preserve existing user data, or is this a fresh start?

> [!WARNING]
> **Breaking Change**: Better Auth replaces your entire auth flow (signup, login, email verification, password reset, JWT cookies). All existing session cookies will be invalidated. Users will need to log in again after deployment.

## Open Questions

1. **Email provider**: Better Auth requires you to provide your own email sender for verification/password-reset emails. Which provider are you using? (Resend, Nodemailer, AWS SES, etc.)
2. **Social logins**: Do you want to add OAuth providers (Google, GitHub) now, or just email/password for the initial rewrite?
3. **Rate limiting**: Better Auth includes built-in rate limiting. Do you also want Hono-level rate limiting on other endpoints (transactions, etc.)?

---

## Proposed Changes

The rewrite is organized into **5 phases**, each independently deployable. Dependencies flow top-down.

---

### Phase 1: Replace bcrypt + Custom Auth → Better Auth

> **Doc refs:**
> - [Better Auth Installation](https://www.better-auth.com/docs/installation)
> - [Better Auth + Drizzle Adapter](https://www.better-auth.com/docs/storage/drizzle)
> - [Better Auth + Hono Integration](https://www.better-auth.com/docs/integrations/hono)
> - [Email & Password Config](https://www.better-auth.com/docs/authentication/email-password)
> - [Session Management](https://www.better-auth.com/docs/concepts/session-management)

**What Better Auth replaces:**
- All of [`server/routes/auth.ts`](file:///c:/Users/ELCOT/expense-tracker-next.js/server/routes/auth.ts) (200+ lines of signup, login, verify-email, forgot-password, reset-password)
- [`server/middleware/auth.ts`](file:///c:/Users/ELCOT/expense-tracker-next.js/server/middleware/auth.ts) (JWT verification middleware)
- [`lib/auth.ts`](file:///c:/Users/ELCOT/expense-tracker-next.js/lib/auth.ts) (JWT secret + cookie helpers)
- [`lib/tokens.ts`](file:///c:/Users/ELCOT/expense-tracker-next.js/lib/tokens.ts) (verification token generation)
- [`middleware.ts`](file:///c:/Users/ELCOT/expense-tracker-next.js/middleware.ts) (Next.js route protection)
- `bcryptjs` and `jose` dependencies

#### [NEW] `lib/auth.ts` — Better Auth Server Instance

```typescript
import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { db } from "@/db"

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "pg" }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url }) => {
      // Your email provider here
    },
  },
  emailVerification: {
    sendVerificationEmail: async ({ user, url }) => {
      // Your email provider here
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24,      // refresh daily
  },
})
```

#### [NEW] `lib/auth-client.ts` — Better Auth React Client

```typescript
import { createAuthClient } from "better-auth/react"

export const authClient = createAuthClient()
// Provides: authClient.signUp.email(), authClient.signIn.email(),
//           authClient.signOut(), authClient.useSession(), etc.
```

#### [NEW] `app/api/auth/[...all]/route.ts` — Better Auth Route Handler

```typescript
import { auth } from "@/lib/auth"
import { toNextJsHandler } from "better-auth/next-js"

export const { GET, POST } = toNextJsHandler(auth)
```

#### [MODIFY] `server/middleware/auth.ts` — Replace JWT with Better Auth Session

```typescript
import { createMiddleware } from "hono/factory"
import { auth } from "@/lib/auth"

export const authMiddleware = createMiddleware(async (c, next) => {
  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  })
  if (!session) return c.json({ error: "Unauthorized" }, 401)
  c.set("user", session.user)
  c.set("session", session.session)
  await next()
})
```

#### [MODIFY] `middleware.ts` — Use Better Auth for Next.js Route Protection

```typescript
import { auth } from "@/lib/auth"
import { NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"

export async function middleware(req: NextRequest) {
  const session = await auth.api.getSession({
    headers: req.headers,
  })
  if (!session && req.nextUrl.pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/login", req.url))
  }
  return NextResponse.next()
}
```

#### [DELETE] `server/routes/auth.ts` — Entirely replaced by Better Auth
#### [DELETE] `lib/tokens.ts` — Better Auth handles token generation internally

#### [MODIFY] `db/schema.ts` — Generate Better Auth tables

Run `npx @better-auth/cli generate` to auto-generate the required schema (user, session, account, verification tables). Merge with your existing schema.

#### [MODIFY] `package.json` — Dependency Changes

```diff
- "bcryptjs": "...",
- "jose": "...",
+ "better-auth": "latest",
```

---

### Phase 2: Centralize Middleware — Apply Once at Router Level

> **Doc refs:**
> - [Hono Middleware Guide](https://hono.dev/docs/concepts/middleware)
> - [Hono `app.route()` Best Practices](https://hono.dev/docs/guides/best-practices)

**Current problem:** Every route file repeats `app.use('*', authMiddleware)`:
- [`transactions.ts:19`](file:///c:/Users/ELCOT/expense-tracker-next.js/server/routes/transactions.ts#L19)
- [`accounts.ts:17`](file:///c:/Users/ELCOT/expense-tracker-next.js/server/routes/accounts.ts#L17)
- [`categories.ts:17`](file:///c:/Users/ELCOT/expense-tracker-next.js/server/routes/categories.ts#L17)
- [`budgets.ts:20`](file:///c:/Users/ELCOT/expense-tracker-next.js/server/routes/budgets.ts#L20)
- [`settings.ts:19`](file:///c:/Users/ELCOT/expense-tracker-next.js/server/routes/settings.ts#L19)
- [`transfers.ts:19`](file:///c:/Users/ELCOT/expense-tracker-next.js/server/routes/transfers.ts#L19)

#### [MODIFY] `server/index.ts` — Apply middleware once, mount Better Auth

```typescript
import { Hono } from 'hono'
import { authMiddleware } from './middleware/auth'
import { auth } from '@/lib/auth'
import { transactions } from './routes/transactions'
import { accounts } from './routes/accounts'
import { categories } from './routes/categories'
import { budgets } from './routes/budgets'
import { settings } from './routes/settings'
import { transfers } from './routes/transfers'

const app = new Hono().basePath('/api')

// Better Auth handles its own routes (no auth middleware needed)
app.all('/auth/*', (c) => auth.handler(c.req.raw))

// Apply auth middleware ONCE for all protected routes
app.use('*', authMiddleware)

const routes = app
  .route('/transactions', transactions)
  .route('/accounts', accounts)
  .route('/categories', categories)
  .route('/budgets', budgets)
  .route('/settings', settings)
  .route('/transfers', transfers)

export type AppType = typeof routes
export default app
```

#### [MODIFY] All 6 route files — Remove `app.use('*', authMiddleware)` and `type Variables`

Each route file loses these lines:
```diff
- import { authMiddleware } from '../middleware/auth'
- type Variables = { userId: number }
- const app = new Hono<{ Variables: Variables }>()
- app.use('*', authMiddleware)
+ const app = new Hono()
```

User access changes from `c.get('userId')` to `c.get('user').id` (Better Auth session).

---

### Phase 3: Replace Raw SQL → Drizzle Relational Queries

> **Doc refs:**
> - [Drizzle Relational Queries](https://orm.drizzle.team/docs/rqb)
> - [Drizzle `findMany` with `with`](https://orm.drizzle.team/docs/rqb#find-many)
> - [Drizzle Joins](https://orm.drizzle.team/docs/joins)

**Current problem:** Routes use `db.execute(sql\`...\`)` with raw SQL JOINs instead of Drizzle's query builder.

#### [MODIFY] `server/routes/transactions.ts` — Replace raw SQL GET

**Before** (raw SQL with string interpolation):
```typescript
const result = await db.execute(sql`
  SELECT t.*, c.name as category_name, a.name as account_name
  FROM ${transactions} t
  LEFT JOIN ${categories} c ON t.category_id = c.id
  LEFT JOIN ${accounts} a ON t.account_id = a.id
  WHERE t.user_id = ${userId}
  ORDER BY t.date DESC
`)
```

**After** (Drizzle relational query):
```typescript
const result = await db.query.transactions.findMany({
  where: eq(transactions.userId, userId),
  with: {
    category: { columns: { name: true, icon: true, color: true } },
    account: { columns: { name: true, type: true } },
  },
  orderBy: [desc(transactions.date)],
  limit: limit,
  offset: offset,
})
```

#### [MODIFY] `server/routes/transfers.ts` — Same pattern

Replace the raw SQL GET query with `db.query.transfers.findMany({ with: { ... } })`.

#### [MODIFY] `server/routes/accounts.ts` — Use query builder for balance aggregation

Where raw SQL is used for `SUM()`, use Drizzle's `sql` template within the select builder rather than `db.execute()`:

```typescript
// Drizzle query builder with aggregation — still typed
const accountsWithBalance = await db
  .select({
    ...getTableColumns(accounts),
    balance: sql<number>`COALESCE(SUM(...), 0)`,
  })
  .from(accounts)
  .leftJoin(transactions, eq(accounts.id, transactions.accountId))
  .where(eq(accounts.userId, userId))
  .groupBy(accounts.id)
```

> [!NOTE]
> Aggregations (`SUM`, `COUNT`, `GROUP BY`) **cannot** use Drizzle relational queries and must stay with the query builder. This is expected per the [Drizzle docs](https://orm.drizzle.team/docs/joins). The key change is moving from `db.execute(sql\`...\`)` to `db.select().from().leftJoin()`.

---

### Phase 4: Hono RPC Client — Replace Self-Fetch `api-client.ts`

> **Doc refs:**
> - [Hono RPC Guide](https://hono.dev/docs/guides/rpc)
> - [Hono Client `hc`](https://hono.dev/docs/guides/rpc#client)

**Current problem:** [`server/api-client.ts`](file:///c:/Users/ELCOT/expense-tracker-next.js/server/api-client.ts) makes HTTP `fetch()` calls to `localhost:3000/api/...` from server components — a self-fetch anti-pattern.

#### [MODIFY] `server/api-client.ts` — Replace raw fetch with Hono RPC client

**Before** (manual fetch with hand-typed responses):
```typescript
export async function getTransactions(params) {
  const res = await fetch(`${BASE_URL}/api/transactions?...`, {
    headers: { Cookie: ... },
  })
  return res.json() as Promise<TransactionItem[]>
}
```

**After** (type-safe Hono RPC):
```typescript
import { hc } from 'hono/client'
import type { AppType } from './index'
import { cookies } from 'next/headers'

function getClient() {
  const cookieStore = cookies()
  return hc<AppType>(process.env.NEXT_PUBLIC_BASE_URL!, {
    headers: { Cookie: cookieStore.toString() },
  })
}

export async function getTransactions(params) {
  const client = getClient()
  const res = await client.api.transactions.$get({ query: params })
  return res.json()  // ← Fully typed from Zod validators!
}
```

> [!IMPORTANT]
> The `AppType` exported from [`server/index.ts`](file:///c:/Users/ELCOT/expense-tracker-next.js/server/index.ts#L22) already exists. The key benefit: **all input/output types are inferred from Zod validators**, so the 5+ duplicate type definitions in the codebase are eliminated automatically.

---

### Phase 5: Shared Types & Cleanup

#### [NEW] `types/index.ts` — Single source of truth for domain types

```typescript
import type { InferSelectModel } from 'drizzle-orm'
import * as schema from '@/db/schema'

// Infer types directly from Drizzle schema
export type Transaction = InferSelectModel<typeof schema.transactions>
export type Account = InferSelectModel<typeof schema.accounts>
export type Category = InferSelectModel<typeof schema.categories>
export type Budget = InferSelectModel<typeof schema.budgets>

// Extended types with relations (for API responses)
export type TransactionWithRelations = Transaction & {
  category: Pick<Category, 'name' | 'icon' | 'color'>
  account: Pick<Account, 'name' | 'type'>
}
```

#### [MODIFY] All consumer files — Import from `types/index.ts`

Remove duplicated type definitions from:
- [`dashboard-client.tsx`](file:///c:/Users/ELCOT/expense-tracker-next.js/components/dashboard-client.tsx) (lines 12-72)
- [`transaction-page.tsx`](file:///c:/Users/ELCOT/expense-tracker-next.js/components/transaction-page.tsx) (lines 14-46)
- [`reports-client.tsx`](file:///c:/Users/ELCOT/expense-tracker-next.js/components/reports-client.tsx) (lines 20-55)
- [`server/api-client.ts`](file:///c:/Users/ELCOT/expense-tracker-next.js/server/api-client.ts) (lines 32-86)

#### [MODIFY] `server/lib/balance.ts` — Extract `STRICT_ACCOUNT_TYPES` constant

```typescript
// Derive from schema enum instead of hard-coded array
import { accountTypeEnum } from '@/db/schema'
export const STRICT_ACCOUNT_TYPES = ['cash', 'bank', 'wallet', 'savings'] as const
```

Fix the hard-coded `₹` currency symbol — accept user preferences as a parameter.

#### [MODIFY] `app/layout.tsx` — Fix stale unauthenticated preference fetch

Remove the `db.select().from(userPreferences).limit(1)` and default to `system` theme for unauthenticated users.

#### [MODIFY] Frontend auth components — Use Better Auth client

Replace manual `fetch('/api/auth/...')` calls with:
```typescript
import { authClient } from '@/lib/auth-client'

// Signup
await authClient.signUp.email({ email, password, name })

// Login
await authClient.signIn.email({ email, password })

// Logout
await authClient.signOut()

// Session (React hook)
const { data: session } = authClient.useSession()
```

This modifies: [`login-form.tsx`](file:///c:/Users/ELCOT/expense-tracker-next.js/components/login-form.tsx), [`signup-form.tsx`](file:///c:/Users/ELCOT/expense-tracker-next.js/components/signup-form.tsx), [`forgot-password-form.tsx`](file:///c:/Users/ELCOT/expense-tracker-next.js/components/forgot-password-form.tsx), [`reset-password-form.tsx`](file:///c:/Users/ELCOT/expense-tracker-next.js/components/reset-password-form.tsx)

---

## Files Summary

| Action | File | Phase |
|--------|------|-------|
| [NEW] | `lib/auth.ts` (Better Auth server) | 1 |
| [NEW] | `lib/auth-client.ts` (Better Auth React) | 1 |
| [NEW] | `app/api/auth/[...all]/route.ts` | 1 |
| [NEW] | `types/index.ts` | 5 |
| [MODIFY] | `server/middleware/auth.ts` | 1 |
| [MODIFY] | `middleware.ts` | 1 |
| [MODIFY] | `db/schema.ts` (Better Auth tables) | 1 |
| [MODIFY] | `package.json` | 1 |
| [MODIFY] | `server/index.ts` | 2 |
| [MODIFY] | `server/routes/transactions.ts` | 2, 3 |
| [MODIFY] | `server/routes/accounts.ts` | 2, 3 |
| [MODIFY] | `server/routes/categories.ts` | 2 |
| [MODIFY] | `server/routes/budgets.ts` | 2 |
| [MODIFY] | `server/routes/settings.ts` | 2 |
| [MODIFY] | `server/routes/transfers.ts` | 2, 3 |
| [MODIFY] | `server/api-client.ts` | 4 |
| [MODIFY] | `server/lib/balance.ts` | 5 |
| [MODIFY] | `app/layout.tsx` | 5 |
| [MODIFY] | `components/login-form.tsx` | 5 |
| [MODIFY] | `components/signup-form.tsx` | 5 |
| [MODIFY] | `components/dashboard-client.tsx` | 5 |
| [MODIFY] | `components/transaction-page.tsx` | 5 |
| [MODIFY] | `components/reports-client.tsx` | 5 |
| [DELETE] | `server/routes/auth.ts` | 1 |
| [DELETE] | `lib/tokens.ts` | 1 |

---

## Verification Plan

### Automated Tests
```bash
# After Phase 1: Verify Better Auth endpoints
curl -X POST http://localhost:3000/api/auth/sign-up/email \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Test123!","name":"Test"}'

# After Phase 3: Verify queries return same data shape
pnpm dev  # Start dev server
# Test all CRUD operations on transactions, accounts, budgets

# After all phases: TypeScript compilation check
pnpm tsc --noEmit
```

### Manual Verification
- Full auth flow: signup → email verification → login → session persistence → logout
- Verify existing CRUD operations (transactions, accounts, budgets, categories, transfers) still work
- Verify dashboard loads with correct data (relational queries returning nested objects)
- Verify settings page still reads/writes user preferences
- Confirm no raw `db.execute(sql\`...\`)` calls remain in codebase
- Confirm no `app.use('*', authMiddleware)` appears in any route file
