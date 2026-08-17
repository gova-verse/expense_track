export const dynamic = "force-dynamic"

import { getCategories } from "@/app/actions/categories"
import { CategoryPage } from "@/components/category-page"

export default async function IncomeCategoriesPage() {
  const categories = await getCategories("income")
  
  return (
    <CategoryPage 
      title="Income Categories" 
      type="income" 
      categories={categories} 
    />
  )
}
