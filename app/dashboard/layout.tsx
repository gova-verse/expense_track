import { AppSidebar } from "@/components/app-sidebar"
import { getPreferences, getMe } from "@/server/api-client"
import { PreferencesProvider } from "@/components/preferences-provider"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { verifySession } from "@/lib/auth"
import { redirect } from "next/navigation"

export const dynamic = 'force-dynamic'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await verifySession()
  if (!session) {
    redirect("/login")
  }

  const [prefs, user] = await Promise.all([
    getPreferences(),
    getMe(),
  ])
  
  return (
    <SidebarProvider>
      <PreferencesProvider preferences={{
          currency: prefs.currency || "INR",
          numberFormat: prefs.numberFormat || "en-IN",
          dateFormat: prefs.dateFormat || "DD/MM/YYYY",
          timezone: prefs.timezone || "Asia/Kolkata",
        }}>
        <AppSidebar user={{ name: user.name || "", email: user.email }} />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2">
            <div className="flex items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 h-4" />
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem className="hidden md:block">
                    <BreadcrumbLink href="/dashboard">
                      Dashboard
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </header>
          <main className="flex flex-1 flex-col overflow-hidden">
            {children}
          </main>
        </SidebarInset>
      </PreferencesProvider>
    </SidebarProvider>
  )
}
