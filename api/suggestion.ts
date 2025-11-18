import { sanitizedBaseUrl } from "./config"
import type { SuggestionResponse, CreateSuggestionRequest } from "@/types/suggestion"

// GET - suggestions by post
export async function fetchSuggestionsByPost(postId: string): Promise<SuggestionResponse[]> {
  const res = await fetch(`${sanitizedBaseUrl}/api/suggestions/post/${postId}`, { cache: "no-store" })
  if (!res.ok) {
    throw new Error(`Error al obtener sugerencias: ${res.status} ${res.statusText}`)
  }
  return (await res.json()) as SuggestionResponse[]
}

// POST - create suggestion
export async function createSuggestion(payload: CreateSuggestionRequest): Promise<SuggestionResponse> {
  const res = await fetch(`${sanitizedBaseUrl}/api/suggestions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    const fb = await res.text()
    throw new Error(`No se pudo crear la sugerencia: ${res.status} ${res.statusText}. ${fb}`)
  }
  return (await res.json()) as SuggestionResponse
}

// PUT - accept suggestion
export async function acceptSuggestion(suggestionId: string): Promise<SuggestionResponse> {
  const res = await fetch(`${sanitizedBaseUrl}/api/suggestions/${suggestionId}/accept`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
  })
  if (!res.ok) {
    const fb = await res.text()
    throw new Error(`No se pudo aceptar la sugerencia: ${res.status} ${res.statusText}. ${fb}`)
  }
  return (await res.json()) as SuggestionResponse
}

// PUT - reject suggestion
export async function rejectSuggestion(suggestionId: string): Promise<SuggestionResponse> {
  const res = await fetch(`${sanitizedBaseUrl}/api/suggestions/${suggestionId}/reject`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
  })
  if (!res.ok) {
    const fb = await res.text()
    throw new Error(`No se pudo rechazar la sugerencia: ${res.status} ${res.statusText}. ${fb}`)
  }
  return (await res.json()) as SuggestionResponse
}

