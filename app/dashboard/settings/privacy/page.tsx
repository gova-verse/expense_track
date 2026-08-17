import { PrivacyClient } from "@/components/privacy-client"
import { db } from "@/db"
import { userPreferences, accounts, categories, transactions, budgets } from "@/db/schema"

export default async function PrivacySettingsPage() {
  // Fetch all user data for export
  const prefs = await db.select().from(userPreferences)
  const accs = await db.select().from(accounts)
  const cats = await db.select().from(categories)
  const txs = await db.select().from(transactions)
  const bdgts = await db.select().from(budgets)

  const dataBlob = JSON.stringify({
    exportDate: new Date().toISOString(),
    preferences: prefs,
    accounts: accs,
    categories: cats,
    transactions: txs,
    budgets: bdgts,
  }, null, 2)

  return <PrivacyClient dataBlob={dataBlob} />
}
