import { getPreferences } from "@/server/api-client"
import { AppearanceClient } from "@/components/appearance-client"

export default async function AppearanceSettingsPage() {
  const prefs = await getPreferences()
  
  return (
    <AppearanceClient 
      initialTheme={prefs.theme || "system"} 
      initialColorTheme={prefs.colorTheme || "default"} 
    />
  )
}
