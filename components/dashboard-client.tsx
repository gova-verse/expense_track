"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowUp, ArrowDown, TrendUp, TrendDown, Wallet, PiggyBank, CurrencyDollar, ChartPie } from "@phosphor-icons/react"
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"
import { usePreferences, formatCurrency, formatDate } from "@/components/preferences-provider"

const fmtPct = (val: number) => `${val.toFixed(1)}%`

type AnalyticsData = {
  overall: {
    current: {
      totalIncome: number
      totalExpenses: number
      netSavings: number
      savingsRate: number
      avgIncome: number
      avgExpense: number
      incomeCount: number
      expenseCount: number
    }
    previous: {
      totalIncome: number
      totalExpenses: number
      netSavings: number
      savingsRate: number
    }
    trends: { income: number; expense: number }
  }
  expenseAnalytics: {
    total: number
    averageTransaction: number
    highestCategory: CategoryStat | null
    categories: CategoryStatWithTrend[]
    trend: number
  }
  incomeAnalytics: {
    total: number
    averageTransaction: number
    primarySource: CategoryStat | null
    categories: CategoryStatWithTrend[]
    trend: number
  }
}

type CategoryStat = {
  categoryId: number | null
  categoryName: string
  categoryIcon: string | null
  categoryColor: string | null
  totalSpent: number
  count: number
  avgTransaction: number
  share: number
}

type CategoryStatWithTrend = CategoryStat & { trend: number }

type RecentTx = {
  id: number
  type: "expense" | "income" | "transfer"
  amount: string
  date: string
  description: string | null
  paymentMethod: string | null
  categoryId: number | null
  categoryName: string | null
  categoryIcon: string | null
  categoryColor: string | null
}

const COLORS = ["#6366f1", "#f43f5e", "#10b981", "#f59e0b", "#8b5cf6", "#06b6d4", "#ec4899", "#14b8a6"]

export function DashboardClient({ analytics, recentTransactions }: { analytics: AnalyticsData; recentTransactions: RecentTx[] }) {
  const prefs = usePreferences()
  const fmt = (val: number) => formatCurrency(val, prefs, { maximumFractionDigits: 0 })
  
  const { overall, expenseAnalytics, incomeAnalytics } = analytics
  const c = overall.current
  const hasData = c.incomeCount + c.expenseCount > 0

  
  const barData = [
    { name: "Income", value: c.totalIncome, fill: "#10b981" },
    { name: "Expenses", value: c.totalExpenses, fill: "#f43f5e" },
  ]

  
  const pieData = expenseAnalytics.categories.map((cat, i) => ({
    name: cat.categoryName,
    value: cat.totalSpent,
    fill: cat.categoryColor || COLORS[i % COLORS.length]
  }))

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 pt-0">
      {}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          title="Total Income"
          value={fmt(c.totalIncome)}
          icon={<ArrowUp className="w-5 h-5 text-green-500" />}
          trend={overall.trends.income}
          color="text-green-600 dark:text-green-500"
        />
        <SummaryCard
          title="Total Expenses"
          value={fmt(c.totalExpenses)}
          icon={<ArrowDown className="w-5 h-5 text-red-500" />}
          trend={overall.trends.expense}
          color="text-red-600 dark:text-red-500"
        />
        <SummaryCard
          title="Net Savings"
          value={fmt(c.netSavings)}
          icon={<PiggyBank className="w-5 h-5 text-indigo-500" />}
          color={c.netSavings >= 0 ? "text-green-600 dark:text-green-500" : "text-red-600 dark:text-red-500"}
        />
        <SummaryCard
          title="Savings Rate"
          value={fmtPct(c.savingsRate)}
          icon={<Wallet className="w-5 h-5 text-amber-500" />}
          color="text-foreground"
        />
      </div>

      {}
      <div className="grid gap-4 md:grid-cols-2">
        {}
        <Card>
          <CardHeader>
            <CardTitle>Income vs Expenses</CardTitle>
            <CardDescription>Current month comparison</CardDescription>
          </CardHeader>
          <CardContent>
            {hasData ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={barData} layout="vertical" margin={{ left: 10, right: 20 }}>
                  <XAxis type="number" tickFormatter={(v: number) => fmt(v)} tick={{ fontSize: 11 }} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={70} />
                  <Tooltip formatter={(v) => fmt(Number(v))} />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={28}>
                    {barData.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChart />
            )}
          </CardContent>
        </Card>

        {}
        <Card>
          <CardHeader>
            <CardTitle>Spending by Category</CardTitle>
            <CardDescription>Expense distribution</CardDescription>
          </CardHeader>
          <CardContent>
            {pieData.length > 0 ? (
              <div className="flex items-center gap-4">
                <ResponsiveContainer width="50%" height={200}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={80}
                      paddingAngle={2}
                      strokeWidth={0}
                    >
                      {pieData.map((entry, i) => (
                        <Cell key={i} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v) => fmt(Number(v))} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-col gap-2 text-sm">
                  {expenseAnalytics.categories.map((cat, i) => (
                    <div key={cat.categoryId} className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: cat.categoryColor || COLORS[i % COLORS.length] }}
                      />
                      <span className="truncate">{cat.categoryName}</span>
                      <span className="ml-auto font-medium text-muted-foreground">{fmtPct(cat.share)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <EmptyChart />
            )}
          </CardContent>
        </Card>
      </div>

      {}
      <div className="grid gap-4 md:grid-cols-2">
        {}
        <Card>
          <CardHeader>
            <CardTitle>Top Financial Insights</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <InsightRow
              icon={<CurrencyDollar className="w-5 h-5 text-green-500" />}
              label="Top Income Source"
              value={
                incomeAnalytics.primarySource
                  ? `${incomeAnalytics.primarySource.categoryName} · ${fmt(incomeAnalytics.primarySource.totalSpent)}`
                  : "No income yet"
              }
            />
            <InsightRow
              icon={<ChartPie className="w-5 h-5 text-red-500" />}
              label="Highest Expense Category"
              value={
                expenseAnalytics.highestCategory
                  ? `${expenseAnalytics.highestCategory.categoryName} · ${fmt(expenseAnalytics.highestCategory.totalSpent)}`
                  : "No expenses yet"
              }
            />
          </CardContent>
        </Card>

        {}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>Latest activity</CardDescription>
            </div>
            <Link href="/dashboard/transactions">
              <Button variant="ghost" size="sm">View All</Button>
            </Link>
          </CardHeader>
          <CardContent>
            {recentTransactions.length > 0 ? (
              <div className="flex flex-col gap-3">
                {recentTransactions.map(tx => (
                  <div key={tx.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="flex items-center justify-center w-8 h-8 rounded-full bg-muted flex-shrink-0 text-sm"
                        style={{ backgroundColor: tx.categoryColor || undefined }}
                      >
                        {tx.categoryIcon || (tx.type === "expense" ? "💸" : "💰")}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium leading-none">
                          {tx.description || tx.categoryName || "Transaction"}
                        </span>
                        <span className="text-xs text-muted-foreground mt-0.5">
                          {formatDate(tx.date, prefs)} · {tx.categoryName}
                        </span>
                      </div>
                    </div>
                    <span className={`text-sm font-semibold ${tx.type === "income" ? "text-green-600 dark:text-green-500" : ""}`}>
                      {tx.type === "expense" ? "-" : "+"}
                      {fmt(parseFloat(tx.amount))}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <p className="text-sm text-muted-foreground">No transactions yet.</p>
                <Link href="/dashboard/transactions" className="mt-2">
                  <Button size="sm">Add Transaction</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function SummaryCard({ title, value, icon, trend, color }: {
  title: string
  value: string
  icon: React.ReactNode
  trend?: number
  color?: string
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-1">
        <CardDescription>{title}</CardDescription>
        {icon}
      </CardHeader>
      <CardContent>
        <p className={`text-2xl font-bold ${color || ""}`}>{value}</p>
        {trend !== undefined && (
          <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
            {trend >= 0 ? <TrendUp className="w-3 h-3 text-green-500" /> : <TrendDown className="w-3 h-3 text-red-500" />}
            <span>{trend >= 0 ? "+" : ""}{trend.toFixed(1)}% vs last month</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function InsightRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center justify-center w-9 h-9 rounded-full bg-muted flex-shrink-0">{icon}</div>
      <div className="flex flex-col">
        <span className="text-xs text-muted-foreground">{label}</span>
        <span className="text-sm font-medium">{value}</span>
      </div>
    </div>
  )
}

function EmptyChart() {
  return (
    <div className="flex flex-col items-center justify-center h-[200px] text-center">
      <p className="text-sm text-muted-foreground">No transaction data yet</p>
      <p className="text-xs text-muted-foreground mt-1">Add your first income or expense to see your financial overview.</p>
      <Link href="/dashboard/transactions" className="mt-3">
        <Button size="sm">Add Transaction</Button>
      </Link>
    </div>
  )
}
