# Code Quality Analysis — Expense Tracker (Next.js + Hono)

> **Overall Score: 7.2 / 10** — A solid, well-structured project with good separation of concerns, but with notable security issues, code duplication, and missing production-hardening.

---

## 📊 Scoring Breakdown

| Dimension | Score | Notes |
|---|:---:|---|
| **Architecture & Structure** | 8.5 | Clean separation: Hono API ↔ Next.js frontend ↔ Drizzle ORM |
| **Type Safety** | 7.5 | TypeScript strict mode, Zod validation; but many types are duplicated |
| **Security** | 5.0 | Hard-coded JWT fallback, no rate limiting, no CSRF protection |
| **Code Duplication (DRY)** | 5.5 | Significant repetition across routes, components, and type definitions |
| **Error Handling** | 6.5 | Consistent API error shapes, but no centralized error handling |
| **Database Design** | 8.0 | Well-designed schema with proper relations, indexes, and enums |
| **Frontend Quality** | 7.5 | Good component composition, proper use of `useTransition` |
| **Testing** | 1.0 | No test files found anywhere in the project |
| **DevOps / Tooling** | 7.0 | pnpm, ESLint, drizzle-kit migration scripts |
| **Documentation** | 5.0 | Minimal comments, no JSDoc on public APIs, stale metadata description |

---

## 🔴 Critical Issues

### 1. Hard-Coded JWT Secret Fallback (Security)

The JWT secret appears in **3 separate files** with the same insecure default:

```typescript
// server/middleware/auth.ts (line 5)
// server/routes/auth.ts (line 19)
// lib/auth.ts (line 5)
const secretKey = process.env.JWT_SECRET || 'default_super_secret_key_change_me_in_prod'
```

> [!CAUTION]
> If `JWT_SECRET` is not set in production, the app silently falls back to a publicly known secret. Any attacker can forge session tokens. This fallback should **throw an error at startup** in production.

**Also:** The same secret + encoding logic is duplicated three times. Extract into a shared module.

---

### 2. Root Layout Fetches Any User's Preferences (Auth Bypass)

```typescript
// app/layout.tsx (line 28-31)
// "Since auth is not implemented, fetch the first user's preferences"
const prefs = await db.select().from(userPreferences).limit(1);
```

> [!WARNING]
> This comment is stale — auth **is** implemented. The root layout currently applies the first user's theme/color preferences to ALL visitors (including unauthenticated ones), which is both a data leak and a functional bug.

---

### 3. No Tests

Zero test files exist in the project. No unit tests, integration tests, or E2E tests. For a financial application handling money, this is a significant risk.

---

### 4. No Rate Limiting on Auth Endpoints

[`server/routes/auth.ts`](file:///c:/Users/ELCOT/expense-tracker-next.js/server/routes/auth.ts) has login, signup, forgot-password, and resend-verification endpoints with **no rate limiting**. An attacker can brute-force passwords or flood the email system.

---

## 🟡 Moderate Issues

### 5. Massive Type Duplication

The same types are defined in **3+ places** with minor variations:

| Type | Defined In |
|---|---|
| `TransactionItem` | [`api-client.ts`](file:///c:/Users/ELCOT/expense-tracker-next.js/server/api-client.ts#L32-L48), [`transaction-page.tsx`](file:///c:/Users/ELCOT/expense-tracker-next.js/components/transaction-page.tsx#L14-L30), [`dashboard-client.tsx`](file:///c:/Users/ELCOT/expense-tracker-next.js/components/dashboard-client.tsx#L61-L72) |
| `Account` | [`api-client.ts`](file:///c:/Users/ELCOT/expense-tracker-next.js/server/api-client.ts#L60-L65), [`transaction-page.tsx`](file:///c:/Users/ELCOT/expense-tracker-next.js/components/transaction-page.tsx#L32-L37) |
| `Category` | [`api-client.ts`](file:///c:/Users/ELCOT/expense-tracker-next.js/server/api-client.ts#L79-L86), [`transaction-page.tsx`](file:///c:/Users/ELCOT/expense-tracker-next.js/components/transaction-page.tsx#L39-L46) |
| `CategoryStat` | [`dashboard-client.tsx`](file:///c:/Users/ELCOT/expense-tracker-next.js/components/dashboard-client.tsx#L48-L57), [`reports-client.tsx`](file:///c:/Users/ELCOT/expense-tracker-next.js/components/reports-client.tsx#L20-L29) |
| `AnalyticsData` | [`dashboard-client.tsx`](file:///c:/Users/ELCOT/expense-tracker-next.js/components/dashboard-client.tsx#L12-L46), [`reports-client.tsx`](file:///c:/Users/ELCOT/expense-tracker-next.js/components/reports-client.tsx#L32-L55) |

**Recommendation:** Create a shared `types/` directory and export all domain types from there. Ideally infer types from Zod schemas or Drizzle schema where possible.

---

### 6. Balance Calculation Has Race Conditions

[`server/lib/balance.ts`](file:///c:/Users/ELCOT/expense-tracker-next.js/server/lib/balance.ts) performs a balance check (SELECT) followed by an INSERT in the route handler — but these are **not wrapped in a database transaction**. Two concurrent requests could both pass the balance check and overdraw an account.

```typescript
// In routes/transactions.ts — check then insert, no transaction wrapping
const balanceCheck = await checkSufficientBalance(accountId, amount)
if (!balanceCheck.ok) { ... }
await db.insert(transactions).values({ ... })  // Race condition window
```

---

### 7. Raw SQL Mixed with Query Builder

[`transactions.ts`](file:///c:/Users/ELCOT/expense-tracker-next.js/server/routes/transactions.ts#L22-L45) and [`transfers.ts`](file:///c:/Users/ELCOT/expense-tracker-next.js/server/routes/transfers.ts#L20-L38) use `db.execute(sql\`...\`)` with raw SQL strings for GET queries, while POST/PUT/DELETE use the Drizzle query builder. This inconsistency makes it harder to maintain.

---

### 8. Account Type Magic Strings

"Strict" account types are defined as a plain array in [`balance.ts`](file:///c:/Users/ELCOT/expense-tracker-next.js/server/lib/balance.ts#L6):
```typescript
const STRICT_ACCOUNT_TYPES = ['cash', 'bank', 'wallet', 'savings']
```

Then duplicated verbatim in [`transfers.ts`](file:///c:/Users/ELCOT/expense-tracker-next.js/server/routes/transfers.ts#L141):
```typescript
const isStrict = sourceAcc.length > 0 && ['cash', 'bank', 'wallet', 'savings'].includes(sourceAcc[0].type)
```

These should reference the shared constant or, better, derive from the `accountTypeEnum` in the schema.

---

### 9. Currency Symbol Hard-Coded in Balance Error

[`balance.ts:81`](file:///c:/Users/ELCOT/expense-tracker-next.js/server/lib/balance.ts#L81) hard-codes `₹` regardless of user preferences:

```typescript
return `Insufficient balance in "${accountName}". Available: ₹${available.toLocaleString('en-IN', ...)}`
```

This will display incorrectly for users with other currency settings.

---

### 10. `api-client.ts` Self-Fetch Anti-Pattern

[`server/api-client.ts`](file:///c:/Users/ELCOT/expense-tracker-next.js/server/api-client.ts) makes **HTTP calls to itself** (`localhost:3000/api/...`) from server components to fetch data. While this works, it:
- Adds network overhead on every page load
- Requires `NEXT_PUBLIC_BASE_URL` to be set correctly in all environments
- Breaks in serverless/edge if the server isn't yet listening

The standard Next.js pattern would be to call your database/business logic directly from server components.

---

## 🟢 Strengths

### ✅ Clean Architecture
The project follows a well-organized layered architecture:
- **`db/`** — Schema + connection (Drizzle ORM)
- **`server/`** — Hono API with middleware, routes, and shared libs
- **`lib/`** — Shared business logic (validations, analytics, tokens)
- **`components/`** — React components (feature-level + UI primitives)
- **`app/`** — Next.js pages (thin wrappers that delegate to client components)

### ✅ Strong Validation Layer
All API endpoints use Zod validation via `@hono/zod-validator`, and the same schemas are shared for client-side form validation. Password rules are properly centralized in [`passwordRules`](file:///c:/Users/ELCOT/expense-tracker-next.js/lib/validations.ts#L74-L78).

### ✅ Proper Auth Token Security
[`lib/tokens.ts`](file:///c:/Users/ELCOT/expense-tracker-next.js/lib/tokens.ts) correctly:
- Uses `crypto.randomBytes(32)` for token generation
- Stores only SHA-256 hashes in the database
- Implements single-use tokens (deleted after verification)
- Invalidates prior tokens before creating new ones

### ✅ Good Database Schema Design
- Proper use of Drizzle enums (`pgEnum`) for constrained values
- Performance indexes on high-query columns (date, type, category, account)
- Well-defined relations with foreign keys
- `decimal(12, 2)` for monetary values (avoids floating-point issues at the DB level)

### ✅ Auth Flow is Complete
Login → email verification → password reset → session cookie with proper `httpOnly`, `secure`, `sameSite` flags. Forgot-password returns a generic message to prevent user enumeration.

### ✅ User Preferences System
The [`PreferencesProvider`](file:///c:/Users/ELCOT/expense-tracker-next.js/components/preferences-provider.tsx) with `formatCurrency` and `formatDate` utilities correctly uses `Intl.NumberFormat` and `Intl.DateTimeFormat` for locale-aware formatting.

### ✅ Financial Logic
Balance checks correctly differentiate between account types (credit cards can go negative). Budget spending uses per-period date ranges. Analytics compares current vs previous period with trend calculations.

---

## 📋 Prioritized Recommendations

| # | Priority | Action |
|---|---|---|
| 1 | 🔴 Critical | **Fail fast on missing `JWT_SECRET`** in production. Extract shared `getJwtKey()`. |
| 2 | 🔴 Critical | **Add rate limiting** to auth endpoints (login, signup, forgot-password). |
| 3 | 🔴 Critical | **Fix root layout** — don't query a random user's preferences for unauthenticated visitors. |
| 4 | 🟡 High | **Add database transactions** around balance check + insert operations. |
| 5 | 🟡 High | **Create shared types** (`types/index.ts`) — eliminate all type duplication. |
| 6 | 🟡 High | **Add tests** — at minimum for auth, balance checks, and analytics calculations. |
| 7 | 🟡 Medium | **Remove self-fetch pattern** — call DB directly from server components. |
| 8 | 🟡 Medium | **Fix currency hard-coding** in `insufficientBalanceError`. |
| 9 | 🟢 Low | Standardize on query builder OR raw SQL (not both) in route handlers. |
| 10 | 🟢 Low | Update [`metadata.description`](file:///c:/Users/ELCOT/expense-tracker-next.js/app/layout.tsx#L24) from "Generated by create next app". |
| 11 | 🟢 Low | Add `"use server"` boundary audit — ensure `app/actions/` is properly wired. |

---

## 🏗️ File Size Distribution

| Range | Files | Examples |
|---|---|---|
| **500+ lines** | 1 | `reports-client.tsx` (510 lines) — consider splitting tab components |
| **300–500** | 2 | `dashboard-client.tsx`, `transaction-page.tsx` |
| **100–300** | 8 | Route handlers, validations, analytics |
| **< 100** | 20+ | Clean, focused utility modules |

Most files are appropriately sized. [`reports-client.tsx`](file:///c:/Users/ELCOT/expense-tracker-next.js/components/reports-client.tsx) at 510 lines is the only one that would benefit from being split into separate files per tab.

---

## Summary

This is a **well-structured, feature-complete expense tracker** that demonstrates solid understanding of the Next.js + Hono + Drizzle stack. The architecture is clean, validations are thorough, and the auth flow is properly implemented with secure token handling.

The main areas needing attention are **security hardening** (JWT secret, rate limiting), **eliminating code duplication** (types, constants), and **adding tests**. The race condition in balance checks should be addressed before handling real money.
