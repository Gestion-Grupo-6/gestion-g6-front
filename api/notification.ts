import { sanitizedBaseUrl } from "./config"
import type { Notification } from "@/types/notification"

/**
 * Obtiene y consume las notificaciones de un usuario
 * Nota: Este endpoint elimina las notificaciones después de obtenerlas
 */
export async function fetchNotifications(userId: string): Promise<Notification[]> {
  const res = await fetch(`${sanitizedBaseUrl}/api/notifications/user/${userId}`, {
    cache: "no-store",
  })
  if (!res.ok) {
    throw new Error(`Error al obtener notificaciones: ${res.status} ${res.statusText}`)
  }
  return (await res.json()) as Notification[]
}

