import { getUserPreferences } from "@/app/actions/settings"
import { NotificationsClient } from "@/components/notifications-client"

export default async function NotificationsSettingsPage() {
  const prefs = await getUserPreferences()
  
  return (
    <NotificationsClient preferences={{
      notifySecurityAlerts: prefs.notifySecurityAlerts,
      notifyAccountActivity: prefs.notifyAccountActivity,
      notifyMonthlySummary: prefs.notifyMonthlySummary,
      notifyBudgetApproaching: prefs.notifyBudgetApproaching,
      notifyBudgetExceeded: prefs.notifyBudgetExceeded,
      notifyHighSpending: prefs.notifyHighSpending,
      notifyProductUpdates: prefs.notifyProductUpdates,
      notifyNewFeatures: prefs.notifyNewFeatures,
    }} />
  )
}
