"use client"

import { useEffect, useMemo, useState } from "react"
import { Header } from "@/components/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { MapPin, Phone, Mail, Globe, Loader2, Plus, Building2 } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { createPlace, fetchPlaces } from "@/lib/api"
import type { Place } from "@/types/place"

const CATEGORY_OPTIONS = [
  { value: "hoteles", label: "Hoteles" },
  { value: "restaurantes", label: "Restaurantes" },
  { value: "actividades", label: "Actividades" },
  { value: "destinos", label: "Destinos" },
] as const

type CategoryValue = (typeof CATEGORY_OPTIONS)[number]["value"]

const INITIAL_FORM = {
  name: "",
  description: "",
  location: "",
  address: "",
  phone: "",
  email: "",
  website: "",
  rating: "",
  reviews: "",
  price: "",
  priceLabel: "",
  images: "",
  amenities: "",
  checkIn: "",
  checkOut: "",
  hours: "",
  duration: "",
  includes: "",
  bestTime: "",
  howToGet: "",
}

export default function MisNegociosPage() {
  const { isAuthenticated } = useAuth()
  const [selectedCategory, setSelectedCategory] = useState<CategoryValue>("hoteles")
  const [places, setPlaces] = useState<Place[]>([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState(INITIAL_FORM)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const categoryLabel = useMemo(
    () => CATEGORY_OPTIONS.find((option) => option.value === selectedCategory)?.label ?? "Publicaciones",
    [selectedCategory],
  )

  useEffect(() => {
    if (!isAuthenticated) return

    const loadPlaces = async () => {
      setLoading(true)
      setErrorMessage(null)
      try {
        const data = await fetchPlaces(selectedCategory)
        setPlaces(data)
      } catch (error) {
        console.error(error)
        setErrorMessage("No fue posible obtener las publicaciones. Inténtalo nuevamente.")
      } finally {
        setLoading(false)
      }
    }

    void loadPlaces()
  }, [selectedCategory, isAuthenticated])

  const handleFormChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = event.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const resetForm = () => {
    setFormData(INITIAL_FORM)
    setShowForm(false)
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    setErrorMessage(null)
    setSuccessMessage(null)

    const requiredFields: Array<{ key: keyof typeof INITIAL_FORM; label: string }> = [
      { key: "name", label: "Nombre" },
      { key: "description", label: "Descripción" },
      { key: "location", label: "Ubicación" },
      { key: "address", label: "Dirección" },
      { key: "phone", label: "Teléfono" },
      { key: "email", label: "Email" },
      { key: "website", label: "Sitio web" },
      { key: "rating", label: "Calificación" },
      { key: "reviews", label: "Cantidad de reseñas" },
      { key: "price", label: "Precio" },
      { key: "images", label: "Imágenes" },
      { key: "amenities", label: "Características" },
    ]

    const missing = requiredFields.filter(({ key }) => !formData[key].trim())
    if (missing.length > 0) {
      setErrorMessage(`Completa los campos obligatorios: ${missing.map((field) => field.label).join(", ")}`)
      return
    }

    const images = formData.images
      .split(/[\n,]/)
      .map((item) => item.trim())
      .filter(Boolean)

    const amenities = formData.amenities
      .split(/[\n,]/)
      .map((item) => item.trim())
      .filter(Boolean)

    if (images.length === 0 || amenities.length === 0) {
      setErrorMessage("Debes proporcionar al menos una imagen y una característica.")
      return
    }

    const rating = Number(formData.rating)
    const reviews = Number(formData.reviews)
    const price = Number(formData.price)

    if (Number.isNaN(rating) || Number.isNaN(reviews) || Number.isNaN(price)) {
      setErrorMessage("Calificación, reseñas y precio deben ser valores numéricos.")
      return
    }

    try {
      setSubmitting(true)
      const payload = {
        name: formData.name.trim(),
        location: formData.location.trim(),
        rating,
        reviews,
        price,
        priceLabel: formData.priceLabel.trim() || `$${price}`,
        images,
        description: formData.description.trim(),
        amenities,
        address: formData.address.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        website: formData.website.trim(),
        checkIn: formData.checkIn.trim() || null,
        checkOut: formData.checkOut.trim() || null,
        hours: formData.hours.trim() || null,
        duration: formData.duration.trim() || null,
        includes: formData.includes.trim() || null,
        bestTime: formData.bestTime.trim() || null,
        howToGet: formData.howToGet.trim() || null,
      }

      await createPlace(selectedCategory, payload)
      const updatedPlaces = await fetchPlaces(selectedCategory)
      setPlaces(updatedPlaces)

      resetForm()
      setSuccessMessage("Publicación creada correctamente.")
    } catch (error) {
      console.error(error)
      setErrorMessage("No se pudo crear la publicación. Revisa los datos e intenta nuevamente.")
    } finally {
      setSubmitting(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center py-12 px-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold">Acceso requerido</CardTitle>
              <CardDescription>Necesitas iniciar sesión para gestionar tus publicaciones.</CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-muted-foreground">Inicia sesión o crea una cuenta para continuar.</p>
              <div className="flex gap-3 justify-center">
                <Button asChild>
                  <a href="/login">Iniciar sesión</a>
                </Button>
                <Button variant="outline" asChild>
                  <a href="/register">Registrarse</a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 py-12 px-4">
        <div className="container mx-auto max-w-6xl space-y-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-1">Mis publicaciones</h1>
              <p className="text-muted-foreground">Gestiona los lugares que compartes con la comunidad.</p>
            </div>
            <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
              <select
                className="border border-input bg-background px-3 py-2 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                value={selectedCategory}
                onChange={(event) => setSelectedCategory(event.target.value as CategoryValue)}
              >
                {CATEGORY_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <Button type="button" onClick={() => setShowForm((prev) => !prev)} className="w-full sm:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                {showForm ? "Cancelar" : "Nueva publicación"}
              </Button>
            </div>
          </div>

          {showForm && (
            <Card>
              <CardHeader>
                <CardTitle>Agregar {categoryLabel.slice(0, -1).toLowerCase()}</CardTitle>
                <CardDescription>
                  Completa la información necesaria. Los campos marcados con * son obligatorios.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-6" onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nombre *</Label>
                      <Input id="name" name="name" value={formData.name} onChange={handleFormChange} required />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="location">Ubicación *</Label>
                      <Input
                        id="location"
                        name="location"
                        value={formData.location}
                        onChange={handleFormChange}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="address">Dirección *</Label>
                      <Input
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleFormChange}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Teléfono *</Label>
                      <Input id="phone" name="phone" value={formData.phone} onChange={handleFormChange} required />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleFormChange}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="website">Sitio web *</Label>
                      <Input
                        id="website"
                        name="website"
                        placeholder="www.ejemplo.com"
                        value={formData.website}
                        onChange={handleFormChange}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="rating">Calificación (0-5) *</Label>
                      <Input
                        id="rating"
                        name="rating"
                        type="number"
                        min="0"
                        max="5"
                        step="0.1"
                        value={formData.rating}
                        onChange={handleFormChange}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="reviews">Cantidad de reseñas *</Label>
                      <Input
                        id="reviews"
                        name="reviews"
                        type="number"
                        min="0"
                        value={formData.reviews}
                        onChange={handleFormChange}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="price">Precio base *</Label>
                      <Input
                        id="price"
                        name="price"
                        type="number"
                        min="0"
                        value={formData.price}
                        onChange={handleFormChange}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="priceLabel">Etiqueta de precio</Label>
                      <Input
                        id="priceLabel"
                        name="priceLabel"
                        placeholder="$150/noche"
                        value={formData.priceLabel}
                        onChange={handleFormChange}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Descripción *</Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleFormChange}
                      required
                      rows={4}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="images">Imágenes (una por línea) *</Label>
                      <Textarea
                        id="images"
                        name="images"
                        value={formData.images}
                        onChange={handleFormChange}
                        placeholder="/ruta-imagen.jpg"
                        rows={4}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="amenities">Características (una por línea) *</Label>
                      <Textarea
                        id="amenities"
                        name="amenities"
                        value={formData.amenities}
                        onChange={handleFormChange}
                        placeholder="WiFi\nPiscina\nSpa"
                        rows={4}
                        required
                      />
                    </div>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="checkIn">Check-in</Label>
                      <Input
                        id="checkIn"
                        name="checkIn"
                        placeholder="15:00"
                        value={formData.checkIn}
                        onChange={handleFormChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="checkOut">Check-out</Label>
                      <Input
                        id="checkOut"
                        name="checkOut"
                        placeholder="12:00"
                        value={formData.checkOut}
                        onChange={handleFormChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="hours">Horario</Label>
                      <Input
                        id="hours"
                        name="hours"
                        placeholder="Lunes a Domingo: 9:00 - 23:00"
                        value={formData.hours}
                        onChange={handleFormChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="duration">Duración</Label>
                      <Input
                        id="duration"
                        name="duration"
                        placeholder="Ej. 4 horas"
                        value={formData.duration}
                        onChange={handleFormChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="includes">Incluye</Label>
                      <Input
                        id="includes"
                        name="includes"
                        placeholder="Transporte, guía, entradas..."
                        value={formData.includes}
                        onChange={handleFormChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bestTime">Mejor época</Label>
                      <Input
                        id="bestTime"
                        name="bestTime"
                        placeholder="Noviembre a abril"
                        value={formData.bestTime}
                        onChange={handleFormChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="howToGet">Cómo llegar</Label>
                      <Input
                        id="howToGet"
                        name="howToGet"
                        placeholder="Aeropuerto X, autobuses Y..."
                        value={formData.howToGet}
                        onChange={handleFormChange}
                      />
                    </div>
                  </div>

                  {errorMessage && <p className="text-sm text-destructive">{errorMessage}</p>}
                  {successMessage && <p className="text-sm text-emerald-600">{successMessage}</p>}

                  <div className="flex flex-wrap gap-3">
                    <Button type="submit" disabled={submitting}>
                      {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Guardar publicación
                    </Button>
                    <Button type="button" variant="outline" onClick={resetForm} disabled={submitting}>
                      Cancelar
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>{categoryLabel}</CardTitle>
              <CardDescription>
                {loading
                  ? "Cargando publicaciones..."
                  : `Se encontraron ${places.length} ${places.length === 1 ? "registro" : "registros"}.`}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {loading ? (
                <div className="flex items-center justify-center py-12 text-muted-foreground">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Cargando...
                </div>
              ) : places.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-4 py-12 text-muted-foreground">
                  <Building2 className="h-10 w-10" />
                  <div className="text-center">
                    <p className="font-medium">Todavía no tienes publicaciones en esta categoría.</p>
                    <p className="text-sm">Crea la primera para que los viajeros puedan descubrir tu negocio.</p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {places.map((place) => (
                    <Card key={place.id} className="border border-muted">
                      <CardContent className="p-4 space-y-4">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className="text-lg font-semibold text-foreground">{place.name}</h3>
                            <p className="text-sm text-muted-foreground">{place.description}</p>
                          </div>
                          <Badge>{categoryLabel.slice(0, -1)}</Badge>
                        </div>

                        <div className="space-y-2 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            <span>{place.location}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4" />
                            <span>{place.phone}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4" />
                            <span>{place.email}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Globe className="h-4 w-4" />
                            <a
                              href={place.website?.startsWith("http") ? place.website : `https://${place.website}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline"
                            >
                              {place.website}
                            </a>
                          </div>
                        </div>

                        <Separator />

                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span className="font-medium text-foreground">{(place.rating ?? 0).toFixed(1)} ★</span>
                          <span>({place.reviews ?? 0} reseñas)</span>
                          <span>•</span>
                          <span className="text-primary font-semibold">
                            {place.priceLabel ?? (place.price != null ? `$${place.price}` : "Consultar")}
                          </span>
                        </div>

                        <div className="flex justify-end">
                          <Button asChild variant="outline">
                            <a href={`/${place.category}/${place.id}`} target="_blank" rel="noopener noreferrer">
                              Ver publicación
                            </a>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
