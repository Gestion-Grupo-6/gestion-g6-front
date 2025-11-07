"use client"

import Link from "next/link"
import { Menu, X, User, LogOut, Newspaper, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { ThemeToggle } from "@/components/theme-toggle"
import Image from "next/image"
import { useAuth } from "@/contexts/AuthContext"
import {FavoritesPanel} from "@/components/favorites-panel";
import {HeaderIcon} from "@/components/header-icon";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { user, isAuthenticated, logout } = useAuth()
  const [favoritesOpen, setFavoritesOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center">
            <Image src="/tango-logo.png" alt="TanGo" width={120} height={40} className="h-10 w-auto"priority />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/hotels" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              Hoteles
            </Link>
            <Link
              href="/restaurants"
              className="text-sm font-medium text-foreground hover:text-primary transition-colors"
            >
              Restaurantes
            </Link>
            <Link
              href="/activities"
              className="text-sm font-medium text-foreground hover:text-primary transition-colors"
            >
              Actividades
            </Link>
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <ThemeToggle />
            {isAuthenticated ? (
              <>
                <HeaderIcon
                  icon={Heart}
                  mobile={false}
                  label="Mis Favoritos"
                  onClick={() => {setFavoritesOpen(true)}}
                />
                <HeaderIcon
                  icon={Newspaper}
                  mobile={false}
                  label="Mis Publicaciones"
                  href="/mis-publicaciones"
                />
                <HeaderIcon
                  icon={User}
                  mobile={false}
                  label="Mi Perfil"
                  href="/profile"
                />
                <HeaderIcon
                  icon={LogOut}
                  mobile={false}
                  label="Cerrar Sesión"
                  onClick={logout}
                />
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/login">Iniciar sesión</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href="/register">Registrarse</Link>
                </Button>
              </>
            )}
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
                href="/hotels"
                className="text-sm font-medium text-foreground hover:text-primary transition-colors"
              >
                Hoteles
              </Link>
              <Link
                href="/restaurants"
                className="text-sm font-medium text-foreground hover:text-primary transition-colors"
              >
                Restaurantes
              </Link>
              <Link
                href="/activities"
                className="text-sm font-medium text-foreground hover:text-primary transition-colors"
              >
                Actividades
              </Link>
              <div className="flex flex-col gap-2 pt-2 border-t border-border">
                <div className="flex justify-center pb-2">
                  <ThemeToggle />
                </div>
                {isAuthenticated ? (
                  <>
                      <HeaderIcon
                          icon={Heart}
                          mobile={true}
                          label="Mis Favoritos"
                          onClick={() => {setFavoritesOpen(true)}}
                      />
                      <HeaderIcon
                          icon={Newspaper}
                          mobile={true}
                          label="Mis Publicaciones"
                          href="/mis-publicaciones"
                      />
                      <HeaderIcon
                          icon={User}
                          mobile={true}
                          label="Mi Perfil"
                          href="/profile"
                      />
                      <HeaderIcon
                          icon={LogOut}
                          mobile={true}
                          label="Cerrar Sesión"
                          onClick={logout}
                      />
                  </>
                ) : (
                  <>
                    <Button variant="ghost" size="sm" className="w-full" asChild>
                      <Link href="/login">Iniciar sesión</Link>
                    </Button>
                    <Button size="sm" className="w-full" asChild>
                      <Link href="/register">Registrarse</Link>
                    </Button>
                  </>
                )}
              </div>
            </div>
          </nav>
        )}
      </div>
      <FavoritesPanel open={favoritesOpen} onOpenChange={setFavoritesOpen} />
    </header>
  )
}
