"use client"

import { useState, useTransition, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription, SheetFooter } from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"
import { Field, FieldLabel, FieldError } from "@/components/ui/field"
import { PencilSimple, Trash, ArrowRight } from "@phosphor-icons/react"
import { insertTransactionSchema } from "@/lib/validations"
import { usePreferences, formatCurrency, formatDate } from "@/components/preferences-provider"
import { revalidateDashboard } from "@/lib/actions"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"

type TransactionItem = {
  id: number;
  type: "expense" | "income" | "transfer";
  amount: string;
  date: string;
  description: string | null;
  paymentMethod: string | null;
  notes: string | null;
  categoryId: number | null;
  categoryName: string | null;
  categoryIcon: string | null;
  categoryColor: string | null;
  accountId: number | null;
  accountName: string | null;
  destinationAccountId: number | null;
  destinationAccountName: string | null;
}

type Account = {
  id: number;
  name: string;
  type: string;
  openingBalance: string;
}

type Category = {
  id: number;
  name: string;
  type: "expense" | "income";
  icon: string | null;
  color: string | null;
  isDefault: boolean;
}

export function TransactionPage({ initialTransactions, categories, accounts }: { initialTransactions: TransactionItem[], categories: Category[], accounts: Account[] }) {
  const prefs = usePreferences()
  const router = useRouter()
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [editingTx, setEditingTx] = useState<TransactionItem | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  
  // Filters
  const [filterType, setFilterType] = useState<"all" | "expense" | "income" | "transfer">("all")
  const [filterCategory, setFilterCategory] = useState<string>("all")
  const [filterMonth, setFilterMonth] = useState<string>("")

  // Form State
  const [type, setType] = useState<"expense" | "income">("expense")
  const [amount, setAmount] = useState("")
  const [date, setDate] = useState("")
  const [categoryId, setCategoryId] = useState("")
  const [accountId, setAccountId] = useState("")
  const [description, setDescription] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("")
  const [notes, setNotes] = useState("")

  const filteredCategories = useMemo(() => {
    return categories.filter(c => c.type === type)
  }, [categories, type])

  const filteredTransactions = useMemo(() => {
    return initialTransactions.filter(tx => {
      if (filterType !== "all" && tx.type !== filterType) return false
      if (filterCategory !== "all" && tx.type !== "transfer" && tx.categoryId?.toString() !== filterCategory) return false
      if (filterMonth) {
        const txMonth = tx.date.slice(0, 7) // YYYY-MM
        if (txMonth !== filterMonth) return false
      }
      return true
    })
  }, [initialTransactions, filterType, filterCategory, filterMonth])

  const openEdit = (tx: TransactionItem) => {
    setEditingTx(tx)
    setType(tx.type as "expense" | "income")
    setAmount(tx.amount.toString())
    setDate(new Date(tx.date).toISOString().slice(0, 10)) // YYYY-MM-DD
    setCategoryId(tx.categoryId?.toString() || "")
    setAccountId(tx.accountId?.toString() || accounts[0]?.id.toString() || "")
    setDescription(tx.description || "")
    setPaymentMethod(tx.paymentMethod || "")
    setNotes(tx.notes || "")
    setError(null)
    setIsSheetOpen(true)
  }

  const openNew = () => {
    setEditingTx(null)
    setType("expense")
    setAmount("")
    setDate(new Date().toISOString().slice(0, 10))
    setCategoryId("")
    setAccountId(accounts[0]?.id.toString() || "")
    setDescription("")
    setPaymentMethod("")
    setNotes("")
    setError(null)
    setIsSheetOpen(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    
    const payload = {
      type,
      amount: parseFloat(amount),
      date: new Date(date),
      categoryId: parseInt(categoryId, 10),
      accountId: parseInt(accountId, 10),
      description: description || undefined,
      paymentMethod: paymentMethod || undefined,
      notes: notes || undefined,
    }
    
    const parsed = insertTransactionSchema.safeParse(payload)
    if (!parsed.success) {
      setError(parsed.error.issues[0].message)
      return
    }

    startTransition(async () => {
      if (editingTx) {
        const res = await fetch(`/api/transactions/${editingTx.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }).then(r => r.json())
        if (res.success) {
          setIsSheetOpen(false)
          await revalidateDashboard()
          router.refresh()
        } else {
          setError(res.error || "Failed to update transaction")
        }
      } else {
        const res = await fetch('/api/transactions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }).then(r => r.json())
        if (res.success) {
          setIsSheetOpen(false)
          await revalidateDashboard()
          router.refresh()
        } else {
          setError(res.error || "Failed to create transaction")
        }
      }
    })
  }

  const handleDelete = (id: number) => {
    setDeleteId(id)
    setDeleteError(null)
  }

  const performDelete = () => {
    if (!deleteId) return
    startTransition(async () => {
      const res = await fetch(`/api/transactions/${deleteId}`, { method: 'DELETE' }).then(r => r.json())
      if (!res.success) {
        setDeleteError(res.error || "Failed to delete transaction")
      } else {
        setDeleteId(null)
        setDeleteError(null)
        await revalidateDashboard()
        router.refresh()
      }
    })
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Transactions</h1>
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetTrigger asChild>
            <Button onClick={openNew}>Add Transaction</Button>
          </SheetTrigger>
          <SheetContent className="flex flex-col p-0">
            <SheetHeader>
              <SheetTitle>{editingTx ? "Edit Transaction" : "New Transaction"}</SheetTitle>
              <SheetDescription>
                {editingTx ? "Update your transaction details." : "Add a new expense or income record."}
              </SheetDescription>
            </SheetHeader>
            <form id="transaction-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 pb-6 flex flex-col gap-5">
              <Field>
                <FieldLabel>Type</FieldLabel>
                <select 
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  value={type} 
                  onChange={e => {
                    setType(e.target.value as "expense" | "income")
                    setCategoryId("") // Reset category when type changes
                  }}
                  disabled={isPending}
                >
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
              </Field>

              <Field>
                <FieldLabel>Account</FieldLabel>
                <select 
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  value={accountId} 
                  onChange={e => setAccountId(e.target.value)}
                  disabled={isPending}
                >
                  <option value="" disabled>Select an account</option>
                  {accounts.map(acc => (
                    <option key={acc.id} value={acc.id}>{acc.name}</option>
                  ))}
                </select>
              </Field>

              <Field>
                <FieldLabel>Amount</FieldLabel>
                <Input type="number" step="0.01" min="0" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" disabled={isPending} />
              </Field>

              <Field>
                <FieldLabel>Date</FieldLabel>
                <Input type="date" value={date} onChange={e => setDate(e.target.value)} disabled={isPending} />
              </Field>

              <Field>
                <FieldLabel>Category</FieldLabel>
                <select 
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  value={categoryId} 
                  onChange={e => setCategoryId(e.target.value)}
                  disabled={isPending}
                >
                  <option value="" disabled>Select a category</option>
                  {filteredCategories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
                  ))}
                </select>
              </Field>

              <Field>
                <FieldLabel>Description (optional)</FieldLabel>
                <Input value={description} onChange={e => setDescription(e.target.value)} placeholder="e.g. Weekly Groceries" disabled={isPending} />
              </Field>

              <Field>
                <FieldLabel>Payment Method (optional)</FieldLabel>
                <Input value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} placeholder="e.g. Credit Card, Cash" disabled={isPending} />
              </Field>

              <Field>
                <FieldLabel>Notes (optional)</FieldLabel>
                <Input value={notes} onChange={e => setNotes(e.target.value)} placeholder="Additional details..." disabled={isPending} />
              </Field>

              {error && <FieldError>{error}</FieldError>}
            </form>
            <SheetFooter>
              <Button form="transaction-form" type="submit" disabled={isPending}>
                {isPending ? "Saving..." : "Save"}
              </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>

      <Card className="mb-4">
        <CardContent className="p-4 flex flex-col md:flex-row gap-4">
          <div className="flex-1 flex flex-col gap-1">
            <span className="text-sm font-medium text-muted-foreground">Type</span>
            <select 
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              value={filterType} 
              onChange={e => {
                setFilterType(e.target.value as "all" | "expense" | "income" | "transfer")
                setFilterCategory("all") // Reset category filter when type changes
              }}
            >
              <option value="all">All Types</option>
              <option value="expense">Expense</option>
              <option value="income">Income</option>
              <option value="transfer">Transfer</option>
            </select>
          </div>
          <div className="flex-1 flex flex-col gap-1">
            <span className="text-sm font-medium text-muted-foreground">Category</span>
            <select 
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              value={filterCategory} 
              onChange={e => setFilterCategory(e.target.value)}
            >
              <option value="all">All Categories</option>
              {categories
                .filter(c => filterType === "all" || c.type === filterType)
                .map(cat => (
                <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
              ))}
            </select>
          </div>
          <div className="flex-1 flex flex-col gap-1">
            <span className="text-sm font-medium text-muted-foreground">Month</span>
            <Input type="month" value={filterMonth} onChange={e => setFilterMonth(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      {filteredTransactions.length === 0 ? (
        <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed p-8 text-center">
          <p className="text-muted-foreground">
            No transactions yet. <br />
            Add your first expense or income to start tracking your finances.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {filteredTransactions.map(tx => (
            <div key={tx.id} className="flex items-center justify-between p-4 rounded-xl border bg-card text-card-foreground shadow-sm">
              <div className="flex items-center gap-4">
                {tx.type === "transfer" ? (
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex-shrink-0">
                    <ArrowRight className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                ) : (
                  <div 
                    className="flex items-center justify-center w-10 h-10 rounded-full bg-muted flex-shrink-0 text-lg"
                    style={{ backgroundColor: tx.categoryColor || undefined }}
                  >
                    {tx.categoryIcon || (tx.type === "expense" ? "💸" : "💰")}
                  </div>
                )}
                <div className="flex flex-col">
                  <span className="font-medium text-base leading-none">
                    {tx.type === "transfer"
                      ? (tx.description || "Transfer")
                      : (tx.description || tx.categoryName || "Transaction")}
                  </span>
                  <span className="text-sm text-muted-foreground mt-1">
                    {tx.type === "transfer"
                      ? `${formatDate(tx.date, prefs)} • ${tx.accountName} → ${tx.destinationAccountName}`
                      : `${formatDate(tx.date, prefs)} • ${tx.accountName} • ${tx.categoryName} ${tx.paymentMethod ? `• ${tx.paymentMethod}` : ""}`}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <span className={`font-semibold ${
                  tx.type === 'income' ? 'text-green-600 dark:text-green-500' : 
                  tx.type === 'transfer' ? 'text-blue-600 dark:text-blue-400' : ''}`}>
                  {tx.type === "expense" ? "-" : tx.type === "transfer" ? "" : "+"}
                  {formatCurrency(parseFloat(tx.amount), prefs)}
                </span>
                
                {tx.type !== "transfer" && (
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(tx)} disabled={isPending}>
                      <PencilSimple className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(tx.id)} disabled={isPending}>
                      <Trash className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog 
        open={deleteId !== null} 
        onOpenChange={(open) => {
          if (!open) {
            setDeleteId(null)
            setDeleteError(null)
          }
        }}
        title="Delete Transaction"
        description="Are you sure you want to delete this transaction? This action cannot be undone."
        onConfirm={performDelete}
        isPending={isPending}
        error={deleteError}
      />
    </div>
  )
}
