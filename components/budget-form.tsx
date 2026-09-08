"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { budgetSchema, type BudgetInput } from "@/lib/budget-utils"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet"

export function BudgetForm({
  open,
  onOpenChange,
  categories,
  initialData,
  budgetId,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  categories: { id: number; name: string; type: string }[]
  initialData?: Partial<BudgetInput>
  budgetId?: number
}) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isEditing = !!budgetId
  const router = useRouter()

  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm({
    resolver: zodResolver(budgetSchema),
    defaultValues: {
      name: initialData?.name || "",
      amount: initialData?.amount || 0,
      period: initialData?.period || "monthly",
      categoryId: initialData?.categoryId || null,
    }
  })

  // Close and reset when done
  const handleSuccess = () => {
    reset()
    onOpenChange(false)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onSubmit = async (data: any) => {
    setIsSubmitting(true)
    try {
      const parsedData = data as BudgetInput
      const url = isEditing && budgetId ? `/api/budgets/${budgetId}` : '/api/budgets'
      const method = isEditing ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsedData),
      }).then(r => r.json())
      if (res.success) {
        handleSuccess()
        router.refresh()
      } else {
        alert(res.error || "Failed to save budget")
      }
    } catch (error) {
      console.error(error)
      alert("Failed to save budget")
    } finally {
      setIsSubmitting(false)
    }
  }

  const expenseCategories = categories.filter(c => c.type === "expense")
  const watchCategory = watch("categoryId")

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col p-0">
        <SheetHeader>
          <SheetTitle>{isEditing ? "Edit Budget" : "Create Budget"}</SheetTitle>
          <SheetDescription>
            {isEditing ? "Modify your budget limit." : "Set a new spending limit."}
          </SheetDescription>
        </SheetHeader>

        <form id="budget-form" onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto px-6 pb-6 flex flex-col gap-5">
          <div className="space-y-2">
            <Label htmlFor="name">Budget Name</Label>
            <Input id="name" placeholder="e.g. Monthly Groceries" {...register("name")} />
            {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount (₹)</Label>
            <Input id="amount" type="number" step="0.01" {...register("amount")} />
            {errors.amount && <p className="text-sm text-red-500">{errors.amount.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="period">Period</Label>
            <select
              id="period"
              className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              {...register("period")}
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
            {errors.period && <p className="text-sm text-red-500">{errors.period.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Scope / Category</Label>
            <select
              id="category"
              className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              value={(watchCategory as string | number) || ""}
              onChange={(e) => {
                const val = e.target.value
                setValue("categoryId", val ? parseInt(val, 10) : null)
              }}
            >
              <option value="">Overall Budget (All Expenses)</option>
              {expenseCategories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            {errors.categoryId && <p className="text-sm text-red-500">{errors.categoryId.message}</p>}
          </div>

        </form>
        <SheetFooter className="flex-row justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button form="budget-form" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : isEditing ? "Save Changes" : "Create Budget"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
