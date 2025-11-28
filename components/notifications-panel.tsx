"use client"

import * as Dialog from "@radix-ui/react-dialog"
import { X, Bell, CheckCircle2, XCircle, ExternalLink, Circle, RefreshCw, Lightbulb, Star, MessageSquare, HelpCircle, ThumbsUp, ThumbsDown, Heart } from "lucide-react"
import { useNotifications } from "@/contexts/NotificationContext"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import { useState, useEffect } from "react"
import { fetchPlace } from "@/api/place"

type NotificationsPanelProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

// Componente para el link del post que intenta encontrar el tipo correcto
function PostLink({ postId, children }: { postId: string; children: React.ReactNode }) {
  const [postPath, setPostPath] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!postId) return

    const findPostType = async () => {
      setIsLoading(true)
      const collections = ["hotel", "restaurant", "activity"]
      
      for (const collection of collections) {
        try {
          const place = await fetchPlace(collection, postId)
          if (place) {
            // Encontró el post, construir la ruta
            setPostPath(`/${collection}/${postId}`)
            setIsLoading(false)
            return
          }
        } catch {
          continue
        }
      }
      
      // Si no se encontró en ninguna colección, usar hotel como fallback
      setPostPath(`/hotel/${postId}`)
      setIsLoading(false)
    }

    void findPostType()
  }, [postId])

  if (isLoading || !postPath) {
    return (
      <span className="text-xs text-muted-foreground flex items-center gap-1">
        {children}
      </span>
    )
  }

  return (
    <Link
      href={postPath}
      onClick={(e) => e.stopPropagation()}
      className="text-xs text-primary hover:underline flex items-center gap-1"
    >
      {children}
      <ExternalLink className="h-3 w-3" />
    </Link>
  )
}

export function NotificationsPanel({ open, onOpenChange }: NotificationsPanelProps) {
  const { notifications, unreadCount, isLoading, error, readIds, markAsRead, hideNotification, clearAll, refreshNotifications } = useNotifications()

  const handleNotificationClick = (notification: any) => {
    if (!readIds.has(notification.id)) {
      markAsRead(notification.id)
    }
  }

  const handleClearAll = async () => {
    try {
      await clearAll()
    } catch (error) {
      console.error("Error al limpiar todas las notificaciones:", error)
    }
  }

  const getNotificationIcon = (notification: any) => {
    switch (notification.type) {
      case "SUGGESTION_CREATED":
        return <Lightbulb className="h-5 w-5 text-yellow-500" />
      case "SUGGESTION_STATUS_CHANGED":
        if ("suggestionStatus" in notification.payload) {
          const payload = notification.payload as { suggestionStatus: string }
          return payload.suggestionStatus === "ACCEPTED" ? (
            <CheckCircle2 className="h-5 w-5 text-green-500" />
          ) : (
            <XCircle className="h-5 w-5 text-red-500" />
          )
        }
        return <Bell className="h-5 w-5" />
      case "REVIEW":
        return <Star className="h-5 w-5 text-yellow-500" />
      case "QUESTION":
        return <HelpCircle className="h-5 w-5 text-blue-500" />
      case "REPLIED_REVIEW":
      case "REPLIED_QUESTION":
        return <MessageSquare className="h-5 w-5 text-blue-500" />
      case "LIKE_COMMENT":
        return <ThumbsUp className="h-5 w-5 text-green-500" />
      case "DISLIKE_COMMENT":
        return <ThumbsDown className="h-5 w-5 text-red-500" />
      case "FAVORITE_POST_UPDATED":
        return <Heart className="h-5 w-5 text-pink-500" />
      default:
        return <Bell className="h-5 w-5" />
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
        <Dialog.Content className="fixed left-1/2 -translate-x-1/2 top-16 bottom-8 z-50 w-full max-w-2xl bg-background rounded-xl shadow-2xl flex flex-col">
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-3">
              <Dialog.Title className="text-2xl font-bold text-foreground flex items-center gap-2">
                <Bell className="h-6 w-6 text-primary" />
                Notificaciones
              </Dialog.Title>
              {unreadCount > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {unreadCount} nueva{unreadCount !== 1 ? "s" : ""}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => refreshNotifications()}
                disabled={isLoading}
                className="p-2 rounded-md hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label="Actualizar notificaciones"
                title="Actualizar notificaciones"
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
              </button>
              {notifications.length > 0 && (
                <button
                  onClick={handleClearAll}
                  className="text-sm text-muted-foreground hover:text-foreground px-2 py-1 rounded hover:bg-muted"
                >
                  Limpiar todo
                </button>
              )}
              <Dialog.Close asChild>
                <button aria-label="Close" className="p-2 rounded-md hover:bg-muted">
                  <X className="h-5 w-5" />
                </button>
              </Dialog.Close>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <p className="text-muted-foreground">Cargando notificaciones...</p>
              </div>
            ) : error ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-destructive">{error}</p>
                </CardContent>
              </Card>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Bell className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  No tienes notificaciones
                </h3>
                <p className="text-muted-foreground">
                  Te notificaremos cuando haya actualizaciones importantes
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {notifications.map((notification) => {
                  const isRead = readIds.has(notification.id)
                  const isSuggestionCreated = notification.type === "SUGGESTION_CREATED"
                  const isSuggestionStatus = notification.type === "SUGGESTION_STATUS_CHANGED"
                  const isReview = notification.type === "REVIEW"
                  const isQuestion = notification.type === "QUESTION"
                  const isRepliedReview = notification.type === "REPLIED_REVIEW"
                  const isRepliedQuestion = notification.type === "REPLIED_QUESTION"
                  const isLikeComment = notification.type === "LIKE_COMMENT"
                  const isDislikeComment = notification.type === "DISLIKE_COMMENT"
                  const isFavoritePostUpdated = notification.type === "FAVORITE_POST_UPDATED"
                  
                  // Para SUGGESTION_CREATED, mostrar enlace a página de sugerencias
                  const suggestionCreatedPayload = isSuggestionCreated && "postId" in notification.payload
                    ? notification.payload as { suggestionId: string; postId: string; content: string; suggestionStatus: string }
                    : null
                  
                  // Para SUGGESTION_STATUS_CHANGED, mostrar enlace al lugar
                  const suggestionStatusPayload = isSuggestionStatus && "postId" in notification.payload 
                    ? notification.payload as { suggestionId: string; postId: string; content: string; suggestionStatus: string }
                    : null
                  
                  // Para REVIEW, mostrar enlace al lugar
                  const reviewPayload = isReview && "postId" in notification.payload
                    ? notification.payload as { commentId: string; comment: string; postId: string }
                    : null
                  
                  // Para QUESTION, mostrar enlace al lugar
                  const questionPayload = isQuestion && "postId" in notification.payload
                    ? notification.payload as { commentId: string; comment: string; postId: string }
                    : null
                  
                  // Para REPLIED_REVIEW y REPLIED_QUESTION, mostrar enlace al lugar
                  const replyPayload = (isRepliedReview || isRepliedQuestion) && "postId" in notification.payload
                    ? notification.payload as { commentId: string; comment: string; postId: string }
                    : null
                  
                  // Para LIKE_COMMENT y DISLIKE_COMMENT, mostrar enlace al lugar
                  const likeCommentPayload = (isLikeComment || isDislikeComment) && "postId" in notification.payload
                    ? notification.payload as { commentId: string; comment: string; postId: string }
                    : null
                  
                  // Para FAVORITE_POST_UPDATED, mostrar enlace al lugar
                  const favoritePostUpdatedPayload = isFavoritePostUpdated && "postId" in notification.payload
                    ? notification.payload as { postId: string; postType: string; postName: string; changes: Record<string, { old: unknown; new: unknown }> }
                    : null

                  return (
                    <Card
                      key={notification.id}
                      className={`transition-all cursor-pointer hover:shadow-md ${
                        !isRead ? "border-primary/50 bg-primary/5" : ""
                      }`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="mt-1">
                            {getNotificationIcon(notification)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <p className={`text-sm font-medium ${!isRead ? "text-foreground" : "text-muted-foreground"}`}>
                                {notification.message}
                              </p>
                              {!isRead && (
                                <Badge 
                                  variant="default" 
                                  className="h-3.5 px-1.5 py-0 text-[10px] font-semibold shrink-0 flex items-center justify-center"
                                >
                                  Nuevo
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              {formatDistanceToNow(new Date(notification.createdAt), {
                                addSuffix: true,
                                locale: es,
                              })}
                            </p>
                            {suggestionCreatedPayload && (
                              <div className="mt-3 flex items-center gap-2">
                                <Link
                                  href={`/sugerencias/${suggestionCreatedPayload.postId}`}
                                  onClick={(e) => e.stopPropagation()}
                                  className="text-xs text-primary hover:underline flex items-center gap-1"
                                >
                                  Ver sugerencias
                                  <ExternalLink className="h-3 w-3" />
                                </Link>
                              </div>
                            )}
                            {suggestionStatusPayload && (
                              <div className="mt-3 flex items-center gap-2">
                                <PostLink postId={suggestionStatusPayload.postId}>
                                  Ver lugar
                                </PostLink>
                              </div>
                            )}
                            {reviewPayload && (
                              <div className="mt-3 flex items-center gap-2">
                                <PostLink postId={reviewPayload.postId}>
                                  Ver lugar
                                </PostLink>
                              </div>
                            )}
                            {questionPayload && (
                              <div className="mt-3 flex items-center gap-2">
                                <PostLink postId={questionPayload.postId}>
                                  Ver lugar
                                </PostLink>
                              </div>
                            )}
                            {replyPayload && (
                              <div className="mt-3 flex items-center gap-2">
                                <PostLink postId={replyPayload.postId}>
                                  Ver lugar
                                </PostLink>
                              </div>
                            )}
                            {likeCommentPayload && (
                              <div className="mt-3 flex items-center gap-2">
                                <PostLink postId={likeCommentPayload.postId}>
                                  Ver lugar
                                </PostLink>
                              </div>
                            )}
                            {favoritePostUpdatedPayload && (
                              <div className="mt-3 flex items-center gap-2">
                                <PostLink postId={favoritePostUpdatedPayload.postId}>
                                  Ver lugar
                                </PostLink>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
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

