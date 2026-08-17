"use client"

import { Button } from "@/components/ui/button"
import { ShieldCheck, Download, Trash } from "@phosphor-icons/react"
import { useState } from "react"

export function PrivacyClient({ dataBlob }: { dataBlob: string }) {
  const [downloading, setDownloading] = useState(false)

  const handleDownload = () => {
    setDownloading(true)
    const blob = new Blob([dataBlob], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `my-app-data-${new Date().toISOString().slice(0, 10)}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    setTimeout(() => setDownloading(false), 1000)
  }

  const handleDelete = () => {
    alert("Account deletion requires confirmation and re-authentication. This feature is disabled in the demo.")
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Privacy & Security</h3>
        <p className="text-sm text-muted-foreground">
          Manage your personal data and account security.
        </p>
      </div>

      <div className="space-y-6">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between p-4 border rounded-lg">
          <div className="flex gap-4">
            <div className="p-2 bg-muted rounded-full self-start">
              <Download className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h4 className="font-medium">Export Your Data</h4>
              <p className="text-sm text-muted-foreground mt-1 max-w-md">
                Download a complete copy of all your transactions, accounts, budgets, and categories in JSON format.
              </p>
            </div>
          </div>
          <Button onClick={handleDownload} disabled={downloading} className="shrink-0">
            {downloading ? "Preparing..." : "Request Data Export"}
          </Button>
        </div>

        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between p-4 border rounded-lg border-red-100 dark:border-red-900/30 bg-red-50/50 dark:bg-red-900/10">
          <div className="flex gap-4">
            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-full self-start">
              <Trash className="w-6 h-6 text-red-600 dark:text-red-500" />
            </div>
            <div>
              <h4 className="font-medium text-red-600 dark:text-red-500">Delete Account</h4>
              <p className="text-sm text-muted-foreground mt-1 max-w-md">
                Permanently delete your account and all associated data. This action cannot be undone.
              </p>
            </div>
          </div>
          <Button variant="destructive" onClick={handleDelete} className="shrink-0">
            Delete Account
          </Button>
        </div>
      </div>
    </div>
  )
}
