import { useState, useCallback } from "react"
import { UIMessage } from "ai"

export function useIAChat() {
  const [messages, setMessages] = useState<UIMessage[]>([])
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle")

  const sendMessage = useCallback(async (content: string) => {
    try {
      setStatus("loading")

      const userMessage: UIMessage = {
        id: crypto.randomUUID(),
        role: "user",
        content,
      }

      const newMessages = [...messages, userMessage]
      setMessages(newMessages)

      const response = await fetch("/api/ia-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      })

      if (!response.ok) throw new Error("Request failed")

      const data = await response.json()

      // adapt based on generateText() return shape
      const assistantMessage: UIMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: data.text ?? data.output ?? "No response",
      }

      setMessages((prev) => [...prev, assistantMessage])
      setStatus("idle")
    } catch (err) {
      console.error(err)
      setStatus("error")
    }
  }, [messages])

  return { messages, sendMessage, status }
}
