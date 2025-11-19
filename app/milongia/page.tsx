"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { notFound } from "next/navigation"
import { useEffect, useState } from "react"
import Image from "next/image"
import { useAuth } from "@/contexts/AuthContext"
import { Chatbot } from "@/app/milongia/chatbot"
import type {UIDataTypes, UIMessage, UITools} from "ai"
import {Trash2} from "lucide-react";
import {Button} from "@/components/ui/button";
import {MessagesPayload} from "@/types/messages";
import {upsertMessages} from "@/api/messages";

export default function MilongiIA() {
  const { user, isAuthenticated } = useAuth()
  const [ conversation, setConversation ] = useState< UIMessage<unknown, UIDataTypes, UITools>[] | undefined>([]);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (isAuthenticated === undefined) return; // wait until auth is resolved

    if (!isAuthenticated || !user?.id) {
      console.log("El usuario no está autenticado o no tiene ID.")
      return
    }
    setConversation(user!.chatHistory)
    setReloadKey(prev => prev + 1)
  }, [user?.id, isAuthenticated])

  const handleMessageChange = (messages: UIMessage[]) => {
    setConversation(messages);
  }

  const handleDeleteConversation = async () => {
    if (!user?.id || !isAuthenticated) {
        console.log("El usuario no está autenticado o no tiene ID.")
    }
    const emptyMessagesPayload: MessagesPayload = {
        userId: user!.id,
        messages: new Array<UIMessage>()
    };
    await upsertMessages(emptyMessagesPayload);
    console.log("Conversación eliminada. ID: ", user!.id);
    // Aquí podrías actualizar el estado local si es necesario
    setConversation(new Array<UIMessage>());
    setReloadKey(prev => prev + 1);
  }

  return (
    <div className="min-h-screen w-full flex flex-col">
      <Header />
      <main className="flex-1 w-full">
        <div className="container mx-auto px-4 py-8 w-full">
          <div className="max-w-4xl mx-auto w-full">
            {/* Header Section */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                <Image src="/milongia-logo.png" alt="MilongIA" width={48} height={48} className="rounded-full" />
              </div>
              <h1 className="text-4xl font-bold text-foreground mb-2">MilongIA</h1>
              <p className="text-muted-foreground text-lg">Descubre lugares increíbles personalizados para ti</p>
            </div>
            {/* Chat Section */}
            <Button
              variant="ghost"
              className="justify-start px-4 py-2 text-sm text-destructive hover:text-destructive hover:bg-destructive/10 "
              onClick={handleDeleteConversation}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Eliminar Conversación
            </Button>
            <Chatbot key={reloadKey} initialMessages={conversation} onChangeMessagesAction={handleMessageChange} ></Chatbot>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
