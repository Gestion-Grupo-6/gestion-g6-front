export type SuggestionStatus = "PENDING" | "ACCEPTED" | "REJECTED"

export type SuggestionResponse = {
  id: string
  ownerId: string
  postId: string
  content: string
  status: SuggestionStatus
  timestamp: string
}

export type CreateSuggestionRequest = {
  ownerId: string
  postId: string
  content: string
}

