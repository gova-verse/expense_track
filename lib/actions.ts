"use server"

import { revalidatePath } from "next/cache"

export async function revalidateDashboard() {
  // This purges the Next.js client-side router cache for the entire dashboard layout,
  // ensuring that navigating to Dashboard, Reports, Budgets, etc. fetches fresh data.
  revalidatePath("/dashboard", "layout")
}
