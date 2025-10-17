"use client"

import Link from "next/link"
import { Music2, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { ThemeToggle } from "@/components/theme-toggle"

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <Music2 className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">TanGo</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/hoteles" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              Hoteles
            </Link>
            <Link
              href="/restaurantes"
              className="text-sm font-medium text-foreground hover:text-primary transition-colors"
            >
              Restaurantes
            </Link>
            <Link
              href="/actividades"
              className="text-sm font-medium text-foreground hover:text-primary transition-colors"
            >
              Actividades
            </Link>
            <Link href="/destinos" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              Destinos
            </Link>
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <ThemeToggle />
            <Button variant="ghost" size="sm">
              Iniciar sesión
            </Button>
            <Button size="sm">Registrarse</Button>
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="Toggle menu">
            {mobileMenuOpen ? <X className="h-6 w-6 text-foreground" /> : <Menu className="h-6 w-6 text-foreground" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="md:hidden py-4 border-t border-border">
            <div className="flex flex-col gap-4">
              <Link
                href="/hoteles"
                className="text-sm font-medium text-foreground hover:text-primary transition-colors"
              >
                Hoteles
              </Link>
              <Link
                href="/restaurantes"
                className="text-sm font-medium text-foreground hover:text-primary transition-colors"
              >
                Restaurantes
              </Link>
              <Link
                href="/actividades"
                className="text-sm font-medium text-foreground hover:text-primary transition-colors"
              >
                Actividades
              </Link>
              <Link
                href="/destinos"
                className="text-sm font-medium text-foreground hover:text-primary transition-colors"
              >
                Destinos
              </Link>
              <div className="flex flex-col gap-2 pt-2 border-t border-border">
                <div className="flex justify-center pb-2">
                  <ThemeToggle />
                </div>
                <Button variant="ghost" size="sm" className="w-full">
                  Iniciar sesión
                </Button>
                <Button size="sm" className="w-full">
                  Registrarse
                </Button>
              </div>
            </div>
          </nav>
        )}
      </div>
    </header>
  )
}
