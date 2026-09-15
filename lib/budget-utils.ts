import { z } from "zod";

export type BudgetPeriod = "daily" | "weekly" | "monthly";

export const budgetSchema = z.object({
  name: z.string().min(1, "Name is required"),
  amount: z.coerce.number().min(0.01, "Amount must be greater than 0"),
  period: z.enum(["daily", "weekly", "monthly"]),
  categoryId: z.coerce.number().nullable().optional(),
})

export type BudgetInput = z.infer<typeof budgetSchema>

export type BudgetStatus = "healthy" | "approaching" | "over";


export function getActivePeriodRange(period: BudgetPeriod, referenceDate: Date = new Date()): { from: Date; to: Date } {
  const from = new Date(referenceDate)
  const to = new Date(referenceDate)

  switch (period) {
    case "daily":
      from.setHours(0, 0, 0, 0)
      to.setHours(23, 59, 59, 999)
      break
    case "weekly": {
      
      const day = from.getDay()
      const diff = from.getDate() - day + (day === 0 ? -6 : 1) 
      from.setDate(diff)
      from.setHours(0, 0, 0, 0)
      
      to.setDate(from.getDate() + 6)
      to.setHours(23, 59, 59, 999)
      break
    }
    case "monthly":
      from.setDate(1)
      from.setHours(0, 0, 0, 0)
      
      to.setMonth(to.getMonth() + 1, 0)
      to.setHours(23, 59, 59, 999)
      break
  }

  return { from, to }
}

export function calculateBudgetMetrics(amount: number, spent: number) {
  const remaining = amount - spent
  const usage = amount > 0 ? (spent / amount) * 100 : 0
  
  let status: BudgetStatus = "healthy"
  if (usage >= 100) {
    status = "over"
  } else if (usage >= 80) {
    status = "approaching"
  }

  return {
    spent,
    remaining,
    usage,
    status
  }
}
