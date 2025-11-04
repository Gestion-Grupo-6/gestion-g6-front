"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, MapPin, Heart } from "lucide-react"
import Link from "next/link"
import type { Place } from "@/types/place"
import { getImage } from "@/contexts/SupabaseContext"
import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { fetchLikedPosts, toggleFavorite } from "@/api/user"
import { toast } from "sonner"

interface FeaturedPlacesProps {
  places: Place[]
}

export function FeaturedPlaces({ places }: FeaturedPlacesProps) {
  const { user, isAuthenticated } = useAuth()
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set())
  const [loadingFavorites, setLoadingFavorites] = useState<Set<string>>(new Set())
  const [isLoadingInitialFavorites, setIsLoadingInitialFavorites] = useState(true)

  useEffect(() => {
    if (!isAuthenticated || !user?.id) {
      setFavoriteIds(new Set())
      setIsLoadingInitialFavorites(false)
      return
    }

    const loadFavorites = async () => {
      setIsLoadingInitialFavorites(true)
      try {
        const likedPosts = await fetchLikedPosts(user.id)
        const ids = new Set(likedPosts.map((post) => post.id))
        setFavoriteIds(ids)
      } catch (error) {
        console.error("Error al cargar favoritos:", error)
        setFavoriteIds(new Set())
      } finally {
        setIsLoadingInitialFavorites(false)
      }
    }

    loadFavorites()
  }, [user?.id, isAuthenticated])

  const handleToggleFavorite = async (e: React.MouseEvent, placeId: string, category: string) => {
    e.preventDefault()
    e.stopPropagation()

    if (!isAuthenticated || !user?.id) {
      toast.error("Debes iniciar sesión para marcar favoritos")
      return
    }

    setLoadingFavorites((prev) => new Set(prev).add(placeId))
    try {
      const response = await toggleFavorite(category, String(placeId), user.id)
      setFavoriteIds((prev) => {
        const newSet = new Set(prev)
        if (response.liked) {
          newSet.add(placeId)
        } else {
          newSet.delete(placeId)
        }
        return newSet
      })
      toast.success(response.message)
    } catch (error: any) {
      console.error("Error al actualizar favorito:", error)
      toast.error(error?.message || "No se pudo actualizar el favorito")
    } finally {
      setLoadingFavorites((prev) => {
        const newSet = new Set(prev)
        newSet.delete(placeId)
        return newSet
      })
    }
  }
  if (isLoadingInitialFavorites) {
    return (
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3 text-balance">Lugares destacados</h2>
            <p className="text-lg text-muted-foreground">Los favoritos de nuestra comunidad</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {places.map((place) => (
              <Card key={place.id} className="opacity-50">
                <div className="relative aspect-[4/3] overflow-hidden bg-muted animate-pulse" />
                <CardContent className="p-4">
                  <div className="h-6 bg-muted rounded animate-pulse mb-2" />
                  <div className="h-4 bg-muted rounded animate-pulse w-2/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    )
  }

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
                    <div className="relative aspect-[4/3] overflow-hidden max-h-64">
                      <img
                        src={mainImage}
                        alt={place.name}
                        className="object-cover w-full h-full max-w-full max-h-full group-hover:scale-110 transition-transform duration-300"
                      />
                      <Badge className="absolute top-3 right-3 bg-background/90 text-foreground capitalize">
                        {place.category}
                      </Badge>
                      {isAuthenticated && (
                        <button
                          onClick={(e) => handleToggleFavorite(e, String(place.id), place.category)}
                          disabled={loadingFavorites.has(String(place.id))}
                          className="absolute top-3 left-3 z-10 bg-background/80 hover:bg-background rounded-full p-1.5 transition-all disabled:opacity-50"
                          aria-label={favoriteIds.has(String(place.id)) ? "Eliminar de favoritos" : "Agregar a favoritos"}
                        >
                          <Heart 
                            className={`h-5 w-5 transition-all ${
                              favoriteIds.has(String(place.id)) 
                                ? "fill-red-500 text-red-500" 
                                : "fill-transparent text-muted-foreground hover:text-red-500"
                            }`} 
                          />
                        </button>
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
