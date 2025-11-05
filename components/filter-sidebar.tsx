"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"

interface FilterSidebarProps {
  category: string
}

export function FilterSidebar({ category }: FilterSidebarProps) {
  const [priceRange, setPriceRange] = useState([0, 200])
  const [rating, setRating] = useState([0])
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([])

  const router = useRouter()
  const pathname = usePathname()

  // amenitiesOptions will be fetched from backend; fall back to an empty array while loading
  const [amenitiesOptions, setAmenitiesOptions] = useState<string[]>([])
  const [loadingAmenities, setLoadingAmenities] = useState(false)

  useEffect(() => {
    let mounted = true

    const servicePaths: Record<string, string> = {
      hotel: "/hotels/services",
      restaurant: "/restaurants/services",
      activity: "/activities/services",
    }

    const fallbackByCategory: Record<string, string[]> = {
      hotel: ["WiFi", "Piscina", "Spa", "Restaurante", "Gimnasio", "Estacionamiento"],
      restaurant: ["Reservaciones", "Terraza", "Bar", "Menú vegetariano", "Música en vivo", "Vista al mar"],
      activity: ["Guía incluido", "Transporte", "Comida", "Equipo incluido", "Certificación", "Para familias"],
    }

    async function loadServices() {
      const path = servicePaths[category]
      // If we don't have an endpoint for this category, use fallback if available
      if (!path) {
        if (mounted) setAmenitiesOptions(fallbackByCategory[category] ?? [])
        return
      }

      setLoadingAmenities(true)
      try {
        const res = await fetch(`http://localhost:8080${path}`)
        if (!res.ok) throw new Error(`Failed to fetch services: ${res.status}`)
        const data = (await res.json()) as string[]
        if (mounted && Array.isArray(data)) {
          setAmenitiesOptions(data)
        } else if (mounted) {
          setAmenitiesOptions(fallbackByCategory[category] ?? [])
        }
      } catch (e) {
        if (mounted) {
          setAmenitiesOptions(fallbackByCategory[category] ?? [])
        }
      } finally {
        if (mounted) setLoadingAmenities(false)
      }
    }

    loadServices()
    return () => {
      mounted = false
    }
  }, [category])

  return (
    <Card className="sticky top-20">
      <CardHeader>
        <CardTitle className="text-lg">Filtros</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {category !== "destino" && (
          <div className="space-y-3">
            <Label className="text-sm font-semibold">Rango de precio</Label>
            <Slider
              value={priceRange}
              onValueChange={setPriceRange}
              max={200}
              step={10}
              className="w-full"
              aria-label="Price range"
            />
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>${priceRange[0]}</span>
              <span>${priceRange[1]}</span>
            </div>
          </div>
        )}

        <div className="space-y-3">
          <Label className="text-sm font-semibold">Calificación mínima</Label>
          <Slider
            value={rating}
            onValueChange={setRating}
            max={5}
            step={0.5}
            className="w-full"
            aria-label="Minimum rating"
          />
          <div className="text-sm text-muted-foreground">{rating[0]} estrellas o más</div>
        </div>

        <div className="space-y-3">
          <Label className="text-sm font-semibold">Características</Label>
          <div className="space-y-2">
              {amenitiesOptions.map((amenity) => (
                <div key={amenity} className="flex items-center space-x-2">
                  <Checkbox
                    id={amenity}
                    checked={selectedAmenities.includes(amenity)}
                    onCheckedChange={(c) => {
                      const checked = Boolean(c)
                      setSelectedAmenities((prev) =>
                        checked ? [...prev, amenity] : prev.filter((a) => a !== amenity),
                      )
                    }}
                  />
                  <label htmlFor={amenity} className="text-sm text-foreground cursor-pointer">
                    {amenity}
                  </label>
                </div>
              ))}
          </div>
        </div>

        <div className="pt-4 space-y-2">
          <Button
            className="w-full"
            onClick={() => {
              // Build attributes query param from selected amenities and navigate
              if (!pathname) return
              const params = new URLSearchParams()
              if (selectedAmenities.length > 0) {
                params.set("attributes", selectedAmenities.join(","))
              }
              const search = params.toString()
              const url = search ? `${pathname}?${search}` : pathname
              router.push(url)
            }}
          >
            Aplicar filtros
          </Button>
          <Button
            variant="outline"
            className="w-full bg-transparent"
            onClick={() => {
              // Reset local filter state
              setPriceRange([0, 200])
              setRating([0])
              setSelectedAmenities([])

              // Remove query params by navigating to the current pathname
              // This will cause the server component page to fetch the default list again
              if (pathname) router.replace(pathname)
            }}
          >
            Limpiar filtros
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
