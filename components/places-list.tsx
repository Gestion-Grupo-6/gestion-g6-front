import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, MapPin } from "lucide-react"
import Link from "next/link"
import type { Place } from "@/types/place"
import { getImage } from "@/contexts/SupabaseContext"

interface PlacesListProps {
  places: Place[]
}

export function PlacesList({ places }: PlacesListProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Mostrando {places.length} {places.length === 1 ? "resultado" : "resultados"}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {places.map((place) => {
          const mainImage = getImage(place.images?.[0]) ?? "/placeholder.svg"
          const displayedAmenities = (place.amenities ?? []).slice(0, 3)
          const extraAmenities =
            place.amenities && place.amenities.length > 3 ? place.amenities.length - 3 : 0
          const rating = (place.rating ?? 0).toFixed(1)
          const reviewCount = place.reviews ?? 0
          const priceLabel = place.priceLabel ?? (place.price != null ? `$${place.price}` : "Consultar")

          return (
            <Link key={place.id} href={`/${place.category}/${String(place.id)}`}>
              <Card className="group overflow-hidden hover:shadow-xl transition-all duration-300 h-full">
                <div className="flex flex-col sm:flex-row">
                  <div className="relative sm:w-48 aspect-[4/3] sm:aspect-auto overflow-hidden flex-shrink-0">
                    <img
                      src={mainImage}
                      alt={place.name}
                      className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  <CardContent className="p-4 flex-1 flex flex-col">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors">
                        {place.name}
                      </h3>
                      <Badge variant="secondary" className="ml-2 flex-shrink-0">
                        {place.category}
                      </Badge>
                    </div>

                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{place.description}</p>

                    <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
                      <MapPin className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate">{place.location}</span>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-3">
                      {displayedAmenities.map((amenity, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {amenity}
                        </Badge>
                      ))}
                      {extraAmenities > 0 && (
                        <Badge variant="outline" className="text-xs">
                          +{extraAmenities}
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-auto pt-3 border-t border-border">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-semibold text-foreground">{rating}</span>
                        <span className="text-sm text-muted-foreground">({reviewCount})</span>
                      </div>
                      <span className="font-bold text-primary">{priceLabel}</span>
                    </div>
                  </CardContent>
                </div>
              </Card>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
