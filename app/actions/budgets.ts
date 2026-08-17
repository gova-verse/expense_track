"use server"

import { db } from "@/db"
import { budgets, transactions, categories } from "@/db/schema"
import { eq, and, gte, lte, sql, or } from "drizzle-orm"
import { verifySession } from "@/lib/auth"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { budgetSchema, type BudgetInput, getActivePeriodRange, calculateBudgetMetrics, type BudgetPeriod } from "@/lib/budget-utils"

// ── Actions ─────────────────────────────────────────────────────

/**
 * Get all budgets with their dynamically calculated spent amounts based on current date.
 */
export async function getBudgetsWithSpent() {
  const session = await verifySession()
  if (!session) throw new Error("Unauthorized")

  const allBudgets = await db
    .select({
      id: budgets.id,
      name: budgets.name,
      amount: budgets.amount,
      period: budgets.period,
      categoryId: budgets.categoryId,
      categoryName: categories.name,
      categoryIcon: categories.icon,
      categoryColor: categories.color,
      startDate: budgets.startDate,
    })
    .from(budgets)
    .leftJoin(categories, eq(budgets.categoryId, categories.id))
    .where(eq(budgets.userId, session.userId))
    .orderBy(budgets.createdAt)

  // Calculate spent amount dynamically for each budget
  const results = await Promise.all(
    allBudgets.map(async (b) => {
      const { from, to } = getActivePeriodRange(b.period as BudgetPeriod)
      
      const conditions = [
        eq(transactions.type, "expense"),
        gte(transactions.date, from),
        lte(transactions.date, to),
        eq(transactions.userId, session.userId)
      ]

      if (b.categoryId) {
        conditions.push(eq(transactions.categoryId, b.categoryId))
      }

      const [{ spent }] = await db
        .select({
          spent: sql<number>`COALESCE(SUM(${transactions.amount}), 0)`
        })
        .from(transactions)
        .where(and(...conditions))

      const metrics = calculateBudgetMetrics(Number(b.amount), Number(spent))

      return {
        ...b,
        amount: Number(b.amount),
        spent: metrics.spent,
        remaining: metrics.remaining,
        usage: metrics.usage,
        status: metrics.status,
        activeFrom: from,
        activeTo: to
      }
    })
  )

  return results
}

export async function createBudget(data: BudgetInput) {
  const session = await verifySession()
  if (!session) throw new Error("Unauthorized")

  const parsed = budgetSchema.parse(data)
  
  if (parsed.categoryId) {
    const [cat] = await db.select({ type: categories.type }).from(categories).where(and(eq(categories.id, parsed.categoryId), or(eq(categories.userId, session.userId), sql`${categories.userId} IS NULL`)))
    if (!cat || cat.type !== "expense") {
      throw new Error("Category must be a valid expense category")
    }
  }

  await db.insert(budgets).values({
    name: parsed.name,
    amount: parsed.amount.toString(),
    period: parsed.period,
    categoryId: parsed.categoryId || null,
    startDate: new Date(),
    userId: session.userId,
  })
  
  revalidatePath("/dashboard/budgets")
}

export async function updateBudget(id: number, data: BudgetInput) {
  const session = await verifySession()
  if (!session) throw new Error("Unauthorized")

  const parsed = budgetSchema.parse(data)
  
  if (parsed.categoryId) {
    const [cat] = await db.select({ type: categories.type }).from(categories).where(and(eq(categories.id, parsed.categoryId), or(eq(categories.userId, session.userId), sql`${categories.userId} IS NULL`)))
    if (!cat || cat.type !== "expense") {
      throw new Error("Category must be a valid expense category")
    }
  }

  await db.update(budgets).set({
    name: parsed.name,
    amount: parsed.amount.toString(),
    period: parsed.period,
    categoryId: parsed.categoryId || null,
    updatedAt: new Date(),
  }).where(and(eq(budgets.id, id), eq(budgets.userId, session.userId)))
  
  revalidatePath("/dashboard/budgets")
}

export async function deleteBudget(id: number) {
  const session = await verifySession()
  if (!session) throw new Error("Unauthorized")

  await db.delete(budgets).where(and(eq(budgets.id, id), eq(budgets.userId, session.userId)))
  revalidatePath("/dashboard/budgets")
}
