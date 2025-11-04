"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, MapPin, Heart } from "lucide-react"
import Link from "next/link"
import type { Place } from "@/types/place"
import { getImage } from "@/contexts/SupabaseContext"
import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { fetchLikedPosts } from "@/api/user"

interface FeaturedPlacesProps {
  places: Place[]
}

export function FeaturedPlaces({ places }: FeaturedPlacesProps) {
  const { user, isAuthenticated } = useAuth()
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (!isAuthenticated || !user?.id) {
      setFavoriteIds(new Set())
      return
    }

    const loadFavorites = async () => {
      try {
        const likedPosts = await fetchLikedPosts(user.id)
        const ids = new Set(likedPosts.map((post) => post.id))
        console.log("Favoritos cargados (FeaturedPlaces):", Array.from(ids))
        setFavoriteIds(ids)
      } catch (error) {
        console.error("Error al cargar favoritos:", error)
        setFavoriteIds(new Set())
      }
    }

    loadFavorites()
  }, [user?.id, isAuthenticated])
  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3 text-balance">Lugares destacados</h2>
          <p className="text-lg text-muted-foreground">Los favoritos de nuestra comunidad</p>
        </div>

        {places.length === 0 ? (
          <p className="text-muted-foreground">Aún no hay lugares destacados disponibles.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {places.map((place) => {
              const mainImage = getImage(place.images?.[0])
              const rating = (place.rating ?? 0).toFixed(1)
              const reviewCount = place.reviews ?? 0
              const priceLabel = place.priceLabel ?? (place.price != null ? `$${place.price}` : "Consultar")

              return (
                <Link key={place.id} href={`/${place.category}/${place.id}`}>
                  <Card className="group overflow-hidden hover:shadow-xl transition-all duration-300 h-full">
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <img
                        src={mainImage}
                        alt={place.name}
                        className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-300"
                      />
                      <Badge className="absolute top-3 right-3 bg-background/90 text-foreground capitalize">
                        {place.category}
                      </Badge>
                      {isAuthenticated && favoriteIds.has(String(place.id)) && (
                        <div className="absolute top-3 left-3 z-10 bg-background/50 rounded-full p-1">
                          <Heart className="h-6 w-6 fill-red-500 text-red-500 drop-shadow-lg" />
                        </div>
                      )}
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-bold text-lg text-foreground mb-2 group-hover:text-primary transition-colors">
                        {place.name}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{place.description}</p>

                      <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                        <MapPin className="h-4 w-4" />
                        <span>{place.location}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-semibold text-foreground">{rating}</span>
                          <span className="text-sm text-muted-foreground">({reviewCount})</span>
                        </div>
                        <span className="font-bold text-primary">{priceLabel}</span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}
