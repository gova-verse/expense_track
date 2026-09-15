import { db } from '@/db'
import { accounts, transactions } from '@/db/schema'
import { eq, sql } from 'drizzle-orm'


const STRICT_ACCOUNT_TYPES = ['cash', 'bank', 'wallet', 'savings']


export async function getAccountBalance(accountId: number): Promise<number> {
  const acc = await db.select().from(accounts).where(eq(accounts.id, accountId)).limit(1)
  if (acc.length === 0) return 0

  const openingBalance = parseFloat(acc[0].openingBalance)

  const [result] = await db
    .select({
      totalIncome: sql<string>`COALESCE(SUM(CASE WHEN ${transactions.type} = 'income' THEN ${transactions.amount} ELSE 0 END), '0')`,
      totalExpense: sql<string>`COALESCE(SUM(CASE WHEN ${transactions.type} = 'expense' THEN ${transactions.amount} ELSE 0 END), '0')`,
      totalOutgoingTransfers: sql<string>`COALESCE(SUM(CASE WHEN ${transactions.type} = 'transfer' THEN ${transactions.amount} ELSE 0 END), '0')`,
    })
    .from(transactions)
    .where(eq(transactions.accountId, accountId))

  const [destResult] = await db
    .select({
      totalIncomingTransfers: sql<string>`COALESCE(SUM(CASE WHEN ${transactions.type} = 'transfer' THEN ${transactions.amount} ELSE 0 END), '0')`,
    })
    .from(transactions)
    .where(eq(transactions.destinationAccountId, accountId))

  return (
    openingBalance +
    parseFloat(result.totalIncome) -
    parseFloat(result.totalExpense) -
    parseFloat(result.totalOutgoingTransfers) +
    parseFloat(destResult.totalIncomingTransfers)
  )
}

type BalanceCheckResult =
  | { ok: true }
  | { ok: false; available: number; accountName: string }


export async function checkSufficientBalance(
  accountId: number,
  requiredAmount: number
): Promise<BalanceCheckResult> {
  const acc = await db.select().from(accounts).where(eq(accounts.id, accountId)).limit(1)
  if (acc.length === 0) {
    return { ok: false, available: 0, accountName: 'Unknown' }
  }

  const account = acc[0]

  
  if (!STRICT_ACCOUNT_TYPES.includes(account.type)) {
    return { ok: true }
  }

  const balance = await getAccountBalance(accountId)

  if (balance < requiredAmount) {
    return { ok: false, available: balance, accountName: account.name }
  }

  return { ok: true }
}


export function insufficientBalanceError(available: number, accountName: string): string {
  return `Insufficient balance in "${accountName}". Available: ₹${available.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
}
