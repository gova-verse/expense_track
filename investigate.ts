import { db } from "./db"
import { users, accounts, transactions, categories, budgets, userPreferences } from "./db/schema"

async function run() {
  console.log("USERS:")
  const allUsers = await db.select().from(users)
  console.log(allUsers)
  
  console.log("\nACCOUNTS:")
  const allAccounts = await db.select().from(accounts)
  console.log(allAccounts)

  console.log("\nTRANSACTIONS:")
  const allTransactions = await db.select().from(transactions).limit(10)
  console.log(allTransactions)

  console.log("\nCATEGORIES:")
  const allCategories = await db.select().from(categories).limit(10)
  console.log(allCategories)
}

run().catch(console.error).finally(() => process.exit(0))
