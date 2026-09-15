"use client"

import * as React from "react"

export type Preferences = {
  currency: string
  numberFormat: string
  dateFormat: string
  timezone: string
}

const PreferencesContext = React.createContext<Preferences | null>(null)

export function PreferencesProvider({
  children,
  preferences,
}: {
  children: React.ReactNode
  preferences: Preferences
}) {
  return (
    <PreferencesContext.Provider value={preferences}>
      {children}
    </PreferencesContext.Provider>
  )
}

export function usePreferences() {
  const context = React.useContext(PreferencesContext)
  if (!context) {
    
    return {
      currency: "INR",
      numberFormat: "en-IN",
      dateFormat: "DD/MM/YYYY",
      timezone: "Asia/Kolkata",
    }
  }
  return context
}

export function formatCurrency(amount: number, prefs: Preferences, options?: Intl.NumberFormatOptions) {
  return new Intl.NumberFormat(prefs.numberFormat, {
    style: 'currency',
    currency: prefs.currency,
    ...options,
  }).format(amount)
}

export function formatDate(date: string | Date, prefs: Preferences) {
  const d = new Date(date)
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: prefs.timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
  
  const parts = formatter.formatToParts(d)
  const p: Record<string, string> = {}
  for (const pt of parts) {
    p[pt.type] = pt.value
  }

  if (prefs.dateFormat === "MM/DD/YYYY") {
    return `${p.month}/${p.day}/${p.year}`
  }
  if (prefs.dateFormat === "YYYY-MM-DD") {
    return `${p.year}-${p.month}-${p.day}`
  }
  
  
  return `${p.day}/${p.month}/${p.year}`
}
