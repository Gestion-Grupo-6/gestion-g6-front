import type { Place, PlaceCreatePayload } from "@/types/place"
import { sanitizedBaseUrl } from "./config"

export const ACTIVIDADES = "activities"
export const HOTELES = "hotels"
export const RESTAURANTES = "restaurants"


// Place - GET (id)
export async function fetchPlace(collection: string, id: string): Promise<Place | null> {
  const response = await fetch(`${sanitizedBaseUrl}/${collection}/${id}`, {
    cache: "no-store",
  })

  if (response.status === 404) {
    return null
  }

  if (!response.ok) {
    throw new Error(`Error al consultar ${collection}/${id}: ${response.status} ${response.statusText}`)
  }

  return (await response.json()) as Place
}

// Place - GET (list)
export async function fetchPlaces(
  collection: string,
  options?: { limit?: number },
): Promise<Place[]> {
  const url = new URL(`${sanitizedBaseUrl}/${collection}`)

  if (options?.limit && options.limit > 0) {
    url.searchParams.set("limit", String(options.limit))
  }

  const response = await fetch(url, {
    cache: "no-store",
  })

  if (!response.ok) {
    throw new Error(`Error al consultar ${collection}: ${response.status} ${response.statusText}`)
  }

  return (await response.json()) as Place[]
}

// Place - POST (create)
export async function createPlace(collection: string, payload: PlaceCreatePayload): Promise<Place> {
  const response = await fetch(`${sanitizedBaseUrl}/${collection}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const fallback = await response.text()
    throw new Error(`No se pudo crear el registro: ${response.status} ${response.statusText}. ${fallback}`)
  }

  return (await response.json()) as Place
}