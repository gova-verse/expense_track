"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { BudgetForm } from "@/components/budget-form"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Target, WarningCircle, CheckCircle, PencilSimple, Trash } from "@phosphor-icons/react"
import type { BudgetInput } from "@/lib/budget-utils"
import { usePreferences, formatCurrency, formatDate } from "@/components/preferences-provider"

export function BudgetsClient({
  budgets,
  categories,
}: {
  budgets: { id: number; name: string; amount: number; period: string; categoryId: number | null; categoryName: string | null; categoryIcon: string | null; categoryColor: string | null; startDate: string; spent: number; remaining: number; usage: number; status: string; activeFrom: string; activeTo: string }[]
  categories: { id: number; name: string; type: string }[]
}) {
  const prefs = usePreferences()
  const router = useRouter()
  const fmt = (val: number) => formatCurrency(val, prefs, { maximumFractionDigits: 0 })
  const [formOpen, setFormOpen] = useState(false)
  const [editingBudget, setEditingBudget] = useState<{ id: number; data: Partial<BudgetInput> } | null>(null)

  const handleEdit = (b: typeof budgets[0]) => {
    setEditingBudget({
      id: b.id,
      data: {
        name: b.name,
        amount: b.amount,
        period: b.period as "daily" | "weekly" | "monthly",
        categoryId: b.categoryId,
      }
    })
    setFormOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this budget? Transactions will not be deleted.")) {
      const res = await fetch(`/api/budgets/${id}`, { method: 'DELETE' }).then(r => r.json())
      if (res.success) router.refresh()
    }
  }

  const handleOpenNew = () => {
    setEditingBudget(null)
    setFormOpen(true)
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 pt-0">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Budgets</h1>
          <p className="text-sm text-muted-foreground">Manage your spending limits.</p>
        </div>
        <Button onClick={handleOpenNew}>Create Budget</Button>
      </div>

      {budgets.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center border rounded-lg bg-card border-dashed">
          <Target className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
          <h3 className="text-lg font-medium mb-1">No budgets yet</h3>
          <p className="text-sm text-muted-foreground mb-4">Create a budget to start controlling your spending.</p>
          <Button onClick={handleOpenNew} variant="outline">Create Budget</Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {budgets.map((b) => (
            <Card key={b.id} className="relative overflow-hidden group">
              {/* Progress bar background indicator (optional neat UI detail) */}
              <div 
                className={`absolute bottom-0 left-0 h-1 transition-all duration-500 ${
                  b.status === "healthy" ? "bg-green-500" :
                  b.status === "approaching" ? "bg-amber-500" : "bg-red-500"
                }`} 
                style={{ width: `${Math.min(b.usage, 100)}%` }}
              />

              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{b.name}</CardTitle>
                    <CardDescription className="capitalize">
                      {b.period} • {b.categoryId ? b.categoryName : "Overall Budget"}
                    </CardDescription>
                  </div>
                  <div className="flex opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEdit(b)}>
                      <PencilSimple className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => handleDelete(b.id)}>
                      <Trash className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-end mb-2">
                  <div>
                    <span className="text-2xl font-bold">{fmt(b.spent)}</span>
                    <span className="text-sm text-muted-foreground ml-1">/ {fmt(b.amount)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {b.status === "over" ? (
                      <WarningCircle className="w-4 h-4 text-red-500" />
                    ) : b.status === "approaching" ? (
                      <WarningCircle className="w-4 h-4 text-amber-500" />
                    ) : (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    )}
                    <span className={`text-sm font-medium ${
                      b.status === "over" ? "text-red-600" :
                      b.status === "approaching" ? "text-amber-600" : "text-green-600"
                    }`}>
                      {b.usage.toFixed(0)}%
                    </span>
                  </div>
                </div>
                
                <div className="w-full bg-secondary rounded-full h-2 mb-2 overflow-hidden">
                  <div 
                    className={`h-2 rounded-full ${
                      b.status === "healthy" ? "bg-green-500" :
                      b.status === "approaching" ? "bg-amber-500" : "bg-red-500"
                    }`}
                    style={{ width: `${Math.min(b.usage, 100)}%` }}
                  />
                </div>

                <div className="text-xs text-muted-foreground flex justify-between">
                  {b.remaining < 0 ? (
                    <span className="text-red-500 font-medium">Over budget by {fmt(Math.abs(b.remaining))}</span>
                  ) : (
                    <span>{fmt(b.remaining)} remaining</span>
                  )}
                  <span>
                    {formatDate(b.activeFrom, prefs)} 
                    {' - '} 
                    {formatDate(b.activeTo, prefs)}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Reusable Form Dialog */}
      <BudgetForm
        open={formOpen}
        onOpenChange={setFormOpen}
        categories={categories}
        initialData={editingBudget?.data}
        budgetId={editingBudget?.id}
      />
    </div>
  )
}
