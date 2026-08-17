"use client"

import { useRouter } from "next/navigation"
import { useState, useRef, useEffect } from "react"
import { exportCSV, exportPDF, exportExcel } from "@/lib/export-report"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  ArrowUp, ArrowDown, TrendUp, TrendDown, Wallet, PiggyBank,
  CurrencyDollar, ChartPie, ArrowsDownUp, Export
} from "@phosphor-icons/react"
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer
} from "recharts"
import { usePreferences, formatCurrency } from "@/components/preferences-provider"

const fmtPct = (val: number) => `${val.toFixed(1)}%`
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

type AnalyticsData = {
  overall: {
    current: {
      totalIncome: number; totalExpenses: number; netSavings: number
      savingsRate: number; avgIncome: number; avgExpense: number
      incomeCount: number; expenseCount: number
    }
    previous: {
      totalIncome: number; totalExpenses: number; netSavings: number
      savingsRate: number
    }
    trends: { income: number; expense: number }
  }
  expenseAnalytics: {
    total: number; averageTransaction: number
    highestCategory: CategoryStat | null
    categories: CategoryStatWithTrend[]; trend: number
  }
  incomeAnalytics: {
    total: number; averageTransaction: number
    primarySource: CategoryStat | null
    categories: CategoryStatWithTrend[]; trend: number
  }
}

const COLORS = ["#6366f1", "#f43f5e", "#10b981", "#f59e0b", "#8b5cf6", "#06b6d4", "#ec4899", "#14b8a6"]
const TABS = ["Overview", "Income", "Expenses", "Categories", "Cash Flow"] as const
type Tab = (typeof TABS)[number]

// ── Main Component ──────────────────────────────────────────────
export function ReportsClient({
  analytics, periodKey, periodLabel
}: {
  analytics: AnalyticsData; periodKey: string; periodLabel: string
}) {
  const prefs = usePreferences()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<Tab>("Overview")
  const [exportOpen, setExportOpen] = useState(false)
  const exportRef = useRef<HTMLDivElement>(null)
  const c = analytics.overall.current
  const hasData = c.incomeCount + c.expenseCount > 0

  const handlePeriodChange = (key: string) => {
    router.push(`/dashboard/reports?period=${key}`)
  }

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (exportRef.current && !exportRef.current.contains(e.target as Node)) setExportOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  const handleExport = async (format: "csv" | "pdf" | "xlsx") => {
    setExportOpen(false)
    if (!hasData) { alert("No data to export for this period."); return }
    if (format === "csv") exportCSV(analytics, periodLabel, prefs)
    else if (format === "pdf") await exportPDF(analytics, periodLabel, prefs)
    else if (format === "xlsx") await exportExcel(analytics, periodLabel, prefs)
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 pt-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold">Financial Reports</h1>

        {/* Period Selector */}
        <div className="flex gap-2">
          {([
            ["this-month", "This Month"],
            ["last-month", "Last Month"],
            ["this-year", "This Year"],
          ] as const).map(([key, label]) => (
            <Button
              key={key}
              variant={periodKey === key ? "default" : "outline"}
              size="sm"
              onClick={() => handlePeriodChange(key)}
            >
              {label}
            </Button>
          ))}

          {/* Export Dropdown */}
          <div className="relative" ref={exportRef}>
            <Button variant="outline" size="sm" onClick={() => setExportOpen(o => !o)}>
              <Export className="w-4 h-4 mr-1" /> Export
            </Button>
            {exportOpen && (
              <div className="absolute right-0 top-full mt-1 z-50 w-44 rounded-md border bg-popover p-1 shadow-md">
                <button className="w-full text-left px-3 py-2 text-sm rounded hover:bg-accent" onClick={() => handleExport("csv")}>Export CSV</button>
                <button className="w-full text-left px-3 py-2 text-sm rounded hover:bg-accent" onClick={() => handleExport("pdf")}>Export PDF</button>
                <button className="w-full text-left px-3 py-2 text-sm rounded hover:bg-accent" onClick={() => handleExport("xlsx")}>Export Excel</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b overflow-x-auto">
        {TABS.map(tab => (
          <button
            key={tab}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === tab
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "Overview" && <OverviewTab analytics={analytics} hasData={hasData} periodLabel={periodLabel} />}
      {activeTab === "Income" && <IncomeTab analytics={analytics} hasData={hasData} />}
      {activeTab === "Expenses" && <ExpenseTab analytics={analytics} hasData={hasData} />}
      {activeTab === "Categories" && <CategoriesTab analytics={analytics} hasData={hasData} />}
      {activeTab === "Cash Flow" && <CashFlowTab analytics={analytics} hasData={hasData} />}
    </div>
  )
}

// ── Overview ────────────────────────────────────────────────────
function OverviewTab({ analytics, hasData, periodLabel }: { analytics: AnalyticsData; hasData: boolean; periodLabel: string }) {
  const prefs = usePreferences()
  const fmt = (val: number) => formatCurrency(val, prefs, { maximumFractionDigits: 0 })
  const c = analytics.overall.current

  const barData = [
    { name: "Income", value: c.totalIncome, fill: "#10b981" },
    { name: "Expenses", value: c.totalExpenses, fill: "#f43f5e" },
    { name: "Net Savings", value: c.netSavings, fill: "#6366f1" },
  ]

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard title="Total Income" value={fmt(c.totalIncome)} icon={<ArrowUp className="w-5 h-5 text-green-500" />} trend={analytics.overall.trends.income} color="text-green-600 dark:text-green-500" />
        <MetricCard title="Total Expenses" value={fmt(c.totalExpenses)} icon={<ArrowDown className="w-5 h-5 text-red-500" />} trend={analytics.overall.trends.expense} />
        <MetricCard title="Net Savings" value={fmt(c.netSavings)} icon={<PiggyBank className="w-5 h-5 text-indigo-500" />} color={c.netSavings >= 0 ? "text-green-600 dark:text-green-500" : "text-red-600 dark:text-red-500"} />
        <MetricCard title="Savings Rate" value={fmtPct(c.savingsRate)} icon={<Wallet className="w-5 h-5 text-amber-500" />} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Income vs Expenses vs Savings</CardTitle>
          <CardDescription>{periodLabel}</CardDescription>
        </CardHeader>
        <CardContent>
          {hasData ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={barData} margin={{ left: 10, right: 20 }}>
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tickFormatter={(v: number) => fmt(v)} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v) => fmt(Number(v))} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={48}>
                  {barData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState />
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// ── Income ──────────────────────────────────────────────────────
function IncomeTab({ analytics, hasData }: { analytics: AnalyticsData; hasData: boolean }) {
  const prefs = usePreferences()
  const fmt = (val: number) => formatCurrency(val, prefs, { maximumFractionDigits: 0 })
  const inc = analytics.incomeAnalytics
  const c = analytics.overall.current

  const pieData = inc.categories.map((cat, i) => ({
    name: cat.categoryName,
    value: cat.totalSpent,
    fill: cat.categoryColor || COLORS[i % COLORS.length]
  }))

  if (!hasData || c.incomeCount === 0) return <EmptyState />

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard title="Total Income" value={fmt(inc.total)} icon={<ArrowUp className="w-5 h-5 text-green-500" />} color="text-green-600 dark:text-green-500" trend={inc.trend} />
        <MetricCard title="Avg. Transaction" value={fmt(inc.averageTransaction)} icon={<CurrencyDollar className="w-5 h-5 text-blue-500" />} />
        <MetricCard title="Top Income Source" value={inc.primarySource ? inc.primarySource.categoryName : "—"} icon={<TrendUp className="w-5 h-5 text-green-500" />} subtitle={inc.primarySource ? fmt(inc.primarySource.totalSpent) : undefined} />
        <MetricCard title="Income Trend" value={<TrendDisplay trend={inc.trend} />} icon={inc.trend >= 0 ? <TrendUp className="w-5 h-5 text-green-500" /> : <TrendDown className="w-5 h-5 text-red-500" />} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Income Source Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} dataKey="value" cx="50%" cy="50%" innerRadius={45} outerRadius={80} paddingAngle={2} strokeWidth={0}>
                  {pieData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                </Pie>
                <Tooltip formatter={(v) => fmt(Number(v))} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Income Sources</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3">
              {inc.categories.map((cat, i) => (
                <CategoryRow key={cat.categoryId} cat={cat} index={i} />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// ── Expenses ────────────────────────────────────────────────────
function ExpenseTab({ analytics, hasData }: { analytics: AnalyticsData; hasData: boolean }) {
  const prefs = usePreferences()
  const fmt = (val: number) => formatCurrency(val, prefs, { maximumFractionDigits: 0 })
  const exp = analytics.expenseAnalytics
  const c = analytics.overall.current

  const pieData = exp.categories.map((cat, i) => ({
    name: cat.categoryName,
    value: cat.totalSpent,
    fill: cat.categoryColor || COLORS[i % COLORS.length]
  }))

  if (!hasData || c.expenseCount === 0) return <EmptyState />

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard title="Total Expenses" value={fmt(exp.total)} icon={<ArrowDown className="w-5 h-5 text-red-500" />} trend={exp.trend} />
        <MetricCard title="Avg. Transaction" value={fmt(exp.averageTransaction)} icon={<CurrencyDollar className="w-5 h-5 text-blue-500" />} />
        <MetricCard title="Highest Category" value={exp.highestCategory ? exp.highestCategory.categoryName : "—"} icon={<ChartPie className="w-5 h-5 text-red-500" />} subtitle={exp.highestCategory ? fmt(exp.highestCategory.totalSpent) : undefined} />
        <MetricCard title="Spending Trend" value={<TrendDisplay trend={exp.trend} />} icon={exp.trend >= 0 ? <TrendUp className="w-5 h-5 text-red-500" /> : <TrendDown className="w-5 h-5 text-green-500" />} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Expense Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} dataKey="value" cx="50%" cy="50%" innerRadius={45} outerRadius={80} paddingAngle={2} strokeWidth={0}>
                  {pieData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                </Pie>
                <Tooltip formatter={(v) => fmt(Number(v))} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Expense Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3">
              {exp.categories.map((cat, i) => (
                <div key={cat.categoryId} className="flex flex-col gap-1 pb-3 border-b last:border-0 last:pb-0">
                  <CategoryRow cat={cat} index={i} />
                  <div className="flex gap-4 text-xs text-muted-foreground pl-5">
                    <span>Avg. Tx: {fmt(cat.avgTransaction)}</span>
                    <span>{cat.count} transactions</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// ── Categories ──────────────────────────────────────────────────
function CategoriesTab({ analytics, hasData }: { analytics: AnalyticsData; hasData: boolean }) {
  const prefs = usePreferences()
  const fmt = (val: number) => formatCurrency(val, prefs, { maximumFractionDigits: 0 })
  const exp = analytics.expenseAnalytics

  if (!hasData || exp.categories.length === 0) return <EmptyState />

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Category Spending Distribution</CardTitle>
          <CardDescription>Expense categories ranked by spending</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={Math.max(180, exp.categories.length * 50)}>
            <BarChart data={exp.categories.map((c, i) => ({ name: c.categoryName, value: c.totalSpent, fill: c.categoryColor || COLORS[i % COLORS.length] }))} layout="vertical" margin={{ left: 10, right: 20 }}>
              <XAxis type="number" tickFormatter={(v: number) => fmt(v)} tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={100} />
              <Tooltip formatter={(v) => fmt(Number(v))} />
              <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={24}>
                {exp.categories.map((c, i) => <Cell key={i} fill={c.categoryColor || COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {exp.categories.map((cat, i) => (
          <Card key={cat.categoryId}>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: cat.categoryColor || COLORS[i % COLORS.length] }} />
                <CardTitle>{cat.categoryIcon} {cat.categoryName}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground text-xs">Total Spent</p>
                  <p className="font-semibold">{fmt(cat.totalSpent)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Share of Spending</p>
                  <p className="font-semibold">{fmtPct(cat.share)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Avg. Transaction</p>
                  <p className="font-semibold">{fmt(cat.avgTransaction)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Trend</p>
                  <TrendDisplay trend={cat.trend} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

// ── Cash Flow ───────────────────────────────────────────────────
function CashFlowTab({ analytics, hasData }: { analytics: AnalyticsData; hasData: boolean }) {
  const prefs = usePreferences()
  const fmt = (val: number) => formatCurrency(val, prefs, { maximumFractionDigits: 0 })
  const c = analytics.overall.current

  const barData = [
    { name: "Income", value: c.totalIncome, fill: "#10b981" },
    { name: "Expenses", value: c.totalExpenses, fill: "#f43f5e" },
    { name: "Net Cash Flow", value: c.netSavings, fill: c.netSavings >= 0 ? "#6366f1" : "#ef4444" },
  ]

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard title="Total Income" value={fmt(c.totalIncome)} icon={<ArrowUp className="w-5 h-5 text-green-500" />} color="text-green-600 dark:text-green-500" trend={analytics.overall.trends.income} />
        <MetricCard title="Total Expenses" value={fmt(c.totalExpenses)} icon={<ArrowDown className="w-5 h-5 text-red-500" />} trend={analytics.overall.trends.expense} />
        <MetricCard title="Net Cash Flow" value={fmt(c.netSavings)} icon={<ArrowsDownUp className="w-5 h-5 text-indigo-500" />} color={c.netSavings >= 0 ? "text-green-600 dark:text-green-500" : "text-red-600 dark:text-red-500"} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Cash Flow Breakdown</CardTitle>
          <CardDescription>Income, Expenses, and Net Cash Flow</CardDescription>
        </CardHeader>
        <CardContent>
          {hasData ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={barData} margin={{ left: 10, right: 20 }}>
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tickFormatter={(v: number) => fmt(v)} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v) => fmt(Number(v))} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={56}>
                  {barData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState />
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// ── Shared Sub-Components ───────────────────────────────────────

function MetricCard({ title, value, icon, trend, color, subtitle }: {
  title: string
  value: React.ReactNode
  icon: React.ReactNode
  trend?: number
  color?: string
  subtitle?: string
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-1">
        <CardDescription>{title}</CardDescription>
        {icon}
      </CardHeader>
      <CardContent>
        <p className={`text-2xl font-bold ${color || ""}`}>{value}</p>
        {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
        {trend !== undefined && (
          <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
            {trend >= 0 ? <TrendUp className="w-3 h-3 text-green-500" /> : <TrendDown className="w-3 h-3 text-red-500" />}
            <span>{trend >= 0 ? "+" : ""}{trend.toFixed(1)}% vs prev. period</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function CategoryRow({ cat, index }: { cat: CategoryStatWithTrend; index: number }) {
  const prefs = usePreferences()
  const fmt = (val: number) => formatCurrency(val, prefs, { maximumFractionDigits: 0 })
  return (
    <div className="flex items-center gap-3">
      <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: cat.categoryColor || COLORS[index % COLORS.length] }} />
      <span className="text-sm font-medium truncate flex-1">{cat.categoryIcon} {cat.categoryName}</span>
      <span className="text-sm font-semibold">{fmt(cat.totalSpent)}</span>
      <span className="text-xs text-muted-foreground w-14 text-right">{fmtPct(cat.share)}</span>
    </div>
  )
}

function TrendDisplay({ trend }: { trend: number }) {
  const isNew = trend === 100 // our calculateTrend returns 100 when prev === 0 && current > 0
  if (isNew) return <span className="text-sm font-medium text-blue-500">New</span>
  return (
    <span className={`text-sm font-medium ${trend >= 0 ? "text-green-600 dark:text-green-500" : "text-red-600 dark:text-red-500"}`}>
      {trend >= 0 ? "+" : ""}{trend.toFixed(1)}%
    </span>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <p className="text-sm text-muted-foreground">No financial activity for this period.</p>
      <p className="text-xs text-muted-foreground mt-1">Add transactions to generate your report.</p>
      <Link href="/dashboard/transactions" className="mt-3">
        <Button size="sm">Add Transaction</Button>
      </Link>
    </div>
  )
}
