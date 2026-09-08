export const dynamic = "force-dynamic"

import { getCategories } from "@/server/api-client"
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
