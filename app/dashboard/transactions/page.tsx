export const dynamic = "force-dynamic"

import { getTransactions, getAllCategories, getAccounts } from "@/server/api-client"
import { TransactionPage } from "@/components/transaction-page"

export default async function TransactionsRoute() {
  const [transactions, categories, accounts] = await Promise.all([
    getTransactions(),
    getAllCategories(),
    getAccounts(),
  ])

  return <TransactionPage initialTransactions={transactions} categories={categories} accounts={accounts} />
}
