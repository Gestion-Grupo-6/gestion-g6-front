import { sanitizedBaseUrl } from "./config"
import type { Notification } from "@/types/notification"

/**
 * Obtiene todas las notificaciones de un usuario (incluyendo las ocultas)
 */
export async function fetchNotifications(userId: string): Promise<Notification[]> {
  try {
    const res = await fetch(`${sanitizedBaseUrl}/api/notifications/user/${userId}`, {
      cache: "no-store",
    })
    if (!res.ok) {
      throw new Error(`Error al obtener notificaciones: ${res.status} ${res.statusText}`)
    }
    return (await res.json()) as Notification[]
  } catch (error: any) {
    // Si es un error de red, relanzarlo para que el contexto lo maneje
    if (error?.message?.includes("Failed to fetch") || error?.name === "TypeError") {
      throw new Error("Failed to fetch")
    }
    throw error
  }
}

/**
 * Marca todas las notificaciones no leídas como leídas (showed: true)
 * Este endpoint consume las notificaciones (las marca como showed: true)
 */
export async function markAllAsRead(userId: string): Promise<Notification[]> {
  const res = await fetch(`${sanitizedBaseUrl}/api/notifications/user/${userId}/read`, {
    method: "PUT",
    cache: "no-store",
  })
  if (!res.ok) {
    throw new Error(`Error al marcar notificaciones como leídas: ${res.status} ${res.statusText}`)
  }
  return (await res.json()) as Notification[]
}

