"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Star, ThumbsUp } from "lucide-react"
import { Progress } from "@/components/ui/progress"

interface Review {
  id: number
  author: string
  avatar?: string
  rating: number
  date: string
  comment: string
  helpful: number
}

interface ReviewsSectionProps {
  placeId: string
  averageRating: number
  totalReviews: number
}

const mockReviews: Review[] = [
  {
    id: 1,
    author: "María González",
    rating: 5,
    date: "Hace 2 semanas",
    comment:
      "Experiencia increíble! El servicio fue excepcional y las instalaciones están impecables. Definitivamente volveré y lo recomiendo ampliamente.",
    helpful: 12,
  },
  {
    id: 2,
    author: "Carlos Ramírez",
    rating: 4,
    date: "Hace 1 mes",
    comment:
      "Muy buena opción, aunque un poco caro. La ubicación es excelente y el personal muy amable. Solo le faltaría mejorar algunos detalles menores.",
    helpful: 8,
  },
  {
    id: 3,
    author: "Ana Martínez",
    rating: 5,
    date: "Hace 2 meses",
    comment:
      "Superó todas mis expectativas. Desde la reservación hasta el check-out todo fue perfecto. Las amenidades son de primera calidad.",
    helpful: 15,
  },
  {
    id: 4,
    author: "Luis Hernández",
    rating: 4,
    date: "Hace 3 meses",
    comment: "Buena relación calidad-precio. El lugar es hermoso y bien mantenido. La comida estuvo deliciosa.",
    helpful: 6,
  },
]

export function ReviewsSection({ placeId, averageRating, totalReviews }: ReviewsSectionProps) {
  const [reviews] = useState<Review[]>(mockReviews)
  const [newReview, setNewReview] = useState("")
  const [newRating, setNewRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)

  const ratingDistribution = [
    { stars: 5, percentage: 65, count: Math.floor(totalReviews * 0.65) },
    { stars: 4, percentage: 20, count: Math.floor(totalReviews * 0.2) },
    { stars: 3, percentage: 10, count: Math.floor(totalReviews * 0.1) },
    { stars: 2, percentage: 3, count: Math.floor(totalReviews * 0.03) },
    { stars: 1, percentage: 2, count: Math.floor(totalReviews * 0.02) },
  ]

  const handleSubmitReview = () => {
    if (newReview.trim() && newRating > 0) {
      // In a real app, this would send to an API
      console.log("New review:", { rating: newRating, comment: newReview })
      setNewReview("")
      setNewRating(0)
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
              <div className="text-5xl font-bold text-foreground mb-2">{averageRating}</div>
              <div className="flex items-center gap-1 mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-5 w-5 ${
                      star <= Math.round(averageRating) ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"
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
                  <AvatarImage src={review.avatar || "/placeholder.svg"} alt={review.author} />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {review.author
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-semibold text-foreground">{review.author}</h4>
                      <p className="text-sm text-muted-foreground">{review.date}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-4 w-4 ${
                            star <= review.rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <p className="text-foreground leading-relaxed mb-4">{review.comment}</p>

                  <div className="flex items-center gap-4">
                    <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                      <ThumbsUp className="h-4 w-4" />
                      <span>Útil ({review.helpful})</span>
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
