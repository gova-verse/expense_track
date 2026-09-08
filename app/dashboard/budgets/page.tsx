export const dynamic = "force-dynamic"

import { getBudgets, getAllCategories } from "@/server/api-client"
import { BudgetsClient } from "@/components/budgets-client"

export default async function BudgetsPage() {
  const [budgets, allCategories] = await Promise.all([
    getBudgets(),
    getAllCategories(),
  ])

  return <BudgetsClient budgets={budgets} categories={allCategories} />
}
