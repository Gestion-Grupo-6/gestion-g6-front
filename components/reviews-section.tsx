"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Star, ThumbsUp } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { fetchReviewsByPost, createReview, likeComment } from "@/api/review"
import { fetchUser } from "@/api/user"
import type { CommentResponse } from "@/types/review"
import { useAuth } from "@/contexts/AuthContext"
import { toast } from "sonner"

interface ReviewsSectionProps {
  placeId: string
  averageRating: number
  totalReviews: number
}

export function ReviewsSection({ placeId, averageRating, totalReviews }: ReviewsSectionProps) {
  const { user, isAuthenticated } = useAuth()
  const [reviews, setReviews] = useState<CommentResponse[]>([])
  const [newReview, setNewReview] = useState("")
  const [newRating, setNewRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [authorById, setAuthorById] = useState<Record<string, string>>({})

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchReviewsByPost(placeId)
        setReviews(data)
        const uniqueIds = Array.from(new Set(data.map((r) => r.ownerId).filter(Boolean)))
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

  const handleSubmitReview = async () => {
    if (!isAuthenticated || !user?.id) return
    if (!(newReview.trim() && newRating > 0)) return
    try {
      setSubmitting(true)
      const payload = {
        ownerId: user.id,
        postId: placeId,
        comment: newReview.trim(),
        ratings: { cleanliness: newRating, service: newRating, location: newRating },
      }
      await createReview(payload)
      const data = await fetchReviewsByPost(placeId)
      setReviews(data)
      setNewReview("")
      setNewRating(0)
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

          {/* Write Review */}
          <div className="border-t border-border pt-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Escribe tu reseña</h3>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Tu calificación</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setNewRating(star)}
                      onMouseEnter={() => setHoveredRating(star)}
                      onMouseLeave={() => setHoveredRating(0)}
                      className="transition-transform hover:scale-110"
                    >
                      <Star
                        className={`h-8 w-8 ${
                          star <= (hoveredRating || newRating)
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-muted-foreground"
                        }`}
                      />
                    </button>
                  ))}
                  {newRating > 0 && <span className="ml-2 text-sm text-muted-foreground">({newRating}/5)</span>}
                </div>
              </div>

              <div>
                <label htmlFor="review-comment" className="text-sm font-medium text-foreground mb-2 block">
                  Tu comentario
                </label>
                <Textarea
                  id="review-comment"
                  placeholder="Comparte tu experiencia..."
                  value={newReview}
                  onChange={(e) => setNewReview(e.target.value)}
                  rows={4}
                  className="resize-none"
                />
              </div>

              <Button onClick={handleSubmitReview} disabled={!newReview.trim() || newRating === 0}>
                Publicar reseña
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reviews List */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-foreground">Reseñas de usuarios</h3>

        {reviews.map((review) => (
          <Card key={review.id}>
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={(review as any).avatar || "/placeholder.svg"} alt={authorById[review.ownerId] || review.ownerId} />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {(authorById[review.ownerId] || review.ownerId)
                      .split(" ")
                      .filter(Boolean)
                      .map((n) => n[0])
                      .join("")
                      .slice(0,2)
                      .toUpperCase() || "US"}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-semibold text-foreground">{authorById[review.ownerId] || review.ownerId}</h4>
                      <p className="text-sm text-muted-foreground">{new Date(review.timestamp).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-4 w-4 ${
                            star <= Math.round(((review.ratings?.cleanliness ?? 0) + (review.ratings?.service ?? 0) + (review.ratings?.location ?? 0)) / ([(review.ratings?.cleanliness),(review.ratings?.service),(review.ratings?.location)].filter((n)=>typeof n === 'number').length || 1))
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-muted-foreground"
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <p className="text-foreground leading-relaxed mb-4">{review.comment}</p>

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
        ))}
      </div>
    </div>
  )
}
