import type { Place } from "@/types/place"

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || process.env.API_BASE_URL || "http://localhost:8080"

const sanitizedBaseUrl = API_BASE_URL.replace(/\/$/, "")

export interface PlaceCreatePayload {
  name: string
  location: string
  rating: number
  reviews: number
  price: number
  priceLabel: string
  images: string[]
  description: string
  amenities: string[]
  address: string
  phone: string
  email: string
  website: string
  checkIn?: string | null
  checkOut?: string | null
  hours?: string | null
  duration?: string | null
  includes?: string | null
  bestTime?: string | null
  howToGet?: string | null
}

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
