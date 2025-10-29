"use client"

import { useState } from "react"
import { Star, MapPin, Phone, Mail, Globe, Clock, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"
import { ReviewsSection } from "@/components/reviews-section"
import type { Place } from "@/types/place"
import { getImage } from "@/contexts/SupabaseContext"

interface PlaceDetailProps {
  place: Place
}

export function PlaceDetail({ place }: PlaceDetailProps) {
  const images = place.images && place.images.length > 0 ? place.images.map(getImage) : ["/placeholder.svg"]
  const amenities = place.amenities && place.amenities.length > 0 ? place.amenities : []
  const rating = place.rating ?? 0
  const reviewCount = place.reviews ?? 0
  const priceLabel = place.priceLabel ?? (place.price != null ? `$${place.price}` : "Consultar")
  const categoryRoutes: Record<string, string> = {
    hotel: "hoteles",
    restaurante: "restaurantes",
    actividad: "actividades",
  }
  const categoryPath = categoryRoutes[place.category] ?? `${place.category}s`
  const categoryLabel = place.category
  const address = place.address ?? "Información no disponible"
  const phone = place.phone ?? ""
  const email = place.email ?? ""
  const website = place.website ?? ""
  const websiteUrl = website ? (website.startsWith("http") ? website : `https://${website}`) : ""
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

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
                    <span>{place.location}</span>
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

            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-bold text-foreground mb-4">Características</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {amenities.map((amenity, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-primary" />
                      <span className="text-sm text-foreground">{amenity}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Additional Info based on category */}
            {(place.checkIn || place.hours || place.duration || place.bestTime) && (
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold text-foreground mb-4">Información adicional</h2>
                  <div className="space-y-3">
                    {place.checkIn && (
                      <div className="flex items-center gap-3">
                        <Clock className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium text-foreground">Check-in / Check-out</p>
                          <p className="text-sm text-muted-foreground">
                            {place.checkIn} / {place.checkOut}
                          </p>
                        </div>
                      </div>
                    )}
                    {place.hours && (
                      <div className="flex items-center gap-3">
                        <Clock className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium text-foreground">Horario</p>
                          <p className="text-sm text-muted-foreground">{place.hours}</p>
                        </div>
                      </div>
                    )}
                    {place.duration && (
                      <div className="flex items-center gap-3">
                        <Clock className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium text-foreground">Duración</p>
                          <p className="text-sm text-muted-foreground">{place.duration}</p>
                        </div>
                      </div>
                    )}
                    {place.includes && (
                      <div className="flex items-start gap-3">
                        <div className="h-5 w-5 text-muted-foreground">✓</div>
                        <div>
                          <p className="text-sm font-medium text-foreground">Incluye</p>
                          <p className="text-sm text-muted-foreground">{place.includes}</p>
                        </div>
                      </div>
                    )}
                    {place.bestTime && (
                      <div className="flex items-start gap-3">
                        <div className="h-5 w-5 text-muted-foreground">☀</div>
                        <div>
                          <p className="text-sm font-medium text-foreground">Mejor época para visitar</p>
                          <p className="text-sm text-muted-foreground">{place.bestTime}</p>
                        </div>
                      </div>
                    )}
                    {place.howToGet && (
                      <div className="flex items-start gap-3">
                        <MapPin className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium text-foreground">Cómo llegar</p>
                          <p className="text-sm text-muted-foreground">{place.howToGet}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            <ReviewsSection placeId={String(place.id)} averageRating={rating} totalReviews={reviewCount} />
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

                <Separator />

                <div className="space-y-2 pt-2">
                  <Button className="w-full" size="lg">
                    Reservar ahora
                  </Button>
                  <Button variant="outline" className="w-full bg-transparent" size="lg">
                    Guardar en favoritos
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
