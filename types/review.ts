export type Ratings = {
  cleanliness?: number
  service?: number
  location?: number
}

export type ReviewCreatePayload = {
  ownerId: string
  postId: string
  comment?: string
  ratings: Ratings
  images?: string[]
}

export type ReviewUpdatePayload = {
  ownerId: string
  comment?: string
  ratings: Ratings
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
  ratings?: Ratings
  images?: string[]
  replies?: CommentResponse[]
}
