"use client"

import * as Dialog from "@radix-ui/react-dialog"
import * as Popover from "@radix-ui/react-popover"
import { X, Star, ChevronDown } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { fetchReviewsByPost, addReply } from "@/api/review"
import type { CommentResponse } from "@/types/review"
import { fetchUser } from "@/api/user"
import { fetchPlace } from "@/api/place"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { useAuth } from "@/contexts/AuthContext"
import { getImage } from "@/contexts/SupabaseContext"
import type { Place } from "@/types/place"

type ReviewsPanelProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  placeId: string
}

// Función para traducir los tipos de rating a español
// Solo incluye los ratings que realmente existen en el sistema
const getRatingTypeLabel = (type: string): string => {
  const labels: Record<string, string> = {
    general: "General",
    service: "Servicio",
    location: "Ubicación",
  }
  return labels[type.toLowerCase()] || type.charAt(0).toUpperCase() + type.slice(1)
}

export function ReviewsPanel({ open, onOpenChange, placeId }: ReviewsPanelProps) {
  const { user, isAuthenticated } = useAuth()
  const [reviews, setReviews] = useState<CommentResponse[]>([])
  const [authorById, setAuthorById] = useState<Record<string, string>>({})
  const [place, setPlace] = useState<Place | null>(null)
  const [ratingsPopoverOpen, setRatingsPopoverOpen] = useState(false)
  const [replyText, setReplyText] = useState<Record<string, string>>({})
  const [showReplies, setShowReplies] = useState<Record<string, boolean>>({})

  async function loadReviews() {
    try {
      const data = await fetchReviewsByPost(placeId)
      const uniqueIds = Array.from(new Set(
        data.flatMap((r) => [r.ownerId, ...(Array.isArray(r.replies) ? r.replies.map((rep) => rep.ownerId) : [])]).filter(Boolean)
      ))
      const entries = await Promise.all(
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
      setAuthorById(Object.fromEntries(entries))
      setReviews(data)

      // set default showReplies false for each review
      const repliesState: Record<string, boolean> = {}
      data.forEach((r) => { repliesState[r.id] = false })
      setShowReplies(repliesState)

      // Intentar cargar el lugar para obtener ratingAverage
      const collections = ["hotel", "restaurant", "activity"]
      for (const collection of collections) {
        try {
          const fetchedPlace = await fetchPlace(collection, placeId)
          if (fetchedPlace) {
            setPlace(fetchedPlace)
            break
          }
        } catch {
          continue
        }
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error("No se pudieron cargar reseñas", e)
    }
  }

  useEffect(() => {
    if (!open) return
    void loadReviews()
  }, [open, placeId])

  async function handleReply(commentId: string) {
    const text = (replyText[commentId] || "").trim()
    if (!text) {
      toast.error("Escribe una respuesta antes de enviar")
      return
    }
    if (!isAuthenticated || !user?.id) {
      toast.error("Debes iniciar sesión para responder")
      return
    }
    try {
      await addReply(commentId, { ownerId: user.id, comment: text })
      // clear and refresh
      setReplyText((s) => ({ ...s, [commentId]: "" }))
      await loadReviews()
      setShowReplies((s) => ({ ...s, [commentId]: true }))
      toast.success("Respuesta publicada")
    } catch (err: any) {
      console.error("Failed to post reply", err)
      toast.error(err?.message || "No se pudo publicar la respuesta")
    }
  }

  const totalReviews = reviews.length
  const averageRating = useMemo(() => {
    if (place) {
      return ((place as any).ratingAverage ?? place.rating ?? 0).toFixed(1)
    }
    return "0.0"
  }, [place])

  // Obtener ratings específicos del lugar
  const specificRatings = useMemo(() => {
    if (!place?.ratings) return []
    return Object.entries(place.ratings)
      .filter(([type]) => type.toLowerCase() !== 'general') // Excluir general ya que se muestra arriba
      .map(([type, data]) => {
        const avg = typeof data.average === 'number' ? data.average : parseFloat(String(data.average)) || 0
        const count = typeof data.numberOfRatings === 'number' ? data.numberOfRatings : parseInt(String(data.numberOfRatings), 10) || 0
        return {
          type,
          label: getRatingTypeLabel(type),
          average: avg.toFixed(1),
          numberOfRatings: count,
        }
      })
      .sort((a, b) => a.label.localeCompare(b.label))
  }, [place])

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
        <Dialog.Content className="fixed left-1/2 -translate-x-1/2 top-16 bottom-8 z-50 w-full max-w-3xl bg-background rounded-xl shadow-2xl flex flex-col">
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-3 flex-wrap">
              <Dialog.Title className="text-2xl font-bold text-foreground">Reseñas y preguntas</Dialog.Title>
              <div className="flex items-center gap-1">
                <span className="text-xl font-semibold text-foreground">{averageRating}</span>
                <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                <span className="text-sm text-muted-foreground">({totalReviews})</span>
              </div>
              {specificRatings.length > 0 && (
                <Popover.Root open={ratingsPopoverOpen} onOpenChange={setRatingsPopoverOpen}>
                  <Popover.Trigger asChild>
                    <button
                      type="button"
                      className="inline-flex items-center justify-center gap-2 rounded-md border border-input bg-background px-3 py-1.5 text-sm font-medium text-foreground hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                    >
                      <span>Ratings específicos</span>
                      <ChevronDown className={`h-4 w-4 transition-transform ${ratingsPopoverOpen ? 'rotate-180' : ''}`} />
                    </button>
                  </Popover.Trigger>
                  <Popover.Portal>
                    <Popover.Content
                      className="rounded-md border border-border bg-background shadow-lg z-50 min-w-[280px] p-2"
                      sideOffset={5}
                    >
                      <div className="space-y-1">
                        <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                          Ratings por categoría
                        </div>
                        {specificRatings.map((rating) => (
                          <div
                            key={rating.type}
                            className="flex items-center justify-between gap-3 rounded-sm px-2 py-1.5 hover:bg-muted"
                          >
                            <span className="text-sm font-medium text-foreground">{rating.label}</span>
                            <div className="flex items-center gap-1">
                              <span className="text-sm font-semibold text-foreground">{rating.average}</span>
                              <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                              <span className="text-xs text-muted-foreground">({rating.numberOfRatings})</span>
                            </div>
                          </div>
                        ))}
                      </div>
                      <Popover.Arrow className="fill-border" />
                    </Popover.Content>
                  </Popover.Portal>
                </Popover.Root>
              )}
            </div>
            <Dialog.Close asChild>
              <button aria-label="Close" className="p-2 rounded-md hover:bg-muted">
                <X className="h-5 w-5" />
              </button>
            </Dialog.Close>
          </div>

          <div className="grid grid-cols-1 p-4 overflow-y-auto">
            <div className="space-y-4">
              {reviews.length === 0 ? (
                <Card>
                  <CardContent className="p-6 text-center text-muted-foreground">
                    Aún no se recibieron comentarios.
                  </CardContent>
                </Card>
              ) : (
                reviews.map((review) => {
                  const name = authorById[review.ownerId] || "Usuario"
                  // Usar el rating "general" directamente (obligatorio)
                  const stars = (() => {
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
                    
                    return generalScore ? Math.round(generalScore) : 0
                  })()
                  return (
                    <Card key={review.id}>
                      <CardContent className="p-6 space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="font-semibold text-foreground">{name}</div>
                            <div className="text-sm text-muted-foreground">{new Date(review.timestamp).toLocaleDateString()}</div>
                          </div>
                          <div className="flex items-center gap-1">
                            {[1,2,3,4,5].map((s)=> (
                              <Star key={s} className={`h-4 w-4 ${s <= stars ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`} />
                            ))}
                          </div>
                        </div>
                        {review.comment && <div className="text-foreground">{review.comment}</div>}
                        {Array.isArray(review.images) && review.images.length > 0 && (
                          <div className="grid grid-cols-3 gap-2">
                            {review.images.map((src, idx) => (
                              <img 
                                key={idx} 
                                src={getImage(src)} 
                                alt="review" 
                                className="w-full h-24 object-cover rounded-md border"
                                onError={(e) => {
                                  // Si falla la carga, mostrar placeholder
                                  e.currentTarget.src = "/placeholder.svg"
                                }}
                              />
                            ))}
                          </div>
                        )}
                        {Array.isArray(review.replies) && review.replies.length > 0 && (
                          <div className="mt-2">
                            <button
                              type="button"
                              className="text-sm text-primary hover:underline"
                              onClick={() => setShowReplies((s) => ({ ...s, [review.id]: !s[review.id] }))}
                            >
                              {showReplies[review.id] ? "Ocultar respuesta" : `Ver mi respuesta (${review.replies.length})`}
                            </button>

                            {showReplies[review.id] && (
                              <div className="mt-2 space-y-2 border-t pt-2">
                                {review.replies.map((rep) => (
                                  <div key={rep.id} className="text-sm">
                                     <span className="font-medium">{authorById[rep.ownerId] || "Usuario"}:</span> {rep.comment}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                        {(!Array.isArray(review.replies) || review.replies.length === 0) && (
                          <div className="mt-3">
                            <Textarea
                              value={replyText[review.id] || ""}
                              onChange={(e) => setReplyText((s) => ({ ...s, [review.id]: e.target.value }))}
                              placeholder="Responder"
                              rows={2}
                            />
                            <div className="flex justify-end mt-1">
                              <Button size="sm" onClick={() => handleReply(review.id)} disabled={!isAuthenticated || !(replyText[review.id] || "").trim()}>
                                Responder
                              </Button>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )
                })
              )}
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
