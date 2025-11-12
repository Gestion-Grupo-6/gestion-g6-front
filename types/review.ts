export type Ratings = {
  cleanliness?: number
  service?: number
  location?: number
}

export type RatingItem = {
  type: string
  score: number
}

export type ReviewCreatePayload = {
  ownerId: string
  postId: string
  comment?: string
  ratings: RatingItem[]
  images?: string[]
}

export type ReviewUpdatePayload = {
  ownerId: string
  comment?: string
  ratings: RatingItem[]
  images?: string[]
}

export type CommentResponse = {
  id: string
  type: "REVIEW" | "REPLY"
  ownerId: string
  postId: string
  timestamp: string
  comment?: string
  likes: number
  dislikes: number
  deleted: boolean
  edited: boolean
  ratings?: RatingItem[] | Ratings // Puede ser array (formato backend) u objeto plano (compatibilidad)
  images?: string[]
  replies?: CommentResponse[]
}
