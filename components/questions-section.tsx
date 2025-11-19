"use client"

import React, { useEffect, useState } from "react"
import { fetchQuestionsByPost, createQuestion, addReply } from "../api/question"
import { fetchUser } from "../api/user"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { useAuth } from "@/contexts/AuthContext"
import { toast } from "sonner"

type CommentAny = any

export default function QuestionsSection({ postId, ownerId: ownerIdProp }: { postId: string; ownerId?: string | null }) {
  const { user, isAuthenticated } = useAuth()
  const ownerId = ownerIdProp ?? user?.id ?? null

  const [questions, setQuestions] = useState<CommentAny[]>([])
  const [newQuestion, setNewQuestion] = useState("")
  const [replyText, setReplyText] = useState<Record<string, string>>({})
  const [authorById, setAuthorById] = useState<Record<string, string>>({})
  const [photoById, setPhotoById] = useState<Record<string, string>>({})

  useEffect(() => {
    if (!postId) return
    void loadQuestions()
  }, [postId])

  async function loadQuestions() {
    try {
      const all = await fetchQuestionsByPost(postId)
      const qs = (all || []).filter((c: any) => c.type === "QUESTION")
      setQuestions(qs)
      // fetch authors
      const ids = Array.from(new Set(
        qs.flatMap((q: any) => [q.ownerId, ...(q.replies || []).map((r: any) => r.ownerId)])
      )).filter((v): v is string => typeof v === "string")
      const entries = await Promise.all(ids.map(async (id) => {
        try {
          const u = await fetchUser(id)
          const name = u ? `${u.name ?? ""} ${u.lastname ?? ""}`.trim() : id
          return [id, name || id] as const
        } catch (_) {
          return [id, id] as const
        }
      }))
      const photoEntries = await Promise.all(ids.map(async (id) => {
        try {
          const u = await fetchUser(id)
          return u?.profilePhoto ? [id, u.profilePhoto] as const : null
        } catch { return null }
      }))
      setAuthorById(Object.fromEntries(entries))
      const validPhotos = photoEntries.filter((e): e is [string, string] => e !== null)
      setPhotoById(Object.fromEntries(validPhotos))
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Failed to load questions", err)
    }
  }

  async function handleCreateQuestion(e: React.FormEvent) {
    e.preventDefault()
    if (!newQuestion.trim()) {
      toast.error("Escribe una pregunta antes de enviar")
      return
    }
    if (!ownerId) {
      toast.error("Debes iniciar sesión para preguntar")
      return
    }
    try {
      await createQuestion({ ownerId, postId, comment: newQuestion.trim() })
      setNewQuestion("")
      await loadQuestions()
      toast.success("Pregunta publicada")
    } catch (err: any) {
      console.error("Failed to create question", err)
      toast.error(err?.message || "No se pudo publicar la pregunta")
    }
  }

  async function handleReply(parentId: string) {
    const text = (replyText[parentId] || "").trim()
    if (!text) {
      toast.error("Escribe una respuesta antes de enviar")
      return
    }
    if (!ownerId) {
      toast.error("Debes iniciar sesión para responder")
      return
    }
    try {
      await addReply(parentId, { ownerId, comment: text })
      setReplyText((s) => ({ ...s, [parentId]: "" }))
      await loadQuestions()
      toast.success("Respuesta publicada")
    } catch (err: any) {
      console.error("Failed to post reply", err)
      toast.error(err?.message || "No se pudo publicar la respuesta")
    }
  }

  return (
    <Card>
      <CardContent className="space-y-4">
        <h2 className="text-2xl font-bold text-foreground mb-6"> ¿Tienes alguna pregunta?</h2>

        <form onSubmit={handleCreateQuestion} className="space-y-2">
          <Textarea
            value={newQuestion}
            onChange={(e) => setNewQuestion(e.target.value)}
            placeholder="Haz una pregunta sobre esta publicación"
            rows={3}
          />
          <div className="flex justify-end">
            <Button type="submit" disabled={!ownerId || !newQuestion.trim()}>
              Enviar pregunta
            </Button>
          </div>
        </form>

        <div className="rounded-xl p-0.5 bg-gray-100/70 ring-2 ring-gray-300/60">
          <div className="space-y-4 p-4 bg-transparent">
            <h3 className="text-lg font-semibold mt-4">Preguntas y respuestas</h3>

            <div className="max-h-72 overflow-y-auto space-y-4 pr-2">
          {questions.length === 0 && <p className="text-sm text-muted-foreground">No hay preguntas aún.</p>}
          {questions.map((q: CommentAny) => (
            <div key={q.id} className="rounded-2xl border border-gray-200 bg-white/70 p-3 shadow-sm">
              <div className="mb-2 flex items-start gap-3">
                <Avatar className="h-8 w-8">
                  {photoById[q.ownerId] ? (
                    <AvatarImage src={photoById[q.ownerId]} alt={authorById[q.ownerId] || q.ownerId} />
                  ) : (
                    <AvatarFallback>{(authorById[q.ownerId] || q.ownerId || "U").slice(0, 2)}</AvatarFallback>
                  )}
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-1">
                    <div>
                      <h4 className="font-semibold text-foreground">{authorById[q.ownerId] || q.ownerId || "Usuario"}</h4>
                      {q.timestamp && (
                        <p className="text-sm text-muted-foreground">{new Date(q.timestamp).toLocaleDateString()}</p>
                      )}
                    </div>
                  </div>
                    <p className="text-foreground leading-relaxed mt-2 mb-4">{q.comment}</p>
                </div>
              </div>

              <div className="ml-10 space-y-2">
                {(q.replies || []).map((r: any) => (
                    <div key={r.id} className="rounded-lg bg-white/40 border border-gray-200 p-2">
                    <div className="flex items-start justify-between mb-1">
                      <div>
                        <div className="font-medium text-foreground">{authorById[r.ownerId] || r.ownerId || "Usuario"}</div>
                        {r.timestamp && (
                          <div className="text-sm text-muted-foreground">{new Date(r.timestamp).toLocaleDateString()}</div>
                        )}
                      </div>
                    </div>
                      <p className="text-foreground leading-relaxed">{r.comment}</p>
                  </div>
                ))}

                <div className="mt-2">
                  <Textarea
                    value={replyText[q.id] || ""}
                    onChange={(e) => setReplyText((s) => ({ ...s, [q.id]: e.target.value }))}
                    placeholder="Responder"
                    rows={2}
                  />
                  <div className="flex justify-end mt-1">
                    <Button size="sm" onClick={() => handleReply(q.id)} disabled={!ownerId || !(replyText[q.id] || "").trim()}>
                      Responder
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
