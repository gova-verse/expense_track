/**
 * Shared Report Export Utilities
 *
 * All exports consume the same AnalyticsData object used by the Reports UI.
 * No separate database queries or calculations are performed.
 *
 * Data flow: Neon → Analytics → Report Data → CSV / PDF / Excel
 */

// ── Types (mirror reports-client.tsx) ───────────────────────────
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

export type ExportAnalyticsData = {
  overall: {
    current: {
      totalIncome: number; totalExpenses: number; netSavings: number
      savingsRate: number; avgIncome: number; avgExpense: number
      incomeCount: number; expenseCount: number
    }
  }
  expenseAnalytics: {
    total: number; averageTransaction: number
    highestCategory: CategoryStat | null
    categories: CategoryStatWithTrend[]
  }
  incomeAnalytics: {
    total: number; averageTransaction: number
    primarySource: CategoryStat | null
    categories: CategoryStatWithTrend[]
  }
}

import { Preferences, formatCurrency } from "@/components/preferences-provider"

// ── Formatters ──────────────────────────────────────────────────
const fmtPct = (val: number) => `${val.toFixed(2)}%`
const sanitize = (periodLabel: string) =>
  periodLabel.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")

// ── CSV ─────────────────────────────────────────────────────────
function escapeCsv(val: string | number): string {
  const s = String(val)
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`
  }
  return s
}

export function exportCSV(data: ExportAnalyticsData, periodLabel: string, prefs: Preferences) {
  const fmt = (val: number) => formatCurrency(val, prefs, { maximumFractionDigits: 2 })
  const c = data.overall.current
  const rows: string[][] = []

  rows.push(["Financial Report"])
  rows.push(["Period", periodLabel])
  rows.push([])

  // Summary
  rows.push(["=== Summary ==="])
  rows.push(["Total Income", fmt(c.totalIncome)])
  rows.push(["Total Expenses", fmt(c.totalExpenses)])
  rows.push(["Net Savings", fmt(c.netSavings)])
  rows.push(["Savings Rate", fmtPct(c.savingsRate)])
  rows.push([])

  // Income
  rows.push(["=== Income Analysis ==="])
  rows.push(["Total Income", fmt(c.totalIncome)])
  rows.push(["Average Income Transaction", fmt(c.avgIncome)])
  rows.push(["Top Income Source", data.incomeAnalytics.primarySource?.categoryName || "N/A"])
  rows.push([])
  rows.push(["Income Source", "Total Income", "Share of Income", "Transaction Count"])
  for (const cat of data.incomeAnalytics.categories) {
    rows.push([cat.categoryName, fmt(cat.totalSpent), fmtPct(cat.share), String(cat.count)])
  }
  rows.push([])

  // Expenses
  rows.push(["=== Expense Analysis ==="])
  rows.push(["Total Expenses", fmt(c.totalExpenses)])
  rows.push(["Average Expense Transaction", fmt(c.avgExpense)])
  rows.push(["Highest Expense Category", data.expenseAnalytics.highestCategory?.categoryName || "N/A"])
  rows.push([])
  rows.push(["Category", "Total Spent", "Share of Spending", "Average Transaction", "Transaction Count"])
  for (const cat of data.expenseAnalytics.categories) {
    rows.push([cat.categoryName, fmt(cat.totalSpent), fmtPct(cat.share), fmt(cat.avgTransaction), String(cat.count)])
  }
  rows.push([])

  // Cash Flow
  rows.push(["=== Cash Flow ==="])
  rows.push(["Income", fmt(c.totalIncome)])
  rows.push(["Expenses", fmt(c.totalExpenses)])
  rows.push(["Net Cash Flow", fmt(c.netSavings)])

  const csvContent = "\uFEFF" + rows.map(r => r.map(escapeCsv).join(",")).join("\n")
  downloadFile(csvContent, `financial-report-${sanitize(periodLabel)}.csv`, "text/csv;charset=utf-8")
}

// ── PDF ─────────────────────────────────────────────────────────
export async function exportPDF(data: ExportAnalyticsData, periodLabel: string, prefs: Preferences) {
  const fmt = (val: number) => formatCurrency(val, prefs, { maximumFractionDigits: 2 })
  const { default: jsPDF } = await import("jspdf")
  const { default: autoTable } = await import("jspdf-autotable")

  const doc = new jsPDF()
  const c = data.overall.current
  let y = 20

  // Title
  doc.setFontSize(18)
  doc.text("Financial Report", 14, y)
  y += 8
  doc.setFontSize(11)
  doc.setTextColor(100)
  doc.text(`Period: ${periodLabel}`, 14, y)
  doc.setTextColor(0)
  y += 12

  // Summary
  doc.setFontSize(14)
  doc.text("Summary", 14, y)
  y += 2
  autoTable(doc, {
    startY: y,
    head: [["Metric", "Value"]],
    body: [
      ["Total Income", fmt(c.totalIncome)],
      ["Total Expenses", fmt(c.totalExpenses)],
      ["Net Savings", fmt(c.netSavings)],
      ["Savings Rate", fmtPct(c.savingsRate)],
    ],
    theme: "grid",
    headStyles: { fillColor: [99, 102, 241] },
    margin: { left: 14 },
  })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  y = (doc as any).lastAutoTable.finalY + 10

  // Income
  doc.setFontSize(14)
  doc.text("Income Analysis", 14, y)
  y += 2
  autoTable(doc, {
    startY: y,
    head: [["Metric", "Value"]],
    body: [
      ["Total Income", fmt(c.totalIncome)],
      ["Average Income Transaction", fmt(c.avgIncome)],
      ["Top Income Source", data.incomeAnalytics.primarySource?.categoryName || "N/A"],
    ],
    theme: "grid",
    headStyles: { fillColor: [16, 185, 129] },
    margin: { left: 14 },
  })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  y = (doc as any).lastAutoTable.finalY + 4

  if (data.incomeAnalytics.categories.length > 0) {
    autoTable(doc, {
      startY: y,
      head: [["Source", "Total Income", "Share", "Transactions"]],
      body: data.incomeAnalytics.categories.map(cat => [
        cat.categoryName, fmt(cat.totalSpent), fmtPct(cat.share), String(cat.count)
      ]),
      theme: "striped",
      headStyles: { fillColor: [16, 185, 129] },
      margin: { left: 14 },
    })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    y = (doc as any).lastAutoTable.finalY + 10
  } else {
    y += 10
  }

  // Check if we need a new page
  if (y > 240) { doc.addPage(); y = 20 }

  // Expenses
  doc.setFontSize(14)
  doc.text("Expense Analysis", 14, y)
  y += 2
  autoTable(doc, {
    startY: y,
    head: [["Metric", "Value"]],
    body: [
      ["Total Expenses", fmt(c.totalExpenses)],
      ["Average Expense Transaction", fmt(c.avgExpense)],
      ["Highest Expense Category", data.expenseAnalytics.highestCategory?.categoryName || "N/A"],
    ],
    theme: "grid",
    headStyles: { fillColor: [244, 63, 94] },
    margin: { left: 14 },
  })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  y = (doc as any).lastAutoTable.finalY + 4

  if (data.expenseAnalytics.categories.length > 0) {
    autoTable(doc, {
      startY: y,
      head: [["Category", "Total Spent", "Share", "Avg. Transaction", "Transactions"]],
      body: data.expenseAnalytics.categories.map(cat => [
        cat.categoryName, fmt(cat.totalSpent), fmtPct(cat.share), fmt(cat.avgTransaction), String(cat.count)
      ]),
      theme: "striped",
      headStyles: { fillColor: [244, 63, 94] },
      margin: { left: 14 },
    })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    y = (doc as any).lastAutoTable.finalY + 10
  } else {
    y += 10
  }

  if (y > 240) { doc.addPage(); y = 20 }

  // Cash Flow
  doc.setFontSize(14)
  doc.text("Cash Flow", 14, y)
  y += 2
  autoTable(doc, {
    startY: y,
    head: [["Metric", "Value"]],
    body: [
      ["Income", fmt(c.totalIncome)],
      ["Expenses", fmt(c.totalExpenses)],
      ["Net Cash Flow", fmt(c.netSavings)],
    ],
    theme: "grid",
    headStyles: { fillColor: [99, 102, 241] },
    margin: { left: 14 },
  })

  doc.save(`financial-report-${sanitize(periodLabel)}.pdf`)
}

// ── Excel ───────────────────────────────────────────────────────
export async function exportExcel(data: ExportAnalyticsData, periodLabel: string, prefs: Preferences) {
  const XLSX = await import("xlsx")
  const c = data.overall.current
  const wb = XLSX.utils.book_new()

  // Summary sheet
  const summaryData = [
    ["Financial Report"],
    ["Period", periodLabel],
    [],
    ["Metric", "Value"],
    ["Total Income", c.totalIncome],
    ["Total Expenses", c.totalExpenses],
    ["Net Savings", c.netSavings],
    ["Savings Rate (%)", c.savingsRate],
  ]
  const ws1 = XLSX.utils.aoa_to_sheet(summaryData)
  XLSX.utils.book_append_sheet(wb, ws1, "Summary")

  // Income sheet
  const incomeData = [
    ["Income Analysis"],
    ["Period", periodLabel],
    [],
    ["Total Income", c.totalIncome],
    ["Average Income Transaction", c.avgIncome],
    ["Top Income Source", data.incomeAnalytics.primarySource?.categoryName || "N/A"],
    [],
    ["Source", "Total Income", "Share (%)", "Transactions"],
    ...data.incomeAnalytics.categories.map(cat => [
      cat.categoryName, cat.totalSpent, cat.share, cat.count
    ])
  ]
  const ws2 = XLSX.utils.aoa_to_sheet(incomeData)
  XLSX.utils.book_append_sheet(wb, ws2, "Income")

  // Expenses sheet
  const expenseData = [
    ["Expense Analysis"],
    ["Period", periodLabel],
    [],
    ["Total Expenses", c.totalExpenses],
    ["Average Expense Transaction", c.avgExpense],
    ["Highest Expense Category", data.expenseAnalytics.highestCategory?.categoryName || "N/A"],
    [],
    ["Category", "Total Spent", "Share (%)", "Avg. Transaction", "Transactions"],
    ...data.expenseAnalytics.categories.map(cat => [
      cat.categoryName, cat.totalSpent, cat.share, cat.avgTransaction, cat.count
    ])
  ]
  const ws3 = XLSX.utils.aoa_to_sheet(expenseData)
  XLSX.utils.book_append_sheet(wb, ws3, "Expenses")

  // Categories sheet
  const catData = [
    ["Category Analysis"],
    ["Period", periodLabel],
    [],
    ["Category", "Total Spent", "Share (%)", "Avg. Transaction", "Transactions", "Trend (%)"],
    ...data.expenseAnalytics.categories.map(cat => [
      cat.categoryName, cat.totalSpent, cat.share, cat.avgTransaction, cat.count, cat.trend
    ])
  ]
  const ws4 = XLSX.utils.aoa_to_sheet(catData)
  XLSX.utils.book_append_sheet(wb, ws4, "Categories")

  // Cash Flow sheet
  const cfData = [
    ["Cash Flow"],
    ["Period", periodLabel],
    [],
    ["Metric", "Value"],
    ["Income", c.totalIncome],
    ["Expenses", c.totalExpenses],
    ["Net Cash Flow", c.netSavings],
  ]
  const ws5 = XLSX.utils.aoa_to_sheet(cfData)
  XLSX.utils.book_append_sheet(wb, ws5, "Cash Flow")

  XLSX.writeFile(wb, `financial-report-${sanitize(periodLabel)}.xlsx`)
}

// ── Helper ──────────────────────────────────────────────────────
function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
