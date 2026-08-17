"use server"

import { db } from "@/db"
import { accounts, transactions } from "@/db/schema"
import { eq, sql, or, and } from "drizzle-orm"
import { verifySession } from "@/lib/auth"
import { insertAccountSchema, updateAccountSchema } from "@/lib/validations"
import { revalidatePath } from "next/cache"
import { z } from "zod"

export async function getAccounts() {
  const session = await verifySession()
  if (!session) throw new Error("Unauthorized")
  return await db.select().from(accounts).where(eq(accounts.userId, session.userId)).orderBy(accounts.name)
}

export async function getAccountsWithBalance() {
  const session = await verifySession()
  if (!session) throw new Error("Unauthorized")

  // Query to get accounts and calculate balance based on transactions
  const accountsData = await db.select().from(accounts).where(eq(accounts.userId, session.userId)).orderBy(accounts.name)
  
  // Aggregate income, expense, and outgoing transfers per source account
  const balanceAggs = await db.select({
    accountId: transactions.accountId,
    totalIncome: sql<string>`COALESCE(SUM(CASE WHEN ${transactions.type} = 'income' THEN ${transactions.amount} ELSE 0 END), '0')`,
    totalExpense: sql<string>`COALESCE(SUM(CASE WHEN ${transactions.type} = 'expense' THEN ${transactions.amount} ELSE 0 END), '0')`,
    totalOutgoingTransfers: sql<string>`COALESCE(SUM(CASE WHEN ${transactions.type} = 'transfer' THEN ${transactions.amount} ELSE 0 END), '0')`,
  })
  .from(transactions)
  .where(and(sql`${transactions.accountId} IS NOT NULL`, eq(transactions.userId, session.userId)))
  .groupBy(transactions.accountId)

  // Aggregate incoming transfers per destination account
  const incomingTransferAggs = await db.select({
    destinationAccountId: transactions.destinationAccountId,
    totalIncomingTransfers: sql<string>`COALESCE(SUM(${transactions.amount}), '0')`,
  })
  .from(transactions)
  .where(and(sql`${transactions.type} = 'transfer' AND ${transactions.destinationAccountId} IS NOT NULL`, eq(transactions.userId, session.userId)))
  .groupBy(transactions.destinationAccountId)

  return accountsData.map(acc => {
    const agg = balanceAggs.find(a => a.accountId === acc.id)
    const incomingAgg = incomingTransferAggs.find(a => a.destinationAccountId === acc.id)
    const openingBal = parseFloat(acc.openingBalance)
    let currentBalance = openingBal

    if (agg) {
      currentBalance += parseFloat(agg.totalIncome)
      currentBalance -= parseFloat(agg.totalExpense)
      currentBalance -= parseFloat(agg.totalOutgoingTransfers)
    }

    if (incomingAgg) {
      currentBalance += parseFloat(incomingAgg.totalIncomingTransfers)
    }

    return {
      ...acc,
      currentBalance
    }
  })
}

export async function createAccount(data: z.infer<typeof insertAccountSchema>): Promise<{ success: boolean; error?: string }> {
  const parsed = insertAccountSchema.safeParse(data)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message }
  }

  const session = await verifySession()
  if (!session) return { success: false, error: "Unauthorized" }

  await db.insert(accounts).values({
    ...parsed.data,
    openingBalance: parsed.data.openingBalance.toString(),
    userId: session.userId
  })

  revalidatePath("/dashboard/accounts")
  revalidatePath("/dashboard/transactions")
  return { success: true }
}

export async function updateAccount(id: number, data: z.infer<typeof updateAccountSchema>): Promise<{ success: boolean; error?: string }> {
  const parsed = updateAccountSchema.safeParse(data)
  if (!parsed.success) {
    return { success: false, error: "Invalid data" }
  }

  const session = await verifySession()
  if (!session) return { success: false, error: "Unauthorized" }

  const existingAccount = await db.select().from(accounts).where(and(eq(accounts.id, id), eq(accounts.userId, session.userId))).limit(1)
  if (existingAccount.length === 0) return { success: false, error: "Account not found" }

  await db.update(accounts).set({
    ...parsed.data,
    openingBalance: parsed.data.openingBalance !== undefined ? parsed.data.openingBalance.toString() : undefined,
    updatedAt: new Date()
  }).where(eq(accounts.id, id))

  revalidatePath("/dashboard/accounts")
  revalidatePath("/dashboard/transactions")
  return { success: true }
}

export async function deleteAccount(id: number): Promise<{ success: boolean; error?: string }> {
  const session = await verifySession()
  if (!session) return { success: false, error: "Unauthorized" }

  const existingAccount = await db.select().from(accounts).where(and(eq(accounts.id, id), eq(accounts.userId, session.userId))).limit(1)
  if (existingAccount.length === 0) return { success: false, error: "Account not found" }

  // Check for existing transactions
  const existing = await db.select().from(transactions).where(
    or(
      eq(transactions.accountId, id),
      eq(transactions.destinationAccountId, id)
    )
  ).limit(1)
  if (existing.length > 0) {
    return { success: false, error: "Cannot delete account that contains transactions." }
  }

  await db.delete(accounts).where(eq(accounts.id, id))
  
  revalidatePath("/dashboard/accounts")
  revalidatePath("/dashboard/transactions")
  return { success: true }
}
