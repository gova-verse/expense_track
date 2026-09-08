import { getPreferences } from "@/server/api-client"
import { CurrencyClient } from "@/components/currency-client"

export default async function CurrencySettingsPage() {
  const prefs = await getPreferences()

  return (
    <CurrencyClient
      initialCurrency={prefs.currency || "INR"}
      initialNumberFormat={prefs.numberFormat || "en-IN"}
      initialDateFormat={prefs.dateFormat || "DD/MM/YYYY"}
      initialTimezone={prefs.timezone || "Asia/Kolkata"}
    />
  )
}
