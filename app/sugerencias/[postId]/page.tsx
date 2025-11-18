"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { toast } from "sonner"
import { Header } from "@/components/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Loader2, Check, X, Lightbulb } from "lucide-react"
import { fetchSuggestionsByPost, acceptSuggestion, rejectSuggestion } from "@/api/suggestion"
import { fetchPlace } from "@/api/place"
import type { SuggestionResponse } from "@/types/suggestion"
import type { Place } from "@/types/place"
import { useAuth } from "@/contexts/AuthContext"

export default function SugerenciasPage() {
  const params = useParams()
  const router = useRouter()
  const postId = params.postId as string
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()

  const [suggestions, setSuggestions] = useState<SuggestionResponse[]>([])
  const [place, setPlace] = useState<Place | null>(null)
  const [loading, setLoading] = useState(true)
  const [processingId, setProcessingId] = useState<string | null>(null)

  useEffect(() => {
    if (!postId) return
    
    // Esperar a que la autenticación termine de cargar
    if (authLoading) {
      return
    }
    
    const loadData = async () => {
      // Si no está autenticado, no cargar sugerencias
      if (!isAuthenticated || !user?.id) {
        setLoading(false)
        return
      }

      setLoading(true)
      try {
        // Cargar el lugar primero para obtener el ownerId
        let placeOwnerId: string | null = null
        const collections = ["hotel", "restaurant", "activity"]
        for (const collection of collections) {
          try {
            const fetchedPlace = await fetchPlace(collection, postId)
            if (fetchedPlace) {
              setPlace(fetchedPlace)
              // El Place puede tener ownerId, verificar si está disponible
              placeOwnerId = (fetchedPlace as any).ownerId || null
              break
            }
          } catch {
            continue
          }
        }

        // Cargar sugerencias
        const suggestionsData = await fetchSuggestionsByPost(postId)
        
        // Filtrar sugerencias: mostrar si el usuario es el creador O el owner del post
        const userSuggestions = suggestionsData.filter(
          (suggestion) => {
            const isCreator = String(suggestion.ownerId) === String(user.id)
            const isPostOwner = placeOwnerId && String(placeOwnerId) === String(user.id)
            return isCreator || isPostOwner
          }
        )
        
        setSuggestions(userSuggestions)
      } catch (error) {
        console.error("Error al cargar sugerencias:", error)
        toast.error("No se pudieron cargar las sugerencias")
      } finally {
        setLoading(false)
      }
    }

    void loadData()
  }, [postId, isAuthenticated, user?.id, authLoading])

  const handleAccept = async (suggestionId: string) => {
    setProcessingId(suggestionId)
    try {
      await acceptSuggestion(suggestionId)
      setSuggestions((prev) =>
        prev.map((s) => (s.id === suggestionId ? { ...s, status: "ACCEPTED" as const } : s))
      )
      toast.success("Sugerencia aceptada")
    } catch (error) {
      console.error("Error al aceptar sugerencia:", error)
      toast.error("No se pudo aceptar la sugerencia")
    } finally {
      setProcessingId(null)
    }
  }

  const handleReject = async (suggestionId: string) => {
    setProcessingId(suggestionId)
    try {
      await rejectSuggestion(suggestionId)
      setSuggestions((prev) =>
        prev.map((s) => (s.id === suggestionId ? { ...s, status: "REJECTED" as const } : s))
      )
      toast.success("Sugerencia rechazada")
    } catch (error) {
      console.error("Error al rechazar sugerencia:", error)
      toast.error("No se pudo rechazar la sugerencia")
    } finally {
      setProcessingId(null)
    }
  }

  const getStatusBadge = (status: SuggestionResponse["status"]) => {
    switch (status) {
      case "PENDING":
        return <Badge variant="secondary">Pendiente</Badge>
      case "ACCEPTED":
        return <Badge className="bg-green-500 hover:bg-green-600">Aceptada</Badge>
      case "REJECTED":
        return <Badge variant="destructive">Rechazada</Badge>
    }
  }

  return (
    <div className="min-h-screen w-full flex flex-col bg-background">
      <Header />

      <main className="flex-1 w-full py-12 px-4">
        <div className="container mx-auto max-w-4xl space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="flex-shrink-0"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-1">Sugerencias</h1>
              {place && (
                <p className="text-muted-foreground">
                  Para: <span className="font-semibold text-foreground">{place.name}</span>
                </p>
              )}
            </div>
          </div>

          {/* Contenido */}
          {authLoading ? (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                <span className="ml-2 text-muted-foreground">Cargando...</span>
              </CardContent>
            </Card>
          ) : !isAuthenticated || !user?.id ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <Lightbulb className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium text-foreground mb-2">
                  Inicia sesión para ver tus sugerencias
                </p>
                <p className="text-sm text-muted-foreground">
                  Debes estar autenticado para ver las sugerencias que has enviado.
                </p>
              </CardContent>
            </Card>
          ) : loading ? (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                <span className="ml-2 text-muted-foreground">Cargando sugerencias...</span>
              </CardContent>
            </Card>
          ) : suggestions.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <Lightbulb className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium text-foreground mb-2">
                  No has enviado sugerencias aún
                </p>
                <p className="text-sm text-muted-foreground">
                  Puedes dejar una sugerencia desde la página del lugar.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {suggestions.map((suggestion) => (
                <Card key={suggestion.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-2">Sugerencia</CardTitle>
                        <CardDescription>
                          {new Date(suggestion.timestamp).toLocaleString("es-AR", {
                            dateStyle: "long",
                            timeStyle: "short",
                          })}
                        </CardDescription>
                      </div>
                      {getStatusBadge(suggestion.status)}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-foreground whitespace-pre-wrap">{suggestion.content}</p>
                    {suggestion.status === "PENDING" && (
                      <div className="flex gap-2 pt-2 border-t">
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleAccept(suggestion.id)}
                          disabled={processingId === suggestion.id}
                          className="flex-1"
                        >
                          {processingId === suggestion.id ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Procesando...
                            </>
                          ) : (
                            <>
                              <Check className="h-4 w-4 mr-2" />
                              Aceptar
                            </>
                          )}
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleReject(suggestion.id)}
                          disabled={processingId === suggestion.id}
                          className="flex-1"
                        >
                          {processingId === suggestion.id ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Procesando...
                            </>
                          ) : (
                            <>
                              <X className="h-4 w-4 mr-2" />
                              Rechazar
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

