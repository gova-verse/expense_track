export const dynamic = "force-dynamic"

import { getTransfers, getAccounts } from "@/server/api-client"
import { TransfersClient } from "@/components/transfers-client"

export default async function TransfersRoute() {
  const [transfers, accounts] = await Promise.all([
    getTransfers(),
    getAccounts(),
  ])
  return <TransfersClient initialTransfers={transfers} accounts={accounts} />
}
