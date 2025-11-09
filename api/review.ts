import { sanitizedBaseUrl } from "./config"
import type { Ratings, ReviewCreatePayload, ReviewUpdatePayload, CommentResponse } from "@/types/review"
import { uploadImage } from "@/contexts/SupabaseContext"

// GET - reviews/comments by post
export async function fetchReviewsByPost(postId: string): Promise<CommentResponse[]> {
  const res = await fetch(`${sanitizedBaseUrl}/api/comments/post/${postId}`, { cache: "no-store" })
  if (!res.ok) {
    throw new Error(`Error al obtener reseñas: ${res.status} ${res.statusText}`)
  }
  return (await res.json()) as CommentResponse[]
}

// POST - create review
export async function createReview(payload: ReviewCreatePayload): Promise<CommentResponse> {
  const res = await fetch(`${sanitizedBaseUrl}/api/comments/reviews`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    const fb = await res.text()
    throw new Error(`No se pudo crear la reseña: ${res.status} ${res.statusText}. ${fb}`)
  }
  return (await res.json()) as CommentResponse
}

// PUT - update review (by postId for current owner)
export async function updateReview(postId: string, payload: ReviewUpdatePayload): Promise<CommentResponse> {
  const res = await fetch(`${sanitizedBaseUrl}/api/comments/reviews/${postId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    const fb = await res.text()
    throw new Error(`No se pudo actualizar la reseña: ${res.status} ${res.statusText}. ${fb}`)
  }
  return (await res.json()) as CommentResponse
}

// POST - add reply
export async function addReply(commentId: string, payload: { ownerId: string; comment: string }): Promise<CommentResponse> {
  const res = await fetch(`${sanitizedBaseUrl}/api/comments/${commentId}/replies`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    const fb = await res.text()
    throw new Error(`No se pudo agregar la respuesta: ${res.status} ${res.statusText}. ${fb}`)
  }
  return (await res.json()) as CommentResponse
}

// PUT - update reply
export async function updateReply(replyId: string, payload: { ownerId: string; comment: string }): Promise<CommentResponse> {
  const res = await fetch(`${sanitizedBaseUrl}/api/comments/replies/${replyId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    const fb = await res.text()
    throw new Error(`No se pudo actualizar la respuesta: ${res.status} ${res.statusText}. ${fb}`)
  }
  return (await res.json()) as CommentResponse
}

// POST - like / dislike comment
export async function likeComment(commentId: string, userId: string): Promise<CommentResponse> {
  const res = await fetch(`${sanitizedBaseUrl}/api/comments/${commentId}/like`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId }),
  })
  if (!res.ok) {
    const fb = await res.text()
    throw new Error(`No se pudo marcar útil: ${res.status} ${res.statusText}. ${fb}`)
  }
  return (await res.json()) as CommentResponse
}

export async function dislikeComment(commentId: string, userId: string): Promise<CommentResponse> {
  const res = await fetch(`${sanitizedBaseUrl}/api/comments/${commentId}/dislike`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId }),
  })
  if (!res.ok) {
    const fb = await res.text()
    throw new Error(`No se pudo marcar no útil: ${res.status} ${res.statusText}. ${fb}`)
  }
  return (await res.json()) as CommentResponse
}

// Review - Upload image using Supabase
export async function uploadReviewImage(reviewId: string | null, file: File, index?: number): Promise<string> {
  // Genera una ruta única para el archivo en el bucket
  const fileExtension = file.name.split('.').pop() || 'jpg'
  const timestamp = Date.now()
  const suffix = index !== undefined ? `.${index}` : ''
  const path = reviewId 
    ? `review-images/${reviewId}/${timestamp}${suffix}.${fileExtension}`
    : `review-images/temp/${timestamp}${suffix}.${fileExtension}`

  // Sube la imagen al bucket
  const uploadedPath = await uploadImage(path, file)
  
  if (!uploadedPath) {
    throw new Error("Error al subir la imagen de la reseña")
  }

  // Devuelve el path relativo para guardar en la base de datos
  // getImage() se encargará de convertirlo a URL pública cuando se necesite mostrar
  return uploadedPath
}
