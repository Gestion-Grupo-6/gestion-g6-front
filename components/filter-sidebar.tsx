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
  onApply?: (body: Record<string, any>) => Promise<void> | void
  onClear?: () => void
}

export function FilterSidebar({ category, onApply, onClear }: FilterSidebarProps) {
  const [priceRange, setPriceRange] = useState([0, 200])
  // priceCategoryRange: [min, max] where values are 1..4 corresponding to $, $$, $$$, $$$$
  const [priceCategoryRange, setPriceCategoryRange] = useState<number[]>([1, 4])
  const [rating, setRating] = useState([0])
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([])

  const router = useRouter()
  const pathname = usePathname()

  // amenitiesOptions are fixed 
  const [amenitiesOptions, setAmenitiesOptions] = useState<string[]>([])

  const priceCategoryOptions = ["$", "$$", "$$$", "$$$$"]

  useEffect(() => {
    const fixedByCategory: Record<string, string[]> = {
      hotel: ["WiFi", "Spa", "Piscina", "Gimnasio", "Restaurante", "Desayuno incluido", "Estacionamiento", "Sala de juegos", "Espacio Co-Working"],
      restaurant: ["WiFi", "Bar", "Cafetería", "Para llevar", "Reserva anticipada", "Menú vegetariano", "Menú vegano", "Patio", "Terraza", "Work-friendly", "Música en vivo", "Vista al mar"],
      activity: ["Guía", "Transporte", "Aire libre", "Gastronómico", "Equipo incluido", "Para familias"],
    }

    setAmenitiesOptions(fixedByCategory[category] ?? [])
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
            {category === "restaurant" ? (
              <div className="space-y-3">
                <Slider
                  value={priceCategoryRange}
                  onValueChange={(v) => setPriceCategoryRange(v as number[])}
                  min={1}
                  max={4}
                  step={1}
                  className="w-full"
                  aria-label="Price category range"
                />
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span className="text-sm text-muted-foreground">
                    {priceCategoryOptions[(priceCategoryRange[0] || 1) - 1]}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {priceCategoryOptions[(priceCategoryRange[1] || 4) - 1]}
                  </span>
                </div>
              </div>
            ) : (
              <>
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
              </>
            )}
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
          <div className="text-sm text-muted-foreground">
            {rating[0] === 5 ? `${rating[0]} estrellas` : `${rating[0]} estrellas o más`}
          </div>
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
              onClick={async () => {
                // Build the advanced search body expected by backend
                const body: Record<string, any> = {
                  name: null,
                  city: null,
                  category: null,
                  minimumPriceCategory: null,
                  maximumPriceCategory: null,
                  minimumRating: null,
                  maximumRating: 5,
                  attributes: selectedAmenities,
                  quantities: null,
                  openNow: false,
                  sort: null,
                  page: null,
                  pageSize: null,
                }

                if (category === "restaurant") {
                  body.minimumPriceCategory = priceCategoryOptions[(priceCategoryRange[0] || 1) - 1]
                  body.maximumPriceCategory = priceCategoryOptions[(priceCategoryRange[1] || 4) - 1]
                } else {
                  // keep numeric range for other categories as priceRange
                  body.minimumPrice = priceRange[0]
                  body.maximumPrice = priceRange[1]
                }

                if (rating && rating[0] > 0) body.minimumRating = rating[0]

                if (onApply) {
                  await onApply(body)
                } else {
                  // fallback: navigate using query params (existing behavior)
                  if (!pathname) return
                  const params = new URLSearchParams()
                  if (selectedAmenities.length > 0) params.set("attributes", selectedAmenities.join(","))
                  if (body.minimumPriceCategory) params.set("minimumPriceCategory", body.minimumPriceCategory)
                  if (body.maximumPriceCategory) params.set("maximumPriceCategory", body.maximumPriceCategory)
                  if (body.minimumRating) params.set("minimumRating", String(body.minimumRating))
                  const search = params.toString()
                  const url = search ? `${pathname}?${search}` : pathname
                  router.push(url)
                }
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
              if (category === "restaurant") {
                setPriceCategoryRange([1, 4])
              }

              if (onClear) {
                onClear()
              } else {
                // Remove query params by navigating to the current pathname
                // This will cause the server component page to fetch the default list again
                if (pathname) router.replace(pathname)
              }
            }}
          >
            Limpiar filtros
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
