/**
 * Server-side API client for fetching data from Hono endpoints within
 * Next.js Server Components and page.tsx files.
 *
 * It reads the Better Auth session cookies from next/headers and forwards
 * them with every request so Hono's auth middleware can verify the session.
 */
import { cookies } from 'next/headers'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

async function apiFetch<T>(path: string): Promise<T> {
  const cookieStore = await cookies()
  const allCookies = cookieStore.getAll()
  const cookieHeader = allCookies.map(c => `${c.name}=${c.value}`).join('; ')

  const res = await fetch(`${BASE_URL}/api${path}`, {
    headers: {
      Cookie: cookieHeader,
    },
    cache: 'no-store',
  })

  if (!res.ok) {
    throw new Error(`API error ${res.status} for ${path}`)
  }

  return res.json() as Promise<T>
}

// ── Transactions ──────────────────────────────────────────────────

export type TransactionItem = {
  id: number
  type: 'expense' | 'income' | 'transfer'
  amount: string
  date: string
  description: string | null
  paymentMethod: string | null
  notes: string | null
  categoryId: number | null
  category: { name: string; icon: string | null; color: string | null } | null
  accountId: number | null
  account: { name: string; type: string } | null
  destinationAccountId: number | null
  destinationAccount: { name: string } | null
}

export function getTransactions() {
  return apiFetch<TransactionItem[]>('/transactions')
}

export function getRecentTransactions(limit = 5) {
  return apiFetch<TransactionItem[]>(`/transactions/recent?limit=${limit}`)
}

// ── Accounts ──────────────────────────────────────────────────────

export type Account = {
  id: number
  name: string
  type: string
  openingBalance: string
}

export type AccountWithBalance = Account & { currentBalance: number }

export function getAccounts() {
  return apiFetch<Account[]>('/accounts')
}

export function getAccountsWithBalance() {
  return apiFetch<AccountWithBalance[]>('/accounts/with-balance')
}

// ── Categories ────────────────────────────────────────────────────

export type Category = {
  id: number
  name: string
  type: 'expense' | 'income'
  icon: string | null
  color: string | null
  isDefault: boolean
}

export function getCategories(type: 'expense' | 'income') {
  return apiFetch<Category[]>(`/categories?type=${type}`)
}

export function getAllCategories() {
  return apiFetch<Category[]>('/categories')
}

// ── Transfers ─────────────────────────────────────────────────────

export type Transfer = {
  id: number
  type: string
  amount: string
  date: string
  description: string | null
  notes: string | null
  accountId: number
  account: { name: string; type: string } | null
  destinationAccountId: number
  destinationAccount: { name: string; type: string } | null
  createdAt: string
}

export function getTransfers() {
  return apiFetch<Transfer[]>('/transfers')
}

// ── Budgets ───────────────────────────────────────────────────────

export type BudgetWithSpent = {
  id: number
  name: string
  amount: number
  period: string
  categoryId: number | null
  categoryName: string | null
  categoryIcon: string | null
  categoryColor: string | null
  startDate: string
  spent: number
  remaining: number
  usage: number
  status: string
  activeFrom: string
  activeTo: string
}

export function getBudgets() {
  return apiFetch<BudgetWithSpent[]>('/budgets')
}

// ── Settings / User ───────────────────────────────────────────────

export type UserInfo = {
  id: string
  name: string | null
  email: string
  emailVerifiedAt: string | null
  createdAt: string
}

export type UserPreferences = {
  id: number
  userId: string
  theme: string | null
  colorTheme: string | null
  currency: string | null
  numberFormat: string | null
  dateFormat: string | null
  timezone: string | null
  notifySecurityAlerts: boolean
  notifyAccountActivity: boolean
  notifyMonthlySummary: boolean
  notifyBudgetApproaching: boolean
  notifyBudgetExceeded: boolean
  notifyHighSpending: boolean
  notifyProductUpdates: boolean
  notifyNewFeatures: boolean
}

export function getMe() {
  return apiFetch<UserInfo>('/settings/me')
}

export function getPreferences() {
  return apiFetch<UserPreferences>('/settings/preferences')
}
