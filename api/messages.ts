import { sanitizedBaseUrl } from "./config"
import {Messages, MessagesPayload} from "@/types/messages";

// Messages - GET (id)
export async function fetchMessages(userId: string | undefined): Promise<Messages | null> {

  if (!userId) {
    return null
  }

  const response = await fetch(`${sanitizedBaseUrl}/messages/${userId}`, {
    cache: "no-store",
  })

  if (response.status === 404) {
    return null
  }

  if (!response.ok) {
    throw new Error(`Error al consultar messages/${userId}: ${response.status} ${response.statusText}`)
  }

  return (await response.json()) as Messages
}

// Messages - PUT (upsert - insert if not exists)
export async function upsertMessages(
  payload: MessagesPayload,
): Promise<Messages> {
  const response = await fetch(`${sanitizedBaseUrl}/messages/${payload.userId}`, {
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

  return (await response.json()) as Messages
}
