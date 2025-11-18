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

export default function SugerenciasPage() {
  const params = useParams()
  const router = useRouter()
  const postId = params.postId as string

  const [suggestions, setSuggestions] = useState<SuggestionResponse[]>([])
  const [place, setPlace] = useState<Place | null>(null)
  const [loading, setLoading] = useState(true)
  const [processingId, setProcessingId] = useState<string | null>(null)

  useEffect(() => {
    if (!postId) return

    const loadData = async () => {
      setLoading(true)
      try {
        // Cargar sugerencias
        const suggestionsData = await fetchSuggestionsByPost(postId)
        setSuggestions(suggestionsData)

        // Intentar cargar el lugar para mostrar su nombre
        const collections = ["hotel", "restaurant", "activity"]
        for (const collection of collections) {
          try {
            const fetchedPlace = await fetchPlace(collection, postId)
            if (fetchedPlace) {
              setPlace(fetchedPlace)
              break
            }
          } catch {
            continue
          }
        }
      } catch (error) {
        console.error("Error al cargar sugerencias:", error)
        toast.error("No se pudieron cargar las sugerencias")
      } finally {
        setLoading(false)
      }
    }

    void loadData()
  }, [postId])

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
          {loading ? (
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
                  No hay sugerencias aún
                </p>
                <p className="text-sm text-muted-foreground">
                  Los usuarios aún no han enviado sugerencias para esta publicación.
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

