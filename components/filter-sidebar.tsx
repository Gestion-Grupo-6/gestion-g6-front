"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { useState } from "react"

interface FilterSidebarProps {
  category: string
}

export function FilterSidebar({ category }: FilterSidebarProps) {
  const [priceRange, setPriceRange] = useState([0, 200])
  const [rating, setRating] = useState([0])

  const amenitiesOptions =
    category === "hotel"
      ? ["WiFi", "Piscina", "Spa", "Restaurante", "Gimnasio", "Estacionamiento"]
      : category === "restaurant"
        ? ["Reservaciones", "Terraza", "Bar", "Menú vegetariano", "Música en vivo", "Vista al mar"]
        : category === "activity"
          ? ["Guía incluido", "Transporte", "Comida", "Equipo incluido", "Certificación", "Para familias"]
          : ["Playas", "Montañas", "Cultura", "Aventura", "Gastronomía", "Vida nocturna"]

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
                <Checkbox id={amenity} />
                <label htmlFor={amenity} className="text-sm text-foreground cursor-pointer">
                  {amenity}
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-4 space-y-2">
          <Button className="w-full">Aplicar filtros</Button>
          <Button variant="outline" className="w-full bg-transparent">
            Limpiar filtros
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
