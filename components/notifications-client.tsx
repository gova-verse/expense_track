"use client"

import { useState } from "react"
import { updateNotificationPreferences } from "@/app/actions/settings"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"

interface NotificationPrefs {
  notifySecurityAlerts: boolean
  notifyAccountActivity: boolean
  notifyMonthlySummary: boolean
  notifyBudgetApproaching: boolean
  notifyBudgetExceeded: boolean
  notifyHighSpending: boolean
  notifyProductUpdates: boolean
  notifyNewFeatures: boolean
}

function NotificationRow({
  id,
  label,
  description,
  checked,
  onToggle,
}: {
  id: string
  label: string
  description: string
  checked: boolean
  onToggle: (checked: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between py-3">
      <div className="space-y-0.5">
        <label htmlFor={id} className="text-sm font-medium cursor-pointer">{label}</label>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <Switch id={id} checked={checked} onCheckedChange={onToggle} />
    </div>
  )
}

export function NotificationsClient({ preferences }: { preferences: NotificationPrefs }) {
  const [prefs, setPrefs] = useState<NotificationPrefs>(preferences)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  async function handleToggle(key: keyof NotificationPrefs, value: boolean) {
    const updated = { ...prefs, [key]: value }
    setPrefs(updated)
    setSaving(true)
    setMessage(null)

    const result = await updateNotificationPreferences(updated)
    setSaving(false)
    if (result.success) {
      setMessage("Preferences saved.")
      setTimeout(() => setMessage(null), 2000)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-medium">Notifications</h3>
        <p className="text-sm text-muted-foreground">
          Choose what notifications you&apos;d like to receive.
        </p>
      </div>
      <Separator />

      {/* Email Notifications */}
      <div>
        <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Email Notifications</h4>
        <div className="space-y-1">
          <NotificationRow
            id="notify-security"
            label="Security alerts"
            description="Get notified about password changes and suspicious activity."
            checked={prefs.notifySecurityAlerts}
            onToggle={(v) => handleToggle("notifySecurityAlerts", v)}
          />
          <NotificationRow
            id="notify-activity"
            label="Account activity"
            description="Receive updates about your account activity."
            checked={prefs.notifyAccountActivity}
            onToggle={(v) => handleToggle("notifyAccountActivity", v)}
          />
          <NotificationRow
            id="notify-summary"
            label="Monthly financial summary"
            description="Receive a monthly email summarizing your finances."
            checked={prefs.notifyMonthlySummary}
            onToggle={(v) => handleToggle("notifyMonthlySummary", v)}
          />
        </div>
      </div>

      <Separator />

      {/* Financial Notifications */}
      <div>
        <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Financial Notifications</h4>
        <div className="space-y-1">
          <NotificationRow
            id="notify-budget-approaching"
            label="Budget approaching limit"
            description="Get notified when a budget reaches 80% usage."
            checked={prefs.notifyBudgetApproaching}
            onToggle={(v) => handleToggle("notifyBudgetApproaching", v)}
          />
          <NotificationRow
            id="notify-budget-exceeded"
            label="Budget exceeded"
            description="Get notified immediately when a budget is exceeded."
            checked={prefs.notifyBudgetExceeded}
            onToggle={(v) => handleToggle("notifyBudgetExceeded", v)}
          />
          <NotificationRow
            id="notify-high-spending"
            label="High spending alerts"
            description="Get alerted about unusually high spending patterns."
            checked={prefs.notifyHighSpending}
            onToggle={(v) => handleToggle("notifyHighSpending", v)}
          />
        </div>
      </div>

      <Separator />

      {/* Product Notifications */}
      <div>
        <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Product Notifications</h4>
        <div className="space-y-1">
          <NotificationRow
            id="notify-updates"
            label="Product updates"
            description="Hear about improvements and changes to Expense Tracker."
            checked={prefs.notifyProductUpdates}
            onToggle={(v) => handleToggle("notifyProductUpdates", v)}
          />
          <NotificationRow
            id="notify-features"
            label="New features"
            description="Be the first to know when new features are released."
            checked={prefs.notifyNewFeatures}
            onToggle={(v) => handleToggle("notifyNewFeatures", v)}
          />
        </div>
      </div>

      {/* Save indicator */}
      {saving && (
        <p className="text-sm text-muted-foreground">Saving...</p>
      )}
      {message && (
        <div className="rounded-md bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 p-3 text-sm font-medium text-green-700 dark:text-green-400">
          {message}
        </div>
      )}
    </div>
  )
}
