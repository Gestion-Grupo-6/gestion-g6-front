"use client"

import * as Dialog from "@radix-ui/react-dialog"
import { X, Star } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { fetchReviewsByPost } from "@/api/review"
import type { CommentResponse } from "@/types/review"
import { fetchUser } from "@/api/user"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { useAuth } from "@/contexts/AuthContext"

type ReviewsPanelProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  placeId: string
}

export function ReviewsPanel({ open, onOpenChange, placeId }: ReviewsPanelProps) {
  const { user, isAuthenticated } = useAuth()
  const [reviews, setReviews] = useState<CommentResponse[]>([])
  const [authorById, setAuthorById] = useState<Record<string, string>>({})

  useEffect(() => {
    if (!open) return
    const load = async () => {
      try {
        const data = await fetchReviewsByPost(placeId)
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
        setReviews(data)
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error("No se pudieron cargar reseñas", e)
      }
    }
    void load()
  }, [open, placeId])

  const totalReviews = reviews.length
  const averageRating = useMemo(() => {
    if (!reviews.length) return 0
    const stars = reviews
      .map((r) => r.ratings)
      .filter(Boolean)
      .map((rt) => {
        const vals = [rt!.cleanliness, rt!.service, rt!.location].filter((n) => typeof n === "number") as number[]
        if (!vals.length) return 0
        return vals.reduce((a, b) => a + b, 0) / vals.length
      })
    if (!stars.length) return 0
    return Number((stars.reduce((a, b) => a + b, 0) / stars.length).toFixed(1))
  }, [reviews])

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
        <Dialog.Content className="fixed left-1/2 -translate-x-1/2 top-16 bottom-8 z-50 w-full max-w-3xl bg-background rounded-xl shadow-2xl flex flex-col">
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-3">
              <Dialog.Title className="text-2xl font-bold text-foreground">Reseñas y preguntas</Dialog.Title>
              <div className="flex items-center gap-1">
                <span className="text-xl font-semibold text-foreground">{averageRating}</span>
                <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                <span className="text-sm text-muted-foreground">({totalReviews})</span>
              </div>
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
                  const stars = Math.round(((review.ratings?.cleanliness ?? 0) + (review.ratings?.service ?? 0) + (review.ratings?.location ?? 0)) / ([(review.ratings?.cleanliness),(review.ratings?.service),(review.ratings?.location)].filter((n)=>typeof n === 'number').length || 1))
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
                              <img key={idx} src={src} alt="review" className="w-full h-24 object-cover rounded-md border" />
                            ))}
                          </div>
                        )}
                        {Array.isArray(review.replies) && review.replies.length > 0 && (
                          <div className="mt-2 space-y-2 border-t pt-2">
                            {review.replies.map((rep) => (
                              <div key={rep.id} className="text-sm">
                                 <span className="font-medium">{authorById[rep.ownerId] || "Usuario"}:</span> {rep.comment}
                              </div>
                            ))}
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


