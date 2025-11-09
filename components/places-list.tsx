"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {Star, MapPin, Heart, Building2} from "lucide-react"
import Link from "next/link"
import type { Place } from "@/types/place"
import { getImage } from "@/contexts/SupabaseContext"
import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { fetchLikedPosts, toggleFavorite } from "@/api/user"
import { toast } from "sonner"

interface PlacesListProps {
  places: Place[]
}

export function PlacesList({ places }: PlacesListProps) {
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
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Cargando resultados ...
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {places.map((place) => (
            <Card key={place.id} className="opacity-50">
              <div className="flex flex-col sm:flex-row">
                <div className="relative sm:w-48 aspect-[4/3] sm:aspect-auto overflow-hidden flex-shrink-0 bg-muted animate-pulse" />
                <CardContent className="p-4 flex-1">
                  <div className="h-6 bg-muted rounded animate-pulse mb-2" />
                  <div className="h-4 bg-muted rounded animate-pulse w-2/3 mb-3" />
                </CardContent>
              </div>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Mostrando {places.length} {places.length === 1 ? "resultado" : "resultados"}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {places.map((place) => {
          const mainImage = getImage(place.images?.[0])
          const displayedAttributes = (place.attributes ?? []).slice(0, 3)
          const extraAttributes =
            place.attributes && place.attributes.length > 3 ? place.attributes.length - 3 : 0
          const rating = (place.rating ?? 0).toFixed(1)
          const reviewCount = place.reviews ?? 0
          const priceLabel = place.priceCategory != null ? place.priceCategory : "-"
          const location = [ (place as any).city, (place as any).country ].filter(Boolean).join(", ")

          return (
            <Link key={place.id} href={`/${place.category}/${String(place.id)}`}>
              <Card className="group overflow-hidden hover:shadow-xl transition-all duration-300 h-full">
                <div className="flex flex-col sm:flex-row">
                  <div className="relative sm:w-48 aspect-[4/3] sm:aspect-auto sm:h-36 overflow-hidden flex-shrink-0">
                    <img
                      src={mainImage}
                      alt={place.name}
                      className="object-cover w-full h-full max-w-full max-h-full group-hover:scale-110 transition-transform duration-300"
                    />
                    {isAuthenticated && (
                      <button
                        onClick={(e) => handleToggleFavorite(e, String(place.id), place.category)}
                        disabled={loadingFavorites.has(String(place.id))}
                        className="absolute top-3 right-3 z-10 bg-background/80 hover:bg-background rounded-full p-1.5 transition-all disabled:opacity-50"
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
                  <CardContent className="p-4 flex-1 flex flex-col">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors">
                        {place.name}
                      </h3>
                      <Badge variant="secondary" className="ml-2 flex-shrink-0">
                        {place.category}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{truncate(place.description, 80)}</p>

                    <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
                      <MapPin className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate">{truncate(place.address, 25)}</span>
                    </div>

                    <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
                      <Building2 className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate">{truncate(location, 25)}</span>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-3">
                      {displayedAttributes.map((attribute, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {attribute}
                        </Badge>
                      ))}
                      {extraAttributes > 0 && (
                        <Badge variant="outline" className="text-xs">
                          +{extraAttributes}
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

function truncate(text: string, maxLength: number) {
  if (!text) return "";
  return text.length > maxLength ? text.slice(0, maxLength) + "..." : text;
}
