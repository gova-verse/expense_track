export const dynamic = "force-dynamic"

import { getTransfers } from "@/app/actions/transfers"
import { getAccounts } from "@/app/actions/accounts"
import { TransfersClient } from "@/components/transfers-client"

export default async function TransfersRoute() {
  const transfers = await getTransfers()
  const accounts = await getAccounts()
  return <TransfersClient initialTransfers={transfers} accounts={accounts} />
}
