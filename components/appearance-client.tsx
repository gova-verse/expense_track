"use client"

import { useTheme } from "next-themes"
import { useState, useTransition } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export function AppearanceClient({ initialTheme, initialColorTheme }: { initialTheme: string, initialColorTheme: string }) {
  const { setTheme, theme: currentNextTheme } = useTheme()
  const [selectedTheme, setSelectedTheme] = useState(initialTheme)
  const [selectedColorTheme, setSelectedColorTheme] = useState(initialColorTheme)
  const [isPending, startTransition] = useTransition()

  const handleThemeChange = (newTheme: string) => {
    setSelectedTheme(newTheme)
    setTheme(newTheme) 

    startTransition(async () => {
      await fetch('/api/settings/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme: newTheme }),
      })
    })
  }

  const handleColorThemeChange = (newColorTheme: string) => {
    setSelectedColorTheme(newColorTheme)

    
    if (newColorTheme === 'default') {
      document.documentElement.removeAttribute('data-theme')
    } else {
      document.documentElement.setAttribute('data-theme', newColorTheme)
    }

    startTransition(async () => {
      await fetch('/api/settings/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ colorTheme: newColorTheme }),
      })
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Appearance</h3>
        <p className="text-sm text-muted-foreground">
          Customize the appearance of the application. Automatically switches between day and night themes.
        </p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-3">
        <button
          onClick={() => handleThemeChange("light")}
          className={`flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground ${selectedTheme === "light" ? "border-primary" : ""}`}
        >
          <div className="items-center rounded-md border-2 border-muted p-1 bg-[#ecedef] mb-3 w-full max-w-[120px] aspect-[4/3] flex shadow-sm">
            <div className="space-y-2 w-full">
              <div className="rounded-sm bg-white p-2 shadow-sm">
                <div className="h-2 w-[80%] rounded-lg bg-[#ecedef]" />
                <div className="mt-2 h-2 w-[60%] rounded-lg bg-[#ecedef]" />
              </div>
              <div className="flex items-center space-x-2 rounded-sm bg-white p-2 shadow-sm">
                <div className="h-4 w-4 rounded-full bg-[#ecedef]" />
                <div className="h-2 w-[80%] rounded-lg bg-[#ecedef]" />
              </div>
            </div>
          </div>
          <span className="block w-full text-center font-medium">Light</span>
        </button>

        <button
          onClick={() => handleThemeChange("dark")}
          className={`flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground ${selectedTheme === "dark" ? "border-primary" : ""}`}
        >
          <div className="items-center rounded-md border-2 border-muted p-1 bg-slate-950 mb-3 w-full max-w-[120px] aspect-[4/3] flex shadow-sm">
            <div className="space-y-2 w-full">
              <div className="rounded-sm bg-slate-800 p-2 shadow-sm">
                <div className="h-2 w-[80%] rounded-lg bg-slate-400" />
                <div className="mt-2 h-2 w-[60%] rounded-lg bg-slate-400" />
              </div>
              <div className="flex items-center space-x-2 rounded-sm bg-slate-800 p-2 shadow-sm">
                <div className="h-4 w-4 rounded-full bg-slate-400" />
                <div className="h-2 w-[80%] rounded-lg bg-slate-400" />
              </div>
            </div>
          </div>
          <span className="block w-full text-center font-medium">Dark</span>
        </button>

        <button
          onClick={() => handleThemeChange("system")}
          className={`flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground ${selectedTheme === "system" ? "border-primary" : ""}`}
        >
          <div className="items-center rounded-md border-2 border-muted p-1 bg-gradient-to-br from-[#ecedef] to-slate-950 mb-3 w-full max-w-[120px] aspect-[4/3] flex shadow-sm">
             <div className="space-y-2 w-full">
              <div className="rounded-sm bg-white/50 p-2 shadow-sm">
                <div className="h-2 w-[80%] rounded-lg bg-black/20" />
                <div className="mt-2 h-2 w-[60%] rounded-lg bg-black/20" />
              </div>
              <div className="flex items-center space-x-2 rounded-sm bg-slate-800/50 p-2 shadow-sm">
                <div className="h-4 w-4 rounded-full bg-slate-400" />
                <div className="h-2 w-[80%] rounded-lg bg-slate-400" />
              </div>
            </div>
          </div>
          <span className="block w-full text-center font-medium">System</span>
        </button>
      </div>

      <div className="pt-6 border-t mt-8">
        <h3 className="text-lg font-medium">Color Theme</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Select an accent color for the application.
        </p>

        <div className="grid gap-4 md:grid-cols-3">
          <button
            onClick={() => handleColorThemeChange("default")}
            className={`flex items-center gap-3 rounded-md border-2 p-4 hover:bg-accent hover:text-accent-foreground ${selectedColorTheme === "default" ? "border-primary" : "border-muted"}`}
          >
            <div className="h-6 w-6 rounded-full bg-slate-900 dark:bg-white" />
            <span className="font-medium">Default</span>
          </button>

          <button
            onClick={() => handleColorThemeChange("ocean")}
            className={`flex items-center gap-3 rounded-md border-2 p-4 hover:bg-accent hover:text-accent-foreground ${selectedColorTheme === "ocean" ? "border-primary" : "border-muted"}`}
          >
            <div className="h-6 w-6 rounded-full bg-blue-600" />
            <span className="font-medium">Ocean</span>
          </button>

          <button
            onClick={() => handleColorThemeChange("forest")}
            className={`flex items-center gap-3 rounded-md border-2 p-4 hover:bg-accent hover:text-accent-foreground ${selectedColorTheme === "forest" ? "border-primary" : "border-muted"}`}
          >
            <div className="h-6 w-6 rounded-full bg-emerald-600" />
            <span className="font-medium">Forest</span>
          </button>
        </div>
      </div>
    </div>
  )
}
