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
import {Conversation, MessagesPayload} from "@/types/messages";
import {upsertMessages} from "@/api/messages";
import ChatTabs from "@/app/milongia/chatTabs";

export default function MilongiIA() {
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
            <ChatTabs></ChatTabs>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
