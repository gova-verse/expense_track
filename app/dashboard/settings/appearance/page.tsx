import { getUserPreferences } from "@/app/actions/settings"
import { AppearanceClient } from "@/components/appearance-client"

export default async function AppearanceSettingsPage() {
  const prefs = await getUserPreferences()
  
  return (
    <AppearanceClient 
      initialTheme={prefs.theme} 
      initialColorTheme={prefs.colorTheme} 
    />
  )
}
