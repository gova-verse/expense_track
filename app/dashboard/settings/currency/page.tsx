import { getUserPreferences } from "@/app/actions/settings"
import { CurrencyClient } from "@/components/currency-client"

export default async function CurrencySettingsPage() {
  const prefs = await getUserPreferences()
  
  return (
    <CurrencyClient 
      initialCurrency={prefs.currency}
      initialNumberFormat={prefs.numberFormat}
      initialDateFormat={prefs.dateFormat}
      initialTimezone={prefs.timezone}
    />
  )
}
