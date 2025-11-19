import { sanitizedBaseUrl } from "../api/config"

export async function fetchQuestionsByPost(postId: string) {
  const res = await fetch(`${sanitizedBaseUrl}/api/comments/questions/post/${postId}`, { cache: "no-store" })
  if (!res.ok) throw new Error(`Failed to fetch questions: ${res.status} ${res.statusText}`)
  return res.json()
}

export async function createQuestion(body: { ownerId: string; postId: string; comment: string }) {
  const res = await fetch(`${sanitizedBaseUrl}/api/comments/questions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const fb = await res.text()
    throw new Error(`Failed to create question: ${res.status} ${res.statusText}. ${fb}`)
  }
  return res.json()
}

export async function addReply(commentId: string, body: { ownerId: string; comment: string }) {
  const res = await fetch(`${sanitizedBaseUrl}/api/comments/${commentId}/replies`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const fb = await res.text()
    throw new Error(`Failed to add reply: ${res.status} ${res.statusText}. ${fb}`)
  }
  return res.json()
}
