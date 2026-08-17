export const dynamic = "force-dynamic"

import { getTransactions } from "@/app/actions/transactions"
import { getAllCategories } from "@/app/actions/categories"
import { getAccounts } from "@/app/actions/accounts"
import { TransactionPage } from "@/components/transaction-page"

export default async function TransactionsRoute() {
  const transactions = await getTransactions()
  const categories = await getAllCategories()
  const accounts = await getAccounts()
  
  return <TransactionPage initialTransactions={transactions} categories={categories} accounts={accounts} />
}
