export const dynamic = "force-dynamic"

import { getCategories } from "@/app/actions/categories"
import { CategoryPage } from "@/components/category-page"

export default async function ExpenseCategoriesPage() {
  const categories = await getCategories("expense")
  
  return (
    <CategoryPage 
      title="Expense Categories" 
      type="expense" 
      categories={categories} 
    />
  )
}
