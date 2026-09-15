"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription, SheetFooter } from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"
import { Field, FieldLabel, FieldError } from "@/components/ui/field"
import { PencilSimple, Trash, Wallet, Bank, CreditCard, Coins, PiggyBank } from "@phosphor-icons/react"
import { insertAccountSchema } from "@/lib/validations"
import { usePreferences, formatCurrency } from "@/components/preferences-provider"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"

type AccountWithBalance = {
  id: number;
  name: string;
  type: string;
  openingBalance: string;
  currentBalance: number;
}

const getAccountIcon = (type: string) => {
  switch (type) {
    case 'cash': return <Coins className="w-8 h-8 text-yellow-500" />
    case 'bank': return <Bank className="w-8 h-8 text-blue-500" />
    case 'credit': return <CreditCard className="w-8 h-8 text-red-500" />
    case 'savings': return <PiggyBank className="w-8 h-8 text-green-500" />
    case 'wallet': return <Wallet className="w-8 h-8 text-purple-500" />
    default: return <Wallet className="w-8 h-8 text-gray-500" />
  }
}

const getAccountTypeLabel = (type: string) => {
  switch (type) {
    case 'cash': return "Cash"
    case 'bank': return "Bank Account"
    case 'credit': return "Credit Card"
    case 'savings': return "Savings"
    case 'wallet': return "Wallet"
    default: return "Account"
  }
}

export function AccountsClient({ initialAccounts }: { initialAccounts: AccountWithBalance[] }) {
  const prefs = usePreferences()
  const router = useRouter()
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [editingAcc, setEditingAcc] = useState<AccountWithBalance | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  // Form State
  const [name, setName] = useState("")
  type AccountType = "cash" | "bank" | "wallet" | "credit" | "savings"
  const [type, setType] = useState<AccountType>("bank")
  const [openingBalance, setOpeningBalance] = useState("0")

  const openEdit = (acc: AccountWithBalance) => {
    setEditingAcc(acc)
    setName(acc.name)
    setType(acc.type as AccountType)
    setOpeningBalance(acc.openingBalance)
    setError(null)
    setIsSheetOpen(true)
  }

  const openNew = () => {
    setEditingAcc(null)
    setName("")
    setType("bank")
    setOpeningBalance("0")
    setError(null)
    setIsSheetOpen(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    
    const payload = {
      name,
      type,
      openingBalance: parseFloat(openingBalance),
    }
    
    const parsed = insertAccountSchema.safeParse(payload)
    if (!parsed.success) {
      setError(parsed.error.issues[0].message)
      return
    }

    startTransition(async () => {
      if (editingAcc) {
        const res = await fetch(`/api/accounts/${editingAcc.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }).then(r => r.json())
        if (res.success) {
          setIsSheetOpen(false)
          router.refresh()
        } else {
          setError(res.error || "Failed to update account")
        }
      } else {
        const res = await fetch('/api/accounts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }).then(r => r.json())
        if (res.success) {
          setIsSheetOpen(false)
          router.refresh()
        } else {
          setError(res.error || "Failed to create account")
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
      const res = await fetch(`/api/accounts/${deleteId}`, { method: 'DELETE' }).then(r => r.json())
      if (!res.success) {
        setDeleteError(res.error || "Failed to delete account")
      } else {
        setDeleteId(null)
        setDeleteError(null)
        router.refresh()
      }
    })
  }

  const totalBalance = initialAccounts.reduce((sum, acc) => sum + acc.currentBalance, 0)

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Accounts</h1>
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetTrigger asChild>
            <Button onClick={openNew}>Add Account</Button>
          </SheetTrigger>
          <SheetContent className="flex flex-col p-0">
            <SheetHeader>
              <SheetTitle>{editingAcc ? "Edit Account" : "New Account"}</SheetTitle>
              <SheetDescription>
                {editingAcc ? "Update your account details." : "Add a new account to track your money."}
              </SheetDescription>
            </SheetHeader>
            <form id="account-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 pb-6 flex flex-col gap-5">
              <Field>
                <FieldLabel>Name</FieldLabel>
                <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Main Bank" disabled={isPending} />
              </Field>

              <Field>
                <FieldLabel>Type</FieldLabel>
                <select 
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  value={type} 
                  onChange={e => setType(e.target.value as AccountType)}
                  disabled={isPending}
                >
                  <option value="cash">Cash</option>
                  <option value="bank">Bank Account</option>
                  <option value="wallet">Wallet (Paypal, etc)</option>
                  <option value="credit">Credit Card</option>
                  <option value="savings">Savings</option>
                </select>
              </Field>

              <Field>
                <FieldLabel>Opening Balance</FieldLabel>
                <Input type="number" step="0.01" value={openingBalance} onChange={e => setOpeningBalance(e.target.value)} disabled={isPending || (editingAcc !== null)} />
                {editingAcc && <p className="text-xs text-muted-foreground mt-1">Opening balance cannot be easily changed after creation to preserve financial history integrity.</p>}
              </Field>

              {error && <FieldError>{error}</FieldError>}
            </form>
            <SheetFooter>
              <Button form="account-form" type="submit" disabled={isPending}>
                {isPending ? "Saving..." : "Save"}
              </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="bg-primary text-primary-foreground border-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium opacity-80">Total Net Worth</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {formatCurrency(totalBalance, prefs)}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {initialAccounts.map(acc => (
          <Card key={acc.id} className="overflow-hidden hover:shadow-md transition-shadow">
            <CardContent className="p-0">
              <div className="p-6 pb-4 flex justify-between items-start">
                <div className="flex gap-4">
                  <div className="p-3 bg-muted rounded-xl flex items-center justify-center">
                    {getAccountIcon(acc.type)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{acc.name}</h3>
                    <p className="text-sm text-muted-foreground">{getAccountTypeLabel(acc.type)}</p>
                  </div>
                </div>
                
                <div className="flex flex-col gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(acc)} disabled={isPending}>
                    <PencilSimple className="h-4 w-4" />
                  </Button>
                  {acc.name !== "Cash" && (
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleDelete(acc.id)} disabled={isPending}>
                      <Trash className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
              
              <div className="bg-muted/30 p-6 pt-4 border-t flex justify-between items-end">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Current Balance</p>
                  <p className="font-bold text-2xl">
                    {formatCurrency(acc.currentBalance, prefs)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <ConfirmDialog 
        open={deleteId !== null} 
        onOpenChange={(open) => {
          if (!open) {
            setDeleteId(null)
            setDeleteError(null)
          }
        }}
        title="Delete Account"
        description="Are you sure you want to delete this account? It will fail if there are any transactions associated with it."
        onConfirm={performDelete}
        isPending={isPending}
        error={deleteError}
      />
    </div>
  )
}
