export type NotificationType = 
  | "SUGGESTION_CREATED"
  | "SUGGESTION_STATUS_CHANGED" 
  | "REVIEW"
  | "QUESTION"
  | "REPLIED_QUESTION"
  | "REPLIED_REVIEW"
  | "LIKE_COMMENT"
  | "DISLIKE_COMMENT"
  | "FAVORITE_POST_UPDATED"
  | "GENERIC"

export type SuggestionCreatedPayload = {
  suggestionId: string
  postId: string
  content: string
  suggestionStatus: "PENDING" | "ACCEPTED" | "REJECTED"
}

export type SuggestionStatusPayload = {
  suggestionId: string
  postId: string
  content: string
  suggestionStatus: "ACCEPTED" | "REJECTED"
}

export type ReviewPayload = {
  commentId: string
  comment: string
  postId: string
}

export type QuestionPayload = {
  commentId: string
  comment: string
  postId: string
}

export type ReplyPayload = {
  commentId: string
  comment: string
  postId: string
}

export type LikeCommentPayload = {
  commentId: string
  comment: string
  postId: string
}

export type NotificationPayload = SuggestionCreatedPayload | SuggestionStatusPayload | ReviewPayload | QuestionPayload | ReplyPayload | LikeCommentPayload | Record<string, unknown>

export type Notification = {
  id: string
  ownerId: string
  fromUser: string
  type: NotificationType
  message: string
  createdAt: string
  payload: NotificationPayload
  showed?: boolean
  sent?: boolean
}

