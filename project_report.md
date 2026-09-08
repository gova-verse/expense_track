# EXPENSE TRACKER (GOVA) — Complete Project Report

> **Purpose of this document**: This is a comprehensive, machine-readable report of the entire codebase of the "GOVA" Expense Tracker application. It is designed so that another AI model (such as ChatGPT) can fully understand the project's architecture, every file, every route, every database table, every component, every design decision, and the complete context needed to work with or extend this codebase.

---

## TABLE OF CONTENTS

1. [Project Overview](#1-project-overview)
2. [Technology Stack](#2-technology-stack)
3. [Project Structure (File Tree)](#3-project-structure-file-tree)
4. [Environment Variables](#4-environment-variables)
5. [Database Layer](#5-database-layer)
6. [Server / API Layer (Hono)](#6-server--api-layer-hono)
7. [Authentication System](#7-authentication-system)
8. [Frontend / App Layer (Next.js)](#8-frontend--app-layer-nextjs)
9. [UI Components](#9-ui-components)
10. [Theming & Design System](#10-theming--design-system)
11. [Business Logic & Utilities](#11-business-logic--utilities)
12. [Data Flow Architecture](#12-data-flow-architecture)
13. [Complete Code Reference](#13-complete-code-reference)
14. [Known Patterns & Conventions](#14-known-patterns--conventions)
15. [Deployment & Scripts](#15-deployment--scripts)

---

## 1. PROJECT OVERVIEW

**App Name**: GOVA (branded as "I-E" / "Income-to-Expense" in the sidebar)
**App Title in HTML**: "GOVA"
**Description**: A full-stack personal finance management web application that allows users to track income, expenses, transfers between accounts, manage budgets, view analytics/reports, and export financial data.

### Core Features
- **User Authentication**: Signup, login, logout, email verification, password reset
- **Multi-Account Management**: Cash, bank, wallet, credit card, and savings accounts with computed balances
- **Transaction Tracking**: Income and expense transactions with categories, accounts, payment methods, and notes
- **Inter-Account Transfers**: Transfer money between accounts with balance validation
- **Budget Management**: Daily, weekly, monthly budgets with category tracking and status indicators (healthy/approaching/over)
- **Financial Analytics**: Period-based aggregations, category breakdowns, trend comparisons (current vs previous month)
- **Reports & Export**: CSV, PDF (jsPDF), and Excel (xlsx) export of financial reports
- **Settings**: Theme (light/dark/system), color themes (default/ocean/forest), currency, date format, timezone, notification preferences, profile management, password change
- **Dashboard**: Summary cards with trends, bar chart (income vs expenses), pie chart (spending by category), financial insights, recent transactions

### Target Audience
Indian users (default currency INR, default locale en-IN, default timezone Asia/Kolkata), but configurable for any locale.

---

## 2. TECHNOLOGY STACK

### Core Framework
| Technology | Version | Purpose |
|---|---|---|
| **Next.js** | 16.3.1 | Full-stack React framework (App Router) |
| **React** | 19.2.8 | UI library |
| **TypeScript** | ^5 | Type safety |
| **Hono** | ^4.13.5 | Lightweight API framework (runs inside Next.js API routes) |

### Database
| Technology | Version | Purpose |
|---|---|---|
| **PostgreSQL** | (external, Neon-compatible) | Primary database |
| **Drizzle ORM** | ^0.45.2 | Type-safe SQL ORM |
| **Drizzle Kit** | ^0.31.10 | Database migration tool |
| **pg** | ^8.23.0 | PostgreSQL client for Node.js |

### UI & Styling
| Technology | Version | Purpose |
|---|---|---|
| **Tailwind CSS** | ^4 | Utility-first CSS framework |
| **shadcn/ui** | ^4.18.0 | Radix-based component library (style: radix-lyra) |
| **Radix UI** | ^1.6.7 | Unstyled accessible components |
| **Phosphor Icons** | ^2.1.10 | Icon library |
| **Recharts** | ^3.10.1 | Chart library (pie, bar, etc.) |
| **next-themes** | ^0.4.6 | Theme switching (dark/light/system) |
| **tw-animate-css** | ^1.4.0 | Tailwind animation utilities |

### Authentication & Security
| Technology | Version | Purpose |
|---|---|---|
| **jose** | ^6.2.9 | JWT signing and verification (HS256) |
| **bcryptjs** | ^3.0.3 | Password hashing |
| **nodemailer** | ^9.0.5 | Email sending (verification, password reset) |

### Forms & Validation
| Technology | Version | Purpose |
|---|---|---|
| **Zod** | ^4.4.3 | Schema validation (shared between client and server) |
| **React Hook Form** | ^7.85.0 | Form state management |
| **@hookform/resolvers** | ^5.9.0 | Zod resolver for React Hook Form |
| **@hono/zod-validator** | ^0.9.0 | Zod validation middleware for Hono |

### Export & Reports
| Technology | Version | Purpose |
|---|---|---|
| **jsPDF** | ^4.2.1 | PDF generation |
| **jspdf-autotable** | ^5.0.8 | PDF table plugin |
| **xlsx** | ^0.18.5 | Excel file generation |

### Build & Dev Tools
| Technology | Version | Purpose |
|---|---|---|
| **pnpm** | 11.20.0 | Package manager |
| **tsx** | ^4.23.12 | TypeScript execution (for scripts like seed) |
| **ESLint** | ^9 | Code linting |

### Fonts (Google Fonts)
- **Geist** (sans-serif, `--font-geist-sans`)
- **Geist Mono** (monospace, `--font-geist-mono`)
- **JetBrains Mono** (monospace, `--font-mono`) — **Primary body font** (`html` uses `font-mono`)

---

## 3. PROJECT STRUCTURE (FILE TREE)

```
expense-tracker-next.js/
├── app/                              # Next.js App Router
│   ├── api/
│   │   └── [[...route]]/
│   │       └── route.ts              # Catch-all API route → delegates to Hono
│   ├── dashboard/
│   │   ├── accounts/                 # Accounts page
│   │   ├── budgets/                  # Budgets page
│   │   ├── categories/               # Categories management (expense/income)
│   │   ├── reports/                  # Financial reports page
│   │   ├── settings/
│   │   │   ├── account/              # Profile & password settings
│   │   │   ├── appearance/           # Theme settings
│   │   │   ├── billing/              # Billing page (upgrade)
│   │   │   ├── currency/             # Currency & locale settings
│   │   │   ├── help/                 # Help & about
│   │   │   ├── notifications/        # Notification preferences
│   │   │   ├── privacy/              # Privacy & security settings
│   │   │   ├── layout.tsx            # Settings layout
│   │   │   └── page.tsx              # Settings index (redirects)
│   │   ├── transactions/             # Transactions page + transfers sub-page
│   │   ├── upgrade/                  # Upgrade/pricing page
│   │   ├── error.tsx                 # Error boundary
│   │   ├── layout.tsx                # Dashboard layout (sidebar, breadcrumbs, preferences)
│   │   └── page.tsx                  # Dashboard home (analytics + recent transactions)
│   ├── forgot-password/              # Forgot password page
│   ├── login/                        # Login page
│   ├── reset-password/               # Reset password page
│   ├── signup/                       # Signup page
│   ├── verify-email/                 # Email verification page
│   ├── globals.css                   # Global styles + theme CSS variables
│   ├── layout.tsx                    # Root layout (fonts, ThemeProvider, TooltipProvider)
│   ├── page.tsx                      # Home page (redirects to /dashboard or /login)
│   └── favicon.ico
│
├── components/                       # React components
│   ├── ui/                           # shadcn/ui base components
│   │   ├── accordion.tsx
│   │   ├── avatar.tsx
│   │   ├── breadcrumb.tsx
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── collapsible.tsx
│   │   ├── dialog.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── field.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── separator.tsx
│   │   ├── sheet.tsx
│   │   ├── sidebar.tsx
│   │   ├── skeleton.tsx
│   │   ├── switch.tsx
│   │   └── tooltip.tsx
│   │
│   ├── account-client.tsx            # Account settings form (profile, password)
│   ├── accounts-client.tsx           # Accounts list page client component
│   ├── app-sidebar.tsx               # Main sidebar navigation
│   ├── appearance-client.tsx         # Appearance settings (theme, color theme)
│   ├── billing-client.tsx            # Billing/upgrade settings
│   ├── budget-form.tsx               # Budget create/edit form
│   ├── budgets-client.tsx            # Budgets list page
│   ├── category-page.tsx             # Category management page
│   ├── currency-client.tsx           # Currency & region settings
│   ├── dashboard-client.tsx          # Dashboard home with charts & analytics
│   ├── forgot-password-form.tsx      # Forgot password form
│   ├── login-form.tsx                # Login form
│   ├── nav-Insights.tsx              # Sidebar insights navigation section
│   ├── nav-main.tsx                  # Sidebar main navigation section
│   ├── nav-user.tsx                  # Sidebar user menu (avatar, logout)
│   ├── notifications-client.tsx      # Notification preferences settings
│   ├── preferences-provider.tsx      # React context for user preferences + formatCurrency/formatDate
│   ├── privacy-client.tsx            # Privacy & security settings
│   ├── reports-client.tsx            # Reports page with analytics charts
│   ├── reset-password-form.tsx       # Reset password form
│   ├── search-form.tsx               # Search form component
│   ├── signup-form.tsx               # Signup form
│   ├── team-switcher.tsx             # Brand/team switcher in sidebar header
│   ├── theme-provider.tsx            # next-themes provider wrapper
│   ├── transaction-page.tsx          # Transactions management page (list, add, edit, delete)
│   ├── transfers-client.tsx          # Transfers management page
│   ├── upgrade-client.tsx            # Upgrade pricing page
│   ├── verify-email-client.tsx       # Email verification client
│   └── version-switcher.tsx          # Version switcher component
│
├── db/                               # Database layer
│   ├── migrations/                   # Drizzle migration SQL files
│   │   ├── 0000_conscious_shiva.sql  # Initial schema
│   │   ├── 0001_married_nocturne.sql # Auth tokens + user preferences update
│   │   └── meta/                     # Migration metadata
│   ├── index.ts                      # Database connection (Drizzle + pg Pool, singleton)
│   ├── schema.ts                     # Complete database schema (all tables + relations)
│   └── seed.ts                       # Seed script for default categories
│
├── hooks/
│   └── use-mobile.ts                 # Mobile detection hook
│
├── lib/                              # Shared utilities
│   ├── analytics.ts                  # Analytics engine (aggregations, trends, category breakdowns)
│   ├── auth.ts                       # Server-only auth utilities (encrypt, decrypt, session management)
│   ├── budget-utils.ts               # Budget period calculations and metrics
│   ├── email.ts                      # Email templates (verification, password reset) via nodemailer
│   ├── export-report.ts              # CSV, PDF, Excel export utilities
│   ├── tokens.ts                     # Auth token generation, hashing, verification (SHA-256)
│   ├── utils.ts                      # cn() utility (clsx + tailwind-merge)
│   └── validations.ts               # All Zod schemas (shared between client and server)
│
├── server/                           # Hono API server
│   ├── api-client.ts                 # Server-side API client for Next.js Server Components
│   ├── index.ts                      # Hono app entry point, route registration
│   ├── lib/
│   │   └── balance.ts                # Account balance calculation & insufficient balance checks
│   ├── middleware/
│   │   └── auth.ts                   # JWT auth middleware for Hono
│   └── routes/
│       ├── auth.ts                   # Auth routes (signup, login, logout, verify-email, forgot/reset-password)
│       ├── accounts.ts               # Account CRUD + balance calculation
│       ├── budgets.ts                # Budget CRUD + spent calculation
│       ├── categories.ts             # Category CRUD
│       ├── settings.ts               # User settings (profile, preferences, password, notifications)
│       ├── transactions.ts           # Transaction CRUD with category/balance validation
│       └── transfers.ts              # Transfer CRUD with balance checks
│
├── scripts/
│   └── migrate-accounts.ts           # One-time migration script
│
├── public/                           # Static assets
├── .env.local                        # Environment variables (not committed)
├── components.json                   # shadcn/ui configuration
├── drizzle.config.ts                 # Drizzle ORM configuration
├── middleware.ts                     # Next.js Edge middleware (auth redirects)
├── next.config.ts                    # Next.js configuration
├── package.json                      # Dependencies & scripts
├── pnpm-lock.yaml                    # Lock file
├── pnpm-workspace.yaml               # Workspace config
├── postcss.config.mjs                # PostCSS config (Tailwind)
├── tsconfig.json                     # TypeScript configuration
└── README.md                         # Project readme
```

---

## 4. ENVIRONMENT VARIABLES

The app requires the following environment variables in `.env.local`:

| Variable | Description | Example |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/dbname?sslmode=require` |
| `JWT_SECRET` | Secret key for JWT signing (HS256) | `your-super-secret-key-here` |
| `NEXT_PUBLIC_BASE_URL` | Public base URL (used by server-side API client) | `http://localhost:3000` |
| `APP_URL` | Application URL (used in email templates) | `http://localhost:3000` |
| `SMTP_HOST` | SMTP server host for sending emails | `smtp.gmail.com` |
| `SMTP_PORT` | SMTP server port | `465` |
| `SMTP_USER` | SMTP username/email | `your-email@gmail.com` |
| `SMTP_PASSWORD` | SMTP password or app-specific password | `your-app-password` |
| `EMAIL_FROM` | "From" address for outgoing emails | `noreply@your-app.com` |

---

## 5. DATABASE LAYER

### 5.1 Connection (`db/index.ts`)

Uses a **singleton pattern** with a global pool to avoid creating multiple connections during development hot reloads:

```typescript
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

const globalForDb = globalThis as unknown as { pool: Pool | undefined };
const pool = globalForDb.pool ?? new Pool({ connectionString: process.env.DATABASE_URL });
if (process.env.NODE_ENV !== 'production') globalForDb.pool = pool;
export const db = drizzle(pool, { schema });
```

### 5.2 Complete Schema (`db/schema.ts`)

#### Enum Types
```sql
auth_token_type: 'email_verification' | 'password_reset'
category_type:   'expense' | 'income'
transaction_type: 'expense' | 'income' | 'transfer'
account_type:    'cash' | 'bank' | 'wallet' | 'credit' | 'savings'
budget_period:   'daily' | 'weekly' | 'monthly'
```

#### Table: `users`
| Column | Type | Constraints |
|---|---|---|
| id | serial | PRIMARY KEY |
| email | varchar(255) | UNIQUE, NOT NULL |
| password | varchar(255) | nullable (for future OAuth) |
| name | varchar(255) | nullable |
| email_verified_at | timestamp | nullable |
| created_at | timestamp | DEFAULT NOW(), NOT NULL |
| updated_at | timestamp | DEFAULT NOW(), NOT NULL |

#### Table: `user_preferences`
| Column | Type | Default |
|---|---|---|
| id | serial | PRIMARY KEY |
| user_id | integer | FK → users.id, UNIQUE |
| theme | varchar(50) | 'system' |
| color_theme | varchar(50) | 'default' |
| currency | varchar(10) | 'INR' |
| number_format | varchar(50) | 'en-IN' |
| date_format | varchar(50) | 'DD/MM/YYYY' |
| timezone | varchar(100) | 'Asia/Kolkata' |
| notify_security_alerts | boolean | true |
| notify_account_activity | boolean | true |
| notify_monthly_summary | boolean | false |
| notify_budget_approaching | boolean | true |
| notify_budget_exceeded | boolean | true |
| notify_high_spending | boolean | false |
| notify_product_updates | boolean | false |
| notify_new_features | boolean | true |
| created_at | timestamp | DEFAULT NOW() |
| updated_at | timestamp | DEFAULT NOW() |

#### Table: `auth_tokens`
| Column | Type | Constraints |
|---|---|---|
| id | serial | PRIMARY KEY |
| user_id | integer | FK → users.id, NOT NULL |
| token_hash | varchar(255) | NOT NULL (SHA-256 hash) |
| type | auth_token_type | NOT NULL |
| expires_at | timestamp | NOT NULL |
| created_at | timestamp | DEFAULT NOW() |

#### Table: `categories`
| Column | Type | Constraints |
|---|---|---|
| id | serial | PRIMARY KEY |
| name | varchar(255) | NOT NULL |
| type | category_type | NOT NULL |
| icon | varchar(255) | nullable |
| color | varchar(255) | nullable |
| is_default | boolean | DEFAULT false |
| user_id | integer | FK → users.id, nullable (null = global default) |
| created_at | timestamp | DEFAULT NOW() |
| updated_at | timestamp | DEFAULT NOW() |

#### Table: `accounts`
| Column | Type | Constraints |
|---|---|---|
| id | serial | PRIMARY KEY |
| name | varchar(255) | NOT NULL |
| type | account_type | NOT NULL |
| opening_balance | decimal(12,2) | DEFAULT '0', NOT NULL |
| user_id | integer | FK → users.id, nullable |
| created_at | timestamp | DEFAULT NOW() |
| updated_at | timestamp | DEFAULT NOW() |

#### Table: `transactions`
| Column | Type | Constraints |
|---|---|---|
| id | serial | PRIMARY KEY |
| type | transaction_type | NOT NULL |
| amount | decimal(12,2) | NOT NULL |
| date | timestamp | NOT NULL |
| description | text | nullable |
| category_id | integer | FK → categories.id, nullable |
| account_id | integer | FK → accounts.id, nullable |
| destination_account_id | integer | FK → accounts.id, nullable (for transfers) |
| payment_method | varchar(255) | nullable |
| notes | text | nullable |
| user_id | integer | FK → users.id, nullable |
| created_at | timestamp | DEFAULT NOW() |
| updated_at | timestamp | DEFAULT NOW() |

**Indexes**: `date_idx`, `type_idx`, `category_idx`, `account_idx`

#### Table: `budgets`
| Column | Type | Constraints |
|---|---|---|
| id | serial | PRIMARY KEY |
| name | varchar(255) | NOT NULL |
| amount | decimal(12,2) | NOT NULL |
| period | budget_period | NOT NULL |
| category_id | integer | FK → categories.id, nullable (null = overall budget) |
| user_id | integer | FK → users.id, nullable |
| start_date | timestamp | NOT NULL |
| end_date | timestamp | nullable (ongoing budgets) |
| created_at | timestamp | DEFAULT NOW() |
| updated_at | timestamp | DEFAULT NOW() |

### 5.3 Relations (Drizzle ORM)

```
users ──(1:1)──> user_preferences
users ──(1:N)──> categories
users ──(1:N)──> transactions
users ──(1:N)──> budgets
users ──(1:N)──> accounts
accounts ──(1:N)──> transactions (via account_id, relationName: 'account_transactions')
accounts ──(1:N)──> transactions (via destination_account_id, relationName: 'destination_account_transactions')
categories ──(1:N)──> transactions
categories ──(1:N)──> budgets
```

### 5.4 Default Seed Data (`db/seed.ts`)

20 default categories seeded with `isDefault: true` and `userId: null` (global):

**Expense Categories**: Food, Transport, Shopping, Entertainment, Bills, Rent, Health, Education, Travel, Personal, Other

**Income Categories**: Salary, Freelance, Business, Investment, Interest, Rental, Gift, Refund, Other Income

---

## 6. SERVER / API LAYER (Hono)

### 6.1 Architecture

The API uses **Hono** framework mounted inside Next.js via a catch-all API route:

```
app/api/[[...route]]/route.ts → imports Hono app → handles GET/POST/PUT/DELETE/PATCH
```

The Hono app (`server/index.ts`) registers routes with `.basePath('/api')`:

```typescript
const app = new Hono().basePath('/api')
const routes = app
  .route('/transactions', transactions)
  .route('/accounts', accounts)
  .route('/categories', categories)
  .route('/auth', auth)
  .route('/budgets', budgets)
  .route('/settings', settings)
  .route('/transfers', transfers)
export type AppType = typeof routes  // Exported for type-safe RPC client
```

### 6.2 Auth Middleware (`server/middleware/auth.ts`)

All routes except `/api/auth/*` use the auth middleware that:
1. Reads the `session` cookie via `getCookie(c, 'session')`
2. Verifies the JWT using `jose.jwtVerify` with HS256
3. Extracts `userId` from payload and sets it on the Hono context: `c.set('userId', payload.userId)`
4. Returns 401 if token is missing/invalid

### 6.3 Complete API Endpoints

#### Auth Routes (`/api/auth/*`) — NO auth middleware

| Method | Path | Description | Request Body |
|---|---|---|---|
| POST | `/api/auth/signup` | Register new user | `{ name, email, password, confirmPassword }` |
| POST | `/api/auth/login` | Login (sets session cookie) | `{ email, password }` |
| POST | `/api/auth/logout` | Logout (deletes session cookie) | none |
| POST | `/api/auth/verify-email` | Verify email with token | `{ token }` |
| POST | `/api/auth/resend-verification` | Resend verification email | `{ email }` |
| POST | `/api/auth/forgot-password` | Send password reset email | `{ email }` |
| POST | `/api/auth/reset-password` | Reset password with token | `{ token, password, confirmPassword }` |

**Auth Logic Details**:
- Passwords hashed with bcrypt (10 rounds)
- JWT sessions expire in 7 days
- Email verification required before login (returns 403 with `requiresVerification: true`)
- Auth tokens are SHA-256 hashed before storage, single-use, auto-expired
- Verification tokens expire in 24 hours, password reset tokens in 1 hour
- Generic response for forgot-password (doesn't reveal if email exists)

#### Transaction Routes (`/api/transactions/*`) — auth required

| Method | Path | Description |
|---|---|---|
| GET | `/api/transactions` | List all transactions for user (with category and account names, ordered by date DESC) |
| GET | `/api/transactions/recent?limit=5` | Recent transactions |
| POST | `/api/transactions` | Create transaction (validates category type match, checks balance for expenses) |
| PUT | `/api/transactions/:id` | Update transaction (validates ownership, category, balance) |
| DELETE | `/api/transactions/:id` | Delete transaction (validates ownership) |

**Business Rules**:
- Transfer type transactions must use `/api/transfers` instead
- Category is required for income/expense
- Category type must match transaction type
- Balance check for expense on non-credit accounts (cash, bank, wallet, savings)
- On update, if same account, calculates delta for balance check

#### Account Routes (`/api/accounts/*`) — auth required

| Method | Path | Description |
|---|---|---|
| GET | `/api/accounts` | List user's accounts |
| GET | `/api/accounts/with-balance` | List accounts with computed `currentBalance` |
| POST | `/api/accounts` | Create account |
| PUT | `/api/accounts/:id` | Update account |
| DELETE | `/api/accounts/:id` | Delete account (fails if has transactions) |

**Balance Calculation**:
```
currentBalance = openingBalance + totalIncome - totalExpense - outgoingTransfers + incomingTransfers
```

#### Category Routes (`/api/categories/*`) — auth required

| Method | Path | Description |
|---|---|---|
| GET | `/api/categories?type=expense\|income` | List categories (user's + global defaults) |
| POST | `/api/categories` | Create category (checks for duplicate name+type) |
| PUT | `/api/categories/:id` | Update category (only user-owned) |
| DELETE | `/api/categories/:id` | Delete category (fails if referenced by transactions) |

#### Budget Routes (`/api/budgets/*`) — auth required

| Method | Path | Description |
|---|---|---|
| GET | `/api/budgets` | List budgets with computed spent, remaining, usage%, status |
| POST | `/api/budgets` | Create budget (validates expense category if specified) |
| PUT | `/api/budgets/:id` | Update budget |
| DELETE | `/api/budgets/:id` | Delete budget |

**Budget Metrics**:
- `spent`: Sum of expense transactions in the active period (optionally filtered by category)
- `remaining`: amount - spent
- `usage`: (spent / amount) * 100
- `status`: "healthy" (<80%), "approaching" (80-99%), "over" (≥100%)
- Active period calculated dynamically: daily (today), weekly (Mon-Sun), monthly (1st to last day)

#### Transfer Routes (`/api/transfers/*`) — auth required

| Method | Path | Description |
|---|---|---|
| GET | `/api/transfers` | List transfers with account names |
| POST | `/api/transfers` | Create transfer (validates both accounts, checks balance) |
| PUT | `/api/transfers/:id` | Update transfer |
| DELETE | `/api/transfers/:id` | Delete transfer |

**Transfer Rules**:
- Source and destination must be different accounts
- Balance check on source account (credit accounts exempt)

#### Settings Routes (`/api/settings/*`) — auth required

| Method | Path | Description |
|---|---|---|
| GET | `/api/settings/me` | Get authenticated user info |
| GET | `/api/settings/preferences` | Get user preferences |
| PATCH | `/api/settings/preferences` | Update preferences (theme, currency, etc.) |
| PATCH | `/api/settings/profile` | Update profile (name) |
| POST | `/api/settings/change-password` | Change password (validates current password) |
| PATCH | `/api/settings/notifications` | Update notification preferences |

### 6.4 Server-Side API Client (`server/api-client.ts`)

For use in Next.js **Server Components** and `page.tsx` files. It:
1. Reads the `session` cookie from `next/headers`
2. Makes `fetch()` calls to the Hono API with the cookie forwarded
3. Uses `cache: 'no-store'` for fresh data
4. Exports typed functions: `getTransactions()`, `getRecentTransactions()`, `getAccounts()`, `getAccountsWithBalance()`, `getCategories()`, `getAllCategories()`, `getTransfers()`, `getBudgets()`, `getMe()`, `getPreferences()`

### 6.5 Balance Utilities (`server/lib/balance.ts`)

- `getAccountBalance(accountId)`: Computes balance from transactions
- `checkSufficientBalance(accountId, amount)`: Returns `{ ok: true }` or `{ ok: false, available, accountName }`
- Credit card accounts (`type: 'credit'`) always pass balance checks
- Strict accounts: cash, bank, wallet, savings

---

## 7. AUTHENTICATION SYSTEM

### 7.1 Flow Overview

```
Signup → Hash password → Insert user → Create preferences → Generate verification token → Send email
Login → Verify password → Check email verified → Create JWT session cookie (7 days)
Logout → Delete session cookie
Middleware (Next.js Edge) → Verify JWT → Redirect if needed
Middleware (Hono) → Verify JWT → Inject userId into context
```

### 7.2 JWT Structure

```json
{
  "userId": 1,
  "expiresAt": "2026-09-09T11:44:15.000Z",
  "iat": 1725268455,
  "exp": 1725873255
}
```
- Algorithm: HS256
- Stored in: HttpOnly cookie named `session`
- Cookie flags: `httpOnly: true`, `secure: true (prod)`, `sameSite: Lax`, `path: /`

### 7.3 Next.js Edge Middleware (`middleware.ts`)

Routes are classified into:
- **Dashboard routes** (`/dashboard/*`): Require auth, redirect to `/login` if no session
- **Auth routes** (`/login`, `/signup`, `/`): Redirect to `/dashboard` if already authenticated
- **Public routes** (`/forgot-password`, `/verify-email`, `/reset-password`): Accessible to everyone
- **API routes, static assets**: Excluded from middleware via matcher

### 7.4 Token System (`lib/tokens.ts`)

- **Token Generation**: `crypto.randomBytes(32)` → 64-char hex string
- **Token Storage**: Only SHA-256 hash stored in `auth_tokens` table
- **Single-use**: Token deleted after successful verification
- **Auto-invalidation**: Creating a new token invalidates existing tokens of the same type for the user

### 7.5 Email System (`lib/email.ts`)

Uses nodemailer with SMTP transport. Sends:
1. **Verification Email**: HTML template with CTA button, link expires in 24 hours
2. **Password Reset Email**: HTML template with CTA button, link expires in 1 hour

Both templates are responsive, table-based HTML emails with the "Expense Tracker" branding.

---

## 8. FRONTEND / APP LAYER (Next.js)

### 8.1 Routing Architecture

Uses **Next.js App Router** with the following pattern:
- **Server Components** (`page.tsx` files): Fetch data server-side, pass to client components
- **Client Components** (`*-client.tsx`): Handle interactivity, forms, state
- **`export const dynamic = 'force-dynamic'`**: Used on pages that require fresh data

### 8.2 Root Layout (`app/layout.tsx`)

```
<html> (with data-theme attribute for color themes)
  <body> (Geist + JetBrains Mono fonts)
    <ThemeProvider> (next-themes, supports system/light/dark)
      <TooltipProvider>
        {children}
      </TooltipProvider>
    </ThemeProvider>
  </body>
</html>
```

### 8.3 Dashboard Layout (`app/dashboard/layout.tsx`)

```
<SidebarProvider>
  <PreferencesProvider> (currency, numberFormat, dateFormat, timezone from API)
    <AppSidebar> (navigation)
    <SidebarInset>
      <header> (SidebarTrigger, breadcrumbs)
      <main> {children} </main>
    </SidebarInset>
  </PreferencesProvider>
</SidebarProvider>
```

### 8.4 Page Data Flow Pattern

Every dashboard page follows this pattern:

```typescript
// page.tsx (Server Component)
export const dynamic = "force-dynamic"

export default async function Page() {
  // 1. Verify session
  const session = await verifySession()
  if (!session) redirect("/login")

  // 2. Fetch data via server-side API client
  const data = await getDataFromAPI()

  // 3. Pass to client component
  return <ClientComponent data={data} />
}
```

### 8.5 Dashboard Page

Fetches:
- Full analytics (current month + previous month for trends)
- Recent 5 transactions

Renders via `DashboardClient`:
- 4 summary cards (Total Income, Total Expenses, Net Savings, Savings Rate) with trend indicators
- Bar chart (Income vs Expenses, horizontal layout)
- Pie chart (Spending by Category, donut style)
- Financial insights (Top Income Source, Highest Expense Category)
- Recent transactions list with category icons and color coding

### 8.6 Sidebar Navigation Structure

**Main Section**:
- Dashboard
- Accounts
- Transactions → All Transactions, Transfers
- Categories → Expense categories, Income categories

**Insights Section**:
- Reports
- Budgets
- Settings → Appearance, Currency & Region, Account, Notifications, Privacy & Security, Billing, Help & About

---

## 9. UI COMPONENTS

### 9.1 Component Library

The project uses **shadcn/ui** with the `radix-lyra` style. Components installed:

| Component | File | Description |
|---|---|---|
| Accordion | `ui/accordion.tsx` | Expandable content sections |
| Avatar | `ui/avatar.tsx` | User profile images |
| Breadcrumb | `ui/breadcrumb.tsx` | Navigation breadcrumbs |
| Button | `ui/button.tsx` | Standard buttons with variants |
| Card | `ui/card.tsx` | Content containers |
| Collapsible | `ui/collapsible.tsx` | Toggle content visibility |
| Dialog | `ui/dialog.tsx` | Modal dialogs |
| DropdownMenu | `ui/dropdown-menu.tsx` | Dropdown menus |
| Field | `ui/field.tsx` | Form field wrapper |
| Input | `ui/input.tsx` | Text inputs |
| Label | `ui/label.tsx` | Form labels |
| Separator | `ui/separator.tsx` | Visual dividers |
| Sheet | `ui/sheet.tsx` | Slide-out panels |
| Sidebar | `ui/sidebar.tsx` | Full sidebar implementation |
| Skeleton | `ui/skeleton.tsx` | Loading placeholders |
| Switch | `ui/switch.tsx` | Toggle switches |
| Tooltip | `ui/tooltip.tsx` | Hover tooltips |

### 9.2 Icon Library

Uses **Phosphor Icons** (`@phosphor-icons/react`). Icons used include:
`RowsIcon`, `WaveformIcon`, `ChartPieIcon`, `WalletIcon`, `SquaresFour`, `ArrowsLeftRight`, `Tag`, `GearIcon`, `PaletteIcon`, `GlobeIcon`, `ShieldCheckIcon`, `QuestionIcon`, `Bank`, `UserCircleIcon`, `BellIcon`, `CreditCardIcon`, `ArrowUp`, `ArrowDown`, `TrendUp`, `TrendDown`, `PiggyBank`, `CurrencyDollar`, `ChartPie`

### 9.3 Chart Library

Uses **Recharts** with these chart types:
- `PieChart` + `Pie` + `Cell` — Spending by category (donut chart)
- `BarChart` + `Bar` + `Cell` — Income vs Expenses (horizontal)
- `ResponsiveContainer` — Responsive wrapper

Color palette for charts: `["#6366f1", "#f43f5e", "#10b981", "#f59e0b", "#8b5cf6", "#06b6d4", "#ec4899", "#14b8a6"]`

---

## 10. THEMING & DESIGN SYSTEM

### 10.1 Theme Architecture

- **Mode**: Light / Dark / System (via `next-themes`)
- **Color Themes**: Default (neutral), Ocean (blue), Forest (green)
- Mode is stored in `user_preferences.theme` and applied via CSS class (`.dark`)
- Color theme stored in `user_preferences.color_theme` and applied via `data-theme` attribute on `<html>`

### 10.2 CSS Variables (from `globals.css`)

The design system uses **oklch** color space exclusively:

**Light Mode (`:root`)**:
```css
--background: oklch(1 0 0);        /* White */
--foreground: oklch(0.145 0 0);    /* Near black */
--primary: oklch(0.205 0 0);       /* Very dark */
--primary-foreground: oklch(0.985 0 0);
--secondary: oklch(0.97 0 0);
--muted: oklch(0.97 0 0);
--muted-foreground: oklch(0.556 0 0);
--destructive: oklch(0.577 0.245 27.325);  /* Red */
--border: oklch(0.922 0 0);
--radius: 0.625rem;
```

**Dark Mode (`.dark`)**:
```css
--background: oklch(0.145 0 0);    /* Near black */
--foreground: oklch(0.985 0 0);    /* Near white */
--primary: oklch(0.922 0 0);
--card: oklch(0.205 0 0);
--border: oklch(1 0 0 / 10%);
--input: oklch(1 0 0 / 15%);
```

**Ocean Theme** (`[data-theme="ocean"]`):
```css
--primary: oklch(0.55 0.15 240);   /* Blue */
```

**Forest Theme** (`[data-theme="forest"]`):
```css
--primary: oklch(0.55 0.15 150);   /* Green */
```

### 10.3 Typography

- **Body font**: JetBrains Mono (monospace) — applied globally via `html { font-mono }`
- **Sans font**: Geist (available via `font-sans`)
- **Heading font**: Uses `--font-mono` (JetBrains Mono)

### 10.4 Component Configuration (`components.json`)

```json
{
  "style": "radix-lyra",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "css": "app/globals.css",
    "baseColor": "neutral",
    "cssVariables": true
  },
  "iconLibrary": "phosphor",
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui"
  }
}
```

---

## 11. BUSINESS LOGIC & UTILITIES

### 11.1 Analytics Engine (`lib/analytics.ts`)

**`getPeriodAggregations(period, userId)`**: Returns for a date range:
- `totalIncome`, `totalExpenses`, `netSavings`, `savingsRate`
- `avgIncome`, `avgExpense`, `incomeCount`, `expenseCount`

**`getCategoryAggregations(period, type, userId)`**: Returns category-level breakdown:
- Per category: `totalSpent`, `count`, `avgTransaction`, `share` (percentage)
- `topCategory` (highest spending)

**`getFullAnalytics(currentPeriod, previousPeriod, userId)`**: Combines current and previous period data with trend calculations:
- `trends.income = ((current - previous) / previous) * 100`
- Per-category trends comparing current vs previous period

### 11.2 Budget Utilities (`lib/budget-utils.ts`)

**`getActivePeriodRange(period)`**: Calculates date range:
- Daily: Start of today → End of today
- Weekly: Monday 00:00 → Sunday 23:59
- Monthly: 1st of month → Last day of month

**`calculateBudgetMetrics(amount, spent)`**: Returns:
- `remaining`, `usage` (%), `status` ("healthy"/"approaching"/"over")

### 11.3 Export Report (`lib/export-report.ts`)

All exports consume the same `ExportAnalyticsData` type. No separate DB queries.

**CSV**: BOM-encoded UTF-8, sections for Summary, Income Analysis, Expense Analysis, Cash Flow
**PDF**: jsPDF with autoTable plugin, colored headers per section (indigo for summary, green for income, red for expenses)
**Excel**: Multi-sheet workbook: Summary, Income, Expenses, Categories, Cash Flow

### 11.4 Preferences System (`components/preferences-provider.tsx`)

React Context providing:
- `currency` (e.g., "INR", "USD")
- `numberFormat` (e.g., "en-IN", "en-US")
- `dateFormat` (e.g., "DD/MM/YYYY", "MM/DD/YYYY", "YYYY-MM-DD")
- `timezone` (e.g., "Asia/Kolkata")

Utility functions:
- `formatCurrency(amount, prefs)`: Uses `Intl.NumberFormat`
- `formatDate(date, prefs)`: Uses `Intl.DateTimeFormat` with timezone

### 11.5 Validation Schemas (`lib/validations.ts`)

All schemas use Zod and are shared between client and server:

| Schema | Fields | Notes |
|---|---|---|
| `insertTransactionSchema` | type, amount, date, description, categoryId, accountId, destinationAccountId, paymentMethod, notes | amount is coerced number, positive |
| `insertTransferSchema` | amount, date, accountId, destinationAccountId, description, notes | Refine: accounts must differ |
| `insertAccountSchema` | name, type, openingBalance | type enum validated |
| `insertCategorySchema` | name, type, icon, color, isDefault | — |
| `loginSchema` | email, password | — |
| `signupSchema` | name, email, password, confirmPassword | Password: 8+ chars, uppercase, lowercase, number |
| `forgotPasswordSchema` | email | — |
| `resetPasswordSchema` | token, password, confirmPassword | — |
| `updateProfileSchema` | name | — |
| `changePasswordSchema` | currentPassword, newPassword, confirmPassword | — |
| `notificationPreferencesSchema` | 8 boolean fields | — |
| `budgetSchema` | name, amount, period, categoryId | From budget-utils.ts |

---

## 12. DATA FLOW ARCHITECTURE

```
┌─────────────────────────────────────────────────────────────┐
│                         BROWSER                              │
│                                                              │
│  ┌──────────────┐  ┌───────────────┐  ┌──────────────────┐  │
│  │ Client Comps │  │  React Hook   │  │  fetch('/api/…') │  │
│  │ (*-client)   │──│  Form + Zod   │──│  from client     │  │
│  └──────────────┘  └───────────────┘  └────────┬─────────┘  │
│                                                 │            │
└─────────────────────────────────────────────────┼────────────┘
                                                  │
┌─────────────────────────────────────────────────┼────────────┐
│                      NEXT.JS SERVER              │            │
│                                                  │            │
│  ┌──────────────────┐   ┌────────────────────┐  │            │
│  │  Server Components│   │ API Route Handler  │◀─┘            │
│  │  (page.tsx)       │   │ /api/[[...route]]  │              │
│  │                   │   │                    │              │
│  │  Uses api-client  │   │  Delegates to Hono │              │
│  │  (fetch + cookie) │──▶│                    │              │
│  └──────────────────┘   └────────┬───────────┘              │
│                                   │                          │
│                         ┌─────────▼──────────┐              │
│                         │    HONO FRAMEWORK   │              │
│                         │                     │              │
│                         │  Auth Middleware     │              │
│                         │  ↓                   │              │
│                         │  Route Handlers      │              │
│                         │  (Zod validation)    │              │
│                         └─────────┬───────────┘              │
│                                   │                          │
│                         ┌─────────▼──────────┐              │
│                         │   DRIZZLE ORM       │              │
│                         │   (Type-safe SQL)   │              │
│                         └─────────┬───────────┘              │
│                                   │                          │
└───────────────────────────────────┼──────────────────────────┘
                                    │
                         ┌──────────▼──────────┐
                         │    POSTGRESQL        │
                         │    (Neon / local)    │
                         └─────────────────────┘
```

### Key Data Flow Patterns

1. **Server Component Data Fetching**: `page.tsx` → `server/api-client.ts` → `fetch('/api/…')` → Hono → Drizzle → PostgreSQL
2. **Client-Side Mutations**: Client Component → `fetch('/api/…')` → Hono middleware (auth) → Route handler (Zod validation) → Drizzle → PostgreSQL → JSON response → `router.refresh()`
3. **Session Flow**: Login → JWT cookie set → Every request includes cookie → Middleware verifies → userId injected

---

## 13. COMPLETE CODE REFERENCE

### 13.1 Key File Sizes and Complexity

| File | Lines | Purpose |
|---|---|---|
| `components/reports-client.tsx` | ~600+ | Most complex client component — full reports page |
| `components/transaction-page.tsx` | ~400+ | Transaction management with CRUD dialogs |
| `components/dashboard-client.tsx` | 337 | Dashboard with charts and analytics |
| `components/transfers-client.tsx` | ~280 | Transfer management |
| `components/accounts-client.tsx` | ~250 | Account management |
| `components/budgets-client.tsx` | ~180 | Budget management |
| `server/routes/transactions.ts` | 224 | Transaction CRUD with balance validation |
| `server/routes/auth.ts` | 194 | Full auth flow |
| `server/routes/transfers.ts` | 190 | Transfer CRUD |
| `lib/analytics.ts` | 187 | Analytics engine |
| `db/schema.ts` | 181 | Complete database schema |
| `server/api-client.ts` | 176 | Server-side API client with types |
| `server/routes/budgets.ts` | 161 | Budget CRUD with metrics |
| `lib/email.ts` | 156 | Email templates |
| `app/globals.css` | 155 | Theme system |
| `server/routes/accounts.ts` | 155 | Account CRUD |
| `server/routes/settings.ts` | 153 | Settings endpoints |
| `server/routes/categories.ts` | 138 | Category CRUD |
| `lib/validations.ts` | 134 | All Zod schemas |
| `lib/tokens.ts` | 107 | Token management |
| `server/lib/balance.ts` | 83 | Balance calculation |

---

## 14. KNOWN PATTERNS & CONVENTIONS

### 14.1 Code Conventions

1. **Path Alias**: `@/` maps to project root (e.g., `@/db`, `@/lib`, `@/components`, `@/server`)
2. **Client Components**: Named with `-client.tsx` suffix
3. **Server-Only Code**: Uses `import "server-only"` guard (e.g., `lib/auth.ts`, `lib/tokens.ts`, `lib/email.ts`)
4. **Dynamic Pages**: All dashboard pages use `export const dynamic = 'force-dynamic'`
5. **Hono Route Exports**: Each route file exports the Hono app instance renamed to the route name (e.g., `export { app as transactions }`)
6. **Type Variables**: Hono routes use `type Variables = { userId: number }` for type-safe context access

### 14.2 Error Handling Patterns

- API returns `{ success: false, error: "message" }` with appropriate HTTP status
- Client components catch errors and display via state/alerts
- Auth errors return 401/403 with specific fields like `requiresVerification`
- Conflict errors (duplicate names, referenced records) return 409

### 14.3 Security Patterns

- Passwords: bcrypt with 10 rounds
- Tokens: Raw token sent via email, only SHA-256 hash stored in DB
- JWTs: HS256 algorithm, 7-day expiry, HttpOnly + Secure cookies
- Data isolation: All queries filter by `userId` from JWT
- CSRF: SameSite=Lax cookie policy
- Rate limiting: Not implemented (potential improvement area)

### 14.4 Database Patterns

- Global categories have `userId: null`; user-specific ones have the user's ID
- Queries for categories include both: `WHERE userId = ? OR userId IS NULL`
- Accounts cannot be deleted if they have transactions (referential integrity at app level)
- Categories cannot be deleted if referenced by transactions

---

## 15. DEPLOYMENT & SCRIPTS

### 15.1 NPM Scripts

```json
{
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "eslint",
  "db:generate": "drizzle-kit generate",
  "db:migrate": "drizzle-kit migrate",
  "db:push": "drizzle-kit push",
  "db:seed": "tsx db/seed.ts"
}
```

### 15.2 Database Setup Flow

```bash
# 1. Set DATABASE_URL in .env.local
# 2. Generate migrations from schema
pnpm db:generate

# 3. Push schema to database
pnpm db:push

# 4. Seed default categories
pnpm db:seed
```

### 15.3 Drizzle Config (`drizzle.config.ts`)

```typescript
export default defineConfig({
  schema: './db/schema.ts',
  out: './db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL || '',
  },
});
```

### 15.4 TypeScript Config Highlights

```json
{
  "target": "ES2017",
  "module": "esnext",
  "moduleResolution": "bundler",
  "strict": true,
  "jsx": "react-jsx",
  "paths": { "@/*": ["./*"] }
}
```

---

## APPENDIX: QUICK REFERENCE CARD

```
Project Name:    GOVA (Expense Tracker)
Framework:       Next.js 16.3.1 (App Router) + Hono 4.13.5
Language:        TypeScript 5
Database:        PostgreSQL via Drizzle ORM
Auth:            JWT (HS256) in HttpOnly cookies, bcrypt passwords
UI:              shadcn/ui (radix-lyra) + Tailwind CSS 4 + Phosphor Icons
Charts:          Recharts 3
Fonts:           JetBrains Mono (primary), Geist
Package Manager: pnpm 11.20.0
Styling:         oklch color space, CSS variables, 3 color themes
Export:           CSV, PDF (jsPDF), Excel (xlsx)
Email:           Nodemailer + SMTP
Default Locale:  en-IN, INR, DD/MM/YYYY, Asia/Kolkata
```

---

*This report was generated on 2026-09-02 and represents a complete snapshot of the codebase at that time. All code snippets, schemas, and route definitions are directly sourced from the project files.*
