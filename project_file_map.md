# Project File Map — Expense Tracker (Next.js + Hono + Drizzle)

Every source file in the project, documented with 6 questions.

---

## 📁 Root — Configuration & Entry Points

---

### [`package.json`](file:///c:/Users/ELCOT/expense-tracker-next.js/package.json)

| Question | Answer |
|---|---|
| **What is this file?** | Project manifest — defines name, scripts, and all npm dependencies |
| **Why does it exist?** | Required by Node.js/pnpm to manage the project lifecycle (install, dev, build, lint) |
| **Who imports it?** | No code imports it. `pnpm`, `next`, and tooling read it automatically |
| **What imports does it have?** | N/A (JSON). Lists `dependencies` (next, hono, drizzle-orm, bcryptjs, jose, recharts, zod, etc.) and `devDependencies` (drizzle-kit, eslint, typescript, etc.) |
| **What responsibility belongs here?** | Declaring scripts (`dev`, `build`, `seed`, `db:push`), dependency versions, project metadata |
| **What must NOT belong here?** | Application logic, environment variables, or build output configuration (those go in `next.config.ts`) |

---

### [`next.config.ts`](file:///c:/Users/ELCOT/expense-tracker-next.js/next.config.ts)

| Question | Answer |
|---|---|
| **What is this file?** | Next.js framework configuration |
| **Why does it exist?** | Required by Next.js to customize build behavior, redirects, webpack, etc. |
| **Who imports it?** | Next.js internals (never imported by application code) |
| **What imports does it have?** | `NextConfig` type from `next` |
| **What responsibility belongs here?** | Image domains, redirects, headers, webpack overrides, experimental flags |
| **What must NOT belong here?** | Runtime application logic, database connections, API routes |

---

### [`tsconfig.json`](file:///c:/Users/ELCOT/expense-tracker-next.js/tsconfig.json)

| Question | Answer |
|---|---|
| **What is this file?** | TypeScript compiler configuration |
| **Why does it exist?** | Configures strict mode, module resolution, path aliases (`@/*`), and JSX handling |
| **Who imports it?** | TypeScript compiler (`tsc`), VS Code, ESLint |
| **What imports does it have?** | N/A (JSON). Defines `paths: { "@/*": ["./*"] }` alias |
| **What responsibility belongs here?** | Compiler strictness, module resolution strategy, path aliases, include/exclude globs |
| **What must NOT belong here?** | Runtime configuration, linting rules, build scripts |

---

### [`eslint.config.mjs`](file:///c:/Users/ELCOT/expense-tracker-next.js/eslint.config.mjs)

| Question | Answer |
|---|---|
| **What is this file?** | ESLint flat configuration (new format) |
| **Why does it exist?** | Enforces code quality rules — extends Next.js core-web-vitals and TypeScript configs |
| **Who imports it?** | ESLint CLI / `pnpm lint` |
| **What imports does it have?** | `eslint/config`, `eslint-config-next/core-web-vitals`, `eslint-config-next/typescript` |
| **What responsibility belongs here?** | Lint rules, ignore patterns (`.next/`, `out/`, `build/`) |
| **What must NOT belong here?** | Formatting rules (use Prettier), runtime logic |

---

### [`drizzle.config.ts`](file:///c:/Users/ELCOT/expense-tracker-next.js/drizzle.config.ts)

| Question | Answer |
|---|---|
| **What is this file?** | Drizzle Kit configuration for schema migrations |
| **Why does it exist?** | Tells `drizzle-kit` where the schema is, where to output migrations, and the DB connection URL |
| **Who imports it?** | `drizzle-kit` CLI commands (`generate`, `push`, `migrate`) |
| **What imports does it have?** | `drizzle-kit` (`defineConfig`), `dotenv` |
| **What responsibility belongs here?** | Schema path, migration output dir, dialect (`postgresql`), DB credentials |
| **What must NOT belong here?** | Application-level DB queries, schema definitions (those go in `db/schema.ts`) |

---

### [`postcss.config.mjs`](file:///c:/Users/ELCOT/expense-tracker-next.js/postcss.config.mjs)

| Question | Answer |
|---|---|
| **What is this file?** | PostCSS configuration for Tailwind CSS v4 processing |
| **Why does it exist?** | Required by Next.js to process CSS through the Tailwind pipeline |
| **Who imports it?** | Next.js build system (webpack/turbopack) |
| **What imports does it have?** | `@tailwindcss/postcss` plugin |
| **What responsibility belongs here?** | PostCSS plugin chain configuration |
| **What must NOT belong here?** | CSS rules, theme configuration, component styles |

---

### [`components.json`](file:///c:/Users/ELCOT/expense-tracker-next.js/components.json)

| Question | Answer |
|---|---|
| **What is this file?** | shadcn/ui configuration manifest |
| **Why does it exist?** | Tells the `shadcn` CLI where to place generated UI components and what conventions to use |
| **Who imports it?** | `npx shadcn add` CLI commands |
| **What imports does it have?** | N/A (JSON). Defines paths for `components`, `utils`, `hooks`, `ui` |
| **What responsibility belongs here?** | Component library conventions — aliases, style format, base color |
| **What must NOT belong here?** | Component implementations, runtime logic |

---

### [`middleware.ts`](file:///c:/Users/ELCOT/expense-tracker-next.js/middleware.ts)

| Question | Answer |
|---|---|
| **What is this file?** | Next.js Edge Middleware — intercepts requests before they reach pages |
| **Why does it exist?** | Protects `/dashboard/*` routes by verifying JWT session cookies; redirects unauthenticated users to `/login` |
| **Who imports it?** | Next.js runtime (auto-detected at project root) |
| **What imports does it have?** | `next/server` (`NextRequest`, `NextResponse`), `jose` (`jwtVerify`) |
| **What responsibility belongs here?** | Route protection at the edge, session cookie verification, redirect logic |
| **What must NOT belong here?** | Database queries, API logic, rendering, business rules |

---

### [`pnpm-workspace.yaml`](file:///c:/Users/ELCOT/expense-tracker-next.js/pnpm-workspace.yaml)

| Question | Answer |
|---|---|
| **What is this file?** | pnpm workspace configuration |
| **Why does it exist?** | Declares this as a pnpm workspace root (even for single-package repos) |
| **Who imports it?** | pnpm CLI |
| **What imports does it have?** | N/A (YAML) |
| **What responsibility belongs here?** | Workspace package glob patterns |
| **What must NOT belong here?** | Dependencies, scripts, application logic |

---

## 📁 `app/` — Next.js App Router Pages

---

### [`app/globals.css`](file:///c:/Users/ELCOT/expense-tracker-next.js/app/globals.css)

| Question | Answer |
|---|---|
| **What is this file?** | Global CSS stylesheet — design tokens, theme variables, base styles |
| **Why does it exist?** | Defines the entire color palette (HSL variables), dark mode theme, Tailwind v4 imports, and custom color themes |
| **Who imports it?** | [`app/layout.tsx`](file:///c:/Users/ELCOT/expense-tracker-next.js/app/layout.tsx) (line 3) |
| **What imports does it have?** | `@import "tailwindcss"` |
| **What responsibility belongs here?** | CSS custom properties, `@theme` tokens, base resets, scrollbar styles, color theme variants (`[data-theme]`) |
| **What must NOT belong here?** | Component-specific styles (use component-level classes), JavaScript logic |

---

### [`app/layout.tsx`](file:///c:/Users/ELCOT/expense-tracker-next.js/app/layout.tsx)

| Question | Answer |
|---|---|
| **What is this file?** | Root layout — wraps every page in the application |
| **Why does it exist?** | Sets up `<html>`, `<body>`, fonts (Geist, JetBrains Mono), theme provider, tooltip provider, and color theme from DB |
| **Who imports it?** | Next.js (auto-detected as root layout) |
| **What imports does it have?** | `next/font/google` (Geist, Geist_Mono, JetBrains_Mono), `globals.css`, `@/lib/utils`, `@/components/ui/tooltip`, `@/components/theme-provider`, `@/db`, `@/db/schema` |
| **What responsibility belongs here?** | HTML metadata, font loading, global providers (ThemeProvider, TooltipProvider) |
| **What must NOT belong here?** | Page-specific data fetching, auth logic, feature-level UI. ⚠️ Currently fetches `userPreferences` with `LIMIT 1` which is a bug (leaks any user's theme) |

---

### [`app/page.tsx`](file:///c:/Users/ELCOT/expense-tracker-next.js/app/page.tsx)

| Question | Answer |
|---|---|
| **What is this file?** | Root page (`/`) — entry point redirect |
| **Why does it exist?** | Checks if user has a valid session and redirects to `/dashboard` or `/login` accordingly |
| **Who imports it?** | Next.js (auto-detected as route `/`) |
| **What imports does it have?** | `next/navigation` (`redirect`), `@/lib/auth` (`verifySession`) |
| **What responsibility belongs here?** | Session check + redirect. Nothing else |
| **What must NOT belong here?** | UI rendering, data fetching, business logic |

---

### [`app/favicon.ico`](file:///c:/Users/ELCOT/expense-tracker-next.js/app/favicon.ico)

| Question | Answer |
|---|---|
| **What is this file?** | Browser tab icon |
| **Why does it exist?** | Displayed in browser tabs and bookmarks |
| **Who imports it?** | Next.js (auto-served from `app/`) |
| **What imports does it have?** | N/A (binary) |
| **What responsibility belongs here?** | Brand icon only |
| **What must NOT belong here?** | N/A |

---

### [`app/login/page.tsx`](file:///c:/Users/ELCOT/expense-tracker-next.js/app/login/page.tsx)

| Question | Answer |
|---|---|
| **What is this file?** | Login page (`/login`) |
| **Why does it exist?** | Renders the centered login form |
| **Who imports it?** | Next.js (route `/login`) |
| **What imports does it have?** | `@/components/login-form` |
| **What responsibility belongs here?** | Page layout wrapper (centering) for the login form |
| **What must NOT belong here?** | Form logic, validation, API calls (delegate to `LoginForm` component) |

---

### [`app/signup/page.tsx`](file:///c:/Users/ELCOT/expense-tracker-next.js/app/signup/page.tsx)

| Question | Answer |
|---|---|
| **What is this file?** | Signup page (`/signup`) |
| **Why does it exist?** | Renders the centered signup form |
| **Who imports it?** | Next.js (route `/signup`) |
| **What imports does it have?** | `@/components/signup-form` |
| **What responsibility belongs here?** | Page layout wrapper only |
| **What must NOT belong here?** | Registration logic, validation |

---

### [`app/forgot-password/page.tsx`](file:///c:/Users/ELCOT/expense-tracker-next.js/app/forgot-password/page.tsx)

| Question | Answer |
|---|---|
| **What is this file?** | Forgot password page (`/forgot-password`) |
| **Why does it exist?** | Renders the forgot-password form with branding header |
| **Who imports it?** | Next.js (route `/forgot-password`) |
| **What imports does it have?** | `@/components/forgot-password-form` |
| **What responsibility belongs here?** | Page layout + branding wrapper |
| **What must NOT belong here?** | Email sending logic, token generation |

---

### [`app/reset-password/page.tsx`](file:///c:/Users/ELCOT/expense-tracker-next.js/app/reset-password/page.tsx)

| Question | Answer |
|---|---|
| **What is this file?** | Reset password page (`/reset-password`) |
| **Why does it exist?** | Renders the password reset form (accessed via email link with token) |
| **Who imports it?** | Next.js (route `/reset-password`) |
| **What imports does it have?** | `@/components/reset-password-form` |
| **What responsibility belongs here?** | Page layout wrapper only |
| **What must NOT belong here?** | Token validation, password hashing |

---

### [`app/verify-email/page.tsx`](file:///c:/Users/ELCOT/expense-tracker-next.js/app/verify-email/page.tsx)

| Question | Answer |
|---|---|
| **What is this file?** | Email verification page (`/verify-email`) |
| **Why does it exist?** | Renders the OTP verification UI after signup |
| **Who imports it?** | Next.js (route `/verify-email`) |
| **What imports does it have?** | `@/components/verify-email-client` |
| **What responsibility belongs here?** | Page layout wrapper only |
| **What must NOT belong here?** | OTP verification logic, token checking |

---

### [`app/api/[[...route]]/route.ts`](file:///c:/Users/ELCOT/expense-tracker-next.js/app/api/[[...route]]/route.ts)

| Question | Answer |
|---|---|
| **What is this file?** | Catch-all API route — bridges Hono to Next.js |
| **Why does it exist?** | Adapts the Hono app to Next.js App Router via `hono/vercel` adapter. All `/api/*` requests flow through here |
| **Who imports it?** | Next.js (auto-detected as API route) |
| **What imports does it have?** | `hono/vercel` (`handle`), `@/server` (the Hono app instance) |
| **What responsibility belongs here?** | Exporting `GET`, `POST`, `PUT`, `PATCH`, `DELETE`, `OPTIONS` handlers via `handle(app)` |
| **What must NOT belong here?** | Route definitions, business logic, middleware — all that belongs in `server/` |

---

### [`app/dashboard/layout.tsx`](file:///c:/Users/ELCOT/expense-tracker-next.js/app/dashboard/layout.tsx)

| Question | Answer |
|---|---|
| **What is this file?** | Dashboard layout — wraps all `/dashboard/*` pages |
| **Why does it exist?** | Provides the sidebar, breadcrumb header, and user preferences context for every dashboard page |
| **Who imports it?** | Next.js (auto-detected as layout for `/dashboard`) |
| **What imports does it have?** | `@/components/app-sidebar`, `@/server/api-client` (`getPreferences`, `getMe`), `@/components/preferences-provider`, `@/components/ui/breadcrumb`, `@/components/ui/separator`, `@/components/ui/sidebar` |
| **What responsibility belongs here?** | Fetching user preferences + user data (server component), providing `PreferencesProvider`, rendering sidebar + header |
| **What must NOT belong here?** | Page-level data fetching, feature UI, auth logic |

---

### [`app/dashboard/page.tsx`](file:///c:/Users/ELCOT/expense-tracker-next.js/app/dashboard/page.tsx)

| Question | Answer |
|---|---|
| **What is this file?** | Dashboard home page (`/dashboard`) |
| **Why does it exist?** | Fetches analytics data and recent transactions, passes them to `DashboardClient` |
| **Who imports it?** | Next.js (route `/dashboard`) |
| **What imports does it have?** | `@/lib/analytics` (`getFullAnalytics`, `DateRange`), `@/server/api-client` (`getRecentTransactions`), `@/components/dashboard-client`, `@/lib/auth` (`verifySession`), `next/navigation` |
| **What responsibility belongs here?** | Server-side data fetching for dashboard, session verification, date range computation |
| **What must NOT belong here?** | Client-side interactivity, chart rendering, UI state |

---

### [`app/dashboard/error.tsx`](file:///c:/Users/ELCOT/expense-tracker-next.js/app/dashboard/error.tsx)

| Question | Answer |
|---|---|
| **What is this file?** | Error boundary for the dashboard segment |
| **Why does it exist?** | Catches unhandled errors (e.g., DB connection failures) in dashboard pages and shows a friendly error message |
| **Who imports it?** | Next.js (auto-detected as error boundary for `/dashboard`) |
| **What imports does it have?** | None (self-contained `"use client"` component) |
| **What responsibility belongs here?** | User-facing error UI for dashboard failures |
| **What must NOT belong here?** | Error logging, retry logic, data fetching |

---

### [`app/dashboard/accounts/page.tsx`](file:///c:/Users/ELCOT/expense-tracker-next.js/app/dashboard/accounts/page.tsx)

| Question | Answer |
|---|---|
| **What is this file?** | Accounts page (`/dashboard/accounts`) |
| **Why does it exist?** | Fetches accounts with balance from API, passes to `AccountsClient` |
| **Who imports it?** | Next.js (route) |
| **What imports does it have?** | `@/server/api-client` (`getAccountsWithBalance`), `@/components/accounts-client` |
| **What responsibility belongs here?** | Server-side data fetching only |
| **What must NOT belong here?** | CRUD UI, form handling |

---

### [`app/dashboard/transactions/page.tsx`](file:///c:/Users/ELCOT/expense-tracker-next.js/app/dashboard/transactions/page.tsx)

| Question | Answer |
|---|---|
| **What is this file?** | Transactions page (`/dashboard/transactions`) |
| **Why does it exist?** | Fetches transactions, categories, and accounts — passes all three to `TransactionPage` |
| **Who imports it?** | Next.js (route) |
| **What imports does it have?** | `@/server/api-client` (`getTransactions`, `getAllCategories`, `getAccounts`), `@/components/transaction-page` |
| **What responsibility belongs here?** | Parallel data fetching via `Promise.all` |
| **What must NOT belong here?** | Transaction CRUD, form state, filters |

---

### [`app/dashboard/transactions/transfers/page.tsx`](file:///c:/Users/ELCOT/expense-tracker-next.js/app/dashboard/transactions/transfers/page.tsx)

| Question | Answer |
|---|---|
| **What is this file?** | Transfers page (`/dashboard/transactions/transfers`) |
| **Why does it exist?** | Fetches transfers and accounts, passes to `TransfersClient` |
| **Who imports it?** | Next.js (route) |
| **What imports does it have?** | `@/server/api-client` (`getTransfers`, `getAccounts`), `@/components/transfers-client` |
| **What responsibility belongs here?** | Server-side data fetching only |
| **What must NOT belong here?** | Transfer UI, form logic |

---

### [`app/dashboard/budgets/page.tsx`](file:///c:/Users/ELCOT/expense-tracker-next.js/app/dashboard/budgets/page.tsx)

| Question | Answer |
|---|---|
| **What is this file?** | Budgets page (`/dashboard/budgets`) |
| **Why does it exist?** | Fetches budgets and categories, passes to `BudgetsClient` |
| **Who imports it?** | Next.js (route) |
| **What imports does it have?** | `@/server/api-client` (`getBudgets`, `getAllCategories`), `@/components/budgets-client` |
| **What responsibility belongs here?** | Server-side data fetching only |
| **What must NOT belong here?** | Budget CRUD UI |

---

### [`app/dashboard/reports/page.tsx`](file:///c:/Users/ELCOT/expense-tracker-next.js/app/dashboard/reports/page.tsx)

| Question | Answer |
|---|---|
| **What is this file?** | Reports page (`/dashboard/reports`) |
| **Why does it exist?** | Computes date ranges for period-based analytics (this-month, last-month, this-year), fetches data, passes to `ReportsClient` |
| **Who imports it?** | Next.js (route) |
| **What imports does it have?** | `@/lib/analytics` (`getFullAnalytics`, `DateRange`), `@/components/reports-client`, `@/lib/auth`, `next/navigation` |
| **What responsibility belongs here?** | Period calculation logic (`getPeriods` helper), session check, data fetching |
| **What must NOT belong here?** | Chart rendering, export logic, client-side interactivity |

---

### [`app/dashboard/categories/expense/page.tsx`](file:///c:/Users/ELCOT/expense-tracker-next.js/app/dashboard/categories/expense/page.tsx)

| Question | Answer |
|---|---|
| **What is this file?** | Expense categories page (`/dashboard/categories/expense`) |
| **Why does it exist?** | Fetches expense-type categories, passes to shared `CategoryPage` component |
| **Who imports it?** | Next.js (route) |
| **What imports does it have?** | `@/server/api-client` (`getCategories`), `@/components/category-page` |
| **What responsibility belongs here?** | Data fetching with `type="expense"` filter |
| **What must NOT belong here?** | Category CRUD UI |

---

### [`app/dashboard/categories/income/page.tsx`](file:///c:/Users/ELCOT/expense-tracker-next.js/app/dashboard/categories/income/page.tsx)

| Question | Answer |
|---|---|
| **What is this file?** | Income categories page (`/dashboard/categories/income`) |
| **Why does it exist?** | Same as expense but with `type="income"` filter |
| **Who imports it?** | Next.js (route) |
| **What imports does it have?** | `@/server/api-client` (`getCategories`), `@/components/category-page` |
| **What responsibility belongs here?** | Data fetching with `type="income"` filter |
| **What must NOT belong here?** | Category CRUD UI |

---

### [`app/dashboard/settings/layout.tsx`](file:///c:/Users/ELCOT/expense-tracker-next.js/app/dashboard/settings/layout.tsx)

| Question | Answer |
|---|---|
| **What is this file?** | Settings layout — wraps all `/dashboard/settings/*` pages |
| **Why does it exist?** | Provides the settings sidebar navigation (Appearance, Currency, Account, Notifications, etc.) with active-link highlighting |
| **Who imports it?** | Next.js (auto-detected as layout for `/dashboard/settings`) |
| **What imports does it have?** | `next/link`, `next/navigation` (`usePathname`) — `"use client"` |
| **What responsibility belongs here?** | Settings navigation sidebar, active link state |
| **What must NOT belong here?** | Settings form logic, data fetching |

---

### [`app/dashboard/settings/page.tsx`](file:///c:/Users/ELCOT/expense-tracker-next.js/app/dashboard/settings/page.tsx)

| Question | Answer |
|---|---|
| **What is this file?** | Settings index redirect (`/dashboard/settings` → `/dashboard/settings/appearance`) |
| **Why does it exist?** | Ensures visiting `/settings` redirects to the default sub-page |
| **Who imports it?** | Next.js (route) |
| **What imports does it have?** | `next/navigation` (`redirect`) |
| **What responsibility belongs here?** | Redirect only |
| **What must NOT belong here?** | Any UI |

---

### [`app/dashboard/settings/appearance/page.tsx`](file:///c:/Users/ELCOT/expense-tracker-next.js/app/dashboard/settings/appearance/page.tsx)

| Question | Answer |
|---|---|
| **What is this file?** | Appearance settings page |
| **Why does it exist?** | Fetches current theme/color preferences, passes to `AppearanceClient` |
| **Who imports it?** | Next.js (route) |
| **What imports does it have?** | `@/server/api-client` (`getPreferences`), `@/components/appearance-client` |
| **What responsibility belongs here?** | Server-side preference fetching |
| **What must NOT belong here?** | Theme toggle UI |

---

### [`app/dashboard/settings/currency/page.tsx`](file:///c:/Users/ELCOT/expense-tracker-next.js/app/dashboard/settings/currency/page.tsx)

| Question | Answer |
|---|---|
| **What is this file?** | Currency/locale settings page |
| **Why does it exist?** | Fetches currency, number format, date format, timezone preferences — passes to `CurrencyClient` |
| **Who imports it?** | Next.js (route) |
| **What imports does it have?** | `@/server/api-client` (`getPreferences`), `@/components/currency-client` |
| **What responsibility belongs here?** | Server-side preference fetching |
| **What must NOT belong here?** | Locale picker UI |

---

### [`app/dashboard/settings/account/page.tsx`](file:///c:/Users/ELCOT/expense-tracker-next.js/app/dashboard/settings/account/page.tsx)

| Question | Answer |
|---|---|
| **What is this file?** | Account settings page (profile, password) |
| **Why does it exist?** | Fetches current user profile, passes to `AccountClient` |
| **Who imports it?** | Next.js (route) |
| **What imports does it have?** | `@/server/api-client` (`getMe`), `@/components/account-client` |
| **What responsibility belongs here?** | Server-side user data fetching |
| **What must NOT belong here?** | Profile edit forms, password change logic |

---

### [`app/dashboard/settings/notifications/page.tsx`](file:///c:/Users/ELCOT/expense-tracker-next.js/app/dashboard/settings/notifications/page.tsx)

| Question | Answer |
|---|---|
| **What is this file?** | Notification preferences page |
| **Why does it exist?** | Fetches notification preference flags, passes to `NotificationsClient` |
| **Who imports it?** | Next.js (route) |
| **What imports does it have?** | `@/server/api-client` (`getPreferences`), `@/components/notifications-client` |
| **What responsibility belongs here?** | Server-side preference fetching |
| **What must NOT belong here?** | Toggle UI, notification delivery logic |

---

### [`app/dashboard/settings/billing/page.tsx`](file:///c:/Users/ELCOT/expense-tracker-next.js/app/dashboard/settings/billing/page.tsx)

| Question | Answer |
|---|---|
| **What is this file?** | Billing settings page |
| **Why does it exist?** | Renders `BillingClient` (plan selection UI, currently placeholder) |
| **Who imports it?** | Next.js (route) |
| **What imports does it have?** | `@/components/billing-client` |
| **What responsibility belongs here?** | Page wrapper only |
| **What must NOT belong here?** | Payment processing, Stripe integration |

---

### [`app/dashboard/settings/privacy/page.tsx`](file:///c:/Users/ELCOT/expense-tracker-next.js/app/dashboard/settings/privacy/page.tsx)

| Question | Answer |
|---|---|
| **What is this file?** | Privacy settings page (data export, account deletion) |
| **Why does it exist?** | Fetches ALL user data from DB (preferences, accounts, categories, transactions, budgets), serializes to JSON, passes to `PrivacyClient` for download |
| **Who imports it?** | Next.js (route) |
| **What imports does it have?** | `@/components/privacy-client`, `@/db`, `@/db/schema` (all tables) |
| **What responsibility belongs here?** | Data export aggregation |
| **What must NOT belong here?** | ⚠️ Currently queries DB directly without user filtering — should filter by `userId`. Delete account logic should go through the API |

---

### [`app/dashboard/settings/help/page.tsx`](file:///c:/Users/ELCOT/expense-tracker-next.js/app/dashboard/settings/help/page.tsx)

| Question | Answer |
|---|---|
| **What is this file?** | Help & About settings page |
| **Why does it exist?** | Shows Help Center (coming soon), Documentation (coming soon), and app version/license info |
| **Who imports it?** | Next.js (route) |
| **What imports does it have?** | `@/components/ui/card`, `@phosphor-icons/react`, `next/link` |
| **What responsibility belongs here?** | Static informational content |
| **What must NOT belong here?** | Dynamic help articles, ticket submission logic |

---

### [`app/dashboard/upgrade/page.tsx`](file:///c:/Users/ELCOT/expense-tracker-next.js/app/dashboard/upgrade/page.tsx)

| Question | Answer |
|---|---|
| **What is this file?** | Upgrade/pricing page (`/dashboard/upgrade`) |
| **Why does it exist?** | Renders `UpgradeClient` (plan comparison UI) |
| **Who imports it?** | Next.js (route) |
| **What imports does it have?** | `@/components/upgrade-client` |
| **What responsibility belongs here?** | Page wrapper only |
| **What must NOT belong here?** | Payment logic, subscription management |

---

## 📁 `components/` — React Components

---

### [`components/login-form.tsx`](file:///c:/Users/ELCOT/expense-tracker-next.js/components/login-form.tsx)

| Question | Answer |
|---|---|
| **What is this file?** | Login form component (`"use client"`) |
| **Why does it exist?** | Handles email/password login — form validation, API calls to `/api/auth/login`, error display, redirect on success |
| **Who imports it?** | [`app/login/page.tsx`](file:///c:/Users/ELCOT/expense-tracker-next.js/app/login/page.tsx) |
| **What imports does it have?** | `react`, `next/link`, `next/navigation`, `@/lib/validations`, `@/components/ui/*` (button, card, field, input, label) |
| **What responsibility belongs here?** | Login form UI, client-side validation, login API call, error/loading states |
| **What must NOT belong here?** | Password hashing, JWT generation, session management (server-side concerns) |

---

### [`components/signup-form.tsx`](file:///c:/Users/ELCOT/expense-tracker-next.js/components/signup-form.tsx)

| Question | Answer |
|---|---|
| **What is this file?** | Signup form component (`"use client"`) |
| **Why does it exist?** | Handles user registration — name, email, password with live validation rules display |
| **Who imports it?** | [`app/signup/page.tsx`](file:///c:/Users/ELCOT/expense-tracker-next.js/app/signup/page.tsx) |
| **What imports does it have?** | `react`, `next/link`, `next/navigation`, `@/lib/validations` (signupSchema, passwordRules), `@/components/ui/*` |
| **What responsibility belongs here?** | Signup form UI, password strength indicators, API call to `/api/auth/signup` |
| **What must NOT belong here?** | User creation, email sending, token generation |

---

### [`components/forgot-password-form.tsx`](file:///c:/Users/ELCOT/expense-tracker-next.js/components/forgot-password-form.tsx)

| Question | Answer |
|---|---|
| **What is this file?** | Forgot password form (`"use client"`) |
| **Why does it exist?** | Email input → calls `/api/auth/forgot-password` → shows success/error |
| **Who imports it?** | [`app/forgot-password/page.tsx`](file:///c:/Users/ELCOT/expense-tracker-next.js/app/forgot-password/page.tsx) |
| **What imports does it have?** | `react`, `@/components/ui/*` |
| **What responsibility belongs here?** | Form UI and API call |
| **What must NOT belong here?** | Email delivery, token generation |

---

### [`components/reset-password-form.tsx`](file:///c:/Users/ELCOT/expense-tracker-next.js/components/reset-password-form.tsx)

| Question | Answer |
|---|---|
| **What is this file?** | Reset password form (`"use client"`) |
| **Why does it exist?** | New password + confirm password inputs, reads token from URL params, calls `/api/auth/reset-password` |
| **Who imports it?** | [`app/reset-password/page.tsx`](file:///c:/Users/ELCOT/expense-tracker-next.js/app/reset-password/page.tsx) |
| **What imports does it have?** | `react`, `next/navigation` (`useSearchParams`), `@/lib/validations`, `@/components/ui/*` |
| **What responsibility belongs here?** | Form UI, password validation, API call with token |
| **What must NOT belong here?** | Token verification, password hashing |

---

### [`components/verify-email-client.tsx`](file:///c:/Users/ELCOT/expense-tracker-next.js/components/verify-email-client.tsx)

| Question | Answer |
|---|---|
| **What is this file?** | Email OTP verification UI (`"use client"`) |
| **Why does it exist?** | OTP input, verify call to `/api/auth/verify-email`, resend code flow |
| **Who imports it?** | [`app/verify-email/page.tsx`](file:///c:/Users/ELCOT/expense-tracker-next.js/app/verify-email/page.tsx) |
| **What imports does it have?** | `react`, `next/navigation`, `@/components/ui/*` |
| **What responsibility belongs here?** | OTP input UI, verify/resend API calls |
| **What must NOT belong here?** | Token validation, email sending |

---

### [`components/dashboard-client.tsx`](file:///c:/Users/ELCOT/expense-tracker-next.js/components/dashboard-client.tsx)

| Question | Answer |
|---|---|
| **What is this file?** | Dashboard overview UI (`"use client"`) — the main dashboard view |
| **Why does it exist?** | Displays KPI cards (income/expense/balance/savings), spending chart (recharts), recent transactions list, and category breakdown |
| **Who imports it?** | [`app/dashboard/page.tsx`](file:///c:/Users/ELCOT/expense-tracker-next.js/app/dashboard/page.tsx) |
| **What imports does it have?** | `react`, `recharts` (BarChart, ResponsiveContainer, etc.), `@/components/ui/card`, `@/components/preferences-provider` (`usePreferences`, `formatCurrency`), `@phosphor-icons/react`, `next/link` |
| **What responsibility belongs here?** | Dashboard data visualization, chart rendering, KPI display |
| **What must NOT belong here?** | Data fetching (receives props from server component), raw DB queries. ⚠️ Defines local types (`AnalyticsData`, `CategoryStat`, `TransactionItem`) that duplicate types elsewhere |

---

### [`components/transaction-page.tsx`](file:///c:/Users/ELCOT/expense-tracker-next.js/components/transaction-page.tsx)

| Question | Answer |
|---|---|
| **What is this file?** | Transaction CRUD UI (`"use client"`) — list, create, edit, delete transactions |
| **Why does it exist?** | Full transaction management: tabular list with filters, add/edit dialog with form validation, delete confirmation, category/account pickers |
| **Who imports it?** | [`app/dashboard/transactions/page.tsx`](file:///c:/Users/ELCOT/expense-tracker-next.js/app/dashboard/transactions/page.tsx) |
| **What imports does it have?** | `react`, `@/components/ui/*` (dialog, button, field, input), `@/components/preferences-provider`, `@/lib/validations`, `@phosphor-icons/react`, `next/navigation` |
| **What responsibility belongs here?** | Transaction CRUD UI, form state, optimistic updates via `useTransition` + `router.refresh()` |
| **What must NOT belong here?** | API route definitions, database queries. ⚠️ Redefines `TransactionItem`, `Account`, `Category` types locally |

---

### [`components/accounts-client.tsx`](file:///c:/Users/ELCOT/expense-tracker-next.js/components/accounts-client.tsx)

| Question | Answer |
|---|---|
| **What is this file?** | Accounts management UI (`"use client"`) |
| **Why does it exist?** | Lists financial accounts with balances, create/edit/delete account dialogs |
| **Who imports it?** | [`app/dashboard/accounts/page.tsx`](file:///c:/Users/ELCOT/expense-tracker-next.js/app/dashboard/accounts/page.tsx) |
| **What imports does it have?** | `react`, `@/components/ui/*`, `@/components/preferences-provider`, `@phosphor-icons/react`, `next/navigation` |
| **What responsibility belongs here?** | Account CRUD UI, balance display |
| **What must NOT belong here?** | Balance calculations, API routes |

---

### [`components/account-client.tsx`](file:///c:/Users/ELCOT/expense-tracker-next.js/components/account-client.tsx)

| Question | Answer |
|---|---|
| **What is this file?** | Account settings client (`"use client"`) — profile edit + password change |
| **Why does it exist?** | Manages the user's profile (name) and password in the settings area |
| **Who imports it?** | [`app/dashboard/settings/account/page.tsx`](file:///c:/Users/ELCOT/expense-tracker-next.js/app/dashboard/settings/account/page.tsx) |
| **What imports does it have?** | `react`, `@/components/ui/*`, `@/lib/validations` |
| **What responsibility belongs here?** | Profile edit form, password change form, API calls to `/api/settings/profile` and `/api/settings/change-password` |
| **What must NOT belong here?** | Password hashing, session management |

---

### [`components/transfers-client.tsx`](file:///c:/Users/ELCOT/expense-tracker-next.js/components/transfers-client.tsx)

| Question | Answer |
|---|---|
| **What is this file?** | Transfers management UI (`"use client"`) |
| **Why does it exist?** | Lists account-to-account transfers, create/delete transfer dialogs |
| **Who imports it?** | [`app/dashboard/transactions/transfers/page.tsx`](file:///c:/Users/ELCOT/expense-tracker-next.js/app/dashboard/transactions/transfers/page.tsx) |
| **What imports does it have?** | `react`, `@/components/ui/*`, `@/components/preferences-provider`, `@phosphor-icons/react`, `next/navigation` |
| **What responsibility belongs here?** | Transfer CRUD UI |
| **What must NOT belong here?** | Balance validation, transfer execution logic |

---

### [`components/budgets-client.tsx`](file:///c:/Users/ELCOT/expense-tracker-next.js/components/budgets-client.tsx)

| Question | Answer |
|---|---|
| **What is this file?** | Budget management UI (`"use client"`) |
| **Why does it exist?** | Budget cards with progress bars, create/edit/delete budgets |
| **Who imports it?** | [`app/dashboard/budgets/page.tsx`](file:///c:/Users/ELCOT/expense-tracker-next.js/app/dashboard/budgets/page.tsx) |
| **What imports does it have?** | `react`, `@/components/budget-form`, `@/components/ui/*`, `@/components/preferences-provider`, `@phosphor-icons/react`, `next/navigation` |
| **What responsibility belongs here?** | Budget list UI, progress visualization, delete confirmation |
| **What must NOT belong here?** | Spending calculations (server-side) |

---

### [`components/budget-form.tsx`](file:///c:/Users/ELCOT/expense-tracker-next.js/components/budget-form.tsx)

| Question | Answer |
|---|---|
| **What is this file?** | Budget create/edit form dialog (`"use client"`) |
| **Why does it exist?** | Reusable form for both creating and editing budgets — name, amount, period, category picker |
| **Who imports it?** | [`components/budgets-client.tsx`](file:///c:/Users/ELCOT/expense-tracker-next.js/components/budgets-client.tsx) |
| **What imports does it have?** | `react`, `@/components/ui/*`, `@/lib/budget-utils` |
| **What responsibility belongs here?** | Budget form UI and validation |
| **What must NOT belong here?** | API calls (parent handles submission) |

---

### [`components/category-page.tsx`](file:///c:/Users/ELCOT/expense-tracker-next.js/components/category-page.tsx)

| Question | Answer |
|---|---|
| **What is this file?** | Category management UI (`"use client"`) — shared between expense and income categories |
| **Why does it exist?** | Reusable category list with add/edit/delete, color/icon pickers |
| **Who imports it?** | [`app/dashboard/categories/expense/page.tsx`](file:///c:/Users/ELCOT/expense-tracker-next.js/app/dashboard/categories/expense/page.tsx), [`app/dashboard/categories/income/page.tsx`](file:///c:/Users/ELCOT/expense-tracker-next.js/app/dashboard/categories/income/page.tsx) |
| **What imports does it have?** | `react`, `@/components/ui/*`, `@phosphor-icons/react`, `next/navigation` |
| **What responsibility belongs here?** | Category CRUD UI (parameterized by `type` prop) |
| **What must NOT belong here?** | Database operations |

---

### [`components/reports-client.tsx`](file:///c:/Users/ELCOT/expense-tracker-next.js/components/reports-client.tsx)

| Question | Answer |
|---|---|
| **What is this file?** | Reports & analytics UI (`"use client"`) — the largest component (510+ lines) |
| **Why does it exist?** | Full reporting dashboard with tabs: Overview, Income, Expenses, Categories. Multiple chart types (bar, pie, line). Export functionality (PDF/CSV) |
| **Who imports it?** | [`app/dashboard/reports/page.tsx`](file:///c:/Users/ELCOT/expense-tracker-next.js/app/dashboard/reports/page.tsx) |
| **What imports does it have?** | `react`, `recharts` (multiple chart types), `@/components/ui/*`, `@/components/preferences-provider`, `@/lib/export-report`, `next/navigation`, `@phosphor-icons/react` |
| **What responsibility belongs here?** | Report visualization, tab navigation, period selector, export triggers |
| **What must NOT belong here?** | Data aggregation (server-side), export file generation logic (delegated to `lib/export-report.ts`). ⚠️ Should be split — 510 lines is too large for one file |

---

### [`components/appearance-client.tsx`](file:///c:/Users/ELCOT/expense-tracker-next.js/components/appearance-client.tsx)

| Question | Answer |
|---|---|
| **What is this file?** | Appearance settings UI (`"use client"`) |
| **Why does it exist?** | Theme selector (light/dark/system) and color theme picker (default, blue, green, etc.) |
| **Who imports it?** | [`app/dashboard/settings/appearance/page.tsx`](file:///c:/Users/ELCOT/expense-tracker-next.js/app/dashboard/settings/appearance/page.tsx) |
| **What imports does it have?** | `react`, `next-themes`, `@/components/ui/*`, `next/navigation` |
| **What responsibility belongs here?** | Theme/color switching UI, saving preferences via API |
| **What must NOT belong here?** | CSS variable definitions (those go in `globals.css`) |

---

### [`components/currency-client.tsx`](file:///c:/Users/ELCOT/expense-tracker-next.js/components/currency-client.tsx)

| Question | Answer |
|---|---|
| **What is this file?** | Currency & locale settings UI (`"use client"`) |
| **Why does it exist?** | Dropdowns for currency, number format, date format, timezone |
| **Who imports it?** | [`app/dashboard/settings/currency/page.tsx`](file:///c:/Users/ELCOT/expense-tracker-next.js/app/dashboard/settings/currency/page.tsx) |
| **What imports does it have?** | `react`, `@/components/ui/*`, `next/navigation` |
| **What responsibility belongs here?** | Locale preference UI, saving via `/api/settings/preferences` |
| **What must NOT belong here?** | Formatting logic (that's in `preferences-provider.tsx`) |

---

### [`components/notifications-client.tsx`](file:///c:/Users/ELCOT/expense-tracker-next.js/components/notifications-client.tsx)

| Question | Answer |
|---|---|
| **What is this file?** | Notification preferences UI (`"use client"`) |
| **Why does it exist?** | Toggle switches for 8 notification categories (security, activity, budget, etc.) |
| **Who imports it?** | [`app/dashboard/settings/notifications/page.tsx`](file:///c:/Users/ELCOT/expense-tracker-next.js/app/dashboard/settings/notifications/page.tsx) |
| **What imports does it have?** | `react`, `@/components/ui/*` (card, switch), `next/navigation` |
| **What responsibility belongs here?** | Notification toggle UI, saving via `/api/settings/notifications` |
| **What must NOT belong here?** | Notification delivery logic |

---

### [`components/billing-client.tsx`](file:///c:/Users/ELCOT/expense-tracker-next.js/components/billing-client.tsx)

| Question | Answer |
|---|---|
| **What is this file?** | Billing/plan UI (`"use client"`) |
| **Why does it exist?** | Shows current plan info, payment method placeholder, billing history placeholder |
| **Who imports it?** | [`app/dashboard/settings/billing/page.tsx`](file:///c:/Users/ELCOT/expense-tracker-next.js/app/dashboard/settings/billing/page.tsx) |
| **What imports does it have?** | `@/components/ui/card`, `next/link` |
| **What responsibility belongs here?** | Billing UI (mostly static/placeholder currently) |
| **What must NOT belong here?** | Payment processing |

---

### [`components/privacy-client.tsx`](file:///c:/Users/ELCOT/expense-tracker-next.js/components/privacy-client.tsx)

| Question | Answer |
|---|---|
| **What is this file?** | Privacy settings UI (`"use client"`) |
| **Why does it exist?** | Download data export button, delete account button |
| **Who imports it?** | [`app/dashboard/settings/privacy/page.tsx`](file:///c:/Users/ELCOT/expense-tracker-next.js/app/dashboard/settings/privacy/page.tsx) |
| **What imports does it have?** | `react`, `@/components/ui/*` |
| **What responsibility belongs here?** | Data download trigger (receives pre-serialized `dataBlob`), delete confirmation UI |
| **What must NOT belong here?** | Data aggregation (server-side), actual account deletion |

---

### [`components/upgrade-client.tsx`](file:///c:/Users/ELCOT/expense-tracker-next.js/components/upgrade-client.tsx)

| Question | Answer |
|---|---|
| **What is this file?** | Upgrade/pricing page UI (`"use client"`) |
| **Why does it exist?** | Plan comparison cards (Free, Pro, Business) with feature lists |
| **Who imports it?** | [`app/dashboard/upgrade/page.tsx`](file:///c:/Users/ELCOT/expense-tracker-next.js/app/dashboard/upgrade/page.tsx) |
| **What imports does it have?** | `react`, `@/components/ui/*`, `@phosphor-icons/react` |
| **What responsibility belongs here?** | Pricing tier display, plan selection UI |
| **What must NOT belong here?** | Payment processing, subscription logic |

---

### [`components/preferences-provider.tsx`](file:///c:/Users/ELCOT/expense-tracker-next.js/components/preferences-provider.tsx)

| Question | Answer |
|---|---|
| **What is this file?** | React Context provider for user locale preferences + formatting utilities |
| **Why does it exist?** | Makes `currency`, `numberFormat`, `dateFormat`, `timezone` available to all dashboard components via `usePreferences()`. Also exports `formatCurrency()` and `formatDate()` helpers |
| **Who imports it?** | [`app/dashboard/layout.tsx`](file:///c:/Users/ELCOT/expense-tracker-next.js/app/dashboard/layout.tsx) (provider), and many client components via `usePreferences()` |
| **What imports does it have?** | `react` |
| **What responsibility belongs here?** | Preferences context, `formatCurrency()` via `Intl.NumberFormat`, `formatDate()` via `Intl.DateTimeFormat` |
| **What must NOT belong here?** | API calls, persistence logic, theme switching |

---

### [`components/theme-provider.tsx`](file:///c:/Users/ELCOT/expense-tracker-next.js/components/theme-provider.tsx)

| Question | Answer |
|---|---|
| **What is this file?** | Thin wrapper around `next-themes` `ThemeProvider` |
| **Why does it exist?** | Re-exports the provider as a client component (`"use client"`) so it can be used in server component layouts |
| **Who imports it?** | [`app/layout.tsx`](file:///c:/Users/ELCOT/expense-tracker-next.js/app/layout.tsx) |
| **What imports does it have?** | `next-themes` |
| **What responsibility belongs here?** | Client boundary wrapper only |
| **What must NOT belong here?** | Theme logic, color variables |

---

### [`components/app-sidebar.tsx`](file:///c:/Users/ELCOT/expense-tracker-next.js/components/app-sidebar.tsx)

| Question | Answer |
|---|---|
| **What is this file?** | Main application sidebar (`"use client"`) |
| **Why does it exist?** | Composes the sidebar from sub-components: `VersionSwitcher`, `SearchForm`, `NavMain`, `NavInsights`, `NavUser` |
| **Who imports it?** | [`app/dashboard/layout.tsx`](file:///c:/Users/ELCOT/expense-tracker-next.js/app/dashboard/layout.tsx) |
| **What imports does it have?** | `@/components/nav-main`, `@/components/nav-Insights`, `@/components/nav-user`, `@/components/search-form`, `@/components/team-switcher`, `@/components/version-switcher`, `@/components/ui/sidebar` |
| **What responsibility belongs here?** | Sidebar composition, navigation item definitions (data arrays for links) |
| **What must NOT belong here?** | Page content, data fetching |

---

### [`components/nav-main.tsx`](file:///c:/Users/ELCOT/expense-tracker-next.js/components/nav-main.tsx)

| Question | Answer |
|---|---|
| **What is this file?** | Main navigation section of the sidebar |
| **Why does it exist?** | Renders collapsible nav groups (Dashboard, Transactions, Accounts, etc.) with sub-items |
| **Who imports it?** | [`components/app-sidebar.tsx`](file:///c:/Users/ELCOT/expense-tracker-next.js/components/app-sidebar.tsx) |
| **What imports does it have?** | `@/components/ui/sidebar`, `@/components/ui/collapsible`, `next/link` |
| **What responsibility belongs here?** | Navigation tree rendering with active state |
| **What must NOT belong here?** | Route definitions (data comes from props) |

---

### [`components/nav-Insights.tsx`](file:///c:/Users/ELCOT/expense-tracker-next.js/components/nav-Insights.tsx)

| Question | Answer |
|---|---|
| **What is this file?** | Insights/secondary navigation section of the sidebar |
| **Why does it exist?** | Renders links like Reports, Budgets, and an "Upgrade" callout card |
| **Who imports it?** | [`components/app-sidebar.tsx`](file:///c:/Users/ELCOT/expense-tracker-next.js/components/app-sidebar.tsx) |
| **What imports does it have?** | `@/components/ui/sidebar`, `next/link`, `@phosphor-icons/react` |
| **What responsibility belongs here?** | Secondary nav rendering, upgrade CTA |
| **What must NOT belong here?** | Data fetching, business logic |

---

### [`components/nav-user.tsx`](file:///c:/Users/ELCOT/expense-tracker-next.js/components/nav-user.tsx)

| Question | Answer |
|---|---|
| **What is this file?** | User profile section in sidebar footer |
| **Why does it exist?** | Shows user avatar/name/email, dropdown menu with Settings, Billing, Logout links |
| **Who imports it?** | [`components/app-sidebar.tsx`](file:///c:/Users/ELCOT/expense-tracker-next.js/components/app-sidebar.tsx) |
| **What imports does it have?** | `@/components/ui/sidebar`, `@/components/ui/avatar`, `@/components/ui/dropdown-menu`, `next/navigation`, `@phosphor-icons/react` |
| **What responsibility belongs here?** | User menu UI, logout action (calls `/api/auth/logout`) |
| **What must NOT belong here?** | Auth logic, session management |

---

### [`components/search-form.tsx`](file:///c:/Users/ELCOT/expense-tracker-next.js/components/search-form.tsx)

| Question | Answer |
|---|---|
| **What is this file?** | Sidebar search input |
| **Why does it exist?** | Search form UI in the sidebar header |
| **Who imports it?** | [`components/app-sidebar.tsx`](file:///c:/Users/ELCOT/expense-tracker-next.js/components/app-sidebar.tsx) |
| **What imports does it have?** | `@/components/ui/sidebar`, `@/components/ui/label`, `@/components/ui/input` |
| **What responsibility belongs here?** | Search input UI |
| **What must NOT belong here?** | Search logic, result display |

---

### [`components/team-switcher.tsx`](file:///c:/Users/ELCOT/expense-tracker-next.js/components/team-switcher.tsx)

| Question | Answer |
|---|---|
| **What is this file?** | Team/workspace switcher dropdown |
| **Why does it exist?** | Sidebar header showing active team with a dropdown to switch (placeholder for multi-tenant support) |
| **Who imports it?** | [`components/app-sidebar.tsx`](file:///c:/Users/ELCOT/expense-tracker-next.js/components/app-sidebar.tsx) |
| **What imports does it have?** | `@/components/ui/sidebar`, `@/components/ui/dropdown-menu` |
| **What responsibility belongs here?** | Team selection UI |
| **What must NOT belong here?** | Team management logic |

---

### [`components/version-switcher.tsx`](file:///c:/Users/ELCOT/expense-tracker-next.js/components/version-switcher.tsx)

| Question | Answer |
|---|---|
| **What is this file?** | Version/environment switcher in sidebar |
| **Why does it exist?** | Dropdown showing current version/environment (e.g., "1.0.0", "staging") |
| **Who imports it?** | [`components/app-sidebar.tsx`](file:///c:/Users/ELCOT/expense-tracker-next.js/components/app-sidebar.tsx) |
| **What imports does it have?** | `@/components/ui/sidebar` |
| **What responsibility belongs here?** | Version display UI |
| **What must NOT belong here?** | Version management logic |

---

### `components/ui/*` — 17 shadcn/ui primitives

These are auto-generated by `npx shadcn add`. All follow the same pattern:

| File | Purpose | Imported By |
|---|---|---|
| [`accordion.tsx`](file:///c:/Users/ELCOT/expense-tracker-next.js/components/ui/accordion.tsx) | Collapsible content sections | Various |
| [`avatar.tsx`](file:///c:/Users/ELCOT/expense-tracker-next.js/components/ui/avatar.tsx) | User avatars | `nav-user.tsx` |
| [`breadcrumb.tsx`](file:///c:/Users/ELCOT/expense-tracker-next.js/components/ui/breadcrumb.tsx) | Page breadcrumbs | `dashboard/layout.tsx` |
| [`button.tsx`](file:///c:/Users/ELCOT/expense-tracker-next.js/components/ui/button.tsx) | Buttons (all variants) | Almost every component |
| [`card.tsx`](file:///c:/Users/ELCOT/expense-tracker-next.js/components/ui/card.tsx) | Content cards | Dashboard, settings, forms |
| [`collapsible.tsx`](file:///c:/Users/ELCOT/expense-tracker-next.js/components/ui/collapsible.tsx) | Collapsible wrapper | `nav-main.tsx` |
| [`dialog.tsx`](file:///c:/Users/ELCOT/expense-tracker-next.js/components/ui/dialog.tsx) | Modal dialogs | CRUD forms |
| [`dropdown-menu.tsx`](file:///c:/Users/ELCOT/expense-tracker-next.js/components/ui/dropdown-menu.tsx) | Dropdown menus | `nav-user.tsx`, `team-switcher.tsx` |
| [`field.tsx`](file:///c:/Users/ELCOT/expense-tracker-next.js/components/ui/field.tsx) | Form field wrapper with label/error | All form components |
| [`input.tsx`](file:///c:/Users/ELCOT/expense-tracker-next.js/components/ui/input.tsx) | Text inputs | All form components |
| [`label.tsx`](file:///c:/Users/ELCOT/expense-tracker-next.js/components/ui/label.tsx) | Form labels | Forms, search |
| [`separator.tsx`](file:///c:/Users/ELCOT/expense-tracker-next.js/components/ui/separator.tsx) | Horizontal/vertical dividers | `dashboard/layout.tsx` |
| [`sheet.tsx`](file:///c:/Users/ELCOT/expense-tracker-next.js/components/ui/sheet.tsx) | Slide-out panels | Sidebar mobile |
| [`sidebar.tsx`](file:///c:/Users/ELCOT/expense-tracker-next.js/components/ui/sidebar.tsx) | Full sidebar system (21KB) | Sidebar components |
| [`skeleton.tsx`](file:///c:/Users/ELCOT/expense-tracker-next.js/components/ui/skeleton.tsx) | Loading placeholders | Various |
| [`switch.tsx`](file:///c:/Users/ELCOT/expense-tracker-next.js/components/ui/switch.tsx) | Toggle switches | Notifications settings |
| [`tooltip.tsx`](file:///c:/Users/ELCOT/expense-tracker-next.js/components/ui/tooltip.tsx) | Hover tooltips | Root layout, sidebar |

> **What must NOT belong here:** Custom business logic. These are generic, design-system-level primitives. Don't add app-specific behavior.

---

## 📁 `lib/` — Shared Business Logic & Utilities

---

### [`lib/auth.ts`](file:///c:/Users/ELCOT/expense-tracker-next.js/lib/auth.ts)

| Question | Answer |
|---|---|
| **What is this file?** | Server-side auth utilities — JWT verification and session cookie reading |
| **Why does it exist?** | Provides `verifySession()` used by server components to check if the user is logged in. Uses `server-only` to prevent client-side imports |
| **Who imports it?** | [`app/page.tsx`](file:///c:/Users/ELCOT/expense-tracker-next.js/app/page.tsx), [`app/dashboard/page.tsx`](file:///c:/Users/ELCOT/expense-tracker-next.js/app/dashboard/page.tsx), [`app/dashboard/reports/page.tsx`](file:///c:/Users/ELCOT/expense-tracker-next.js/app/dashboard/reports/page.tsx) |
| **What imports does it have?** | `server-only`, `next/headers` (`cookies`), `jose` (`jwtVerify`) |
| **What responsibility belongs here?** | JWT verification, extracting `userId` from session cookie |
| **What must NOT belong here?** | JWT creation (that's in `server/routes/auth.ts`), password hashing, user CRUD. ⚠️ Has hard-coded fallback JWT secret |

---

### [`lib/tokens.ts`](file:///c:/Users/ELCOT/expense-tracker-next.js/lib/tokens.ts)

| Question | Answer |
|---|---|
| **What is this file?** | Verification token utilities — generation, hashing, storage |
| **Why does it exist?** | Creates and stores SHA-256 hashed tokens for email verification and password reset |
| **Who imports it?** | [`server/routes/auth.ts`](file:///c:/Users/ELCOT/expense-tracker-next.js/server/routes/auth.ts) |
| **What imports does it have?** | `server-only`, `crypto`, `@/db`, `@/db/schema`, `drizzle-orm` |
| **What responsibility belongs here?** | Token generation (`crypto.randomBytes`), SHA-256 hashing, DB storage/lookup/deletion |
| **What must NOT belong here?** | Email sending, session management |

---

### [`lib/validations.ts`](file:///c:/Users/ELCOT/expense-tracker-next.js/lib/validations.ts)

| Question | Answer |
|---|---|
| **What is this file?** | Zod validation schemas — shared between server and client |
| **Why does it exist?** | Single source of truth for request validation: login, signup, transactions, budgets, profile updates, password changes, notification preferences |
| **Who imports it?** | Server routes (`auth.ts`, `settings.ts`), client components (`login-form.tsx`, `signup-form.tsx`, `transaction-page.tsx`, `reset-password-form.tsx`, `account-client.tsx`) |
| **What imports does it have?** | `zod` |
| **What responsibility belongs here?** | Schema definitions, `passwordRules` array, all Zod schemas |
| **What must NOT belong here?** | Database operations, API logic, UI rendering |

---

### [`lib/analytics.ts`](file:///c:/Users/ELCOT/expense-tracker-next.js/lib/analytics.ts)

| Question | Answer |
|---|---|
| **What is this file?** | Server-side analytics aggregation engine |
| **Why does it exist?** | Computes dashboard/report data: total income/expense, category breakdowns, daily trends, period-over-period comparisons |
| **Who imports it?** | [`app/dashboard/page.tsx`](file:///c:/Users/ELCOT/expense-tracker-next.js/app/dashboard/page.tsx), [`app/dashboard/reports/page.tsx`](file:///c:/Users/ELCOT/expense-tracker-next.js/app/dashboard/reports/page.tsx) |
| **What imports does it have?** | `server-only`, `@/db`, `@/db/schema`, `drizzle-orm` operators |
| **What responsibility belongs here?** | SQL aggregation queries, trend calculation, `getFullAnalytics()` function |
| **What must NOT belong here?** | Chart rendering, UI logic, API route definitions |

---

### [`lib/budget-utils.ts`](file:///c:/Users/ELCOT/expense-tracker-next.js/lib/budget-utils.ts)

| Question | Answer |
|---|---|
| **What is this file?** | Budget calculation utilities — shared between server and client |
| **Why does it exist?** | Provides `getActivePeriodRange()` (weekly/monthly/yearly date ranges), `calculateBudgetMetrics()` (spent/remaining/usage/status), and `budgetSchema` (Zod) |
| **Who imports it?** | [`server/routes/budgets.ts`](file:///c:/Users/ELCOT/expense-tracker-next.js/server/routes/budgets.ts), [`components/budget-form.tsx`](file:///c:/Users/ELCOT/expense-tracker-next.js/components/budget-form.tsx) |
| **What imports does it have?** | `zod` |
| **What responsibility belongs here?** | Budget period math, metric calculations, budget validation schema |
| **What must NOT belong here?** | Database queries, UI rendering |

---

### [`lib/email.ts`](file:///c:/Users/ELCOT/expense-tracker-next.js/lib/email.ts)

| Question | Answer |
|---|---|
| **What is this file?** | Email sending service |
| **Why does it exist?** | Sends transactional emails: verification codes, password reset links, welcome emails. Uses Nodemailer with SMTP |
| **Who imports it?** | [`server/routes/auth.ts`](file:///c:/Users/ELCOT/expense-tracker-next.js/server/routes/auth.ts) |
| **What imports does it have?** | `server-only`, `nodemailer` |
| **What responsibility belongs here?** | SMTP configuration, HTML email templates, `sendVerificationEmail()`, `sendPasswordResetEmail()`, `sendWelcomeEmail()` |
| **What must NOT belong here?** | Token generation, user lookup, auth flow logic |

---

### [`lib/export-report.ts`](file:///c:/Users/ELCOT/expense-tracker-next.js/lib/export-report.ts)

| Question | Answer |
|---|---|
| **What is this file?** | Report export utilities (PDF/CSV) — client-side |
| **Why does it exist?** | Generates downloadable PDF and CSV files from analytics data |
| **Who imports it?** | [`components/reports-client.tsx`](file:///c:/Users/ELCOT/expense-tracker-next.js/components/reports-client.tsx) |
| **What imports does it have?** | `jspdf`, `jspdf-autotable` |
| **What responsibility belongs here?** | PDF generation with tables/charts, CSV formatting, file download trigger |
| **What must NOT belong here?** | Data aggregation (receives pre-computed data) |

---

### [`lib/utils.ts`](file:///c:/Users/ELCOT/expense-tracker-next.js/lib/utils.ts)

| Question | Answer |
|---|---|
| **What is this file?** | Utility belt — the `cn()` class name merger |
| **Why does it exist?** | Provides `cn()` = `twMerge(clsx(...))` for conditional Tailwind class merging |
| **Who imports it?** | Every UI component (`button.tsx`, `card.tsx`, `input.tsx`, `sidebar.tsx`, etc.) |
| **What imports does it have?** | `clsx`, `tailwind-merge` |
| **What responsibility belongs here?** | Generic, framework-agnostic utilities |
| **What must NOT belong here?** | Business logic, domain-specific helpers |

---

## 📁 `server/` — Hono API Backend

---

### [`server/index.ts`](file:///c:/Users/ELCOT/expense-tracker-next.js/server/index.ts)

| Question | Answer |
|---|---|
| **What is this file?** | Hono app entry point — central router |
| **Why does it exist?** | Creates the Hono app with `/api` basePath, mounts all route modules, exports `AppType` for RPC |
| **Who imports it?** | [`app/api/[[...route]]/route.ts`](file:///c:/Users/ELCOT/expense-tracker-next.js/app/api/[[...route]]/route.ts), [`server/api-client.ts`](file:///c:/Users/ELCOT/expense-tracker-next.js/server/api-client.ts) (for `AppType`) |
| **What imports does it have?** | `hono`, all route modules from `./routes/*` |
| **What responsibility belongs here?** | Route registration via `.route()`, `AppType` export |
| **What must NOT belong here?** | Route handler implementations, middleware definitions, business logic |

---

### [`server/api-client.ts`](file:///c:/Users/ELCOT/expense-tracker-next.js/server/api-client.ts)

| Question | Answer |
|---|---|
| **What is this file?** | Server-side API client — used by Next.js server components to fetch data |
| **Why does it exist?** | Provides typed wrapper functions (`getTransactions()`, `getAccounts()`, `getBudgets()`, etc.) that make HTTP calls to the Hono API endpoints |
| **Who imports it?** | All dashboard page server components (`dashboard/page.tsx`, `accounts/page.tsx`, `transactions/page.tsx`, `budgets/page.tsx`, settings pages, etc.) |
| **What imports does it have?** | `next/headers` (`cookies`), defines local type interfaces |
| **What responsibility belongs here?** | Forwarding session cookies, calling API endpoints, typing responses |
| **What must NOT belong here?** | Business logic, database queries. ⚠️ Contains 5+ duplicate type definitions. ⚠️ Uses self-fetch anti-pattern (HTTP calls to `localhost`) |

---

### [`server/middleware/auth.ts`](file:///c:/Users/ELCOT/expense-tracker-next.js/server/middleware/auth.ts)

| Question | Answer |
|---|---|
| **What is this file?** | Hono auth middleware — verifies JWT from cookies |
| **Why does it exist?** | Extracts `session` cookie, verifies JWT, sets `userId` on Hono context |
| **Who imports it?** | All route files: `transactions.ts`, `accounts.ts`, `categories.ts`, `budgets.ts`, `settings.ts`, `transfers.ts` |
| **What imports does it have?** | `hono/factory` (`createMiddleware`), `jose` (`jwtVerify`) |
| **What responsibility belongs here?** | JWT verification, setting `c.set('userId', ...)` |
| **What must NOT belong here?** | Route logic, database queries. ⚠️ Hard-coded JWT fallback secret. ⚠️ Imported separately in each route file instead of applied once |

---

### [`server/lib/balance.ts`](file:///c:/Users/ELCOT/expense-tracker-next.js/server/lib/balance.ts)

| Question | Answer |
|---|---|
| **What is this file?** | Balance checking utility for financial operations |
| **Why does it exist?** | `checkSufficientBalance()` prevents overdrawing "strict" accounts (cash, bank, wallet, savings) while allowing credit card accounts to go negative |
| **Who imports it?** | [`server/routes/transactions.ts`](file:///c:/Users/ELCOT/expense-tracker-next.js/server/routes/transactions.ts), [`server/routes/transfers.ts`](file:///c:/Users/ELCOT/expense-tracker-next.js/server/routes/transfers.ts) |
| **What imports does it have?** | `@/db`, `@/db/schema`, `drizzle-orm` operators |
| **What responsibility belongs here?** | Balance calculation (opening balance + income - expense), insufficient balance error formatting |
| **What must NOT belong here?** | Transaction insertion, transfer execution. ⚠️ Hard-codes `₹` currency symbol. ⚠️ `STRICT_ACCOUNT_TYPES` array duplicated in `transfers.ts` |

---

### [`server/routes/auth.ts`](file:///c:/Users/ELCOT/expense-tracker-next.js/server/routes/auth.ts)

| Question | Answer |
|---|---|
| **What is this file?** | Auth API routes — signup, login, verify-email, forgot/reset password, logout |
| **Why does it exist?** | Handles the complete authentication lifecycle |
| **Who imports it?** | [`server/index.ts`](file:///c:/Users/ELCOT/expense-tracker-next.js/server/index.ts) (mounted at `/auth`) |
| **What imports does it have?** | `hono`, `@hono/zod-validator`, `@/db`, `@/db/schema`, `bcryptjs`, `jose`, `@/lib/tokens`, `@/lib/email`, `@/lib/validations` |
| **What responsibility belongs here?** | User creation, password hashing, JWT signing, cookie setting, email verification flow, password reset flow |
| **What must NOT belong here?** | UI rendering, protected resource logic. ⚠️ Duplicates JWT secret. ⚠️ No rate limiting |

---

### [`server/routes/transactions.ts`](file:///c:/Users/ELCOT/expense-tracker-next.js/server/routes/transactions.ts)

| Question | Answer |
|---|---|
| **What is this file?** | Transaction API routes — CRUD for income/expense transactions |
| **Why does it exist?** | GET (list with filters), POST (create with balance check), PUT (update), DELETE |
| **Who imports it?** | [`server/index.ts`](file:///c:/Users/ELCOT/expense-tracker-next.js/server/index.ts) (mounted at `/transactions`) |
| **What imports does it have?** | `hono`, `@hono/zod-validator`, `@/db`, `@/db/schema`, `drizzle-orm`, `@/lib/validations`, `./lib/balance`, `../middleware/auth` |
| **What responsibility belongs here?** | Transaction CRUD endpoints, balance validation before insert |
| **What must NOT belong here?** | UI rendering, analytics. ⚠️ GET uses raw `db.execute(sql\`...\`)` instead of Drizzle query builder. ⚠️ Balance check + insert not wrapped in DB transaction (race condition) |

---

### [`server/routes/accounts.ts`](file:///c:/Users/ELCOT/expense-tracker-next.js/server/routes/accounts.ts)

| Question | Answer |
|---|---|
| **What is this file?** | Account API routes — CRUD for financial accounts |
| **Why does it exist?** | GET (list with balances), GET (single), POST (create), PUT (update), DELETE |
| **Who imports it?** | [`server/index.ts`](file:///c:/Users/ELCOT/expense-tracker-next.js/server/index.ts) (mounted at `/accounts`) |
| **What imports does it have?** | `hono`, `@hono/zod-validator`, `@/db`, `@/db/schema`, `drizzle-orm`, `../middleware/auth` |
| **What responsibility belongs here?** | Account CRUD, balance aggregation (SUM of transactions) |
| **What must NOT belong here?** | Transaction logic |

---

### [`server/routes/categories.ts`](file:///c:/Users/ELCOT/expense-tracker-next.js/server/routes/categories.ts)

| Question | Answer |
|---|---|
| **What is this file?** | Category API routes — CRUD for expense/income categories |
| **Why does it exist?** | GET (list by type), POST (create), PUT (update with name-uniqueness check), DELETE (with transaction-existence guard) |
| **Who imports it?** | [`server/index.ts`](file:///c:/Users/ELCOT/expense-tracker-next.js/server/index.ts) (mounted at `/categories`) |
| **What imports does it have?** | `hono`, `@hono/zod-validator`, `@/db`, `@/db/schema`, `drizzle-orm`, `zod`, `../middleware/auth` |
| **What responsibility belongs here?** | Category CRUD, ownership checks, referential integrity checks |
| **What must NOT belong here?** | Transaction categorization logic |

---

### [`server/routes/budgets.ts`](file:///c:/Users/ELCOT/expense-tracker-next.js/server/routes/budgets.ts)

| Question | Answer |
|---|---|
| **What is this file?** | Budget API routes — CRUD for spending budgets |
| **Why does it exist?** | GET (list with spending progress), POST (create with category validation), PUT (update), DELETE |
| **Who imports it?** | [`server/index.ts`](file:///c:/Users/ELCOT/expense-tracker-next.js/server/index.ts) (mounted at `/budgets`) |
| **What imports does it have?** | `hono`, `@hono/zod-validator`, `@/db`, `@/db/schema`, `drizzle-orm`, `@/lib/budget-utils`, `zod`, `../middleware/auth` |
| **What responsibility belongs here?** | Budget CRUD, spending aggregation per budget period |
| **What must NOT belong here?** | Budget alerting, notification logic |

---

### [`server/routes/settings.ts`](file:///c:/Users/ELCOT/expense-tracker-next.js/server/routes/settings.ts)

| Question | Answer |
|---|---|
| **What is this file?** | Settings API routes — user profile, preferences, password, notifications |
| **Why does it exist?** | GET/PATCH preferences, PATCH profile, POST change-password, PATCH notifications |
| **Who imports it?** | [`server/index.ts`](file:///c:/Users/ELCOT/expense-tracker-next.js/server/index.ts) (mounted at `/settings`) |
| **What imports does it have?** | `hono`, `@hono/zod-validator`, `@/db`, `@/db/schema`, `drizzle-orm`, `bcryptjs`, `zod`, `@/lib/validations`, `../middleware/auth` |
| **What responsibility belongs here?** | User preference CRUD, password change (with current password verification), `getOrCreatePreferences` helper |
| **What must NOT belong here?** | Session management, auth flow |

---

### [`server/routes/transfers.ts`](file:///c:/Users/ELCOT/expense-tracker-next.js/server/routes/transfers.ts)

| Question | Answer |
|---|---|
| **What is this file?** | Transfer API routes — account-to-account money transfers |
| **Why does it exist?** | GET (list), POST (create transfer pair), DELETE (reverse transfer) |
| **Who imports it?** | [`server/index.ts`](file:///c:/Users/ELCOT/expense-tracker-next.js/server/index.ts) (mounted at `/transfers`) |
| **What imports does it have?** | `hono`, `@hono/zod-validator`, `@/db`, `@/db/schema`, `drizzle-orm`, `zod`, `../middleware/auth` |
| **What responsibility belongs here?** | Transfer creation (debit source, credit destination), balance checks for strict accounts |
| **What must NOT belong here?** | Single-transaction logic. ⚠️ Duplicates `STRICT_ACCOUNT_TYPES` from `balance.ts`. ⚠️ GET uses raw SQL |

---

## 📁 `db/` — Database Layer

---

### [`db/schema.ts`](file:///c:/Users/ELCOT/expense-tracker-next.js/db/schema.ts)

| Question | Answer |
|---|---|
| **What is this file?** | Drizzle ORM schema — defines all database tables, enums, and relations |
| **Why does it exist?** | Single source of truth for the PostgreSQL schema. Used by Drizzle queries, migrations, and type inference |
| **Who imports it?** | Every server route, `lib/analytics.ts`, `lib/tokens.ts`, `db/seed.ts`, `db/index.ts`, `scripts/migrate-accounts.ts`, `app/layout.tsx`, `app/dashboard/settings/privacy/page.tsx` |
| **What imports does it have?** | `drizzle-orm/pg-core` (all column/table/enum builders), `drizzle-orm` (`relations`) |
| **What responsibility belongs here?** | Table definitions (`users`, `transactions`, `accounts`, `categories`, `budgets`, `userPreferences`, `transfers`, `passwordResetTokens`, `verificationTokens`), enum definitions, relation declarations, indexes |
| **What must NOT belong here?** | Queries, business logic, migration scripts, seed data |

---

### [`db/index.ts`](file:///c:/Users/ELCOT/expense-tracker-next.js/db/index.ts)

| Question | Answer |
|---|---|
| **What is this file?** | Database connection singleton |
| **Why does it exist?** | Creates a `pg.Pool` with the `DATABASE_URL` and wraps it with Drizzle ORM. Uses `globalThis` to reuse the pool in serverless/development environments (prevents connection leaks during hot reload) |
| **Who imports it?** | Every file that accesses the database (`server/routes/*`, `lib/analytics.ts`, `lib/tokens.ts`, `app/layout.tsx`, `app/dashboard/settings/privacy/page.tsx`) |
| **What imports does it have?** | `drizzle-orm/node-postgres`, `pg`, `./schema` |
| **What responsibility belongs here?** | Pool creation, Drizzle instance export (`db`), connection reuse |
| **What must NOT belong here?** | Schema definitions, queries, business logic |

---

### [`db/seed.ts`](file:///c:/Users/ELCOT/expense-tracker-next.js/db/seed.ts)

| Question | Answer |
|---|---|
| **What is this file?** | Database seed script — run via `pnpm seed` |
| **Why does it exist?** | Inserts default categories (11 expense + 9 income) if the categories table is empty |
| **Who imports it?** | No code imports it — run as a standalone script (`tsx db/seed.ts`) |
| **What imports does it have?** | `drizzle-orm/node-postgres`, `pg`, `./schema`, `dotenv` |
| **What responsibility belongs here?** | One-time seed data insertion, idempotency check |
| **What must NOT belong here?** | Application logic, runtime queries, test data |

---

### `db/migrations/` (directory)

| Question | Answer |
|---|---|
| **What is this file?** | Auto-generated SQL migration files from `drizzle-kit generate` |
| **Why does it exist?** | Tracks schema changes as versioned SQL files for reproducible deployments |
| **Who imports it?** | `drizzle-kit migrate` CLI |
| **What responsibility belongs here?** | SQL DDL statements only (CREATE TABLE, ALTER TABLE) |
| **What must NOT belong here?** | Application code, seed data, runtime queries |

---

## 📁 `hooks/` — React Hooks

---

### [`hooks/use-mobile.ts`](file:///c:/Users/ELCOT/expense-tracker-next.js/hooks/use-mobile.ts)

| Question | Answer |
|---|---|
| **What is this file?** | `useIsMobile()` hook — detects mobile viewport |
| **Why does it exist?** | Returns `true` when viewport width < 768px. Used by sidebar for responsive behavior |
| **Who imports it?** | [`components/ui/sidebar.tsx`](file:///c:/Users/ELCOT/expense-tracker-next.js/components/ui/sidebar.tsx) |
| **What imports does it have?** | `react` |
| **What responsibility belongs here?** | Viewport width detection via `matchMedia` |
| **What must NOT belong here?** | UI rendering, layout decisions (consumers decide) |

---

## 📁 `scripts/` — CLI Scripts

---

### [`scripts/migrate-accounts.ts`](file:///c:/Users/ELCOT/expense-tracker-next.js/scripts/migrate-accounts.ts)

| Question | Answer |
|---|---|
| **What is this file?** | One-time data migration script |
| **Why does it exist?** | Creates default "Cash" and "Bank Account" accounts, then backfills existing transactions that have `NULL` accountId |
| **Who imports it?** | No code imports it — run manually via `tsx scripts/migrate-accounts.ts` |
| **What imports does it have?** | `dotenv/config`, `../db`, `../db/schema`, `drizzle-orm` |
| **What responsibility belongs here?** | Data migration, backfilling nullable columns |
| **What must NOT belong here?** | Application logic, should not be run repeatedly |

---

## 📁 `public/` — Static Assets

| File | Purpose |
|---|---|
| [`public/file.svg`](file:///c:/Users/ELCOT/expense-tracker-next.js/public/file.svg) | Default Next.js icon (file) |
| [`public/globe.svg`](file:///c:/Users/ELCOT/expense-tracker-next.js/public/globe.svg) | Default Next.js icon (globe) |
| [`public/next.svg`](file:///c:/Users/ELCOT/expense-tracker-next.js/public/next.svg) | Next.js logo |
| [`public/vercel.svg`](file:///c:/Users/ELCOT/expense-tracker-next.js/public/vercel.svg) | Vercel logo |
| [`public/window.svg`](file:///c:/Users/ELCOT/expense-tracker-next.js/public/window.svg) | Default Next.js icon (window) |

> These are all boilerplate from `create-next-app` and appear to be **unused** in the actual application. Safe to delete.

---

## 📊 File Count Summary

| Directory | Source Files | Purpose |
|---|:---:|---|
| Root config | 9 | Framework/tooling configuration |
| `app/` | 25 | Next.js pages & layouts |
| `components/` | 29 + 17 UI | React components |
| `lib/` | 8 | Shared business logic & utilities |
| `server/` | 9 | Hono API backend |
| `db/` | 3 + migrations | Database schema, connection, seed |
| `hooks/` | 1 | React hooks |
| `scripts/` | 1 | CLI migration scripts |
| `public/` | 5 | Static assets (mostly unused) |
| **Total** | **~107** | |
