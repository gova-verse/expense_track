"use server"

import { db } from "@/db"
import { transactions, categories, accounts } from "@/db/schema"
import { eq, desc, sql, and, or } from "drizzle-orm"
import { verifySession } from "@/lib/auth"
import { insertTransactionSchema, updateTransactionSchema } from "@/lib/validations"
import { revalidatePath } from "next/cache"
import { z } from "zod"

export async function getTransactions() {
  const session = await verifySession()
  if (!session) throw new Error("Unauthorized")

  const data = await db.execute(sql`
    SELECT 
      t.id,
      t.type,
      t.amount,
      t.date,
      t.description,
      t.payment_method as "paymentMethod",
      t.notes,
      t.category_id as "categoryId",
      c.name as "categoryName",
      c.icon as "categoryIcon",
      c.color as "categoryColor",
      t.account_id as "accountId",
      sa.name as "accountName",
      t.destination_account_id as "destinationAccountId",
      da.name as "destinationAccountName"
    FROM transactions t
    LEFT JOIN categories c ON t.category_id = c.id
    LEFT JOIN accounts sa ON t.account_id = sa.id
    LEFT JOIN accounts da ON t.destination_account_id = da.id
    WHERE t.user_id = ${session.userId}
    ORDER BY t.date DESC, t.created_at DESC
  `)
    
  return data.rows as Array<{
    id: number;
    type: "expense" | "income" | "transfer";
    amount: string;
    date: Date;
    description: string | null;
    paymentMethod: string | null;
    notes: string | null;
    categoryId: number | null;
    categoryName: string | null;
    categoryIcon: string | null;
    categoryColor: string | null;
    accountId: number | null;
    accountName: string | null;
    destinationAccountId: number | null;
    destinationAccountName: string | null;
  }>
}

export async function getRecentTransactions(limit = 5) {
  const session = await verifySession()
  if (!session) throw new Error("Unauthorized")

  const data = await db.execute(sql`
    SELECT 
      t.id,
      t.type,
      t.amount,
      t.date,
      t.description,
      t.payment_method as "paymentMethod",
      t.category_id as "categoryId",
      c.name as "categoryName",
      c.icon as "categoryIcon",
      c.color as "categoryColor",
      t.account_id as "accountId",
      sa.name as "accountName",
      t.destination_account_id as "destinationAccountId",
      da.name as "destinationAccountName"
    FROM transactions t
    LEFT JOIN categories c ON t.category_id = c.id
    LEFT JOIN accounts sa ON t.account_id = sa.id
    LEFT JOIN accounts da ON t.destination_account_id = da.id
    WHERE t.user_id = ${session.userId}
    ORDER BY t.date DESC, t.created_at DESC
    LIMIT ${limit}
  `)
    
  return data.rows as Array<{
    id: number;
    type: "expense" | "income" | "transfer";
    amount: string;
    date: Date;
    description: string | null;
    paymentMethod: string | null;
    categoryId: number | null;
    categoryName: string | null;
    categoryIcon: string | null;
    categoryColor: string | null;
    accountId: number | null;
    accountName: string | null;
    destinationAccountId: number | null;
    destinationAccountName: string | null;
  }>
}

export async function createTransaction(data: z.infer<typeof insertTransactionSchema>): Promise<{ success: boolean; error?: string }> {
  const parsed = insertTransactionSchema.safeParse(data)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message }
  }

  const session = await verifySession()
  if (!session) return { success: false, error: "Unauthorized" }

  const { type, amount, date, description, categoryId, accountId, destinationAccountId, paymentMethod, notes } = parsed.data

  if (type === "transfer") {
     return { success: false, error: "Transfers are not supported yet." }
  }
  
  if (!categoryId) {
     return { success: false, error: "Category is required." }
  }

  const cat = await db.select().from(categories).where(and(eq(categories.id, categoryId), or(eq(categories.userId, session.userId), sql`${categories.userId} IS NULL`))).limit(1)
  if (cat.length === 0) {
    return { success: false, error: "Category not found." }
  }
  if (cat[0].type !== type) {
    return { success: false, error: `Cannot use a ${cat[0].type} category for a ${type} transaction.` }
  }

  await db.insert(transactions).values({
    type,
    amount: amount.toString(),
    date: new Date(date),
    description,
    categoryId,
    accountId,
    destinationAccountId,
    paymentMethod,
    notes,
    userId: session.userId,
  })

  revalidatePath("/dashboard/transactions")
  return { success: true }
}

export async function updateTransaction(id: number, data: z.infer<typeof updateTransactionSchema>): Promise<{ success: boolean; error?: string }> {
  const parsed = updateTransactionSchema.safeParse(data)
  if (!parsed.success) {
    return { success: false, error: "Invalid data" }
  }

  const session = await verifySession()
  if (!session) return { success: false, error: "Unauthorized" }

  const existingTx = await db.select().from(transactions).where(and(eq(transactions.id, id), eq(transactions.userId, session.userId))).limit(1)
  if (existingTx.length === 0) {
    return { success: false, error: "Transaction not found." }
  }

  const type = parsed.data.type || existingTx[0].type
  const categoryId = parsed.data.categoryId !== undefined ? parsed.data.categoryId : existingTx[0].categoryId
  
  if (type === "transfer") {
     return { success: false, error: "Transfers are not supported yet." }
  }

  if (categoryId) {
    const cat = await db.select().from(categories).where(and(eq(categories.id, categoryId), or(eq(categories.userId, session.userId), sql`${categories.userId} IS NULL`))).limit(1)
    if (cat.length > 0 && cat[0].type !== type) {
      return { success: false, error: `Cannot use a ${cat[0].type} category for a ${type} transaction.` }
    }
  }

  await db.update(transactions).set({
    ...parsed.data,
    amount: parsed.data.amount !== undefined ? parsed.data.amount.toString() : undefined,
    date: parsed.data.date ? new Date(parsed.data.date) : undefined,
    updatedAt: new Date()
  }).where(eq(transactions.id, id))

  revalidatePath("/dashboard/transactions")
  return { success: true }
}

export async function deleteTransaction(id: number): Promise<{ success: boolean; error?: string }> {
  const session = await verifySession()
  if (!session) return { success: false, error: "Unauthorized" }

  const existingTx = await db.select().from(transactions).where(and(eq(transactions.id, id), eq(transactions.userId, session.userId))).limit(1)
  if (existingTx.length === 0) return { success: false, error: "Transaction not found" }

  await db.delete(transactions).where(and(eq(transactions.id, id), eq(transactions.userId, session.userId)))
  revalidatePath("/dashboard/transactions")
  return { success: true }
}
