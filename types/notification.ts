export type NotificationType = "SUGGESTION_STATUS_CHANGED" | "GENERIC"

export type SuggestionStatusPayload = {
  suggestionId: string
  postId: string
  status: "ACCEPTED" | "REJECTED"
}

export type NotificationPayload = SuggestionStatusPayload | Record<string, unknown>

export type Notification = {
  id: string
  userId: string
  type: NotificationType
  message: string
  createdAt: string
  payload: NotificationPayload
}

