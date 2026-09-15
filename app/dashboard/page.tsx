export const dynamic = "force-dynamic"

import { getFullAnalytics, type DateRange } from "@/lib/analytics"
import { getRecentTransactions } from "@/server/api-client"
import { DashboardClient } from "@/components/dashboard-client"
import { verifySession } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function DashboardPage() {
  const session = await verifySession()
  if (!session) {
    redirect("/login")
  }

  // Current month period
  const now = new Date()
  const currentPeriod: DateRange = {
    from: new Date(now.getFullYear(), now.getMonth(), 1),
    to: new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)
  }

  // Previous month period for trend comparison
  const previousPeriod: DateRange = {
    from: new Date(now.getFullYear(), now.getMonth() - 1, 1),
    to: new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999)
  }

  const [analytics, recentTransactions] = await Promise.all([
    getFullAnalytics(currentPeriod, previousPeriod, session.user.id),
    getRecentTransactions(5)
  ])

  return (
    <DashboardClient
      analytics={analytics}
      recentTransactions={recentTransactions}
    />
  )
}
