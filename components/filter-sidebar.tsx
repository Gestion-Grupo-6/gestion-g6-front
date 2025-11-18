"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useLocationContext } from "@/contexts/LocationContext"

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
  // quantities for hotels: null means not selected
  const [guestsCount, setGuestsCount] = useState<number | null>(null)
  const [roomsCount, setRoomsCount] = useState<number | null>(null)
  const [bathroomsCount, setBathroomsCount] = useState<number | null>(null)
  // openNow filter for restaurants
  const [openNow, setOpenNow] = useState<boolean>(false)
  const { location: storedLocation } = useLocationContext()
  const [position, setPosition] = useState<{ distance: number | null } | null>(null)

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
    <>
      
      <Card className="sticky top-20">
      <CardHeader>
        <CardTitle className="text-lg">Filtros</CardTitle>
      </CardHeader>
  <CardContent className="space-y-4">
        {category === "hotel" && (
          <div className="space-y-2 -mt-2">
            <div className="grid grid-cols-3 gap-6 items-start">
                <div className="flex flex-col items-center gap-1 min-w-0">
                  <Label className="text-xs text-center font-semibold">Personas</Label>
                  <select
                    className="w-full max-w-[80px] border rounded px-2 py-1 text-xs text-center"
                    value={guestsCount ?? ""}
                    onChange={(e) => setGuestsCount(e.target.value ? Number(e.target.value) : null)}
                  >
                  <option value="">-</option>
                  <option value={1}>1</option>
                  <option value={2}>2</option>
                  <option value={3}>3</option>
                  <option value={4}>4</option>
                  <option value={5}>5</option>
                  <option value={6}>6+</option>
                </select>
              </div>
              <div className="flex flex-col items-center gap-1 min-w-0">
                <Label className="text-xs text-center font-semibold">Habitaciones</Label>
                <select
                  className="w-full max-w-[80px] border rounded px-2 py-1 text-xs text-center"
                  value={roomsCount ?? ""}
                  onChange={(e) => setRoomsCount(e.target.value ? Number(e.target.value) : null)}
                >
                  <option value="">-</option>
                  <option value={1}>1</option>
                  <option value={2}>2</option>
                  <option value={3}>3</option>
                  <option value={4}>4</option>
                  <option value={5}>5</option>
                  <option value={6}>6+</option>
                </select>
              </div>
              <div className="flex flex-col items-center gap-1 min-w-0">
                <Label className="text-xs text-center font-semibold">Baños</Label>
                <select
                  className="w-full max-w-[80px] border rounded px-2 py-1 text-xs text-center"
                  value={bathroomsCount ?? ""}
                  onChange={(e) => setBathroomsCount(e.target.value ? Number(e.target.value) : null)}
                >
                  <option value="">-</option>
                  <option value={1}>1</option>
                  <option value={2}>2</option>
                  <option value={3}>3</option>
                  <option value={4}>4</option>
                  <option value={5}>5</option>
                  <option value={6}>6+</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {category !== "destino" && (
          <div className="space-y-3">
            {/* Open now checkbox for restaurants (now shown before price range) */}
            {category === "restaurant" && (
              <div className="mb-6 -mt-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="open-now"
                    checked={openNow}
                    onCheckedChange={(c) => setOpenNow(Boolean(c))}
                    className="scale-110"
                  />
                  <label htmlFor="open-now" className="text-sm font-semibold text-foreground cursor-pointer">
                    Abierto ahora
                  </label>
                </div>
              </div>
            )}
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

        <div className="space-y-3">
          <Label className="text-sm font-semibold">Distancia</Label>
          <Slider
            value={position?.distance ? [position.distance] : [0]}
            onValueChange={setPosition ? (v) => setPosition({ distance: v[0] }) : undefined}
            max={20}
            step={0.5}
            className="w-full"
            aria-label="Maximum distance in kilometers"
          />
          <div className="text-sm text-muted-foreground">
            {position?.distance ? `Máximo ${position.distance} km` : "Cualquier distancia"}
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
                  lat: null,
                  lng: null,
                  distance: null,
                }

                if (category === "restaurant") {
                  body.minimumPriceCategory = priceCategoryOptions[(priceCategoryRange[0] || 1) - 1]
                  body.maximumPriceCategory = priceCategoryOptions[(priceCategoryRange[1] || 4) - 1]
                } else {
                  // keep numeric range for other categories as priceRange
                  body.minimumPrice = priceRange[0]
                  body.maximumPrice = priceRange[1]
                }

                // quantities: for hotels include selected counts (null if not selected)
                if (category === "hotel") {
                  const quantities: Record<string, number> = {}
                  if (roomsCount) quantities.rooms = roomsCount
                  if (guestsCount) quantities.guests = guestsCount
                  if (bathroomsCount) quantities.bathrooms = bathroomsCount

                  if (Object.keys(quantities).length > 0) {
                    body.quantities = quantities
                  }
                }

                // include restaurant openNow flag
                body.openNow = openNow

                if (rating && rating[0] > 0) body.minimumRating = rating[0]

                if (position?.distance) {
                  if(!storedLocation) {
                    alert("Por favor, establece tu ubicación para usar el filtro de distancia.")
                    return
                  }
                  body.lat = storedLocation.lat
                  body.lng = storedLocation.lng
                  body.distance = position.distance
                }

                // remove null or empty-array fields so the backend only receives set filters
                Object.keys(body).forEach((k) => {
                  const v = (body as any)[k]
                  if (v === null) delete (body as any)[k]
                  // also drop empty arrays
                  if (Array.isArray(v) && v.length === 0) delete (body as any)[k]
                })

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
                  if (body.lat) params.set("lat", String(body.lat))
                  if (body.lng) params.set("lng", String(body.lng))
                  if (body.distance) params.set("distance", String(body.distance))
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
              if (category === "restaurant") {
                setOpenNow(false)
              }
              if (category === "hotel") {
                setGuestsCount(null)
                setRoomsCount(null)
                setBathroomsCount(null)
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
    </>
  )
}
