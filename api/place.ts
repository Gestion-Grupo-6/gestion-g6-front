import type {Place, PlaceCreatePayload} from "@/types/place"
import {sanitizedBaseUrl} from "./config"
import {uploadImage} from "@/contexts/SupabaseContext"

export const ACTIVIDADES = "activities"
export const ACTIVIDAD = "activity"
export const HOTELES = "hotels"
export const HOTEL = "hotel"
export const RESTAURANTES = "restaurants"
export const RESTAURANT = "restaurant"


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

export async function fetchAllPlaces(): Promise<Place[]> {
    const hotelResponse = await fetch(`${sanitizedBaseUrl}/hotels`, {
        cache: "no-store",
    })

    if (!hotelResponse.ok) {
        throw new Error(`Error al consultar posts: ${hotelResponse.status} ${hotelResponse.statusText}`)
    }

    const restaurantResponse = await fetch(`${sanitizedBaseUrl}/restaurants`, {
        cache: "no-store",
    })

    if (!restaurantResponse.ok) {
        throw new Error(`Error al consultar posts: ${restaurantResponse.status} ${restaurantResponse.statusText}`)
    }

    const activityResponse = await fetch(`${sanitizedBaseUrl}/activities`, {
        cache: "no-store",
    })

    if (!activityResponse.ok) {
        throw new Error(`Error al consultar posts: ${activityResponse.status} ${activityResponse.statusText}`)
    }

    return [
        ...(await hotelResponse.json()) as Place[],
        ...(await restaurantResponse.json()) as Place[],
        ...(await activityResponse.json()) as Place[],
    ]
}

// Place - SEARCH (MVP: by name). Send null for unused fields
export async function searchPlaces(
  collection: string,
  params: { name?: string; sort?: string | null; page?: number | null; pageSize?: number | null },
): Promise<Place[]> {
  const postPath = detailPathFor(collection)
  const searchPath = `search/${postPath}`
  const body = {
    name: params.name ?? null,
    sort: params.sort ?? null,
    page: params.page ?? null,
    pageSize: params.pageSize ?? null,
  }

  const response = await fetch(`${sanitizedBaseUrl}/${searchPath}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    const fallback = await response.text()
    throw new Error(`Error en búsqueda: ${response.status} ${response.statusText}. ${fallback}`)
  }

  return (await response.json()) as Place[]
}

// Advanced search: accepts the full search body used by the backend search endpoints.
export async function searchPlacesAdvanced(collection: string, body: Record<string, any>): Promise<Place[]> {
  const postPath = detailPathFor(collection)
  const searchPath = `search/${postPath}`

  const response = await fetch(`${sanitizedBaseUrl}/${searchPath}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    const fallback = await response.text()
    throw new Error(`Error en búsqueda avanzada: ${response.status} ${response.statusText}. ${fallback}`)
  }

  return (await response.json()) as Place[]
}

// Place - POST (create)
export async function createPlace(collection: string, payload: PlaceCreatePayload): Promise<Place> {
  const postPath = detailPathFor(collection)
  const url = `${sanitizedBaseUrl}/${postPath}`

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Error creating place: ${response.status} ${response.statusText}`)
      console.error(`URL: ${url}`)
      console.error(`Payload:`, payload)
      console.error(`Response:`, errorText)
      throw new Error(`No se pudo crear el registro: ${response.status} ${response.statusText}. ${errorText}`)
    }

    return (await response.json()) as Place
  } catch (error) {
    if (error instanceof TypeError && error.message === "Failed to fetch") {
      console.error(`Network error: No se pudo conectar al backend en ${url}`)
      console.error(`Verifica que el backend esté corriendo en ${sanitizedBaseUrl}`)
      throw new Error(`No se pudo conectar al servidor. Verifica que el backend esté corriendo en ${sanitizedBaseUrl}`)
    }
    throw error
  }
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
  return data
}

// Place - Upload image using Supabase
export async function uploadPlaceImage(placeId: string | null, file: File, index?: number): Promise<string> {
  // Genera una ruta única para el archivo en el bucket
  const fileExtension = file.name.split('.').pop() || 'jpg'
  const timestamp = Date.now()
  const suffix = index !== undefined ? `.${index}` : ''
  const path = placeId 
    ? `place-images/${placeId}/${timestamp}${suffix}.${fileExtension}`
    : `place-images/temp/${timestamp}${suffix}.${fileExtension}`

  // Sube la imagen al bucket
  const uploadedPath = await uploadImage(path, file)
  
  if (!uploadedPath) {
    throw new Error("Error al subir la imagen del lugar")
  }

  // Devuelve el path relativo para guardar en la base de datos
  // getImage() se encargará de convertirlo a URL pública cuando se necesite mostrar
  return uploadedPath
}
