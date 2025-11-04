"use client"

import { useEffect, useMemo, useState } from "react"
import * as Dialog from "@radix-ui/react-dialog"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Star, ThumbsUp, X, Upload, Loader2 } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { fetchReviewsByPost, createReview, likeComment, uploadReviewImage } from "@/api/review"
import { fetchUser } from "@/api/user"
import type { CommentResponse } from "@/types/review"
import { useAuth } from "@/contexts/AuthContext"
import { toast } from "sonner"
import { getImage } from "@/contexts/SupabaseContext"

interface ReviewsSectionProps {
  placeId: string
  averageRating: number
  totalReviews: number
}

export function ReviewsSection({ placeId, averageRating, totalReviews }: ReviewsSectionProps) {
  const { user, isAuthenticated } = useAuth()
  const [reviews, setReviews] = useState<CommentResponse[]>([])
  const [newReview, setNewReview] = useState("")
  const [ratings, setRatings] = useState({
    cleanliness: 0,
    service: 0,
    location: 0,
  })
  const [submitting, setSubmitting] = useState(false)
  const [uploadingImages, setUploadingImages] = useState(false)
  const [authorById, setAuthorById] = useState<Record<string, string>>({})
  const [profilePhotoById, setProfilePhotoById] = useState<Record<string, string>>({})
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])

  // Debug: Monitorear estados del formulario
  useEffect(() => {
    if (showReviewModal) {
      console.log("📊 Estados del formulario de reseña:", {
        newReview: newReview.trim(),
        ratings,
        submitting,
        uploadingImages,
        selectedFilesCount: selectedFiles.length,
        isDisabled: submitting || uploadingImages || !newReview.trim() || (ratings.cleanliness === 0 && ratings.service === 0 && ratings.location === 0)
      })
    }
  }, [showReviewModal, newReview, ratings, submitting, uploadingImages, selectedFiles.length])

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

  const derivedAverage = useMemo(() => {
    if (!reviews.length) return averageRating
    const stars = reviews
      .map((r) => r.ratings)
      .filter(Boolean)
      .map((rt) => {
        const vals = [rt!.cleanliness, rt!.service, rt!.location].filter((n) => typeof n === "number") as number[]
        if (!vals.length) return 0
        return vals.reduce((a, b) => a + b, 0) / vals.length
      })
    if (!stars.length) return averageRating
    return Number((stars.reduce((a, b) => a + b, 0) / stars.length).toFixed(1))
  }, [reviews, averageRating])

  const ratingDistribution = useMemo(() => {
    // Simple distribución basada en promedio (placeholder). Se puede reemplazar cuando backend provea histograma.
    return [
      { stars: 5, percentage: 65, count: Math.floor(totalReviews * 0.65) },
      { stars: 4, percentage: 20, count: Math.floor(totalReviews * 0.2) },
      { stars: 3, percentage: 10, count: Math.floor(totalReviews * 0.1) },
      { stars: 2, percentage: 3, count: Math.floor(totalReviews * 0.03) },
      { stars: 1, percentage: 2, count: Math.floor(totalReviews * 0.02) },
    ]
  }, [totalReviews])

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
    // Limpiar URL del preview
    URL.revokeObjectURL(imagePreviews[index])
    
    // Remover de los arrays
    const newFiles = selectedFiles.filter((_, i) => i !== index)
    const newPreviews = imagePreviews.filter((_, i) => i !== index)
    
    setSelectedFiles(newFiles)
    setImagePreviews(newPreviews)
  }

  const resetReviewForm = () => {
    // Limpiar URLs de preview para evitar memory leaks
    imagePreviews.forEach(url => URL.revokeObjectURL(url))
    setNewReview("")
    setRatings({ cleanliness: 0, service: 0, location: 0 })
    setSelectedFiles([])
    setImagePreviews([])
  }

  const handleSubmitReview = async (e?: React.MouseEvent) => {
    console.log("🔵 handleSubmitReview llamado")
    console.log("🔵 Event:", e)
    e?.preventDefault()
    e?.stopPropagation()
    
    console.log("🔵 Estado actual:", {
      isAuthenticated,
      userId: user?.id,
      newReview: newReview.trim(),
      ratings,
      submitting,
      uploadingImages
    })
    
    if (!isAuthenticated || !user?.id) {
      console.log("❌ No autenticado o sin usuario")
      toast.error("Debes iniciar sesión para publicar una reseña")
      return
    }
    
    // Validar que haya al menos un rating
    const hasRating = ratings.cleanliness > 0 || ratings.service > 0 || ratings.location > 0
    if (!hasRating) {
      toast.error("Debes calificar al menos una categoría")
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

      const payload = {
        ownerId: user.id,
        postId: placeId,
        comment: newReview.trim(),
        ratings: {
          cleanliness: ratings.cleanliness > 0 ? ratings.cleanliness : undefined,
          service: ratings.service > 0 ? ratings.service : undefined,
          location: ratings.location > 0 ? ratings.location : undefined,
        },
        images: uploadedImagePaths.length > 0 ? uploadedImagePaths : undefined,
      }
      
      await createReview(payload)
      const data = await fetchReviewsByPost(placeId)
      setReviews(data)
      resetReviewForm()
      setShowReviewModal(false)
      toast.success("Reseña publicada correctamente")
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
    label 
  }: {
    value: number
    onStarClick: (star: number) => void
    label: string
  }) => {
    return (
      <div className="space-y-2">
        <Label className="text-sm font-medium text-foreground">{label}</Label>
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                console.log(`⭐ Click en estrella ${star} para ${label}`)
                onStarClick(star)
              }}
              className="transition-transform hover:scale-110 cursor-pointer"
            >
              <Star
                className={`h-6 w-6 ${
                  star <= value
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-muted-foreground"
                }`}
              />
            </button>
          ))}
          {value > 0 && <span className="ml-2 text-sm text-muted-foreground">({value}/5)</span>}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <h2 className="text-2xl font-bold text-foreground mb-6">Valoraciones y reseñas</h2>

          {/* Rating Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div className="flex flex-col items-center justify-center p-6 bg-muted/30 rounded-lg">
              <div className="text-5xl font-bold text-foreground mb-2">{derivedAverage}</div>
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

          {/* Write Review Button */}
          <div className="border-t border-border pt-6">
            {isAuthenticated ? (
              <Button 
                onClick={() => {
                  console.log("🟡 Abriendo modal de reseña")
                  console.log("🟡 Estado inicial:", {
                    newReview,
                    ratings,
                    submitting,
                    uploadingImages
                  })
                  setShowReviewModal(true)
                }} 
                className="w-full sm:w-auto"
              >
                Escribir reseña
              </Button>
            ) : (
              <p className="text-sm text-muted-foreground">Inicia sesión para escribir una reseña</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Review Modal */}
      <Dialog.Root 
        open={showReviewModal} 
        onOpenChange={(open) => {
          console.log("🟡 Modal cambio:", open)
          if (!open) {
            console.log("🟡 Cerrando modal, reseteando formulario")
            resetReviewForm()
          }
          setShowReviewModal(open)
        }}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
          <Dialog.Content className="fixed left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 z-[60] w-full max-w-2xl max-h-[90vh] bg-background rounded-xl shadow-2xl flex flex-col">
            <div className="flex items-center justify-between p-6 border-b">
              <Dialog.Title className="text-2xl font-bold text-foreground">Escribir reseña</Dialog.Title>
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
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">Calificaciones</h3>
                <StarRating
                  value={ratings.cleanliness}
                  onStarClick={(star) => {
                    console.log(`🟢 onStarClick Limpieza: ${star}`)
                    setRatings((prev) => {
                      const updated = { ...prev, cleanliness: star }
                      console.log(`🟢 Ratings actualizados:`, updated)
                      return updated
                    })
                  }}
                  label="Limpieza"
                />
                <StarRating
                  value={ratings.service}
                  onStarClick={(star) => {
                    console.log(`🟢 onStarClick Servicio: ${star}`)
                    setRatings((prev) => {
                      const updated = { ...prev, service: star }
                      console.log(`🟢 Ratings actualizados:`, updated)
                      return updated
                    })
                  }}
                  label="Servicio"
                />
                <StarRating
                  value={ratings.location}
                  onStarClick={(star) => {
                    console.log(`🟢 onStarClick Ubicación: ${star}`)
                    setRatings((prev) => {
                      const updated = { ...prev, location: star }
                      console.log(`🟢 Ratings actualizados:`, updated)
                      return updated
                    })
                  }}
                  label="Ubicación"
                />
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
                {(() => {
                  const isDisabled = submitting || uploadingImages || !newReview.trim() || (ratings.cleanliness === 0 && ratings.service === 0 && ratings.location === 0)
                  console.log("🔵 Estado del botón:", {
                    submitting,
                    uploadingImages,
                    hasReview: !!newReview.trim(),
                    ratings,
                    isDisabled,
                    disabledReasons: {
                      submitting,
                      uploadingImages,
                      noReview: !newReview.trim(),
                      noRatings: ratings.cleanliness === 0 && ratings.service === 0 && ratings.location === 0
                    }
                  })
                  return null
                })()}
                <Button
                  type="button"
                  onClick={(e) => {
                    console.log("🟢 Botón clickeado!")
                    console.log("🟢 Event:", e)
                    e.preventDefault()
                    e.stopPropagation()
                    console.log("🟢 Llamando handleSubmitReview...")
                    void handleSubmitReview(e)
                  }}
                  disabled={submitting || uploadingImages || !newReview.trim() || (ratings.cleanliness === 0 && ratings.service === 0 && ratings.location === 0)}
                  className="flex-1 cursor-pointer"
                >
                  {(submitting || uploadingImages) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {uploadingImages ? "Subiendo imágenes..." : submitting ? "Publicando..." : "Publicar reseña"}
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

      {/* Reviews List */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-foreground">Reseñas de usuarios</h3>

        {reviews.map((review) => {
          const avgRating = (() => {
            const vals = [
              review.ratings?.cleanliness,
              review.ratings?.service,
              review.ratings?.location
            ].filter((n) => typeof n === "number") as number[]
            if (!vals.length) return 0
            return vals.reduce((a, b) => a + b, 0) / vals.length
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
                            className="w-full h-32 object-cover rounded-md border border-border"
                          />
                        ))}
                      </div>
                    )}

                    <div className="flex items-center gap-4">
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
    </div>
  )
}
