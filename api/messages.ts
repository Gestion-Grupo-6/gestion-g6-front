import { sanitizedBaseUrl } from "./config"
import {MessagesPayload} from "@/types/messages";

// Messages - GET (id)
export async function fetchMessages(userId: string | undefined): Promise<Array<MessagesPayload> | null> {

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

  return (await response.json()) as Array<MessagesPayload>
}

// Messages - PUT (upsert - insert if not exists)
export async function upsertMessages(
  payload: MessagesPayload,
): Promise<MessagesPayload> {
  console.log("Upserting messages:", {
    userId: payload.userId,
    conversationId: payload.conversationId,
    messageCount: payload.messages.length
  });

  try {
    const response = await fetch(`${sanitizedBaseUrl}/messages/${payload.userId}/${payload.conversationId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Failed to upsert messages:", {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
        userId: payload.userId,
        conversationId: payload.conversationId
      });
      throw new Error(`Failed to update messages: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    console.log("Messages upserted successfully:", {
      userId: payload.userId,
      conversationId: payload.conversationId,
      result
    });
    return result;
  } catch (error) {
    console.error("Error in upsertMessages:", error);
    throw error;
  }
}
