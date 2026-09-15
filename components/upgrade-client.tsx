"use client"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { CheckCircleIcon, XCircleIcon, SparkleIcon } from "@phosphor-icons/react"
import Link from "next/link"

const freeFeatures = [
  { name: "Transaction tracking", available: true },
  { name: "Categories", available: true },
  { name: "Accounts & transfers", available: true },
  { name: "Basic dashboard", available: true },
  { name: "Basic budgets", available: true },
  { name: "Reports", available: true },
  { name: "CSV / PDF / Excel export", available: true },
  { name: "Advanced financial insights", available: false },
  { name: "Smarter spending analysis", available: false },
  { name: "Advanced budget alerts", available: false },
  { name: "Detailed category trends", available: false },
  { name: "Financial summaries", available: false },
  { name: "Priority features", available: false },
]

const proFeatures = [
  { name: "Everything in Free", available: true },
  { name: "Advanced financial insights", available: true, comingSoon: true },
  { name: "Smarter spending analysis", available: true, comingSoon: true },
  { name: "Advanced budget alerts", available: true, comingSoon: true },
  { name: "Detailed category trends", available: true, comingSoon: true },
  { name: "Advanced reports", available: true, comingSoon: true },
  { name: "More powerful exports", available: true, comingSoon: true },
  { name: "Financial summaries", available: true, comingSoon: true },
  { name: "Priority features", available: true, comingSoon: true },
  { name: "Future premium features", available: true, comingSoon: true },
]

export function UpgradeClient() {
  return (
    <div className="flex flex-col gap-8 p-4 md:p-8 pb-16 max-w-4xl mx-auto w-full">
      {}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 px-4 py-1.5 text-sm font-medium text-amber-700 dark:text-amber-400 mx-auto">
          <SparkleIcon className="h-4 w-4" weight="fill" />
          Pro
        </div>
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
          Take control of every rupee.
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Go beyond tracking expenses. Understand where your money goes, plan where it should go, and build better financial habits.
        </p>
      </div>

      <Separator />

      {}
      <div className="grid md:grid-cols-2 gap-6">
        {}
        <div className="rounded-xl border p-6 space-y-5">
          <div>
            <h3 className="text-xl font-semibold">Free</h3>
            <p className="text-sm text-muted-foreground mt-1">Everything you need to get started</p>
            <div className="mt-3">
              <span className="text-3xl font-bold">₹0</span>
              <span className="text-muted-foreground text-sm"> / forever</span>
            </div>
          </div>
          <Separator />
          <ul className="space-y-2.5">
            {freeFeatures.map((feature) => (
              <li key={feature.name} className="flex items-center gap-2.5 text-sm">
                {feature.available ? (
                  <CheckCircleIcon className="h-4 w-4 text-green-600 shrink-0" weight="fill" />
                ) : (
                  <XCircleIcon className="h-4 w-4 text-muted-foreground/40 shrink-0" weight="fill" />
                )}
                <span className={feature.available ? "" : "text-muted-foreground"}>
                  {feature.name}
                </span>
              </li>
            ))}
          </ul>
          <Link href="/dashboard">
            <Button variant="outline" className="w-full">
              Current plan
            </Button>
          </Link>
        </div>

        {}
        <div className="rounded-xl border-2 border-primary p-6 space-y-5 relative">
          <div className="absolute -top-3 left-6">
            <span className="inline-flex items-center gap-1 rounded-full bg-primary text-primary-foreground px-3 py-0.5 text-xs font-semibold">
              <SparkleIcon className="h-3 w-3" weight="fill" />
              Recommended
            </span>
          </div>
          <div>
            <h3 className="text-xl font-semibold">Pro</h3>
            <p className="text-sm text-muted-foreground mt-1">For users who want more</p>
            <div className="mt-3">
              <span className="text-3xl font-bold">Coming soon</span>
            </div>
          </div>
          <Separator />
          <ul className="space-y-2.5">
            {proFeatures.map((feature) => (
              <li key={feature.name} className="flex items-center gap-2.5 text-sm">
                <CheckCircleIcon className="h-4 w-4 text-green-600 shrink-0" weight="fill" />
                <span>
                  {feature.name}
                  {feature.comingSoon && (
                    <span className="ml-1.5 text-xs text-muted-foreground">(coming with Pro)</span>
                  )}
                </span>
              </li>
            ))}
          </ul>
          <Button className="w-full" disabled>
            <SparkleIcon className="mr-2 h-4 w-4" />
            Upgrade coming soon
          </Button>
        </div>
      </div>

      {}
      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          Pro payments are coming soon. You&apos;ll be notified when Pro is available.
        </p>
      </div>
    </div>
  )
}
