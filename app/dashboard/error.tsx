"use client"

export default function DashboardError() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed p-8 text-center">
        <div>
          <p className="text-lg font-semibold text-destructive">Unable to load dashboard</p>
          <p className="text-sm text-muted-foreground mt-2">
            Could not connect to the database. Please check your connection and try again.
          </p>
        </div>
      </div>
    </div>
  )
}
