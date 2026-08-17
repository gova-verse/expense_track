"use server"

import { db } from "@/db"
import { categories, transactions } from "@/db/schema"
import { eq, and, count, or, sql } from "drizzle-orm"
import { verifySession } from "@/lib/auth"
import { insertCategorySchema, updateCategorySchema } from "@/lib/validations"
import { revalidatePath } from "next/cache"
import { z } from "zod"

export async function getCategories(type: "expense" | "income") {
  const session = await verifySession()
  if (!session) throw new Error("Unauthorized")
  return await db.select().from(categories).where(and(eq(categories.type, type), or(eq(categories.userId, session.userId), sql`${categories.userId} IS NULL`))).orderBy(categories.id)
}

export async function getAllCategories() {
  const session = await verifySession()
  if (!session) throw new Error("Unauthorized")
  return await db.select().from(categories).where(or(eq(categories.userId, session.userId), sql`${categories.userId} IS NULL`)).orderBy(categories.id)
}

export async function createCategory(data: z.infer<typeof insertCategorySchema>) {
  const parsed = insertCategorySchema.safeParse(data)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message }
  }

  const { name, type, icon, color, isDefault } = parsed.data

  const session = await verifySession()
  if (!session) return { success: false, error: "Unauthorized" }

  // Check for duplicate name within the same type
  const existing = await db.select().from(categories).where(and(eq(categories.name, name), eq(categories.type, type), eq(categories.userId, session.userId))).limit(1)
  if (existing.length > 0) {
    return { success: false, error: `A ${type} category named "${name}" already exists.` }
  }

  await db.insert(categories).values({
    name, type, icon, color, isDefault: isDefault ?? false, userId: session.userId
  })

  revalidatePath(`/dashboard/categories/${type}`)
  return { success: true }
}

export async function updateCategory(id: number, data: z.infer<typeof updateCategorySchema>) {
  const parsed = updateCategorySchema.safeParse(data)
  if (!parsed.success) {
    return { success: false, error: "Invalid data" }
  }

  const session = await verifySession()
  if (!session) return { success: false, error: "Unauthorized" }

  const existingCategory = await db.select().from(categories).where(and(eq(categories.id, id), eq(categories.userId, session.userId))).limit(1)
  if (existingCategory.length === 0) {
    return { success: false, error: "Category not found or cannot be modified." }
  }

  const type = parsed.data.type || existingCategory[0].type
  const name = parsed.data.name || existingCategory[0].name

  // Check duplicate if name or type is being changed
  const existing = await db.select().from(categories).where(and(eq(categories.name, name), eq(categories.type, type), eq(categories.userId, session.userId))).limit(1)
  if (existing.length > 0 && existing[0].id !== id) {
     return { success: false, error: `A ${type} category named "${name}" already exists.` }
  }

  await db.update(categories).set({
    ...parsed.data,
    updatedAt: new Date()
  }).where(eq(categories.id, id))

  revalidatePath(`/dashboard/categories/expense`)
  revalidatePath(`/dashboard/categories/income`)
  return { success: true }
}

export async function deleteCategory(id: number, type: "expense" | "income") {
  const session = await verifySession()
  if (!session) return { success: false, error: "Unauthorized" }

  const existingCategory = await db.select().from(categories).where(and(eq(categories.id, id), eq(categories.userId, session.userId))).limit(1)
  if (existingCategory.length === 0) {
    return { success: false, error: "Category not found or cannot be deleted." }
  }

  // Safe delete logic
  const [{ value }] = await db.select({ value: count() }).from(transactions).where(and(eq(transactions.categoryId, id), eq(transactions.userId, session.userId)))
  
  if (value > 0) {
    return { success: false, error: "Cannot delete category because it is referenced by transactions." }
  }

  await db.delete(categories).where(and(eq(categories.id, id), eq(categories.userId, session.userId)))
  
  revalidatePath(`/dashboard/categories/${type}`)
  return { success: true }
}
