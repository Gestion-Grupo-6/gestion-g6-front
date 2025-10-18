"use client"

import type React from "react"

import { Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { useRouter } from "next/navigation"

export function HeroSection() {
  const [searchQuery, setSearchQuery] = useState("")
  const router = useRouter()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/buscar?q=${encodeURIComponent(searchQuery)}`)
    }
  }

  const handleClick = async () => {
    try {
      const response = await fetch("http://localhost:8080/ping")
      const data = await response.text()
      console.log("Respuesta del servidor:", data)
    } catch (error) {
      console.error("Error al hacer GET:", error)
    }
  }

  return (
    <section className="relative bg-gradient-to-br from-primary/10 via-accent/5 to-background py-20 md:py-32">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 text-balance">
            Descubre tu próximo destino
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 text-pretty">
            Encuentra los mejores hoteles, restaurantes y actividades para hacer de tu viaje una experiencia inolvidable
          </p>

          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Buscar destinos, hoteles, restaurantes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12"
              />
            </div>
            <Button
              onClick={handleClick} 
              type="submit" size="lg" className="h-12 px-8">
              Buscar
            </Button>
          </form>
        </div>
      </div>
    </section>
  )
}
