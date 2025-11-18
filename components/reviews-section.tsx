"use client"

import { useEffect, useMemo, useState } from "react"
import * as Dialog from "@radix-ui/react-dialog"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Star, ThumbsUp, X, Upload, Loader2, Edit, ChevronLeft, ChevronRight, Lightbulb } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { fetchReviewsByPost, createReview, updateReview, likeComment, uploadReviewImage } from "@/api/review"
import { fetchUser } from "@/api/user"
import type { CommentResponse } from "@/types/review"
import { useAuth } from "@/contexts/AuthContext"
import { toast } from "sonner"
import { getImage } from "@/contexts/SupabaseContext"
import { createSuggestion, fetchSuggestionsByPost } from "@/api/suggestion"
import type { SuggestionResponse } from "@/types/suggestion"
import { Badge } from "@/components/ui/badge"
import { Check } from "lucide-react"
import { fetchPlace } from "@/api/place"

interface ReviewsSectionProps {
  placeId: string
  averageRating: number
  totalReviews: number
  ratingsByCategory?: Record<string, { average: number; numberOfRatings: number }> | null
}

export function ReviewsSection({ placeId, averageRating, totalReviews, ratingsByCategory }: ReviewsSectionProps) {
  const { user, isAuthenticated } = useAuth()
  const [reviews, setReviews] = useState<CommentResponse[]>([])
  const [newReview, setNewReview] = useState("")
  const [ratings, setRatings] = useState({
    general: 0, // Obligatorio
    cleanliness: 0, // Opcional
    service: 0, // Opcional
    location: 0, // Opcional
  })
  const [submitting, setSubmitting] = useState(false)
  const [uploadingImages, setUploadingImages] = useState(false)
  const [authorById, setAuthorById] = useState<Record<string, string>>({})
  const [profilePhotoById, setProfilePhotoById] = useState<Record<string, string>>({})
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0)
  const [selectedReviewImages, setSelectedReviewImages] = useState<string[]>([])
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null)
  const [existingImagePaths, setExistingImagePaths] = useState<string[]>([])
  const [showSuggestionModal, setShowSuggestionModal] = useState(false)
  const [newSuggestion, setNewSuggestion] = useState("")
  const [submittingSuggestion, setSubmittingSuggestion] = useState(false)
  const [activeTab, setActiveTab] = useState<"reviews" | "suggestions">("reviews")
  const [mySuggestions, setMySuggestions] = useState<any[]>([])
  const [loadingSuggestions, setLoadingSuggestions] = useState(false)
  const [suggestionAuthorById, setSuggestionAuthorById] = useState<Record<string, string>>({})
  const [placeOwnerId, setPlaceOwnerId] = useState<string | null>(null)


  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchReviewsByPost(placeId)
        const uniqueIds = Array.from(new Set(data.map((r) => r.ownerId).filter(Boolean)))
        const authorEntries = await Promise.all(
          uniqueIds.map(async (id) => {
            try {
              const u = await fetchUser(id)
              const full = u ? `${u.name ?? ""} ${u.lastname ?? ""}`.trim() : ""
              return [id, full || id] as const
            } catch {
              return [id, id] as const
            }
          })
        )
        const photoEntries = await Promise.all(
          uniqueIds.map(async (id) => {
            try {
              const u = await fetchUser(id)
              const photo = u?.profilePhoto
              return photo ? [id, photo] as const : null
            } catch {
              return null
            }
          })
        )
        setAuthorById(Object.fromEntries(authorEntries))
        const validPhotos = photoEntries.filter((entry): entry is [string, string] => entry !== null)
        setProfilePhotoById(Object.fromEntries(validPhotos))
        setReviews(data)
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error("No se pudieron cargar las reseñas", e)
      }
    }
    void load()
  }, [placeId])

  // Cargar sugerencias del usuario y del owner
  useEffect(() => {
    if (!isAuthenticated || !user?.id || activeTab !== "suggestions") {
      setMySuggestions([])
      setSuggestionAuthorById({})
      setPlaceOwnerId(null)
      return
    }

    const loadSuggestions = async () => {
      setLoadingSuggestions(true)
      try {
        // Cargar el lugar primero para obtener el ownerId
        let currentPlaceOwnerId: string | null = null
        const collections = ["hotel", "restaurant", "activity"]
        for (const collection of collections) {
          try {
            const fetchedPlace = await fetchPlace(collection, placeId)
            if (fetchedPlace) {
              currentPlaceOwnerId = (fetchedPlace as any).ownerId || null
              setPlaceOwnerId(currentPlaceOwnerId)
              break
            }
          } catch {
            continue
          }
        }

        // Cargar todas las sugerencias
        const allSuggestions = await fetchSuggestionsByPost(placeId)
        
        // Filtrar sugerencias: mostrar si el usuario es el creador O el owner del post
        const userSuggestions = allSuggestions.filter(
          (suggestion) => {
            const isCreator = String(suggestion.ownerId) === String(user.id)
            const isPostOwner = currentPlaceOwnerId && String(currentPlaceOwnerId) === String(user.id)
            return isCreator || isPostOwner
          }
        )
        
        setMySuggestions(userSuggestions)

        // Cargar nombres de los usuarios que crearon las sugerencias
        const uniqueOwnerIds = Array.from(new Set(userSuggestions.map((s) => s.ownerId).filter(Boolean)))
        const authorEntries = await Promise.all(
          uniqueOwnerIds.map(async (id) => {
            try {
              const u = await fetchUser(id)
              const full = u ? `${u.name ?? ""} ${u.lastname ?? ""}`.trim() : ""
              return [id, full || id] as const
            } catch {
              return [id, id] as const
            }
          })
        )
        setSuggestionAuthorById(Object.fromEntries(authorEntries))
      } catch (error) {
        console.error("Error al cargar sugerencias:", error)
        setMySuggestions([])
        setSuggestionAuthorById({})
      } finally {
        setLoadingSuggestions(false)
      }
    }

    void loadSuggestions()
  }, [placeId, user?.id, isAuthenticated, activeTab])

  const derivedAverage = useMemo(() => {
    return averageRating || 0
  }, [averageRating])

  // Verificar si el usuario actual ya tiene una review
  const userHasReview = useMemo(() => {
    if (!user?.id) return false
    return reviews.some((review) => review.ownerId === user.id)
  }, [reviews, user?.id])

  const validCategories = useMemo(() => {
    if (!ratingsByCategory || Object.keys(ratingsByCategory).length === 0) {
      return []
    }
    
    const allCategories = [
      { key: "cleanliness", label: "Limpieza" },
      { key: "service", label: "Servicio" },
      { key: "location", label: "Ubicación" },
    ]
    
    return allCategories.filter(({ key }) => {
      const categoryRating = ratingsByCategory[key]
      return categoryRating && categoryRating.numberOfRatings > 0
    })
  }, [ratingsByCategory])

  const ratingDistribution = useMemo(() => {
    // Calcular la distribución real basada en el rating "general" de las reseñas
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    
    reviews.forEach((review) => {
      if (!review.ratings) return
      
      let generalScore: number | null = null
      
      // Manejar formato array (formato actual del backend)
      if (Array.isArray(review.ratings)) {
        const generalRating = review.ratings.find(r => r != null && typeof r === 'object' && 'type' in r && r.type === 'general')
        if (generalRating && 'score' in generalRating && typeof generalRating.score === 'number') {
          generalScore = generalRating.score
        }
      } 
      // Manejar formato objeto plano (compatibilidad)
      else if (typeof review.ratings === 'object') {
        generalScore = (review.ratings as any).general
      }
      
      if (generalScore == null || generalScore === 0) return
      
      const rounded = Math.round(generalScore)
      
      if (rounded >= 5) distribution[5]++
      else if (rounded >= 4) distribution[4]++
      else if (rounded >= 3) distribution[3]++
      else if (rounded >= 2) distribution[2]++
      else if (rounded >= 1) distribution[1]++
    })
    
    const total = Object.values(distribution).reduce((a, b) => a + b, 0)
    
    return [5, 4, 3, 2, 1].map((stars) => {
      const count = distribution[stars as keyof typeof distribution]
      const percentage = total > 0 ? (count / total) * 100 : 0
      return { stars, percentage, count }
    })
  }, [reviews])

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    if (files.length === 0) return

    // Validar tamaño (5 MB máximo)
    const maxSize = 5 * 1024 * 1024 // 5 MB en bytes
    const validFiles = files.filter((file) => {
      if (file.size > maxSize) {
        toast.error(`La imagen ${file.name} excede el tamaño máximo de 5 MB`)
        return false
      }
      if (!file.type.startsWith('image/')) {
        toast.error(`El archivo ${file.name} no es una imagen válida`)
        return false
      }
      return true
    })

    if (validFiles.length === 0) return

    // Filtrar solo imágenes
    const imageFiles = validFiles.filter(file => file.type.startsWith('image/'))
    
    // Validar formato (JPG o PNG)
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png']
    const formatValidFiles = imageFiles.filter(file => {
      if (!allowedTypes.includes(file.type.toLowerCase())) {
        toast.error(`La imagen ${file.name} debe ser JPG o PNG`)
        return false
      }
      return true
    })

    if (formatValidFiles.length === 0) return

    // Actualizar archivos seleccionados
    const newFiles = [...selectedFiles, ...formatValidFiles]
    setSelectedFiles(newFiles)

    // Crear previews
    const newPreviews = formatValidFiles.map(file => URL.createObjectURL(file))
    setImagePreviews([...imagePreviews, ...newPreviews])
  }

  const removeImage = (index: number) => {
    // Determinar si es una imagen nueva (file) o existente (path)
    if (index < existingImagePaths.length) {
      // Es una imagen existente - solo remover de los estados (no revocar URL porque es una URL pública)
      const newExistingPaths = existingImagePaths.filter((_, i) => i !== index)
      setExistingImagePaths(newExistingPaths)
      const newPreviews = imagePreviews.filter((_, i) => i !== index)
      setImagePreviews(newPreviews)
    } else {
      // Es una imagen nueva - revocar URL del objeto y remover
      const fileIndex = index - existingImagePaths.length
      URL.revokeObjectURL(imagePreviews[index])
      const newFiles = selectedFiles.filter((_, i) => i !== fileIndex)
      const newPreviews = imagePreviews.filter((_, i) => i !== index)
      setSelectedFiles(newFiles)
      setImagePreviews(newPreviews)
    }
  }

  const resetReviewForm = () => {
    // Limpiar URLs de preview para evitar memory leaks (solo las de objetos, no las URLs públicas)
    // Las URLs de objetos empiezan con "blob:", las públicas con "http" o "https"
    imagePreviews.forEach(url => {
      if (url.startsWith("blob:")) {
        URL.revokeObjectURL(url)
      }
    })
    setNewReview("")
    setRatings({ general: 0, cleanliness: 0, service: 0, location: 0 })
    setSelectedFiles([])
    setImagePreviews([])
    setEditingReviewId(null)
    setExistingImagePaths([])
  }

  const handleEditReview = (review: CommentResponse) => {
    if (!review) return
    
    setEditingReviewId(review.id)
    setNewReview(review.comment || "")
    setRatings({
      general: Array.isArray(review.ratings) 
        ? review.ratings.find(r => r.type === 'general')?.score || 0
        : (review.ratings as any)?.general || 0,
      cleanliness: Array.isArray(review.ratings) 
        ? review.ratings.find(r => r.type === 'cleanliness')?.score || 0
        : (review.ratings as any)?.cleanliness || 0,
      service: Array.isArray(review.ratings)
        ? review.ratings.find(r => r.type === 'service')?.score || 0
        : (review.ratings as any)?.service || 0,
      location: Array.isArray(review.ratings)
        ? review.ratings.find(r => r.type === 'location')?.score || 0
        : (review.ratings as any)?.location || 0,
    })
    
    // Si hay imágenes existentes, mostrarlas como previews
    if (Array.isArray(review.images) && review.images.length > 0) {
      setExistingImagePaths(review.images)
      // Crear URLs de preview para las imágenes existentes
      const previewUrls = review.images.map(path => getImage(path))
      setImagePreviews(previewUrls)
    } else {
      setExistingImagePaths([])
      setImagePreviews([])
    }
    
    setSelectedFiles([])
    setShowReviewModal(true)
  }

  const handleSubmitReview = async (e?: React.MouseEvent) => {
    e?.preventDefault()
    e?.stopPropagation()
    
    if (!isAuthenticated || !user?.id) {
      toast.error("Debes iniciar sesión para publicar una reseña")
      return
    }
    
    // Validar que haya un rating "general" obligatorio
    if (!ratings.general || ratings.general === 0) {
      toast.error("Debes calificar la valoración general (obligatorio)")
      return
    }

    if (!newReview.trim()) {
      toast.error("Debes escribir un comentario")
      return
    }

    try {
      setSubmitting(true)
      
      // Subir imágenes si hay archivos seleccionados
      let uploadedImagePaths: string[] = []
      if (selectedFiles.length > 0) {
        try {
          setUploadingImages(true)
          uploadedImagePaths = await Promise.all(
            selectedFiles.map((file, index) => uploadReviewImage(null, file, index))
          )
        } catch (error) {
          toast.error("Error al subir las imágenes. Intenta nuevamente.")
          setUploadingImages(false)
          return
        } finally {
          setUploadingImages(false)
        }
      }

      // Combinar imágenes existentes con las nuevas subidas
      const allImagePaths = [...existingImagePaths, ...uploadedImagePaths]

      if (editingReviewId) {
        // Modo edición
        // Convertir ratings del objeto plano a lista de objetos con type y score
        // "general" es obligatorio, los demás son opcionales
        const ratingsList: Array<{ type: string; score: number }> = []
        
        // General es obligatorio
        if (ratings.general > 0) {
          ratingsList.push({ type: "general", score: ratings.general })
        }
        
        // Los demás son opcionales
        if (ratings.cleanliness > 0) {
          ratingsList.push({ type: "cleanliness", score: ratings.cleanliness })
        }
        if (ratings.service > 0) {
          ratingsList.push({ type: "service", score: ratings.service })
        }
        if (ratings.location > 0) {
          ratingsList.push({ type: "location", score: ratings.location })
        }

        const payload = {
          ownerId: user.id,
          comment: newReview.trim(),
          ratings: ratingsList,
          images: allImagePaths.length > 0 ? allImagePaths : undefined,
        }
        
        await updateReview(placeId, payload)
        const data = await fetchReviewsByPost(placeId)
        setReviews(data)
        resetReviewForm()
        setShowReviewModal(false)
        toast.success("Reseña actualizada correctamente")
        // Auto refresh de la página
        window.location.reload()
      } else {
        // Modo creación
        // Convertir ratings del objeto plano a lista de objetos con type y score
        // "general" es obligatorio, los demás son opcionales
        const ratingsList: Array<{ type: string; score: number }> = []
        
        // General es obligatorio
        if (ratings.general > 0) {
          ratingsList.push({ type: "general", score: ratings.general })
        }
        
        // Los demás son opcionales
        if (ratings.cleanliness > 0) {
          ratingsList.push({ type: "cleanliness", score: ratings.cleanliness })
        }
        if (ratings.service > 0) {
          ratingsList.push({ type: "service", score: ratings.service })
        }
        if (ratings.location > 0) {
          ratingsList.push({ type: "location", score: ratings.location })
        }

        const payload = {
          ownerId: user.id,
          postId: placeId,
          comment: newReview.trim(),
          ratings: ratingsList,
          images: uploadedImagePaths.length > 0 ? uploadedImagePaths : undefined,
        }
        
        await createReview(payload)
        const data = await fetchReviewsByPost(placeId)
        setReviews(data)
        resetReviewForm()
        setShowReviewModal(false)
        toast.success("Reseña publicada correctamente")
        // Auto refresh de la página
        window.location.reload()
      }
    } catch (e: any) {
      // eslint-disable-next-line no-console
      console.error("No se pudo publicar la reseña", e)
      const raw = String(e?.message || e || "")
      const match = raw.match(/\{[^}]*\}/)
      let backendMsg: string | null = null
      try {
        backendMsg = match ? JSON.parse(match[0])?.mensaje || null : null
      } catch {}
      toast.error(backendMsg || "No se pudo crear la reseña. Intenta nuevamente.")
    } finally {
      setSubmitting(false)
    }
  }

  const StarRating = ({ 
    value, 
    onStarClick, 
    label,
    size = "normal"
  }: {
    value: number
    onStarClick: (star: number) => void
    label: string
    size?: "normal" | "large"
  }) => {
    const starSize = size === "large" ? "h-8 w-8" : "h-6 w-6"
    const labelSize = size === "large" ? "text-base font-semibold" : "text-sm font-medium"
    
    return (
      <div className="space-y-2">
        <Label className={`${labelSize} text-foreground`}>{label}</Label>
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                onStarClick(star)
              }}
              className="transition-transform hover:scale-110 cursor-pointer"
            >
              <Star
                className={`${starSize} ${
                  star <= value
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-muted-foreground"
                }`}
              />
            </button>
          ))}
          {value > 0 && <span className={`ml-2 ${size === "large" ? "text-base" : "text-sm"} text-muted-foreground`}>({value}/5)</span>}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          {/* Tabs */}
          <div className="flex items-center gap-2 mb-6 border-b border-border">
            <button
              onClick={() => setActiveTab("reviews")}
              className={`px-4 py-2 font-medium transition-colors border-b-2 ${
                activeTab === "reviews"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4" />
                Reseñas
              </div>
            </button>
            <button
              onClick={() => setActiveTab("suggestions")}
              className={`px-4 py-2 font-medium transition-colors border-b-2 ${
                activeTab === "suggestions"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <div className="flex items-center gap-2">
                <Lightbulb className="h-4 w-4" />
                Sugerencias
              </div>
            </button>
          </div>

          {activeTab === "reviews" && (
            <>
              <h2 className="text-2xl font-bold text-foreground mb-6">Valoraciones y reseñas</h2>

          {/* Rating Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div className="flex flex-col items-center justify-center p-6 bg-muted/30 rounded-lg">
              <div className="text-5xl font-bold text-foreground mb-2">{derivedAverage.toFixed(1)}</div>
              <div className="flex items-center gap-1 mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-5 w-5 ${
                      star <= Math.round(derivedAverage) ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"
                    }`}
                  />
                ))}
              </div>
              <p className="text-sm text-muted-foreground">{totalReviews} reseñas</p>
            </div>

            <div className="space-y-3">
              {ratingDistribution.map((dist) => (
                <div key={dist.stars} className="flex items-center gap-3">
                  <div className="flex items-center gap-1 w-16">
                    <span className="text-sm font-medium text-foreground">{dist.stars}</span>
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  </div>
                  <Progress value={dist.percentage} className="flex-1 h-2" />
                  <span className="text-sm text-muted-foreground w-12 text-right">{dist.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Category Ratings Breakdown */}
          {validCategories.length > 0 && (
            <div className="mb-8 border-t border-border pt-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Valoraciones por categoría</h3>
              <div className="flex flex-wrap justify-center gap-4">
                {validCategories.map(({ key, label }) => {
                  const categoryRating = ratingsByCategory?.[key]
                  if (!categoryRating || categoryRating.numberOfRatings === 0) return null
                  
                  const avg = categoryRating.average
                  
                  return (
                    <div key={key} className="p-4 bg-muted/30 rounded-lg w-full md:w-[calc(50%-0.5rem)] lg:w-[calc(25%-0.75rem)] max-w-xs">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-foreground">{label}</span>
                        <span className="text-lg font-bold text-foreground">{avg.toFixed(1)}</span>
                      </div>
                      <div className="flex items-center gap-1 mb-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-4 w-4 ${
                              star <= Math.round(avg) ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

              {/* Write Review Button */}
              <div className="border-t border-border pt-6 space-y-3">
                {isAuthenticated ? (
                  <>
                    <p className="text-base font-medium text-foreground">
                      ¿Visitaste este lugar?
                    </p>
                    <div className="flex flex-wrap gap-3">
                      <Button 
                        onClick={() => {
                          setShowReviewModal(true)
                        }} 
                        disabled={userHasReview}
                        className="w-full sm:w-auto"
                      >
                        Dejar una reseña
                      </Button>
                      <Button 
                        onClick={() => {
                          setShowSuggestionModal(true)
                        }} 
                        variant="outline"
                        className="w-full sm:w-auto"
                      >
                        <Lightbulb className="h-4 w-4 mr-2" />
                        Dejar sugerencia
                      </Button>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">Inicia sesión para escribir una reseña o sugerencia</p>
                )}
              </div>

              {/* Reviews List */}
              <div className="space-y-4 mt-6">
                <h3 className="text-xl font-bold text-foreground">Reseñas de usuarios</h3>

                {reviews.map((review) => {
                  // Usar el rating "general" directamente (obligatorio)
                  const avgRating = (() => {
                    if (!review.ratings) return 0
                    
                    let generalScore: number | null = null
                    
                    // Manejar formato array (formato actual del backend)
                    if (Array.isArray(review.ratings)) {
                      const generalRating = review.ratings.find(r => r != null && typeof r === 'object' && 'type' in r && r.type === 'general')
                      if (generalRating && 'score' in generalRating && typeof generalRating.score === 'number') {
                        generalScore = generalRating.score
                      }
                    } 
                    // Manejar formato objeto plano (compatibilidad)
                    else if (typeof review.ratings === 'object') {
                      generalScore = (review.ratings as any).general
                    }
                    
                    return generalScore || 0
                  })()

                  return (
                    <Card key={review.id}>
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <Avatar className="h-12 w-12">
                            <AvatarImage 
                              src={profilePhotoById[review.ownerId] ? getImage(profilePhotoById[review.ownerId]) : "/placeholder-user.jpg"} 
                              alt={authorById[review.ownerId] || review.ownerId} 
                            />
                            <AvatarFallback className="bg-primary text-primary-foreground">
                              {(authorById[review.ownerId] || review.ownerId)
                                .split(" ")
                                .filter(Boolean)
                                .map((n) => n[0])
                                .join("")
                                .slice(0, 2)
                                .toUpperCase() || "US"}
                            </AvatarFallback>
                          </Avatar>

                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h4 className="font-semibold text-foreground">{authorById[review.ownerId] || "Usuario"}</h4>
                                <p className="text-sm text-muted-foreground">{new Date(review.timestamp).toLocaleDateString()}</p>
                              </div>
                              <div className="flex items-center gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    className={`h-4 w-4 ${
                                      star <= Math.round(avgRating)
                                        ? "fill-yellow-400 text-yellow-400"
                                        : "text-muted-foreground"
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>

                            <p className="text-foreground leading-relaxed mb-4">{review.comment}</p>

                            {/* Display Images */}
                            {Array.isArray(review.images) && review.images.length > 0 && (
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4">
                                {review.images.map((imagePath, idx) => (
                                  <img
                                    key={idx}
                                    src={getImage(imagePath)}
                                    alt={`Imagen de reseña ${idx + 1}`}
                                    className="w-full h-32 object-cover rounded-md border border-border cursor-pointer hover:opacity-90 transition-opacity"
                                    onClick={() => {
                                      if (Array.isArray(review.images)) {
                                        const imageUrls = review.images.map(path => getImage(path))
                                        const clickedIndex = imageUrls.findIndex(url => url === getImage(imagePath))
                                        setSelectedReviewImages(imageUrls)
                                        setSelectedImageIndex(clickedIndex >= 0 ? clickedIndex : 0)
                                        setSelectedImage(getImage(imagePath))
                                      } else {
                                        setSelectedImage(getImage(imagePath))
                                        setSelectedReviewImages([getImage(imagePath)])
                                        setSelectedImageIndex(0)
                                      }
                                    }}
                                  />
                                ))}
                              </div>
                            )}

                            <div className="flex items-center gap-4">
                              {user?.id === review.ownerId && (
                                <button
                                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                                  onClick={() => handleEditReview(review)}
                                >
                                  <Edit className="h-4 w-4" />
                                  <span>Editar</span>
                                </button>
                              )}
                              <button
                                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                                onClick={async () => {
                                  try {
                                    const updated = await likeComment(review.id, user?.id || "")
                                    setReviews((prev) => prev.map((r) => (r.id === updated.id ? updated : r)))
                                  } catch (e) {
                                    // eslint-disable-next-line no-console
                                    console.error("No se pudo marcar útil", e)
                                  }
                                }}
                              >
                                <ThumbsUp className="h-4 w-4" />
                                <span>Útil ({review.likes})</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </>
          )}

      {/* Review Modal */}
      <Dialog.Root 
        open={showReviewModal && (!userHasReview || editingReviewId !== null)} 
        onOpenChange={(open) => {
          if (!open) {
            resetReviewForm()
          }
          // Permitir abrir el modal si el usuario no tiene una review O si está editando una existente
          if (!userHasReview || editingReviewId !== null) {
            setShowReviewModal(open)
          }
        }}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
          <Dialog.Content className="fixed left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 z-[60] w-full max-w-2xl max-h-[90vh] bg-background rounded-xl shadow-2xl flex flex-col">
            <div className="flex items-center justify-between p-6 border-b">
              <Dialog.Title className="text-2xl font-bold text-foreground">
                {editingReviewId ? "Editar reseña" : "Escribir reseña"}
              </Dialog.Title>
              <Dialog.Close asChild>
                <button
                  aria-label="Close"
                  className="p-2 rounded-md hover:bg-muted"
                  onClick={() => {
                    resetReviewForm()
                    setShowReviewModal(false)
                  }}
                >
                  <X className="h-5 w-5" />
                </button>
              </Dialog.Close>
            </div>

            <div className="p-6 overflow-y-auto space-y-6">
              {/* Ratings */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-foreground">Calificaciones</h3>
                
                {/* Valoración obligatoria */}
                <div className="space-y-3">
                  <p className="text-sm font-medium text-muted-foreground">Obligatoria</p>
                  <StarRating
                    value={ratings.general}
                    onStarClick={(star) => {
                      setRatings((prev) => ({ ...prev, general: star }))
                    }}
                    label="Valoración general *"
                    size="large"
                  />
                </div>

                {/* Valoraciones opcionales */}
                <div className="space-y-4 border-t border-border pt-4">
                  <p className="text-sm font-medium text-muted-foreground">Opcionales</p>
                  <StarRating
                    value={ratings.cleanliness}
                    onStarClick={(star) => {
                      setRatings((prev) => ({ ...prev, cleanliness: star }))
                    }}
                    label="Limpieza"
                  />
                  <StarRating
                    value={ratings.service}
                    onStarClick={(star) => {
                      setRatings((prev) => ({ ...prev, service: star }))
                    }}
                    label="Servicio"
                  />
                  <StarRating
                    value={ratings.location}
                    onStarClick={(star) => {
                      setRatings((prev) => ({ ...prev, location: star }))
                    }}
                    label="Ubicación"
                  />
                </div>
              </div>

              {/* Comment */}
              <div className="space-y-2">
                <Label htmlFor="review-comment" className="text-sm font-medium text-foreground">
                  Tu comentario *
                </Label>
                <Textarea
                  id="review-comment"
                  placeholder="Comparte tu experiencia..."
                  value={newReview}
                  onChange={(e) => setNewReview(e.target.value)}
                  rows={4}
                  className="resize-none"
                />
              </div>

              {/* Image Upload */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="review-images" className="text-sm font-medium text-foreground">
                    Subir imágenes (JPG o PNG, máximo 5 MB cada una)
                  </Label>
                  <div className="flex items-center gap-2">
                    <input
                      id="review-images"
                      type="file"
                      accept="image/jpeg,image/jpg,image/png"
                      multiple
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById('review-images')?.click()}
                      className="flex items-center gap-2"
                    >
                      <Upload className="h-4 w-4" />
                      Seleccionar imágenes
                    </Button>
                  </div>
                  {selectedFiles.length > 0 && (
                    <p className="text-sm text-muted-foreground">
                      {selectedFiles.length} imagen(es) seleccionada(s)
                    </p>
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
              </div>

              {/* Submit Button */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    void handleSubmitReview(e)
                  }}
                  disabled={submitting || uploadingImages || !newReview.trim() || !ratings.general || ratings.general === 0}
                  className="flex-1 cursor-pointer"
                >
                  {(submitting || uploadingImages) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {uploadingImages ? "Subiendo imágenes..." : submitting ? (editingReviewId ? "Actualizando..." : "Publicando...") : (editingReviewId ? "Actualizar reseña" : "Publicar reseña")}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    resetReviewForm()
                    setShowReviewModal(false)
                  }}
                  disabled={submitting || uploadingImages}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

          {activeTab === "suggestions" && (
            <>
              <h2 className="text-2xl font-bold text-foreground mb-6">Sugerencias</h2>
              
              {/* Botón para crear sugerencia */}
              <div className="mb-6 border-b border-border pb-6">
                {isAuthenticated ? (
                  <Button 
                    onClick={() => {
                      setShowSuggestionModal(true)
                    }} 
                    variant="outline"
                    className="w-full sm:w-auto"
                  >
                    <Lightbulb className="h-4 w-4 mr-2" />
                    Dejar sugerencia
                  </Button>
                ) : (
                  <p className="text-sm text-muted-foreground">Inicia sesión para dejar una sugerencia</p>
                )}
              </div>

              {/* Lista de sugerencias del usuario */}
              {loadingSuggestions ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  <span className="ml-2 text-muted-foreground">Cargando sugerencias...</span>
                </div>
              ) : mySuggestions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Lightbulb className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-lg font-medium text-foreground mb-2">
                    No has enviado sugerencias aún
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Puedes dejar una sugerencia usando el botón de arriba.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {mySuggestions.map((suggestion) => {
                    const isPostOwner = placeOwnerId && String(placeOwnerId) === String(user?.id)
                    const isCreator = String(suggestion.ownerId) === String(user?.id)
                    const showAuthorName = isPostOwner && !isCreator
                    const authorName = suggestionAuthorById[suggestion.ownerId] || suggestion.ownerId

                    return (
                      <Card key={suggestion.id}>
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              {showAuthorName && (
                                <p className="text-sm font-semibold text-foreground mb-2">
                                  {authorName}
                                </p>
                              )}
                              <p className="text-sm text-muted-foreground mb-2">
                                {new Date(suggestion.timestamp).toLocaleString("es-AR", {
                                  dateStyle: "long",
                                  timeStyle: "short",
                                })}
                              </p>
                              <p className="text-foreground whitespace-pre-wrap">{suggestion.content}</p>
                            </div>
                            <Badge 
                              variant={
                                suggestion.status === "ACCEPTED" 
                                  ? "default" 
                                  : suggestion.status === "REJECTED" 
                                  ? "destructive" 
                                  : "secondary"
                              }
                              className="ml-2"
                            >
                              {suggestion.status === "ACCEPTED" && <Check className="h-3 w-3 mr-1" />}
                              {suggestion.status === "REJECTED" && <X className="h-3 w-3 mr-1" />}
                              {suggestion.status === "PENDING" ? "Pendiente" : 
                               suggestion.status === "ACCEPTED" ? "Aceptada" : "Rechazada"}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Suggestion Modal */}
      <Dialog.Root 
        open={showSuggestionModal} 
        onOpenChange={(open) => {
          if (!open) {
            setNewSuggestion("")
          }
          setShowSuggestionModal(open)
        }}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
          <Dialog.Content className="fixed left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 z-[60] w-full max-w-2xl max-h-[90vh] bg-background rounded-xl shadow-2xl flex flex-col">
            <div className="flex items-center justify-between p-6 border-b">
              <Dialog.Title className="text-2xl font-bold text-foreground">
                Dejar una sugerencia
              </Dialog.Title>
              <Dialog.Close asChild>
                <button
                  aria-label="Close"
                  className="p-2 rounded-md hover:bg-muted"
                  onClick={() => {
                    setNewSuggestion("")
                    setShowSuggestionModal(false)
                  }}
                >
                  <X className="h-5 w-5" />
                </button>
              </Dialog.Close>
            </div>

            <div className="p-6 overflow-y-auto space-y-6">
              {/* Suggestion Content */}
              <div className="space-y-2">
                <Label htmlFor="suggestion-content" className="text-sm font-medium text-foreground">
                  Tu sugerencia *
                </Label>
                <Textarea
                  id="suggestion-content"
                  placeholder="Comparte tu sugerencia para mejorar este lugar..."
                  value={newSuggestion}
                  onChange={(e) => setNewSuggestion(e.target.value)}
                  rows={6}
                  className="resize-none"
                />
                <p className="text-xs text-muted-foreground">
                  Tu sugerencia será visible solo para ti hasta que sea aceptada o rechazada.
                </p>
              </div>

              {/* Submit Button */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  onClick={async (e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    
                    if (!isAuthenticated || !user?.id) {
                      toast.error("Debes iniciar sesión para publicar una sugerencia")
                      return
                    }

                    if (!newSuggestion.trim()) {
                      toast.error("Debes escribir una sugerencia")
                      return
                    }

                    try {
                      setSubmittingSuggestion(true)
                      await createSuggestion({
                        ownerId: user.id,
                        postId: placeId,
                        content: newSuggestion.trim(),
                      })
                      setNewSuggestion("")
                      setShowSuggestionModal(false)
                      toast.success("Sugerencia enviada correctamente")
                    } catch (e: any) {
                      console.error("No se pudo crear la sugerencia", e)
                      const raw = String(e?.message || e || "")
                      const match = raw.match(/\{[^}]*\}/)
                      let backendMsg: string | null = null
                      try {
                        backendMsg = match ? JSON.parse(match[0])?.mensaje || null : null
                      } catch {}
                      toast.error(backendMsg || "No se pudo crear la sugerencia. Intenta nuevamente.")
                    } finally {
                      setSubmittingSuggestion(false)
                    }
                  }}
                  disabled={submittingSuggestion || !newSuggestion.trim()}
                  className="flex-1 cursor-pointer"
                >
                  {submittingSuggestion && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {submittingSuggestion ? "Enviando..." : "Enviar sugerencia"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setNewSuggestion("")
                    setShowSuggestionModal(false)
                  }}
                  disabled={submittingSuggestion}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Image Modal */}
      <Dialog.Root 
        open={selectedImage !== null} 
        onOpenChange={(open) => {
          if (!open) {
            setSelectedImage(null)
            setSelectedImageIndex(0)
            setSelectedReviewImages([])
          }
        }}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/80 z-[70]" />
          <Dialog.Content className="fixed left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 z-[70] w-full max-w-4xl max-h-[90vh] bg-transparent flex items-center justify-center">
            <Dialog.Title className="sr-only">Imagen ampliada de la reseña</Dialog.Title>
            <div className="relative w-full h-full flex items-center justify-center">
              {selectedImage && (
                <>
                  <img
                    src={selectedImage}
                    alt={`Imagen ampliada ${selectedImageIndex + 1} de ${selectedReviewImages.length}`}
                    className="max-w-full max-h-[90vh] object-contain rounded-lg"
                  />
                  
                  {/* Navigation Arrows */}
                  {selectedReviewImages.length > 1 && (
                    <>
                      <button
                        aria-label="Imagen anterior"
                        className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={() => {
                          const newIndex = selectedImageIndex > 0 ? selectedImageIndex - 1 : selectedReviewImages.length - 1
                          setSelectedImageIndex(newIndex)
                          setSelectedImage(selectedReviewImages[newIndex])
                        }}
                      >
                        <ChevronLeft className="h-6 w-6" />
                      </button>
                      <button
                        aria-label="Imagen siguiente"
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={() => {
                          const newIndex = selectedImageIndex < selectedReviewImages.length - 1 ? selectedImageIndex + 1 : 0
                          setSelectedImageIndex(newIndex)
                          setSelectedImage(selectedReviewImages[newIndex])
                        }}
                      >
                        <ChevronRight className="h-6 w-6" />
                      </button>
                      
                      {/* Image Counter */}
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1 bg-black/50 text-white text-sm rounded-full">
                        {selectedImageIndex + 1} / {selectedReviewImages.length}
                      </div>
                    </>
                  )}
                </>
              )}
              <Dialog.Close asChild>
                <button
                  aria-label="Cerrar"
                  className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
                  onClick={() => {
                    setSelectedImage(null)
                    setSelectedImageIndex(0)
                    setSelectedReviewImages([])
                  }}
                >
                  <X className="h-6 w-6" />
                </button>
              </Dialog.Close>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  )
}
