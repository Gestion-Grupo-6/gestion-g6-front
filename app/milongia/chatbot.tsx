"use client"

import React, { useEffect } from "react"
import { useState } from "react"
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport, type UIMessage } from "ai"
import Image from "next/image"
import { Card } from "@/components/ui/card"
import { Hotel, MapPin, Send, Utensils } from "lucide-react"
import { Button } from "@/components/ui/button"
import Markdown from "react-markdown"
import BouncingDotsLoader from "@/components/ui/BouncingDotsLoader"
import "../../styles/BouncingDotsStyle.css"
import { useLocationContext } from "@/contexts/LocationContext"
import { useAuth } from "@/contexts/AuthContext";

export function Chatbot({
  chatId,
  initialMessages,
  onChangeMessagesAction,
}: { chatId?: string, initialMessages?: UIMessage[], onChangeMessagesAction?: (chatId: string, messages: UIMessage[]) => void } = {}) {
  const { user } = useAuth()
  const [inputValue, setInputValue] = useState("")
  const { location: storedLocation } = useLocationContext()

  const id = `${user?.id}:${user?.name}:${chatId}`

  const { messages, sendMessage, status } = useChat({
    id,
    messages: initialMessages,
    transport: new DefaultChatTransport({
      api: "/api/ai-suggestions",
    }),
  })

  useEffect(() => {
    if (chatId && messages.length > 0 && onChangeMessagesAction) {
      console.log("[CHATBOT] Updating messages for chatId:", chatId, messages);
      onChangeMessagesAction(chatId, messages);
    }
  }, [messages, chatId, onChangeMessagesAction])

  const isThinking = status === "submitted"

  const getLocationMetadata = () => {
    if (!storedLocation) {
      return undefined
    }
    const { lat, lng, city, country, address } = storedLocation
    return {
      location: {
        lat,
        lng,
        city,
        country,
        address,
      },
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (inputValue.trim() && !isThinking) {
      sendMessage({ text: inputValue, metadata: getLocationMetadata() })
      setInputValue("")
    }
  }

  const locationLabel = (() => {
    if (!storedLocation) {
      return null
    }
    if (storedLocation.city && storedLocation.country) {
      return `${storedLocation.city}, ${storedLocation.country}`
    }
    if (storedLocation.address) {
      return storedLocation.address
    }
    return `${storedLocation.lat.toFixed(3)}, ${storedLocation.lng.toFixed(3)}`
  })()

  const hasLocation = Boolean(locationLabel)
  const citySuggestion = storedLocation?.city
  const countrySuggestion = storedLocation?.country

  const suggestedQuestions = hasLocation
    ? [
      `¿Qué restaurantes de comida típica de ${countrySuggestion} me recomiendas?`,
      `Estoy buscando un hotel en ${citySuggestion}`,
      `¿Qué actividades puedo hacer cerca de ${citySuggestion}?`,
      "Recomiéndame lugares con buenas calificaciones y cercanos",
    ]
    : [
      "¿Qué restaurantes de comida me recomiendas?",
      "Estoy buscando un hotel para descansar",
      "¿Qué actividades puedo hacer durante el día?",
      "Recomiéndame lugares con buenas calificaciones",
    ]

  return (
    <div className="w-full">
      {/* Chat Container */}
      <Card className="mb-6 p-6 w-full h-[500px] md:h-[600px] overflow-y-auto flex flex-col">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-1 text-center">
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

            {locationLabel ? (
              <p className="text-xs text-muted-foreground mb-4">
                Ubicación actual: {locationLabel}
              </p>
            ) : (
              <p className="text-xs text-muted-foreground mb-4">
                Activa la ubicación desde el header para obtener recomendaciones cerca tuyo.
              </p>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full">
              {suggestedQuestions.map((question, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="text-left h-auto py-3 px-4 whitespace-normal bg-transparent"
                  onClick={() => {
                    sendMessage({ text: question, metadata: getLocationMetadata() })
                  }}
                >
                  {question}
                </Button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div key={message.id + index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                {message.role === "assistant" && (
                  <div className="flex-shrink-0 mr-3 mt-1">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Image src="/milongia-logo.png" alt="MilongIA" width={24} height={24} className="rounded-full" />
                    </div>
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-3 ${message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                    }`}
                >
                  {message.parts.map((part, index) => {
                    if (part.type === "text") {
                      return <Markdown key={index}>{part.text}</Markdown>
                    }
                    return null
                  })}
                </div>
              </div>
            ))}
            {isThinking && (
              <div className="flex justify-start">
                <div className="flex-shrink-0 mr-3 mt-1">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Image src="/milongia-logo.png" alt="MilongIA" width={24} height={24} className="rounded-full" />
                  </div>
                </div>
                <div className="bg-muted rounded-lg px-4 py-3">
                  <BouncingDotsLoader />
                </div>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="flex gap-2 w-full">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Escribe tu pregunta o preferencias..."
          className="flex-1 px-4 py-3 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          disabled={isThinking}
        />
        <Button type="submit" size="lg" disabled={isThinking || !inputValue.trim()} className="px-6">
          <Send className="w-5 h-5" />
        </Button>
      </form>
    </div>
  )
}
