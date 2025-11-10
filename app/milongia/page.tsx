"use client"

import { Header } from "@/components/header"
import { notFound } from "next/navigation"
import {loadChat} from "@/app/api/ai-suggestions/utils";
import React, {useEffect, useState} from "react";
import Image from "next/image";
import {useAuth} from "@/contexts/AuthContext";
import {Chatbot} from "@/app/milongia/chatbot";
import {UIMessage} from "ai";


export default function MilongiIA() {
    const { user, isAuthenticated } = useAuth()
    const [previousMessages, setPreviousMessages] = useState<UIMessage[]>(new Array<UIMessage>())
    const id = user?.id
    const name = user?.name || "Usuario"

    useEffect(() => {
        if (!isAuthenticated || !user?.id) {
          setPreviousMessages(new Array<UIMessage>())
          return
        }

        const loadMessages = async () => {
              try {
                const messagesLoaded = await loadChat(id)
                setPreviousMessages(messagesLoaded)
              } catch (error) {
                console.error("Error al cargar favoritos:", error)
                setPreviousMessages(new Array<UIMessage>())
              }
            }
        loadMessages()
    }, [user?.id, isAuthenticated])


    if (!previousMessages) {
        notFound()
    }

    return (
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-1">
            <div className="max-w-4xl mx-auto">
              {/* Header Section */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                  <Image src="/milongia-logo.png" alt="MilongIA" width={48} height={48} className="rounded-full" />
                </div>
                <h1 className="text-4xl font-bold text-foreground mb-2">MilongIA</h1>
                <p className="text-muted-foreground text-lg">Descubre lugares increíbles personalizados para ti</p>
              </div>
                {/* Chat Section */}
                <Chatbot userId={id} userName={name} initialMessages={previousMessages}></Chatbot>
              </div>
          </main>
        </div>
    )
}
