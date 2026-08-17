"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, Lifebuoy, Info } from "@phosphor-icons/react"
import Link from "next/link"

export default function HelpSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Help & About</h3>
        <p className="text-sm text-muted-foreground">
          Get support and learn more about the application.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="block outline-none opacity-60 cursor-not-allowed rounded-xl">
          <Card className="h-full">
            <CardHeader>
              <div className="flex justify-between items-start">
                <Lifebuoy className="w-8 h-8 text-primary mb-2" />
                <span className="text-xs bg-muted px-2 py-1 rounded-md font-medium">Coming soon</span>
              </div>
              <CardTitle>Help Center</CardTitle>
              <CardDescription>
                Find answers to common questions and learn how to use the app.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        <div className="block outline-none opacity-60 cursor-not-allowed rounded-xl">
          <Card className="h-full">
            <CardHeader>
              <div className="flex justify-between items-start">
                <BookOpen className="w-8 h-8 text-primary mb-2" />
                <span className="text-xs bg-muted px-2 py-1 rounded-md font-medium">Coming soon</span>
              </div>
              <CardTitle>Documentation</CardTitle>
              <CardDescription>
                Read the detailed guides and API documentation.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Info className="w-5 h-5 text-muted-foreground" />
            <CardTitle>About MyApp</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div className="flex justify-between py-2 border-b">
            <span className="text-muted-foreground">Version</span>
            <span className="font-medium">1.0.0 (Beta)</span>
          </div>
          <div className="flex justify-between py-2 border-b">
            <span className="text-muted-foreground">License</span>
            <span className="font-medium">MIT License</span>
          </div>
          <div className="flex justify-between py-2 border-b">
            <span className="text-muted-foreground">Framework</span>
            <span className="font-medium">Next.js 15, Drizzle ORM, Tailwind v4</span>
          </div>
          <div className="pt-4 text-center text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} MyApp. All rights reserved.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
