export const dynamic = "force-dynamic"

import { getFullAnalytics, type DateRange } from "@/lib/analytics"
import { ReportsClient } from "@/components/reports-client"
import { verifySession } from "@/lib/auth"
import { redirect } from "next/navigation"


function getPeriods(periodKey: string): { current: DateRange; previous: DateRange; label: string } {
  const now = new Date()

  switch (periodKey) {
    case "last-month": {
      const from = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      const to = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999)
      const prevFrom = new Date(now.getFullYear(), now.getMonth() - 2, 1)
      const prevTo = new Date(now.getFullYear(), now.getMonth() - 1, 0, 23, 59, 59, 999)
      return { current: { from, to }, previous: { from: prevFrom, to: prevTo }, label: "Last Month" }
    }
    case "this-year": {
      const from = new Date(now.getFullYear(), 0, 1)
      const to = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999)
      const prevFrom = new Date(now.getFullYear() - 1, 0, 1)
      const prevTo = new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59, 999)
      return { current: { from, to }, previous: { from: prevFrom, to: prevTo }, label: "This Year" }
    }
    default: {
      
      const from = new Date(now.getFullYear(), now.getMonth(), 1)
      const to = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)
      const prevFrom = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      const prevTo = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999)
      return { current: { from, to }, previous: { from: prevFrom, to: prevTo }, label: "This Month" }
    }
  }
}

export default async function ReportsPage({ searchParams }: { searchParams: Promise<{ period?: string }> }) {
  const session = await verifySession()
  if (!session) {
    redirect("/login")
  }

  const params = await searchParams
  const periodKey = params.period || "this-month"
  const { current, previous, label } = getPeriods(periodKey)

  const analytics = await getFullAnalytics(current, previous, session.user.id)

  return (
    <ReportsClient
      analytics={analytics}
      periodKey={periodKey}
      periodLabel={label}
    />
  )
}
