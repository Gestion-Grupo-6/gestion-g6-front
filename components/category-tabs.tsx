"use client"

import { Hotel, UtensilsCrossed, Compass, MapPinned } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const categories = [
  {
    name: "Hoteles",
    href: "/hoteles",
    icon: Hotel,
    description: "Encuentra el alojamiento perfecto",
  },
  {
    name: "Restaurantes",
    href: "/restaurantes",
    icon: UtensilsCrossed,
    description: "Descubre la mejor gastronomía",
  },
  {
    name: "Actividades",
    href: "/actividades",
    icon: Compass,
    description: "Experiencias únicas",
  },
  {
    name: "Destinos",
    href: "/destinos",
    icon: MapPinned,
    description: "Explora nuevos lugares",
  },
]

export function CategoryTabs() {
  const pathname = usePathname()

  return (
    <section className="py-12 border-b border-border">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-8 text-center">¿Qué estás buscando?</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((category) => {
            const Icon = category.icon
            const isActive = pathname === category.href

            return (
              <Link
                key={category.href}
                href={category.href}
                className={cn(
                  "group flex flex-col items-center gap-3 p-6 rounded-xl border-2 transition-all hover:border-primary hover:shadow-lg",
                  isActive ? "border-primary bg-primary/5" : "border-border bg-card",
                )}
              >
                <div
                  className={cn(
                    "flex h-14 w-14 items-center justify-center rounded-full transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground",
                  )}
                >
                  <Icon className="h-7 w-7" />
                </div>
                <div className="text-center">
                  <h3 className="font-semibold text-foreground mb-1">{category.name}</h3>
                  <p className="text-xs text-muted-foreground">{category.description}</p>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
