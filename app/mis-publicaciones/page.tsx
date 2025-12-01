"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Header } from "@/components/header"
import * as AlertDialog from "@radix-ui/react-alert-dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { MapPin, Phone, Mail, Globe, Loader2, Plus, Building2, MoreVertical, Star, Edit, Trash2, X, Upload, Lightbulb, BarChart2 } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import type { Place } from "@/types/place"
import { ACTIVIDADES, createPlace, fetchPlace, fetchPlacesByOwner, updatePlace, deletePlace, HOTELES, RESTAURANTES, uploadPlaceImage } from "@/api/place"
import { fetchVisits } from "@/api/metrics"
import { ReviewsPanel } from "@/components/reviews-panel"
import { LocationSelector, type LocationValue } from "@/components/location-selector"
import StatsChart from "@/components/stats-chart"
import StatsPie from "@/components/stats-pie"
import { parseTimestamp } from "@/lib/parse-timestamp"

const CATEGORY_OPTIONS = [
  { value: HOTELES, label: "Hoteles" },
  { value: RESTAURANTES, label: "Restaurantes" },
  { value: ACTIVIDADES, label: "Actividades" },
] as const

type CategoryValue = (typeof CATEGORY_OPTIONS)[number]["value"]

// Categorías predeterminadas por tipo de lugar
const HOTEL_ATTRIBUTES = [
  "WiFi",
  "Spa",
  "Piscina",
  "Gimnasio",
  "Restaurante",
  "Desayuno incluido",
  "Estacionamiento",
  "Sala de juegos",
  "Espacio de Co-Working",
]

const RESTAURANT_ATTRIBUTES = [
  "WiFi",
  "Estacionamiento",
  "Terraza",
  "Bar",
  "Cafetería",
  "Para llevar",
  "Reserva anticipada",
  "Menú vegetariano",
  "Menú vegano",
  "Patio",
  "Work-friendly",
  "Música en vivo",
  "Vista al mar",
]

const ACTIVITY_ATTRIBUTES = [
  "Guía",
  "Transporte",
  "Aire libre",
  "Gastronómico",
  "Equipo incluido",
  "Para familias",
]

const INITIAL_FORM = {
  name: "",
  description: "",
  category: "hotel",
  address: "",
  city: "",
  country: "",
  locationLat: "",
  locationLng: "",
  phone: "",
  email: "",
  website: "",
  price: "",
  priceCategory: "$$",
  images: "",
  attributes: [] as string[],
  openingHours: {
    monday: { start: undefined, end: undefined },
    tuesday: { start: undefined, end: undefined },
    wednesday: { start: undefined, end: undefined },
    thursday: { start: undefined, end: undefined },
    friday: { start: undefined, end: undefined },
    saturday: { start: undefined, end: undefined },
    sunday: { start: undefined, end: undefined },
  },
  quantities: {
    rooms: "",
    bathrooms: "",
    guests: "",
  },
}

export default function MisPublicacionesPage() {
  const router = useRouter()
  const { isAuthenticated, user } = useAuth()
  // Filtro: 'all' muestra todas; o por categoría específica
  const [selectedFilter, setSelectedFilter] = useState<'all' | CategoryValue>('all')
  const [allPlaces, setAllPlaces] = useState<Place[]>([])
  // Normaliza el tipo (backend) a colección del UI para filtros y rutas
  const toCollection = (value: string | undefined): CategoryValue | string | undefined => {
    if (!value) return value
    const v = String(value).toLowerCase()
    if (v === "hotel" || v === "hoteles" || v === "hotel") return HOTELES
    if (v === "restaurante" || v === "restaurantes" || v === "restaurant") return RESTAURANTES
    if (v === "actividad" || v === "actividades" || v === "activity") return ACTIVIDADES
    return value
  }
  const places = useMemo(() => {
    if (selectedFilter === 'all') return allPlaces
    return allPlaces.filter((p) => toCollection(((p as any).type as string | undefined) ?? (p as any).category) === selectedFilter)
  }, [allPlaces, selectedFilter])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState(INITIAL_FORM)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [uploadingImages, setUploadingImages] = useState(false)
  const [locationConfirmed, setLocationConfirmed] = useState(false)
  
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const [deleteCandidate, setDeleteCandidate] = useState<{
    id: string
    collection: CategoryValue
    name?: string
  } | null>(null)
  const [showReviewsForId, setShowReviewsForId] = useState<string | null>(null)
  const [openStatsFor, setOpenStatsFor] = useState<string | null>(null)
  const [statsByPlace, setStatsByPlace] = useState<Record<string, any>>({})
  const [statsLoading, setStatsLoading] = useState<Record<string, boolean>>({})
  const [statsRangeByPlace, setStatsRangeByPlace] = useState<Record<string, string>>({})
  const [attributesDropdownOpen, setAttributesDropdownOpen] = useState(false)

  const categoryLabel = useMemo(() => {
    if (selectedFilter === 'all') return 'Todas las publicaciones'
    return CATEGORY_OPTIONS.find((option) => option.value === selectedFilter)?.label ?? 'Publicaciones'
  }, [selectedFilter])

  const getCategoryRoute = (category: CategoryValue) => {
    const routeMap: Record<CategoryValue, string> = {
      [HOTELES]: "hotels",
      [RESTAURANTES]: "restaurants",
      [ACTIVIDADES]: "activities",
    }
    return routeMap[category] || category
  }

  const createSingularLabel = useMemo(() => {
    const mapByForm: Record<string, string> = {
      hotel: "Hotel",
      restaurant: "Restaurante",
      activity: "Actividad",
    }
    return mapByForm[formData.category] || "Publicación"
  }, [formData.category])

  const isActivity = formData.category === "activity"

  const backendCategory = useMemo(() => {
    // Usar directamente la categoría del formulario (ya está en inglés)
    return formData.category
  }, [formData.category])

  const confirmedCoordinates = useMemo(() => {
    const lat = Number(formData.locationLat)
    const lng = Number(formData.locationLng)
    if (
      formData.locationLat.trim() &&
      formData.locationLng.trim() &&
      !Number.isNaN(lat) &&
      !Number.isNaN(lng)
    ) {
      return { lat, lng }
    }
    return null
  }, [formData.locationLat, formData.locationLng])

  useEffect(() => {
    if (!isAuthenticated || !user?.id) return

    const loadPlaces = async () => {
      setLoading(true)
      setErrorMessage(null)
      try {
        const data = await fetchPlacesByOwner(user.id)
        // Debug: inspeccionar categorías devueltas por el backend
        try {
          // eslint-disable-next-line no-console
          console.log(
            "MisPublicaciones - fetched posts:",
            data.map((p: any) => ({ id: p.id, category: p.category, type: p.type }))
          )
        } catch {}
        setAllPlaces(data)
      } catch (error) {
        console.error(error)
        setErrorMessage("No fue posible obtener las publicaciones. Inténtalo nuevamente.")
      } finally {
        setLoading(false)
      }
    }

    void loadPlaces()
  }, [isAuthenticated, user?.id])

  // Función para obtener las categorías según el tipo
  const getAttributesForCategory = (category: string): string[] => {
    if (category === "hotel") return HOTEL_ATTRIBUTES
    if (category === "restaurant") return RESTAURANT_ATTRIBUTES
    if (category === "activity") return ACTIVITY_ATTRIBUTES
    return []
  }

  const handleFormChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = event.target
    
    // Si cambia la categoría, resetear las características seleccionadas
    if (name === "category") {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        attributes: [], // Resetear características al cambiar categoría
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }))
    }
  }

  // Función para manejar el toggle de checkboxes de características
  const handleAttributeToggle = (attribute: string) => {
    setFormData((prev) => {
      const currentAttributes = prev.attributes || []
      const isSelected = currentAttributes.includes(attribute)
      
      if (isSelected) {
        // Remover si ya está seleccionado
        return {
          ...prev,
          attributes: currentAttributes.filter((a) => a !== attribute),
        }
      } else {
        // Agregar si no está seleccionado
        return {
          ...prev,
          attributes: [...currentAttributes, attribute],
        }
      }
    })
  }

  const handleLocationChange = (location: LocationValue, options?: { confirmed?: boolean }) => {
    setFormData((prev) => ({
      ...prev,
      address: location.address,
      city: location.city,
      country: location.country,
      locationLat: location.location?.lat != null ? String(location.location.lat) : "",
      locationLng: location.location?.lng != null ? String(location.location.lng) : "",
    }))
    setLocationConfirmed(Boolean(options?.confirmed && location.location))
  }

  const handleOpeningHoursChange = (day: string, field: 'start' | 'end', value: string) => {
    setFormData((prev) => {
      const numValue = value === "" ? undefined : Number(value)
      return {
        ...prev,
        openingHours: {
          ...prev.openingHours,
          [day]: {
            ...prev.openingHours[day as keyof typeof prev.openingHours],
            [field]: numValue,
          },
        },
      }
    })
  }

  const handleQuantitiesChange = (field: 'rooms' | 'bathrooms' | 'guests', value: string) => {
    setFormData((prev) => ({
      ...prev,
      quantities: {
        ...prev.quantities,
        [field]: value,
      },
    }))
  }

  const resetForm = () => {
    // Limpiar URLs de preview para evitar memory leaks
    imagePreviews.forEach(url => URL.revokeObjectURL(url))
    setFormData(INITIAL_FORM)
    setSelectedFiles([])
    setImagePreviews([])
    setShowForm(false)
    setEditingId(null)
    setLocationConfirmed(false)
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    if (files.length === 0) return

    // Filtrar solo imágenes
    const imageFiles = files.filter(file => file.type.startsWith('image/'))
    
    if (imageFiles.length !== files.length) {
      toast.error("Algunos archivos no son imágenes y fueron omitidos")
    }

    // Actualizar archivos seleccionados
    const newFiles = [...selectedFiles, ...imageFiles]
    setSelectedFiles(newFiles)

    // Crear previews
    const newPreviews = imageFiles.map(file => URL.createObjectURL(file))
    setImagePreviews([...imagePreviews, ...newPreviews])
  }

  const removeImage = (index: number) => {
    // Limpiar URL del preview
    URL.revokeObjectURL(imagePreviews[index])
    
    // Remover de los arrays
    const newFiles = selectedFiles.filter((_, i) => i !== index)
    const newPreviews = imagePreviews.filter((_, i) => i !== index)
    
    setSelectedFiles(newFiles)
    setImagePreviews(newPreviews)
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    setErrorMessage(null)
    

    const requiredFields: Array<{ key: keyof typeof INITIAL_FORM; label: string }> = [
      { key: "name", label: "Nombre" },
    ]

    const missing = requiredFields.filter(({ key }) => {
      const value = formData[key]
      // attributes es un array, no necesita trim
      if (key === "attributes") return false
      // Para otros campos, verificar si es string y tiene contenido
      return typeof value === "string" ? !value.trim() : !value
    })
    if (missing.length > 0) {
      setErrorMessage(`Completa los campos obligatorios: ${missing.map((field) => field.label).join(", ")}`)
      return
    }

    if (formData.address.trim() && !locationConfirmed) {
      setErrorMessage("Confirma la dirección en el mapa antes de guardar los cambios.")
      return
    }

    // Obtener URLs manuales del textarea
    const manualImageUrls = (formData.images ?? "")
      .split(/[\n,]/)
      .map((item) => item.trim())
      .filter(Boolean)

    // Subir archivos seleccionados
    let uploadedImageUrls: string[] = []
    if (selectedFiles.length > 0) {
      try {
        setUploadingImages(true)
        uploadedImageUrls = await Promise.all(
          selectedFiles.map((file, index) => uploadPlaceImage(editingId, file, index))
        )
      } catch (error) {
        setErrorMessage("Error al subir las imágenes. Intenta nuevamente.")
        setUploadingImages(false)
        return
      } finally {
        setUploadingImages(false)
      }
    }

    // Combinar URLs manuales con URLs subidas
    const images = [...manualImageUrls, ...uploadedImageUrls]

    // attributes ya es un array, solo necesitamos asegurarnos de que no esté vacío
    const attributes = Array.isArray(formData.attributes) 
      ? formData.attributes.filter(Boolean)
      : []

    const price = Number(formData.price)

    // Permitir vacíos: si están vacíos, Number("") dará 0, lo aceptamos

    if (!user?.id) {
      setErrorMessage("Error: No se pudo identificar al usuario. Por favor, inicia sesión nuevamente.")
      return
    }

    try {
      setSubmitting(true)
      // Determinar la colección (ruta) correcta según la categoría elegida en el formulario
      const collectionForPost = formData.category === "hotel" ? HOTELES : formData.category === "restaurant" ? RESTAURANTES : ACTIVIDADES
      
      // Limpiar campos vacíos antes de enviar (solo enviar campos con valor)
      const payload: any = {
        name: formData.name.trim(),
        ownerId: user.id,
        category: backendCategory,
      }
      
      // Solo agregar campos que tengan valor
      if (price > 0) payload.price = price
      if (formData.priceCategory?.trim()) payload.priceCategory = formData.priceCategory.trim()
      if (images.length > 0) payload.images = images
      if (formData.description.trim()) payload.description = formData.description.trim()
      if (attributes.length > 0) payload.attributes = attributes
      if (formData.address.trim()) payload.address = formData.address.trim()
      if (formData.city.trim()) payload.city = formData.city.trim()
      if (formData.country.trim()) payload.country = formData.country.trim()
      if (formData.phone.trim()) payload.phone = formData.phone.trim()
      if (formData.email.trim()) payload.email = formData.email.trim()
      if (formData.website.trim()) payload.website = formData.website.trim()
      const lat = Number(formData.locationLat)
      const lng = Number(formData.locationLng)
      if (
        locationConfirmed &&
        formData.locationLat.trim() &&
        formData.locationLng.trim() &&
        !Number.isNaN(lat) &&
        !Number.isNaN(lng)
      ) {
        payload.location = { lat, lng }
      }

      // Agregar openingHours si hay al menos un día con horarios definidos
      if (formData.openingHours) {
        const cleanedHours: any = {}
        const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
        let hasAnyHours = false
        
        days.forEach(day => {
          const dayHours = formData.openingHours[day as keyof typeof formData.openingHours]
          if (dayHours && (dayHours.start !== undefined || dayHours.end !== undefined)) {
            cleanedHours[day] = {
              ...(dayHours.start !== undefined && { start: dayHours.start }),
              ...(dayHours.end !== undefined && { end: dayHours.end }),
            }
            hasAnyHours = true
          }
        })
        
        if (hasAnyHours) {
          payload.openingHours = cleanedHours
        }
      }

      // Agregar quantities solo para hoteles
      if (formData.category === "hotel" && formData.quantities) {
        const quantities: any = {}
        const rooms = Number(formData.quantities.rooms)
        const bathrooms = Number(formData.quantities.bathrooms)
        const guests = Number(formData.quantities.guests)
        
        if (!Number.isNaN(rooms) && rooms > 0) quantities.rooms = rooms
        if (!Number.isNaN(bathrooms) && bathrooms > 0) quantities.bathrooms = bathrooms
        if (!Number.isNaN(guests) && guests > 0) quantities.guests = guests
        
        if (Object.keys(quantities).length > 0) {
          payload.quantities = quantities
        }
      }

      if (editingId) {
        await updatePlace(collectionForPost, editingId, payload)
      } else {
        await createPlace(collectionForPost, payload)
      }
      const updatedPlaces = await fetchPlacesByOwner(user.id)
      setAllPlaces(updatedPlaces)

      resetForm()
      toast.success(editingId ? "Publicación actualizada correctamente." : "Publicación creada correctamente.")
    } catch (error) {
      console.error(error)
      setErrorMessage(editingId ? "No se pudo actualizar la publicación. Intenta nuevamente." : "No se pudo crear la publicación. Revisa los datos e intenta nuevamente.")
    } finally {
      setSubmitting(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen w-full flex flex-col bg-background">
        <Header />
        <main className="flex-1 w-full flex items-center justify-center py-12 px-4">
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
    <div className="min-h-screen w-full flex flex-col bg-background">
      <Header />

      <main className="flex-1 w-full py-12 px-4">
        <div className="container mx-auto max-w-6xl space-y-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-1">Mis publicaciones</h1>
              <p className="text-muted-foreground">Gestiona los lugares que compartes con la comunidad.</p>
            </div>
            <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
              <select
                className="border border-input bg-background px-3 py-2 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                value={selectedFilter}
                onChange={(event) => setSelectedFilter(event.target.value as any)}
              >
                <option value="all">Todas</option>
                <option value={HOTELES}>Hoteles</option>
                <option value={RESTAURANTES}>Restaurantes</option>
                <option value={ACTIVIDADES}>Actividades</option>
              </select>
              <Button
                type="button"
                onClick={() => setShowForm((prev) => !prev)}
                className="w-full sm:w-auto"
                variant={showForm ? "destructive" : "default"}
              >
                {!showForm && <Plus className="h-4 w-4 mr-2" />}
                {showForm ? "Cancelar" : "Nueva publicación"}
              </Button>
            </div>
          </div>

          {showForm && (
            <Card>
              <CardHeader>
                <CardTitle>{editingId ? `Editar ${createSingularLabel}` : `Agregar ${createSingularLabel}`}</CardTitle>
                <CardDescription>
                  Completa la información necesaria. Los campos marcados con * son obligatorios.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-6" onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="category">Categoría</Label>
                      <select
                        id="category"
                        name="category"
                        className="border border-input bg-background px-3 py-2 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary w-full"
                        value={formData.category}
                        onChange={handleFormChange}
                      >
                        <option value="hotel">Hotel</option>
                        <option value="restaurant">Restaurante</option>
                        <option value="activity">Actividad</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="name">Nombre *</Label>
                      <Input id="name" name="name" value={formData.name} onChange={handleFormChange} required />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="city">Ciudad</Label>
                      <Input id="city" name="city" value={formData.city} readOnly />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="country">País</Label>
                      <Input id="country" name="country" value={formData.country} readOnly />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="address">Dirección</Label>
                      <LocationSelector
                        inputId="address"
                        value={{
                          address: formData.address,
                          city: formData.city,
                          country: formData.country,
                          location: confirmedCoordinates,
                        }}
                        onChange={handleLocationChange}
                        placeholder="Buscar y seleccionar dirección..."
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Teléfono</Label>
                      <Input id="phone" name="phone" value={formData.phone} onChange={handleFormChange} />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleFormChange}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="website">Sitio web</Label>
                      <Input
                        id="website"
                        name="website"
                        placeholder="www.ejemplo.com"
                        value={formData.website}
                        onChange={handleFormChange}
                      />
                    </div>

                    {/* rating y reviews se calculan con el uso, no en creación */}

                    <div className="space-y-2">
                      <Label htmlFor="price">Precio base</Label>
                      <Input
                        id="price"
                        name="price"
                        type="number"
                        min="0"
                        value={formData.price}
                        onChange={handleFormChange}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="priceCategory">Precio</Label>
                      <select
                        id="priceCategory"
                        name="priceCategory"
                        className="border border-input bg-background px-3 py-2 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary w-full"
                        value={formData.priceCategory}
                        onChange={handleFormChange}
                      >
                        <option value="$">$</option>
                        <option value="$$">$$</option>
                        <option value="$$$">$$$</option>
                        <option value="$$$$">$$$$</option>
                      </select>
                    </div>

                    {/* Eliminado: etiqueta de precio, usamos solo categoría ($, $$, $$$, $$$$) */}
                  </div>

                  {/* Sección de Cantidades solo para hoteles */}
                  {formData.category === "hotel" && (
                    <div className="space-y-4">
                      <Separator />
                      <div className="space-y-2">
                        <Label className="text-base font-semibold">Cantidades</Label>
                        <p className="text-xs text-muted-foreground">
                          Especifica las cantidades disponibles en tu alojamiento
                        </p>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-10 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="quantities-rooms">Habitaciones</Label>
                          <Input
                            id="quantities-rooms"
                            name="quantities-rooms"
                            type="number"
                            min="1"
                            value={formData.quantities.rooms}
                            onChange={(e) => handleQuantitiesChange('rooms', e.target.value)}
                            placeholder="Ej: 2"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="quantities-bathrooms">Baños</Label>
                          <Input
                            id="quantities-bathrooms"
                            name="quantities-bathrooms"
                            type="number"
                            min="1"
                            value={formData.quantities.bathrooms}
                            onChange={(e) => handleQuantitiesChange('bathrooms', e.target.value)}
                            placeholder="Ej: 1"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="quantities-guests">Huéspedes</Label>
                          <Input
                            id="quantities-guests"
                            name="quantities-guests"
                            type="number"
                            min="1"
                            value={formData.quantities.guests}
                            onChange={(e) => handleQuantitiesChange('guests', e.target.value)}
                            placeholder="Ej: 4"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="description">Descripción</Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleFormChange}
                      rows={4}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Características</Label>
                    <div className="relative">
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full justify-between"
                        onClick={() => setAttributesDropdownOpen(!attributesDropdownOpen)}
                      >
                        <span className="text-sm">
                          {formData.attributes && formData.attributes.length > 0
                            ? `Seleccionar características`
                            : "Seleccionar características"}
                        </span>
                        <svg
                          className={`h-4 w-4 transition-transform ${attributesDropdownOpen ? 'rotate-180' : ''}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </Button>
                      {attributesDropdownOpen && (
                        <>
                          <div
                            className="fixed inset-0 z-10"
                            onClick={() => setAttributesDropdownOpen(false)}
                          />
                          <div className="absolute z-20 w-full mt-1 bg-background border border-input rounded-md shadow-lg max-h-64 overflow-y-auto">
                            <div className="p-2 space-y-1">
                              {getAttributesForCategory(formData.category).map((attribute) => {
                                const isSelected = formData.attributes?.includes(attribute) || false
                                return (
                                  <label
                                    key={attribute}
                                    htmlFor={`attribute-${attribute}`}
                                    className="flex items-center space-x-2 p-2 rounded hover:bg-muted cursor-pointer"
                                  >
                                    <Checkbox
                                      id={`attribute-${attribute}`}
                                      checked={isSelected}
                                      onCheckedChange={() => handleAttributeToggle(attribute)}
                                    />
                                    <span className="text-sm font-normal flex-1">
                                      {attribute}
                                    </span>
                                  </label>
                                )
                              })}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                    {formData.attributes && formData.attributes.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {formData.attributes.map((attribute) => (
                          <Badge key={attribute} variant="secondary" className="text-xs">
                            {attribute}
                          </Badge>
                        ))}
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Selecciona las características que aplican a tu {createSingularLabel.toLowerCase()}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>Horarios</Label>
                    <p className="text-xs text-muted-foreground mb-3">
                      {formData.category === "hotel" && "Horario de recepción"}
                      {formData.category === "restaurant" && "Horario de atención"}
                      {formData.category === "activity" && "Aproximado de entre qué horarios se puede hacer esta actividad"}
                    </p>
                    <div className="space-y-3 border border-input rounded-md p-4">
                      {[
                        { key: "monday", label: "Lunes" },
                        { key: "tuesday", label: "Martes" },
                        { key: "wednesday", label: "Miércoles" },
                        { key: "thursday", label: "Jueves" },
                        { key: "friday", label: "Viernes" },
                        { key: "saturday", label: "Sábado" },
                        { key: "sunday", label: "Domingo" },
                      ].map(({ key, label }) => {
                        const dayHours = formData.openingHours?.[key as keyof typeof formData.openingHours]
                        return (
                          <div key={key} className="flex items-center gap-3">
                            <span className="text-sm font-medium w-20 flex-shrink-0">{label}</span>
                            <div className="flex items-center gap-2 flex-1">
                              <Input
                                type="number"
                                min="0"
                                max="23"
                                placeholder="Inicio"
                                value={dayHours?.start ?? ""}
                                onChange={(e) => handleOpeningHoursChange(key, 'start', e.target.value)}
                                className="w-24"
                              />
                              <span className="text-sm text-muted-foreground">-</span>
                              <Input
                                type="number"
                                min="0"
                                max="23"
                                placeholder="Fin"
                                value={dayHours?.end ?? ""}
                                onChange={(e) => handleOpeningHoursChange(key, 'end', e.target.value)}
                                className="w-24"
                              />
                              <span className="text-sm text-muted-foreground">hs</span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="file-upload">Subir imágenes desde el dispositivo</Label>
                      <div className="flex items-center gap-2">
                        <input
                          id="file-upload"
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleFileChange}
                          className="hidden"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => document.getElementById('file-upload')?.click()}
                          className="flex items-center gap-2"
                        >
                          <Upload className="h-4 w-4" />
                          Seleccionar imágenes
                        </Button>
                      </div>
                      {selectedFiles.length > 0 && (
                        <div className="mt-2 text-sm text-muted-foreground">
                          {selectedFiles.length} imagen(es) seleccionada(s)
                        </div>
                      )}
                    </div>

                    {/* Preview de imágenes seleccionadas */}
                    {imagePreviews.length > 0 && (
                      <div className="space-y-2">
                        <Label>Vista previa de imágenes</Label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {imagePreviews.map((preview, index) => (
                            <div key={index} className="relative group">
                              <img
                                src={preview}
                                alt={`Preview ${index + 1}`}
                                className="w-full h-32 object-cover rounded-md border border-border"
                              />
                              <button
                                type="button"
                                onClick={() => removeImage(index)}
                                className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                title="Eliminar imagen"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="images">O agregar URLs de imágenes (una por línea)</Label>
                      <Textarea
                        id="images"
                        name="images"
                        value={formData.images}
                        onChange={handleFormChange}
                        placeholder="https://ejemplo.com/imagen1.jpg\nhttps://ejemplo.com/imagen2.jpg"
                        rows={4}
                      />
                      <p className="text-xs text-muted-foreground">
                        También puedes agregar URLs manualmente si prefieres
                      </p>
                    </div>
                  </div>

                  {/* Campos extra eliminados para ajustarse al DTO del backend */}

                  {errorMessage && <p className="text-sm text-destructive">{errorMessage}</p>}
                  

                  <div className="flex flex-wrap gap-3">
                    <Button type="submit" disabled={submitting || uploadingImages}>
                      {(submitting || uploadingImages) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {uploadingImages ? "Subiendo imágenes..." : editingId ? "Guardar" : "Crear publicación"}
                    </Button>
                    <Button type="button" variant="outline" onClick={resetForm} disabled={submitting || uploadingImages}>
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
              {loading && (
                <CardDescription>
                  Cargando publicaciones...
                </CardDescription>
              )}
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {places.map((place) => (
                    <Card key={place.id} className="border border-muted max-w-md w-full mx-auto">
                      <CardContent className="p-6 space-y-4">
                        {/* Header con nombre y menú de opciones */}
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-foreground mb-2">{place.name}</h3>
                            <Badge variant="secondary" className="mb-3">
                              {(() => {
                                const rawType = ((place as any).type as string | undefined) ?? ((place as any).category as string | undefined)
                                const t = String(rawType || '').toUpperCase()
                                const singularMap: Record<string, string> = {
                                  HOTEL: 'Hotel',
                                  RESTAURANT: 'Restaurante',
                                  ACTIVITY: 'Actividad',
                                }
                                return singularMap[t] || 'Sin categoría'
                              })()}
                            </Badge>
                              {place.address && (
                                <div className="flex items-start gap-2 text-sm text-muted-foreground">
                                  <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                  <span className="line-clamp-2">{place.address}</span>
                                </div>
                              )}
                            </div>
                            {/* Menú de tres puntos */}
                            <div className="relative">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => setOpenMenuId(openMenuId === place.id ? null : place.id)}
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                              {openMenuId === place.id && (
                                <>
                                  <div
                                    className="fixed inset-0 z-10"
                                    onClick={() => setOpenMenuId(null)}
                                  />
                                  <div className="absolute right-0 mt-2 w-48 bg-background border border-border rounded-md shadow-lg z-20">
                                    <Button
                                      variant="ghost"
                                      className="w-full justify-start px-4 py-2 text-sm"
                                      onClick={async () => {
                                        setOpenMenuId(null)
                                        try {
                                          const rawType = ((place as any).type as string | undefined) ?? ((place as any).category as string | undefined)
                                          const t = String(rawType || '').toUpperCase()
                                          const collection: CategoryValue = t === 'HOTEL' ? HOTELES : t === 'RESTAURANT' ? RESTAURANTES : ACTIVIDADES
                                          const full = await fetchPlace(collection, place.id)
                                          if (!full) return
                                          const categoryForForm = collection === HOTELES ? 'hotel' : collection === RESTAURANTES ? 'restaurant' : 'activity'
                                          const fullLocation = (full as any).location as { lat?: number; lng?: number } | undefined
                                          const fullQuantities = (full as any).quantities as { rooms?: number; bathrooms?: number; guests?: number } | undefined
                                          setFormData({
                                            name: full.name || "",
                                            description: full.description || "",
                                            category: categoryForForm,
                                            address: full.address || "",
                                            city: (full as any).city || "",
                                            country: (full as any).country || "",
                                            locationLat:
                                              fullLocation?.lat !== undefined && fullLocation?.lat !== null
                                                ? String(fullLocation.lat)
                                                : "",
                                            locationLng:
                                              fullLocation?.lng !== undefined && fullLocation?.lng !== null
                                                ? String(fullLocation.lng)
                                                : "",
                                            phone: full.phone || "",
                                            email: full.email || "",
                                            website: full.website || "",
                                            price: String(full.price ?? ""),
                                            priceCategory: (full.priceCategory as any) || "$$",
                                            images: Array.isArray(full.images) ? full.images.join("\n") : "",
                                            attributes: Array.isArray((full as any).attributes)
                                              ? (full as any).attributes
                                              : Array.isArray((full as any).amenities)
                                                ? (full as any).amenities
                                                : [],
                                            openingHours: (full as any).openingHours || {
                                              monday: { start: undefined, end: undefined },
                                              tuesday: { start: undefined, end: undefined },
                                              wednesday: { start: undefined, end: undefined },
                                              thursday: { start: undefined, end: undefined },
                                              friday: { start: undefined, end: undefined },
                                              saturday: { start: undefined, end: undefined },
                                              sunday: { start: undefined, end: undefined },
                                            },
                                            quantities: fullQuantities ? {
                                              rooms: fullQuantities.rooms ? String(fullQuantities.rooms) : "",
                                              bathrooms: fullQuantities.bathrooms ? String(fullQuantities.bathrooms) : "",
                                              guests: fullQuantities.guests ? String(fullQuantities.guests) : "",
                                            } : {
                                              rooms: "",
                                              bathrooms: "",
                                              guests: "",
                                            },
                                          })
                                          setLocationConfirmed(Boolean(full.address && fullLocation))
                                          setEditingId(place.id)
                                          setShowForm(true)
                                          window.scrollTo({ top: 0, behavior: 'smooth' })
                                        } catch (e) {
                                          // eslint-disable-next-line no-console
                                          console.error(e)
                                        }
                                      }}
                                    >
                                      <Edit className="h-4 w-4 mr-2" />
                                      Editar
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      className="w-full justify-start px-4 py-2 text-sm text-[#7b1128] hover:text-[#5f0b21] hover:bg-[#7b11282a]"
                                      onClick={() => {
                                        setOpenMenuId(null)
                                        try {
                                          const rawType = ((place as any).type as string | undefined) ?? ((place as any).category as string | undefined)
                                          const t = String(rawType || '').toUpperCase()
                                          const collection: CategoryValue = t === 'HOTEL' ? HOTELES : t === 'RESTAURANT' ? RESTAURANTES : ACTIVIDADES
                                          setDeleteCandidate({ id: place.id, collection, name: place.name })
                                        } catch (e) {
                                          setDeleteCandidate({ id: place.id, collection: HOTELES, name: place.name })
                                        }
                                      }}
                                    >
                                      <Trash2 className="h-4 w-4 mr-2" />
                                      Eliminar Publicación
                                    </Button>
                                  </div>
                                </>
                              )}
                            </div>
                          </div>

                          <Separator />

                          {/* Botones de acciones */}
                          <div className="space-y-2">
                            <Button
                              variant="outline"
                              className="w-full"
                                onClick={() => setShowReviewsForId(place.id)}
                            >
                              <Star className="h-4 w-4 mr-2 fill-yellow-400 text-yellow-400" />
                              Consultar Reseñas y Rating
                            </Button>
                            <Button
                              variant="outline"
                              className="w-full"
                              onClick={() => router.push(`/sugerencias/${place.id}`)}
                            >
                              <Lightbulb className="h-4 w-4 mr-2" />
                              Ver Sugerencias
                            </Button>
                              <Button
                                type="button"
                                variant="outline"
                                className="w-full"
                                onClick={async () => {
                                  // Toggle: close if open
                                  if (openStatsFor === place.id) {
                                    setOpenStatsFor(null)
                                    return
                                  }
                                  // Open panel immediately so user sees loading state
                                  setOpenStatsFor(place.id)
                                  setStatsLoading((s) => ({ ...s, [place.id]: true }))
                                  try {
                                    const data = await fetchVisits({ postId: place.id })
                                    setStatsByPlace((s) => ({ ...s, [place.id]: data }))
                                  } catch (err: any) {
                                    console.error("Failed to load stats", err)
                                    toast.error(err?.message || "No se pudieron cargar las métricas")
                                  } finally {
                                    setStatsLoading((s) => ({ ...s, [place.id]: false }))
                                  }
                                }
                              }
                              >
                                <BarChart2 className="h-4 w-4 mr-2" />
                                Estadísticas
                              </Button>
                          </div>
                        </CardContent>
                      {openStatsFor === place.id && (
                        <div className="px-6 pb-6">
                          <div className="rounded-md border border-gray-200 bg-white p-5 shadow-sm">
                            {statsLoading[place.id] ? (
                              <div className="flex items-center gap-3">
                                <Loader2 className="h-5 w-5 animate-spin" />
                                <span className="text-sm">Cargando métricas...</span>
                              </div>
                            ) : (
                              <div className="space-y-4">
                                <h4 className="text-sm font-semibold">Estadísticas de visitas</h4>
                                <div className="mt-2">
                                  <label className="text-sm text-muted-foreground mr-2">Ver:</label>
                                  <select
                                    value={statsRangeByPlace[place.id] ?? "all"}
                                    onChange={(e) => setStatsRangeByPlace((s) => ({ ...s, [place.id]: e.target.value }))}
                                    className="border border-input bg-background px-2 py-1 rounded text-sm"
                                  >
                                    <option value="7">Última semana</option>
                                    <option value="30">Último mes</option>
                                    <option value="90">Últimos 3 meses</option>
                                    <option value="all">Visitas totales</option>
                                  </select>
                                </div>

                                {statsByPlace[place.id] ? (
                                  (() => {
                                    const rawVisits = statsByPlace[place.id].visits || []
                                    const range = statsRangeByPlace[place.id] ?? "all"
                                    let filteredVisits = rawVisits
                                    if (range !== "all") {
                                      const days = Number(range)
                                      const since = Date.now() - days * 24 * 60 * 60 * 1000
                                      filteredVisits = rawVisits.filter((v: any) => {
                                        const t = parseTimestamp(v.timeStamp)
                                        return !Number.isNaN(t) && t >= since
                                      })
                                    }

                                    if (filteredVisits.length === 0) {
                                      return <div className="text-sm text-muted-foreground italic">No hay visitas todavía.</div>
                                    }

                                    // If viewing 'all' show a comparison: today vs total
                                    if (range === "all") {
                                      const total = rawVisits.length
                                      const now = new Date()
                                      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
                                      const startOfTomorrow = startOfToday + 24 * 60 * 60 * 1000
                                      const todayCount = rawVisits.reduce((acc: number, v: any) => {
                                        const t = parseTimestamp(v.timeStamp)
                                        if (Number.isNaN(t)) return acc
                                        return acc + (t >= startOfToday && t < startOfTomorrow ? 1 : 0)
                                      }, 0)

                                      return (
                                        <>
                                          <StatsPie today={todayCount} total={total} />
                                        </>
                                      )
                                    }

                                    return (
                                      <>
                                        <div className="text-sm text-muted-foreground mb-2">Cantidad de visitas: <span className="font-medium text-foreground">{filteredVisits.length}</span></div>
                                        <StatsChart visits={filteredVisits} range={range} />
                                      </>
                                    )
                                  })()
                                ) : (
                                  <div className="text-sm text-muted-foreground">Sin datos</div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      </Card>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      {showReviewsForId && (
        <ReviewsPanel
          open={Boolean(showReviewsForId)}
          onOpenChange={(open) => !open ? setShowReviewsForId(null) : null}
          placeId={showReviewsForId}
        />
      )}

      {/* Delete confirmation dialog */}
      <AlertDialog.Root open={Boolean(deleteCandidate)} onOpenChange={(open) => { if (!open) setDeleteCandidate(null) }}>
        <AlertDialog.Portal>
          <AlertDialog.Overlay className="fixed inset-0 bg-black/40 z-50" />
          <AlertDialog.Content className="fixed left-1/2 -translate-x-1/2 top-1/3 z-50 w-[90%] max-w-md bg-background rounded-lg p-6 shadow-lg">
            <AlertDialog.Title className="text-lg font-semibold">Eliminar publicación</AlertDialog.Title>
            <AlertDialog.Description className="mt-2 text-sm text-muted-foreground">
              Esta acción no se puede deshacer. Si eliminas la publicación, no podrá recuperarse. ¿Estás seguro?
            </AlertDialog.Description>

            <div className="mt-6 flex justify-end gap-3">
              <AlertDialog.Cancel asChild>
                <Button variant="outline" onClick={() => setDeleteCandidate(null)}>Volver</Button>
              </AlertDialog.Cancel>
              <AlertDialog.Action asChild>
                <Button variant="destructive" className="bg-[#990000] hover:bg-[#5f0b21] text-white" onClick={async () => {
                  if (!deleteCandidate) return
                  try {
                    await deletePlace(deleteCandidate.collection, deleteCandidate.id)
                    toast.success("Se eliminó tu publicación exitosamente.")
                    setDeleteCandidate(null)
                    // Re-fetch places
                    if (user?.id) {
                      const updatedPlaces = await fetchPlacesByOwner(user.id)
                      setAllPlaces(updatedPlaces)
                    }
                  } catch (error) {
                    console.error("Error deleting place:", error)
                    toast.error("No se pudo eliminar la publicación. Intenta nuevamente.")
                  }
                }}>
                  Eliminar
                </Button>
              </AlertDialog.Action>
            </div>
          </AlertDialog.Content>
        </AlertDialog.Portal>
      </AlertDialog.Root>
    </div>
  )
}
