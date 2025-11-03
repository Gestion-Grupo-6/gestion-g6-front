"use client"

import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import { Header } from "@/components/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { MapPin, Phone, Mail, Globe, Loader2, Plus, Building2, MoreVertical, Star, Edit, Trash2, X, Upload } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import type { Place } from "@/types/place"
import { ACTIVIDADES, createPlace, fetchPlace, fetchPlacesByOwner, HOTELES, RESTAURANTES, updatePlace, uploadPlaceImage } from "@/api/place"
import { ReviewsPanel } from "@/components/reviews-panel"

const CATEGORY_OPTIONS = [
  { value: HOTELES, label: "Hoteles" },
  { value: RESTAURANTES, label: "Restaurantes" },
  { value: ACTIVIDADES, label: "Actividades" },
] as const

type CategoryValue = (typeof CATEGORY_OPTIONS)[number]["value"]

const INITIAL_FORM = {
  name: "",
  description: "",
  category: "hotel",
  address: "",
  city: "",
  country: "",
  phone: "",
  email: "",
  website: "",
  price: "",
  priceCategory: "$$",
  images: "",
  attributes: "",
}

export default function MisPublicacionesPage() {
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
  
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const [showReviewsForId, setShowReviewsForId] = useState<string | null>(null)

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

  const handleFormChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = event.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
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

    const missing = requiredFields.filter(({ key }) => !formData[key].trim())
    if (missing.length > 0) {
      setErrorMessage(`Completa los campos obligatorios: ${missing.map((field) => field.label).join(", ")}`)
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

    const attributes = (formData.attributes ?? "")
      .split(/[\n,]/)
      .map((item) => item.trim())
      .filter(Boolean)

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
        <div className="container mx-auto max-w-7xl space-y-8">
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
                      <Input id="city" name="city" value={formData.city} onChange={handleFormChange} />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="country">País</Label>
                      <Input id="country" name="country" value={formData.country} onChange={handleFormChange} />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="address">Dirección</Label>
                      <Input
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleFormChange}
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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                      <div className="space-y-2">
                        <Label htmlFor="attributes">Características (una por línea)</Label>
                        <Textarea
                          id="attributes"
                          name="attributes"
                          value={formData.attributes}
                          onChange={handleFormChange}
                          placeholder="WiFi\nPiscina\nSpa"
                          rows={4}
                        />
                      </div>
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
                                          setFormData({
                                            name: full.name || "",
                                            description: full.description || "",
                                            category: categoryForForm,
                                            address: full.address || "",
                                            city: (full as any).city || "",
                                            country: (full as any).country || "",
                                            phone: full.phone || "",
                                            email: full.email || "",
                                            website: full.website || "",
                                            price: String(full.price ?? ""),
                                            priceCategory: (full.priceCategory as any) || "$$",
                                            images: Array.isArray(full.images) ? full.images.join("\n") : "",
                                            attributes: Array.isArray((full as any).attributes)
                                              ? (full as any).attributes.join("\n")
                                              : Array.isArray((full as any).amenities)
                                                ? (full as any).amenities.join("\n")
                                                : "",
                                          })
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
                                      className="w-full justify-start px-4 py-2 text-sm text-destructive hover:text-destructive hover:bg-destructive/10"
                                      onClick={() => {
                                        // TODO: Implementar eliminación
                                        setOpenMenuId(null)
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

                          {/* Botón de consultar reseñas y rating */}
                          <Button
                            variant="outline"
                            className="w-full"
                            onClick={() => setShowReviewsForId(place.id)}
                          >
                            <Star className="h-4 w-4 mr-2 fill-yellow-400 text-yellow-400" />
                            Consultar Reseñas y Rating
                          </Button>
                        </CardContent>
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
    </div>
  )
}
