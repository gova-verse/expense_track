import { db } from "@/db"
import { transactions, categories } from "@/db/schema"
import { eq, and, gte, lte, sql, desc } from "drizzle-orm"

export type DateRange = {
  from: Date;
  to: Date;
}

// Helper to safely parse decimal strings from Postgres
function safeNum(val: unknown): number {
  if (!val) return 0;
  const num = typeof val === "string" ? parseFloat(val) : Number(val);
  return isNaN(num) ? 0 : num;
}

// 1. Core aggregation query for a specific period
export async function getPeriodAggregations(period: DateRange, userId: number) {
  // Aggregate by type
  const typeAggs = await db.select({
    type: transactions.type,
    total: sql<string>`COALESCE(SUM(${transactions.amount}), '0')`,
    count: sql<number>`CAST(COUNT(*) AS INTEGER)`
  })
  .from(transactions)
  .where(
    and(
      gte(transactions.date, period.from),
      lte(transactions.date, period.to),
      eq(transactions.userId, userId)
    )
  )
  .groupBy(transactions.type);

  let totalIncome = 0;
  let totalExpenses = 0;
  let incomeCount = 0;
  let expenseCount = 0;

  for (const row of typeAggs) {
    if (row.type === "income") {
      totalIncome = safeNum(row.total);
      incomeCount = row.count;
    } else if (row.type === "expense") {
      totalExpenses = safeNum(row.total);
      expenseCount = row.count;
    }
  }

  const netSavings = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? (netSavings / totalIncome) * 100 : 0;
  const avgIncome = incomeCount > 0 ? totalIncome / incomeCount : 0;
  const avgExpense = expenseCount > 0 ? totalExpenses / expenseCount : 0;

  return {
    totalIncome,
    totalExpenses,
    netSavings,
    savingsRate,
    avgIncome,
    avgExpense,
    incomeCount,
    expenseCount
  }
}

// 2. Category Aggregations
export async function getCategoryAggregations(period: DateRange, type: "expense" | "income", userId: number) {
  const catAggs = await db.select({
    categoryId: transactions.categoryId,
    categoryName: categories.name,
    categoryIcon: categories.icon,
    categoryColor: categories.color,
    total: sql<string>`COALESCE(SUM(${transactions.amount}), '0')`,
    count: sql<number>`CAST(COUNT(*) AS INTEGER)`
  })
  .from(transactions)
  .leftJoin(categories, eq(transactions.categoryId, categories.id))
  .where(
    and(
      eq(transactions.type, type),
      gte(transactions.date, period.from),
      lte(transactions.date, period.to),
      eq(transactions.userId, userId)
    )
  )
  .groupBy(transactions.categoryId, categories.name, categories.icon, categories.color)
  .orderBy(desc(sql`SUM(${transactions.amount})`));

  let overallTotal = 0;
  const results = catAggs.map(row => {
    const val = safeNum(row.total);
    overallTotal += val;
    return {
      categoryId: row.categoryId,
      categoryName: row.categoryName || "Uncategorized",
      categoryIcon: row.categoryIcon,
      categoryColor: row.categoryColor,
      totalSpent: val, // meaning total spent or total income
      count: row.count,
      avgTransaction: row.count > 0 ? val / row.count : 0
    }
  });

  // Calculate percentages
  const finalResults = results.map(r => ({
    ...r,
    share: overallTotal > 0 ? (r.totalSpent / overallTotal) * 100 : 0
  }));

  const topCategory = finalResults.length > 0 ? finalResults[0] : null;

  return {
    categories: finalResults,
    overallTotal,
    topCategory
  }
}

// 3. Trend Calculator Helper
export function calculateTrend(current: number, previous: number): number {
  if (previous === 0) {
    return current > 0 ? 100 : 0; // If previous was 0 and we have money now, it's a 100% increase (or handle logically)
  }
  return ((current - previous) / previous) * 100;
}

// 4. Comprehensive Full Analytics Fetcher (combines current and previous period)
export async function getFullAnalytics(currentPeriod: DateRange, previousPeriod: DateRange, userId: number) {
  const currentOverall = await getPeriodAggregations(currentPeriod, userId);
  const previousOverall = await getPeriodAggregations(previousPeriod, userId);

  const currentExpenseCats = await getCategoryAggregations(currentPeriod, "expense", userId);
  const previousExpenseCats = await getCategoryAggregations(previousPeriod, "expense", userId);

  const currentIncomeCats = await getCategoryAggregations(currentPeriod, "income", userId);
  const previousIncomeCats = await getCategoryAggregations(previousPeriod, "income", userId);

  // Calculate trends for overall
  const incomeTrend = calculateTrend(currentOverall.totalIncome, previousOverall.totalIncome);
  const expenseTrend = calculateTrend(currentOverall.totalExpenses, previousOverall.totalExpenses);

  // Map category trends
  const expenseCategoriesWithTrend = currentExpenseCats.categories.map(cat => {
    const prevCat = previousExpenseCats.categories.find(p => p.categoryId === cat.categoryId);
    const prevTotal = prevCat ? prevCat.totalSpent : 0;
    return {
      ...cat,
      trend: calculateTrend(cat.totalSpent, prevTotal)
    }
  });

  const incomeCategoriesWithTrend = currentIncomeCats.categories.map(cat => {
    const prevCat = previousIncomeCats.categories.find(p => p.categoryId === cat.categoryId);
    const prevTotal = prevCat ? prevCat.totalSpent : 0;
    return {
      ...cat,
      trend: calculateTrend(cat.totalSpent, prevTotal)
    }
  });

  return {
    overall: {
      current: currentOverall,
      previous: previousOverall,
      trends: {
        income: incomeTrend,
        expense: expenseTrend
      }
    },
    expenseAnalytics: {
      total: currentOverall.totalExpenses,
      averageTransaction: currentOverall.avgExpense,
      highestCategory: currentExpenseCats.topCategory,
      categories: expenseCategoriesWithTrend,
      trend: expenseTrend
    },
    incomeAnalytics: {
      total: currentOverall.totalIncome,
      averageTransaction: currentOverall.avgIncome,
      primarySource: currentIncomeCats.topCategory,
      categories: incomeCategoriesWithTrend,
      trend: incomeTrend
    }
  }
}
