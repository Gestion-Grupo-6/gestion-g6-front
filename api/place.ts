import type { Place, PlaceCreatePayload } from "@/types/place"
import { sanitizedBaseUrl } from "./config"

export const ACTIVIDADES = "actividad"
export const HOTELES = "hotel"
export const RESTAURANTES = "restaurante"

// Backend path helpers
function listPathFor(category: string): string {
  if (category === HOTELES) return "hotels"
  if (category === RESTAURANTES) return "restaurants"
  if (category === ACTIVIDADES) return "activities"
  return category
}

function detailPathFor(category: string): string {
  if (category === HOTELES) return "hotel"
  if (category === RESTAURANTES) return "restaurant"
  if (category === ACTIVIDADES) return "activity"
  return category
}


// Place - GET (id)
export async function fetchPlace(collection: string, id: string): Promise<Place | null> {
  const path = detailPathFor(collection)
  const response = await fetch(`${sanitizedBaseUrl}/${path}/${id}`, {
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
  options?: { limit?: number; ownerId?: string },
): Promise<Place[]> {
  const url = new URL(`${sanitizedBaseUrl}/${listPathFor(collection)}`)

  if (options?.limit && options.limit > 0) {
    url.searchParams.set("limit", String(options.limit))
  }

  if (options?.ownerId) {
    url.searchParams.set("ownerId", options.ownerId)
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
  const postPath = detailPathFor(collection)

  const response = await fetch(`${sanitizedBaseUrl}/${postPath}`, {
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

// Place - PUT (update)
export async function updatePlace(
  collection: string,
  id: string,
  payload: PlaceCreatePayload,
): Promise<Place> {
  const putPath = `${detailPathFor(collection)}/${id}`
  const response = await fetch(`${sanitizedBaseUrl}/${putPath}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const fallback = await response.text()
    throw new Error(`No se pudo actualizar el registro: ${response.status} ${response.statusText}. ${fallback}`)
  }

  return (await response.json()) as Place
}

// Place - GET by owner (all categories)
export async function fetchPlacesByOwner(ownerId: string): Promise<Place[]> {
  const response = await fetch(`${sanitizedBaseUrl}/posts/owner/${ownerId}`, {
    cache: "no-store",
  })

  if (!response.ok) {
    throw new Error(`Error al consultar posts del owner ${ownerId}: ${response.status} ${response.statusText}`)
  }
  const data = (await response.json()) as Place[]
  try {
    // eslint-disable-next-line no-console
    console.log("fetchPlacesByOwner response:", data)
  } catch {}
  return data
}