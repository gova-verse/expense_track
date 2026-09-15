"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Field, FieldLabel } from "@/components/ui/field"

type CurrencyProps = {
  initialCurrency: string
  initialNumberFormat: string
  initialDateFormat: string
  initialTimezone: string
}

export function CurrencyClient({
  initialCurrency,
  initialNumberFormat,
  initialDateFormat,
  initialTimezone,
}: CurrencyProps) {
  const [currency, setCurrency] = useState(initialCurrency)
  const [numberFormat, setNumberFormat] = useState(initialNumberFormat)
  const [dateFormat, setDateFormat] = useState(initialDateFormat)
  const [timezone, setTimezone] = useState(initialTimezone)

  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [success, setSuccess] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSuccess(false)
    
    startTransition(async () => {
      const res = await fetch('/api/settings/preferences', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currency, numberFormat, dateFormat, timezone }),
      })
      if (res.ok) {
        setSuccess(true)
        router.refresh()
        setTimeout(() => setSuccess(false), 3000)
      }
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Currency & Region</h3>
        <p className="text-sm text-muted-foreground">
          Update how money, dates, and numbers are displayed across the application. 
          Note: This does not convert financial values, it only changes how they are formatted.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Field>
          <FieldLabel>Currency</FieldLabel>
          <select 
            className="flex h-9 w-full max-w-md rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            value={currency} 
            onChange={e => setCurrency(e.target.value)}
            disabled={isPending}
          >
            <option value="INR">Indian Rupee (₹)</option>
            <option value="USD">US Dollar ($)</option>
            <option value="EUR">Euro (€)</option>
            <option value="GBP">British Pound (£)</option>
            <option value="JPY">Japanese Yen (¥)</option>
          </select>
        </Field>

        <Field>
          <FieldLabel>Number Format</FieldLabel>
          <select 
            className="flex h-9 w-full max-w-md rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            value={numberFormat} 
            onChange={e => setNumberFormat(e.target.value)}
            disabled={isPending}
          >
            <option value="en-IN">Indian (1,00,000.00)</option>
            <option value="en-US">US & International (100,000.00)</option>
            <option value="de-DE">European (100.000,00)</option>
          </select>
        </Field>

        <Field>
          <FieldLabel>Date Format</FieldLabel>
          <select 
            className="flex h-9 w-full max-w-md rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            value={dateFormat} 
            onChange={e => setDateFormat(e.target.value)}
            disabled={isPending}
          >
            <option value="DD/MM/YYYY">DD/MM/YYYY</option>
            <option value="MM/DD/YYYY">MM/DD/YYYY</option>
            <option value="YYYY-MM-DD">YYYY-MM-DD</option>
          </select>
        </Field>

        <Field>
          <FieldLabel>Timezone</FieldLabel>
          <select 
            className="flex h-9 w-full max-w-md rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            value={timezone} 
            onChange={e => setTimezone(e.target.value)}
            disabled={isPending}
          >
            <option value="Asia/Kolkata">Asia/Kolkata</option>
            <option value="UTC">UTC</option>
            <option value="America/New_York">America/New_York</option>
            <option value="Europe/London">Europe/London</option>
            <option value="Asia/Tokyo">Asia/Tokyo</option>
          </select>
        </Field>

        <div className="flex items-center gap-4">
          <Button type="submit" disabled={isPending}>
            {isPending ? "Saving..." : "Save preferences"}
          </Button>
          {success && <span className="text-sm text-green-600 dark:text-green-400">Preferences updated!</span>}
        </div>
      </form>
    </div>
  )
}
