"use client"

import type React from "react"

import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Send, Sparkles, MapPin, Utensils, Hotel } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { useState } from "react"

export default function MilongIA() {
  const [inputValue, setInputValue] = useState("")

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({ api: "/api/ai-suggestions" }),
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (inputValue.trim() && status !== "in_progress") {
      sendMessage({ text: inputValue })
      setInputValue("")
    }
  }

  const suggestedQuestions = [
    "¿Qué restaurantes de comida argentina me recomiendas?",
    "Busco un hotel boutique en Buenos Aires",
    "¿Qué actividades puedo hacer en Mendoza?",
    "Recomiéndame lugares románticos para cenar",
  ]

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <Sparkles className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-4xl font-bold text-foreground mb-2">MilongIA</h1>
            <p className="text-muted-foreground text-lg">Descubre lugares increíbles personalizados para ti</p>
          </div>

          {/* Chat Container */}
          <Card className="mb-6 p-6 min-h-[500px] max-h-[600px] overflow-y-auto">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 w-full">
                  <div className="flex flex-col items-center p-4 rounded-lg bg-muted/50">
                    <Hotel className="w-8 h-8 text-primary mb-2" />
                    <h3 className="font-semibold text-sm">Hoteles</h3>
                    <p className="text-xs text-muted-foreground">Encuentra tu alojamiento ideal</p>
                  </div>
                  <div className="flex flex-col items-center p-4 rounded-lg bg-muted/50">
                    <Utensils className="w-8 h-8 text-primary mb-2" />
                    <h3 className="font-semibold text-sm">Restaurantes</h3>
                    <p className="text-xs text-muted-foreground">Descubre sabores únicos</p>
                  </div>
                  <div className="flex flex-col items-center p-4 rounded-lg bg-muted/50">
                    <MapPin className="w-8 h-8 text-primary mb-2" />
                    <h3 className="font-semibold text-sm">Actividades</h3>
                    <p className="text-xs text-muted-foreground">Experiencias inolvidables</p>
                  </div>
                </div>

                <p className="text-muted-foreground mb-6">
                  Cuéntame qué tipo de experiencia buscas y te ayudaré a encontrar los mejores lugares
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full">
                  {suggestedQuestions.map((question, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="text-left h-auto py-3 px-4 whitespace-normal bg-transparent"
                      onClick={() => {
                        setInputValue(question)
                        sendMessage({ text: question })
                      }}
                    >
                      {question}
                    </Button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message) => (
                  <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[80%] rounded-lg px-4 py-3 ${
                        message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                      }`}
                    >
                      {message.parts.map((part, index) => {
                        if (part.type === "text") {
                          return (
                            <p key={index} className="whitespace-pre-wrap">
                              {part.text}
                            </p>
                          )
                        }
                        return null
                      })}
                    </div>
                  </div>
                ))}
                {status === "in_progress" && (
                  <div className="flex justify-start">
                    <div className="bg-muted rounded-lg px-4 py-3">
                      <div className="flex gap-1">
                        <div
                          className="w-2 h-2 bg-primary rounded-full animate-bounce"
                          style={{ animationDelay: "0ms" }}
                        />
                        <div
                          className="w-2 h-2 bg-primary rounded-full animate-bounce"
                          style={{ animationDelay: "150ms" }}
                        />
                        <div
                          className="w-2 h-2 bg-primary rounded-full animate-bounce"
                          style={{ animationDelay: "300ms" }}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </Card>

          {/* Input Form */}
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Escribe tu pregunta o preferencias..."
              className="flex-1 px-4 py-3 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              disabled={status === "in_progress"}
            />
            <Button type="submit" size="lg" disabled={status === "in_progress" || !inputValue.trim()} className="px-6">
              <Send className="w-5 h-5" />
            </Button>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  )
}
