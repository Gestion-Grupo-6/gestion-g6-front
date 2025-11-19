"use client"

import { useState, useEffect } from "react"
import {Star, MapPin, Phone, Mail, Globe, ChevronLeft, ChevronRight, Heart, Building2, ChevronDown, Clock} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"
import { ReviewsSection } from "@/components/reviews-section"
import type { Place } from "@/types/place"
import { getImage } from "@/contexts/SupabaseContext"
import { useAuth } from "@/contexts/AuthContext"
import { checkFavorite, toggleFavorite } from "@/api/user"
import { toast } from "sonner"
import { PlaceLocationMap } from "@/components/place-location-map"

interface PlaceDetailProps {
  place: Place
}

function formatHour(hour: number | undefined): string {
  if (hour === undefined || hour === null) return ""
  return `${hour}hs`
}

export function PlaceDetail({ place }: PlaceDetailProps) {
  const { user, isAuthenticated } = useAuth()
  const [isFavorite, setIsFavorite] = useState(false)
  const [isLoadingFavorite, setIsLoadingFavorite] = useState(false)
  const [isHoursOpen, setIsHoursOpen] = useState(false)
  
  const images = Array.isArray(place.images) && place.images.length > 0
    ? place.images.map((p) => getImage(p) || "/placeholder.svg")
    : ["/placeholder.svg"]
  const amenities = (place as any).attributes && (place as any).attributes.length > 0 ? (place as any).attributes : []
  const rating = (place as any).ratingAverage ?? (place as any).rating ?? (place as any).ratings?.average ?? 0
  const reviewCount = (place as any).reviews ?? (place as any).numberOfReviews ?? 0
  const priceLabel = (place as any).priceCategory ?? (place.price != null ? `$${place.price}` : "Consultar")
  const categoryRoutes: Record<string, string> = {
    hotel: "hotels",
    restaurant: "restaurants",
    activity: "activities",
  }
  const categoryPath = categoryRoutes[place.category] ?? `${place.category}s`
  const categoryLabel = place.category
  const address = place.address ?? "Información no disponible"
  const location = [ (place as any).city, (place as any).country ].filter(Boolean).join(", ")
  const coordinates = place.location
  const hasCoordinates = typeof coordinates?.lat === "number" && typeof coordinates?.lng === "number"
  const phone = place.phone ?? ""
  const email = place.email ?? ""
  const website = place.website ?? ""
  const websiteUrl = website ? (website.startsWith("http") ? website : `https://${website}`) : ""
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  // Verificar si está en favoritos al cargar
  useEffect(() => {
    if (!isAuthenticated || !user?.id) {
      setIsFavorite(false)
      return
    }

    const checkIsFavorite = async () => {
      try {
        const status = await checkFavorite(place.category, String(place.id), user.id)
        setIsFavorite(status.liked)
      } catch (error) {
        console.error("Error al verificar favorito:", error)
        setIsFavorite(false)
      }
    }

    checkIsFavorite()
  }, [place.id, place.category, user?.id, isAuthenticated])


  const handleToggleFavorite = async () => {
    if (!isAuthenticated || !user?.id) {
      toast.error("Debes iniciar sesión para marcar favoritos")
      return
    }

    setIsLoadingFavorite(true)
    try {
      const response = await toggleFavorite(place.category, String(place.id), user.id)
      setIsFavorite(response.liked)
      toast.success(response.message)
    } catch (error: any) {
      console.error("Error al actualizar favorito:", error)
      toast.error(error?.message || "No se pudo actualizar el favorito")
    } finally {
      setIsLoadingFavorite(false)
    }
  }

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  return (
    <div className="bg-background">
      {/* Breadcrumb */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-primary transition-colors">
            Inicio
          </Link>
          <span>/</span>
          <Link href={`/${categoryPath}`} className="hover:text-primary transition-colors capitalize">
            {categoryPath}
          </Link>
          <span>/</span>
          <span className="text-foreground">{place.name}</span>
        </div>
      </div>

      {/* Image Gallery */}
      <div className="container mx-auto px-4 mb-8">
        <div className="relative aspect-[21/9] rounded-xl overflow-hidden bg-muted">
          <img
            src={images[currentImageIndex] || "/placeholder.svg"}
            alt={`${place.name} - Image ${currentImageIndex + 1}`}
            className="object-cover w-full h-full"
          />

          {images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background p-2 rounded-full transition-colors"
                aria-label="Previous image"
              >
                <ChevronLeft className="h-6 w-6 text-foreground" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background p-2 rounded-full transition-colors"
                aria-label="Next image"
              >
                <ChevronRight className="h-6 w-6 text-foreground" />
              </button>

              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`h-2 rounded-full transition-all ${
                      index === currentImageIndex ? "w-8 bg-primary" : "w-2 bg-background/60"
                    }`}
                    aria-label={`Go to image ${index + 1}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">{place.name}</h1>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-5 w-5" />
                    <span>{location || address}</span>
                  </div>
                </div>
                <Badge className="text-base px-4 py-2 capitalize">{categoryLabel}</Badge>
              </div>

              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center gap-1">
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  <span className="text-xl font-bold text-foreground">{rating.toFixed(1)}</span>
                  <span className="text-muted-foreground">({reviewCount} reseñas)</span>
                </div>
                <Separator orientation="vertical" className="h-6" />
                <span className="text-2xl font-bold text-primary">{priceLabel}</span>
              </div>
            </div>

            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-bold text-foreground mb-4">Descripción</h2>
                <p className="text-muted-foreground leading-relaxed">{place.description}</p>
              </CardContent>
            </Card>

            {/* Cantidades solo para hoteles */}
            {place.category === "hotel" && (place as any).quantities && (
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold text-foreground mb-4">Cantidades</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {(place as any).quantities.rooms && (
                      <div className="flex flex-col">
                        <span className="text-sm text-muted-foreground mb-1">Habitaciones</span>
                        <span className="text-lg font-semibold text-foreground">{(place as any).quantities.rooms}</span>
                      </div>
                    )}
                    {(place as any).quantities.bathrooms && (
                      <div className="flex flex-col">
                        <span className="text-sm text-muted-foreground mb-1">Baños</span>
                        <span className="text-lg font-semibold text-foreground">{(place as any).quantities.bathrooms}</span>
                      </div>
                    )}
                    {(place as any).quantities.guests && (
                      <div className="flex flex-col">
                        <span className="text-sm text-muted-foreground mb-1">Huéspedes</span>
                        <span className="text-lg font-semibold text-foreground">{(place as any).quantities.guests}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {amenities.length > 0 && (
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold text-foreground mb-4">Características</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {amenities.map((amenity: string, index: number) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-primary" />
                        <span className="text-sm text-foreground">{amenity}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Se eliminan campos no soportados por el backend (checkIn, checkOut, hours, duration, includes, bestTime, howToGet) */}

            <ReviewsSection 
              placeId={String(place.id)} 
              averageRating={rating} 
              totalReviews={reviewCount}
              ratingsByCategory={(place as any).ratings}
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="sticky top-20">
              <CardContent className="p-6 space-y-4">
                <h2 className="text-xl font-bold text-foreground">Información de contacto</h2>

                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Dirección</p>
                      <p className="text-sm text-muted-foreground">{address}</p>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Teléfono</p>
                      {phone ? (
                        <a href={`tel:${phone}`} className="text-sm text-primary hover:underline">
                          {phone}
                        </a>
                      ) : (
                        <span className="text-sm text-muted-foreground">No disponible</span>
                      )}
                    </div>
                  </div>

                  <Separator />

                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Email</p>
                      {email ? (
                        <a href={`mailto:${email}`} className="text-sm text-primary hover:underline">
                          {email}
                        </a>
                      ) : (
                        <span className="text-sm text-muted-foreground">No disponible</span>
                      )}
                    </div>
                  </div>

                  <Separator />

                  <div className="flex items-center gap-3">
                    <Globe className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Sitio web</p>
                      {websiteUrl ? (
                        <a
                          href={websiteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline"
                        >
                          {website}
                        </a>
                      ) : (
                        <span className="text-sm text-muted-foreground">No disponible</span>
                      )}
                    </div>
                  </div>
                </div>

                {place.openingHours && (
                  <>
                    <Separator />
                    <div>
                      <button
                        onClick={() => setIsHoursOpen(!isHoursOpen)}
                        className="w-full flex items-center justify-between py-2 text-left hover:text-primary transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <Clock className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                          <p className="text-sm font-medium text-foreground">Horarios</p>
                        </div>
                        <ChevronDown 
                          className={`h-4 w-4 text-muted-foreground transition-transform ${isHoursOpen ? 'rotate-180' : ''}`}
                        />
                      </button>
                      {isHoursOpen && (
                        <div className="mt-3 space-y-2 pl-8">
                          {[
                            { key: "monday", label: "Lunes" },
                            { key: "tuesday", label: "Martes" },
                            { key: "wednesday", label: "Miércoles" },
                            { key: "thursday", label: "Jueves" },
                            { key: "friday", label: "Viernes" },
                            { key: "saturday", label: "Sábado" },
                            { key: "sunday", label: "Domingo" },
                          ].map(({ key, label }) => {
                            const dayHours = place.openingHours?.[key as keyof typeof place.openingHours]
                            if (!dayHours || dayHours.start === undefined || dayHours.end === undefined) {
                              return null
                            }
                            return (
                              <div key={key} className="flex justify-between items-center py-1">
                                <span className="text-sm text-foreground">{label}</span>
                                <span className="text-sm text-muted-foreground">
                                  {formatHour(dayHours.start)} - {formatHour(dayHours.end)}
                                </span>
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  </>
                )}

                <Separator />

                <div className="space-y-2 pt-2">
                  <Button 
                    variant={isFavorite ? "default" : "outline"} 
                    className={`w-full flex items-center gap-2 ${isFavorite ? "" : "bg-transparent"}`}
                    size="lg"
                    onClick={handleToggleFavorite}
                    disabled={isLoadingFavorite || !isAuthenticated}
                  >
                    <Heart className={`h-4 w-4 ${isFavorite ? "fill-red-500 text-red-500" : ""}`} />
                    {isFavorite ? "Eliminar de favoritos" : "Guardar en favoritos"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {hasCoordinates && coordinates && (
        <div className="container mx-auto px-4 pb-12">
          <Card>
            <CardContent className="p-0">
              <div className="p-6 space-y-2">
                <h2 className="text-xl font-bold text-foreground">Ubicación en el mapa</h2>
              </div>
              <div className="h-72 w-full border-t">
                <PlaceLocationMap lat={coordinates.lat} lng={coordinates.lng} />
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
