export const dynamic = "force-dynamic"

import { getBudgetsWithSpent } from "@/app/actions/budgets"
import { db } from "@/db"
import { categories } from "@/db/schema"
import { BudgetsClient } from "@/components/budgets-client"

export default async function BudgetsPage() {
  const budgets = await getBudgetsWithSpent()
  const allCategories = await db.select({ id: categories.id, name: categories.name, type: categories.type }).from(categories)

  return <BudgetsClient budgets={budgets} categories={allCategories} />
}
