"use client"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription, SheetFooter } from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"
import { Field, FieldLabel, FieldError } from "@/components/ui/field"
import { createTransfer, updateTransfer, deleteTransfer } from "@/app/actions/transfers"
import { PencilSimple, Trash, ArrowRight } from "@phosphor-icons/react"
import { usePreferences, formatCurrency, formatDate } from "@/components/preferences-provider"

type TransferItem = {
  id: number;
  type: string;
  amount: string;
  date: Date;
  description: string | null;
  notes: string | null;
  accountId: number;
  accountName: string;
  destinationAccountId: number;
  destinationAccountName: string;
  createdAt: Date;
}

type Account = {
  id: number;
  name: string;
  type: string;
  openingBalance: string;
}

export function TransfersClient({ initialTransfers, accounts }: { initialTransfers: TransferItem[], accounts: Account[] }) {
  const prefs = usePreferences()
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [editingTransfer, setEditingTransfer] = useState<TransferItem | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  // Form State
  const [fromAccountId, setFromAccountId] = useState("")
  const [toAccountId, setToAccountId] = useState("")
  const [amount, setAmount] = useState("")
  const [date, setDate] = useState("")
  const [description, setDescription] = useState("")
  const [notes, setNotes] = useState("")

  const openEdit = (tr: TransferItem) => {
    setEditingTransfer(tr)
    setFromAccountId(tr.accountId.toString())
    setToAccountId(tr.destinationAccountId.toString())
    setAmount(tr.amount.toString())
    setDate(new Date(tr.date).toISOString().slice(0, 10))
    setDescription(tr.description || "")
    setNotes(tr.notes || "")
    setError(null)
    setIsSheetOpen(true)
  }

  const openNew = () => {
    setEditingTransfer(null)
    setFromAccountId(accounts[0]?.id.toString() || "")
    setToAccountId(accounts.length > 1 ? accounts[1].id.toString() : "")
    setAmount("")
    setDate(new Date().toISOString().slice(0, 10))
    setDescription("")
    setNotes("")
    setError(null)
    setIsSheetOpen(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const parsedFrom = parseInt(fromAccountId, 10)
    const parsedTo = parseInt(toAccountId, 10)

    if (parsedFrom === parsedTo) {
      setError("Source and destination accounts must be different.")
      return
    }

    const payload = {
      amount: parseFloat(amount),
      date: new Date(date),
      accountId: parsedFrom,
      destinationAccountId: parsedTo,
      description: description || undefined,
      notes: notes || undefined,
    }

    startTransition(async () => {
      if (editingTransfer) {
        const res = await updateTransfer(editingTransfer.id, payload)
        if (res.success) {
          setIsSheetOpen(false)
        } else {
          setError(res.error || "Failed to update transfer")
        }
      } else {
        const res = await createTransfer(payload)
        if (res.success) {
          setIsSheetOpen(false)
        } else {
          setError(res.error || "Failed to create transfer")
        }
      }
    })
  }

  const handleDelete = (id: number) => {
    if (!window.confirm("Are you sure you want to delete this transfer? Account balances will be updated automatically.")) return
    startTransition(async () => {
      const res = await deleteTransfer(id)
      if (!res.success) {
        alert(res.error || "Failed to delete transfer")
      }
    })
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Transfers</h1>
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetTrigger asChild>
            <Button onClick={openNew}>New Transfer</Button>
          </SheetTrigger>
          <SheetContent className="flex flex-col p-0">
            <SheetHeader>
              <SheetTitle>{editingTransfer ? "Edit Transfer" : "New Transfer"}</SheetTitle>
              <SheetDescription>
                {editingTransfer ? "Update this transfer between accounts." : "Move money between your accounts."}
              </SheetDescription>
            </SheetHeader>
            <form id="transfer-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 pb-6 flex flex-col gap-5">
              <Field>
                <FieldLabel>From Account</FieldLabel>
                <select 
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  value={fromAccountId} 
                  onChange={e => {
                    setFromAccountId(e.target.value)
                    setError(null)
                  }}
                  disabled={isPending}
                >
                  <option value="" disabled>Select source account</option>
                  {accounts.map(acc => (
                    <option key={acc.id} value={acc.id}>{acc.name}</option>
                  ))}
                </select>
              </Field>

              <Field>
                <FieldLabel>To Account</FieldLabel>
                <select 
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  value={toAccountId} 
                  onChange={e => {
                    setToAccountId(e.target.value)
                    setError(null)
                  }}
                  disabled={isPending}
                >
                  <option value="" disabled>Select destination account</option>
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
                <FieldLabel>Description (optional)</FieldLabel>
                <Input value={description} onChange={e => setDescription(e.target.value)} placeholder="e.g. ATM withdrawal" disabled={isPending} />
              </Field>

              <Field>
                <FieldLabel>Notes (optional)</FieldLabel>
                <Input value={notes} onChange={e => setNotes(e.target.value)} placeholder="Additional details..." disabled={isPending} />
              </Field>

              {error && <FieldError>{error}</FieldError>}
            </form>
            <SheetFooter>
              <Button form="transfer-form" type="submit" disabled={isPending}>
                {isPending ? "Processing..." : editingTransfer ? "Update Transfer" : "Transfer Money"}
              </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>

      {initialTransfers.length === 0 ? (
        <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed p-8 text-center flex-col gap-4">
          <p className="text-muted-foreground">
            No transfers yet. <br />
            Move money between your accounts to keep your balances organized.
          </p>
          <Button onClick={openNew} variant="outline">New Transfer</Button>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {initialTransfers.map(tr => (
            <div key={tr.id} className="flex items-center justify-between p-4 rounded-xl border bg-card text-card-foreground shadow-sm">
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex-shrink-0">
                  <ArrowRight className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex flex-col">
                  <span className="font-medium text-base leading-none">
                    {tr.description || "Transfer"}
                  </span>
                  <span className="text-sm text-muted-foreground mt-1">
                    {formatDate(tr.date, prefs)} • {tr.accountName} → {tr.destinationAccountName}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <span className="font-semibold text-blue-600 dark:text-blue-400">
                  {formatCurrency(parseFloat(tr.amount), prefs)}
                </span>
                
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(tr)} disabled={isPending}>
                    <PencilSimple className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(tr.id)} disabled={isPending}>
                    <Trash className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
