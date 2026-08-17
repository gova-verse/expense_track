import { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Settings",
  description: "Manage your account settings and preferences.",
}

const sidebarNavItems = [
  {
    title: "Appearance",
    href: "/dashboard/settings/appearance",
  },
  {
    title: "Currency & Region",
    href: "/dashboard/settings/currency",
  },
  {
    title: "Account",
    href: "/dashboard/settings/account",
  },
  {
    title: "Notifications",
    href: "/dashboard/settings/notifications",
  },
  {
    title: "Privacy & Security",
    href: "/dashboard/settings/privacy",
  },
  {
    title: "Billing",
    href: "/dashboard/settings/billing",
  },
  {
    title: "Help & About",
    href: "/dashboard/settings/help",
  },
]

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-6 p-4 pt-0 md:p-8 md:pt-0 pb-16 max-w-5xl mx-auto w-full">
      <div className="space-y-0.5 mb-2">
        <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">
          Manage your application preferences.
        </p>
      </div>
      <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
        <aside className="lg:w-1/4">
          <nav className="flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1 overflow-x-auto pb-2 lg:pb-0">
            {sidebarNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="inline-flex items-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-muted hover:text-foreground h-9 px-4 py-2 justify-start"
              >
                {item.title}
              </Link>
            ))}
          </nav>
        </aside>
        <div className="flex-1 lg:max-w-2xl">{children}</div>
      </div>
    </div>
  )
}
