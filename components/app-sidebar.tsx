"use client"

import * as React from "react"

import { NavMain } from "@/components/nav-main"
import { NavInsights } from "@/components/nav-Insights"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { RowsIcon, WaveformIcon, ChartPieIcon, WalletIcon, SquaresFour, ArrowsLeftRight, Tag, GearIcon, PaletteIcon, GlobeIcon, ShieldCheckIcon, QuestionIcon, Bank, UserCircleIcon, BellIcon, CreditCardIcon } from "@phosphor-icons/react"

const data = {
  teams: [
    {
      name: "I-E",
      logo: (
        <RowsIcon
        />
      ),
      plan: "Income-to-Expense",
    },

  ],
  navMain: [
    {
      title: "Dashboard",
      url: "#",
      icon: (
        < SquaresFour
        />
      ),
      isActive: true,
    },
    {
      title: "Accounts",
      url: "/dashboard/accounts",
      icon: (
        <Bank
        />
      ),
    },
    {
      title: "Transactions",
      url: "/dashboard/transactions",
      icon: (
        <ArrowsLeftRight
        />
      ),
      items: [
        {
          title: "All Transactions",
          url: "/dashboard/transactions",
        },
        {
          title: "Transfers",
          url: "/dashboard/transactions/transfers",
        },
      ],
    },
    {
      title: "Categories",
      url: "#",
      icon: (
        <Tag
        />
      ),
      items: [
        {
          title: "Expense categories",
          url: "/dashboard/categories/expense",
        },
        {
          title: "Income categories",
          url: "/dashboard/categories/income",
        },

      ],
    },


  ],
  Insights: [
    {
      name: "Reports",
      url: "/dashboard/reports",
      icon: (
        <ChartPieIcon
        />
      ),
    },
    {
      name: "Budgets",
      url: "/dashboard/budgets",
      icon: (
        <WalletIcon
        />
      ),
    },
    {
      name: "Settings",
      url: "/dashboard/settings",
      icon: (
        <GearIcon />
      ),
      items: [
        {
          title: "Appearance",
          url: "/dashboard/settings/appearance",
          icon: <PaletteIcon />,
        },
        {
          title: "Currency & Region",
          url: "/dashboard/settings/currency",
          icon: <GlobeIcon />,
        },
        {
          title: "Account",
          url: "/dashboard/settings/account",
          icon: <UserCircleIcon />,
        },
        {
          title: "Notifications",
          url: "/dashboard/settings/notifications",
          icon: <BellIcon />,
        },
        {
          title: "Privacy & Security",
          url: "/dashboard/settings/privacy",
          icon: <ShieldCheckIcon />,
        },
        {
          title: "Billing",
          url: "/dashboard/settings/billing",
          icon: <CreditCardIcon />,
        },
        {
          title: "Help & About",
          url: "/dashboard/settings/help",
          icon: <QuestionIcon />,
        },
      ],
    },
  ],
};

export function AppSidebar({ user, ...props }: React.ComponentProps<typeof Sidebar> & { user: { name: string; email: string } }) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavInsights Insights={data.Insights} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
