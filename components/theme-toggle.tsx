"use client"

import { useEffect, useState } from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  const { resolvedTheme, theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const activeTheme = (resolvedTheme ?? theme) === "dark" ? "dark" : "light"
  const handleToggle = () => setTheme(activeTheme === "dark" ? "light" : "dark")

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" aria-label="Cambiar tema" disabled>
        <Moon className="h-5 w-5 text-foreground" />
      </Button>
    )
  }

  return (
    <Button variant="ghost" size="icon" onClick={handleToggle} aria-label="Cambiar tema">
      {activeTheme === "light" ? (
        <Moon className="h-5 w-5 text-foreground" />
      ) : (
        <Sun className="h-5 w-5 text-foreground" />
      )}
    </Button>
  )
}
