"use server"

import { db } from "@/db"
import { transactions, accounts } from "@/db/schema"
import { eq, sql, and } from "drizzle-orm"
import { verifySession } from "@/lib/auth"
import { insertTransferSchema, updateTransferSchema } from "@/lib/validations"
import { revalidatePath } from "next/cache"
import { z } from "zod"

// Helper: compute available balance for an account
async function getAccountBalance(accountId: number): Promise<number> {
  const acc = await db.select().from(accounts).where(eq(accounts.id, accountId)).limit(1)
  if (acc.length === 0) return 0

  const openingBalance = parseFloat(acc[0].openingBalance)

  const [result] = await db.select({
    totalIncome: sql<string>`COALESCE(SUM(CASE WHEN ${transactions.type} = 'income' THEN ${transactions.amount} ELSE 0 END), '0')`,
    totalExpense: sql<string>`COALESCE(SUM(CASE WHEN ${transactions.type} = 'expense' THEN ${transactions.amount} ELSE 0 END), '0')`,
    totalOutgoingTransfers: sql<string>`COALESCE(SUM(CASE WHEN ${transactions.type} = 'transfer' THEN ${transactions.amount} ELSE 0 END), '0')`,
  })
  .from(transactions)
  .where(eq(transactions.accountId, accountId))

  const [destResult] = await db.select({
    totalIncomingTransfers: sql<string>`COALESCE(SUM(CASE WHEN ${transactions.type} = 'transfer' THEN ${transactions.amount} ELSE 0 END), '0')`,
  })
  .from(transactions)
  .where(eq(transactions.destinationAccountId, accountId))

  return openingBalance
    + parseFloat(result.totalIncome)
    - parseFloat(result.totalExpense)
    - parseFloat(result.totalOutgoingTransfers)
    + parseFloat(destResult.totalIncomingTransfers)
}

export async function getTransfers() {
  const session = await verifySession()
  if (!session) throw new Error("Unauthorized")
  // Alias for destination account name
  const sourceAcc = accounts
  
  const data = await db.execute(sql`
    SELECT 
      t.id,
      t.type,
      t.amount,
      t.date,
      t.description,
      t.notes,
      t.account_id as "accountId",
      sa.name as "accountName",
      t.destination_account_id as "destinationAccountId",
      da.name as "destinationAccountName",
      t.created_at as "createdAt"
    FROM transactions t
    LEFT JOIN accounts sa ON t.account_id = sa.id
    LEFT JOIN accounts da ON t.destination_account_id = da.id
    WHERE t.type = 'transfer' AND t.user_id = ${session.userId}
    ORDER BY t.date DESC, t.created_at DESC
  `)

  return data.rows as Array<{
    id: number;
    type: string;
    amount: string;
    date: Date;
    description: string | null;
    notes: string | null;
    accountId: number;
    accountName: string;
    destinationAccountId: number;
    destinationAccountName: string;
    createdAt: Date;
  }>
}

export async function createTransfer(data: z.infer<typeof insertTransferSchema>): Promise<{ success: boolean; error?: string }> {
  const parsed = insertTransferSchema.safeParse(data)
  if (!parsed.success) {
    const firstError = parsed.error.issues[0]
    return { success: false, error: firstError.message }
  }

  const { amount, date, accountId, destinationAccountId, description, notes } = parsed.data

  const session = await verifySession()
  if (!session) return { success: false, error: "Unauthorized" }

  // Validate accounts exist and belong to user
  const sourceAccount = await db.select().from(accounts).where(and(eq(accounts.id, accountId), eq(accounts.userId, session.userId))).limit(1)
  if (sourceAccount.length === 0) {
    return { success: false, error: "Source account not found." }
  }

  const destAccount = await db.select().from(accounts).where(and(eq(accounts.id, destinationAccountId), eq(accounts.userId, session.userId))).limit(1)
  if (destAccount.length === 0) {
    return { success: false, error: "Destination account not found." }
  }

  // Check sufficient balance
  const sourceBalance = await getAccountBalance(accountId)
  if (sourceBalance < amount) {
    return { success: false, error: `Insufficient balance. Available: ₹${sourceBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` }
  }

  await db.insert(transactions).values({
    type: "transfer",
    amount: amount.toString(),
    date: new Date(date),
    description,
    accountId,
    destinationAccountId,
    notes,
    userId: session.userId,
  })

  revalidatePath("/dashboard/transactions")
  revalidatePath("/dashboard/transactions/transfers")
  revalidatePath("/dashboard/accounts")
  return { success: true }
}

export async function updateTransfer(id: number, data: z.infer<typeof updateTransferSchema>): Promise<{ success: boolean; error?: string }> {
  const parsed = updateTransferSchema.safeParse(data)
  if (!parsed.success) {
    return { success: false, error: "Invalid data" }
  }

  const session = await verifySession()
  if (!session) return { success: false, error: "Unauthorized" }

  // Get the existing transfer
  const existingTx = await db.select().from(transactions).where(
    and(eq(transactions.id, id), eq(transactions.type, "transfer"), eq(transactions.userId, session.userId))
  ).limit(1)

  if (existingTx.length === 0) {
    return { success: false, error: "Transfer not found." }
  }

  const existing = existingTx[0]
  const newAccountId = parsed.data.accountId ?? existing.accountId
  const newDestAccountId = parsed.data.destinationAccountId ?? existing.destinationAccountId
  const newAmount = parsed.data.amount ?? parseFloat(existing.amount)

  // Validate source != destination
  if (newAccountId === newDestAccountId) {
    return { success: false, error: "Source and destination accounts must be different." }
  }

  // Validate accounts exist
  if (newAccountId) {
    const sourceAccount = await db.select().from(accounts).where(and(eq(accounts.id, newAccountId), eq(accounts.userId, session.userId))).limit(1)
    if (sourceAccount.length === 0) {
      return { success: false, error: "Source account not found." }
    }
  }

  if (newDestAccountId) {
    const destAccount = await db.select().from(accounts).where(and(eq(accounts.id, newDestAccountId), eq(accounts.userId, session.userId))).limit(1)
    if (destAccount.length === 0) {
      return { success: false, error: "Destination account not found." }
    }
  }

  // Check sufficient balance (temporarily exclude this transfer for calculation)
  if (newAccountId) {
    const currentSourceBalance = await getAccountBalance(newAccountId)
    // If account changed or amount changed, add back the old transfer amount if same source
    let adjustedBalance = currentSourceBalance
    if (existing.accountId === newAccountId) {
      // The current balance already deducts the old transfer, add it back
      adjustedBalance += parseFloat(existing.amount)
    }
    if (adjustedBalance < newAmount) {
      return { success: false, error: `Insufficient balance. Available: ₹${adjustedBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` }
    }
  }

  await db.update(transactions).set({
    amount: parsed.data.amount !== undefined ? parsed.data.amount.toString() : undefined,
    date: parsed.data.date ? new Date(parsed.data.date) : undefined,
    accountId: parsed.data.accountId,
    destinationAccountId: parsed.data.destinationAccountId,
    description: parsed.data.description,
    notes: parsed.data.notes,
    updatedAt: new Date()
  }).where(eq(transactions.id, id))

  revalidatePath("/dashboard/transactions")
  revalidatePath("/dashboard/transactions/transfers")
  revalidatePath("/dashboard/accounts")
  return { success: true }
}

export async function deleteTransfer(id: number): Promise<{ success: boolean; error?: string }> {
  const session = await verifySession()
  if (!session) return { success: false, error: "Unauthorized" }

  // Ensure the transaction is a transfer
  const existingTx = await db.select().from(transactions).where(
    and(eq(transactions.id, id), eq(transactions.type, "transfer"), eq(transactions.userId, session.userId))
  ).limit(1)

  if (existingTx.length === 0) {
    return { success: false, error: "Transfer not found." }
  }

  await db.delete(transactions).where(eq(transactions.id, id))

  revalidatePath("/dashboard/transactions")
  revalidatePath("/dashboard/transactions/transfers")
  revalidatePath("/dashboard/accounts")
  return { success: true }
}
