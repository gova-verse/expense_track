"use client"

import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { CheckCircleIcon, SparkleIcon } from "@phosphor-icons/react"
import Link from "next/link"

const freeFeatures = [
  "Transaction tracking",
  "Categories",
  "Accounts & transfers",
  "Budgets",
  "Reports",
  "CSV / PDF / Excel exports",
  "Email verification",
  "Password recovery",
]

export function BillingClient() {
  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-medium">Billing</h3>
        <p className="text-sm text-muted-foreground">
          Manage your subscription and billing information.
        </p>
      </div>
      <Separator />

      {/* Current Plan */}
      <div className="rounded-lg border p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-semibold text-base">Free Plan</h4>
            <p className="text-sm text-muted-foreground">Your current plan</p>
          </div>
          <span className="inline-flex items-center rounded-full bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 px-3 py-1 text-xs font-semibold text-green-700 dark:text-green-400">
            Active
          </span>
        </div>
        <Separator />
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">Features included:</p>
          <ul className="space-y-1.5">
            {freeFeatures.map((feature) => (
              <li key={feature} className="flex items-center gap-2 text-sm">
                <CheckCircleIcon className="h-4 w-4 text-green-600 shrink-0" weight="fill" />
                {feature}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Pro Plan */}
      <div className="rounded-lg border border-dashed p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SparkleIcon className="h-5 w-5 text-amber-500" weight="fill" />
            <div>
              <h4 className="font-semibold text-base">Pro Plan</h4>
              <p className="text-sm text-muted-foreground">Advanced features for power users</p>
            </div>
          </div>
          <span className="inline-flex items-center rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
            Coming soon
          </span>
        </div>
        <Separator />
        <p className="text-sm text-muted-foreground">
          Pro will include advanced financial insights, smarter spending analysis, advanced budget alerts, detailed category trends, and more powerful exports.
        </p>
        <Link href="/dashboard/upgrade">
          <Button variant="outline" className="w-full">
            <SparkleIcon className="mr-2 h-4 w-4" />
            Learn more about Pro
          </Button>
        </Link>
      </div>
    </div>
  )
}
