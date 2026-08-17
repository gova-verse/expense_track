import "dotenv/config"
import { db } from "../db"
import { accounts, transactions } from "../db/schema"
import { eq, isNull } from "drizzle-orm"

async function main() {
  console.log("Starting accounts migration...")

  // 1. Ensure Cash account exists
  let cashAccount = await db.query.accounts.findFirst({
    where: eq(accounts.name, "Cash")
  })

  if (!cashAccount) {
    console.log("Creating default Cash account...")
    const [inserted] = await db.insert(accounts).values({
      name: "Cash",
      type: "cash",
      openingBalance: "0"
    }).returning()
    cashAccount = inserted
  } else {
    console.log("Cash account already exists.")
  }

  // 2. Ensure Bank Account exists (for testing purposes as requested)
  const bankAccount = await db.query.accounts.findFirst({
    where: eq(accounts.name, "Bank Account")
  })

  if (!bankAccount) {
    console.log("Creating Bank Account...")
    await db.insert(accounts).values({
      name: "Bank Account",
      type: "bank",
      openingBalance: "10000"
    })
  } else {
    console.log("Bank Account already exists.")
  }

  // 3. Backfill existing transactions
  console.log("Backfilling existing transactions with Cash account...")
  
  const result = await db.update(transactions)
    .set({ accountId: cashAccount.id })
    .where(isNull(transactions.accountId))

  console.log("Migration complete!")
  process.exit(0)
}

main().catch((err) => {
  console.error("Migration failed:", err)
  process.exit(1)
})
