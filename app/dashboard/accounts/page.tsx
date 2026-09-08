export const dynamic = "force-dynamic"

import { getAccountsWithBalance } from "@/server/api-client"
import { AccountsClient } from "@/components/accounts-client"

export default async function AccountsRoute() {
  const accounts = await getAccountsWithBalance()
  return <AccountsClient initialAccounts={accounts} />
}
