"use client"

import * as Dialog from "@radix-ui/react-dialog"
import { X, Heart, Hotel, UtensilsCrossed, Activity } from "lucide-react"
import { useEffect, useState } from "react"
import { fetchLikedPosts, type LikedPost } from "@/api/user"
import { Card, CardContent } from "@/components/ui/card"
import { useAuth } from "@/contexts/AuthContext"
import { getImage } from "@/contexts/SupabaseContext"
import Link from "next/link"

type FavoritesPanelProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function FavoritesPanel({ open, onOpenChange }: FavoritesPanelProps) {
  const { user } = useAuth()
  const [likedPosts, setLikedPosts] = useState<LikedPost[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open || !user?.id) return
    
    const load = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await fetchLikedPosts(user.id)
        setLikedPosts(data)
      } catch (e: any) {
        console.error("No se pudieron cargar favoritos", e)
        setError(e?.message || "Error al cargar favoritos")
      } finally {
        setLoading(false)
      }
    }
    void load()
  }, [open, user?.id])

  const getCategoryIcon = (type: string) => {
    switch (type) {
      case "HOTEL":
        return <Hotel className="h-5 w-5" />
      case "RESTAURANT":
        return <UtensilsCrossed className="h-5 w-5" />
      case "ACTIVITY":
        return <Activity className="h-5 w-5" />
      default:
        return <Hotel className="h-5 w-5" />
    }
  }

  const getCategoryLabel = (type: string) => {
    switch (type) {
      case "HOTEL":
        return "Hotel"
      case "RESTAURANT":
        return "Restaurante"
      case "ACTIVITY":
        return "Actividad"
      default:
        return type
    }
  }

  const getCategoryPath = (type: string) => {
    switch (type) {
      case "HOTEL":
        return "hotel"
      case "RESTAURANT":
        return "restaurant"
      case "ACTIVITY":
        return "activity"
      default:
        return "hotel"
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
        <Dialog.Content className="fixed left-1/2 -translate-x-1/2 top-16 bottom-8 z-50 w-full max-w-3xl bg-background rounded-xl shadow-2xl flex flex-col">
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-3">
              <Dialog.Title className="text-2xl font-bold text-foreground flex items-center gap-2">
                <Heart className="h-6 w-6 text-primary fill-primary" />
                Mis Favoritos
              </Dialog.Title>
              <span className="text-sm text-muted-foreground">({likedPosts.length})</span>
            </div>
            <Dialog.Close asChild>
              <button aria-label="Close" className="p-2 rounded-md hover:bg-muted">
                <X className="h-5 w-5" />
              </button>
            </Dialog.Close>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <p className="text-muted-foreground">Cargando favoritos...</p>
              </div>
            ) : error ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-destructive">{error}</p>
                </CardContent>
              </Card>
            ) : likedPosts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Heart className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  No tienes favoritos aún
                </h3>
                <p className="text-muted-foreground">
                  Explora lugares y marca tus favoritos para encontrarlos fácilmente
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {likedPosts.map((post) => {
                  const imageUrl = post.images && post.images.length > 0
                    ? getImage(post.images[0]) || "/placeholder.svg"
                    : "/placeholder.svg"
                  const categoryPath = getCategoryPath(post.type)
                  
                  return (
                    <Link key={post.id} href={`/${categoryPath}/${post.id}`}>
                      <Card className="group overflow-hidden transition-all hover:shadow-lg h-full">
                        <div className="relative aspect-[4/3] overflow-hidden max-h-64">
                          <img
                            src={imageUrl}
                            alt={post.name}
                            className="object-cover w-full h-full max-w-full max-h-full transition-transform group-hover:scale-105"
                          />
                          <div className="absolute top-3 left-3 flex items-center gap-2">
                            {getCategoryIcon(post.type)}
                            <span className="text-xs font-medium bg-background/90 px-2 py-1 rounded">
                              {getCategoryLabel(post.type)}
                            </span>
                          </div>
                        </div>
                        <CardContent className="p-4">
                          <h3 className="font-semibold text-lg text-foreground line-clamp-1">
                            {post.name}
                          </h3>
                        </CardContent>
                      </Card>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
