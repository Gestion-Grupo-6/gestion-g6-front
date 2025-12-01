"use client"

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { X } from "lucide-react"
import { useState } from "react"
import { Conversation } from "@/types/messages";
import { useAuth } from "@/contexts/AuthContext";
import { UIMessage } from "ai";
import { deleteMessages } from "@/api/messages";
import { Chatbot } from "@/app/milongia/chatbot";
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { ChatHistory } from "@/types/chatHistory"


export default function ChatTabs() {
    const { user } = useAuth()
    const [reloadKey, setReloadKey] = useState(Date.now())
    const [chatToClose, setChatToClose] = useState<string | null>(null)
    const [showCloseDialog, setShowCloseDialog] = useState(false)

    // Initialize from localStorage directly using ChatHistory utility
    const [chatHistory, setChatHistory] = useState<Conversation[]>(ChatHistory.load())
    const [currentTab, setCurrentTab] = useState<string>(() => {
        const history = ChatHistory.load()
        return history[0]?.id.toString() || "1"
    })

    const handleAddConversation = () => {
        const numericIds = chatHistory
            ?.map(c => Number(c.id))
            .filter(n => !isNaN(n) && n > 0) ?? [];

        const lastId = numericIds.length > 0 ? Math.max(...numericIds) : 0;
        const newId = (lastId + 1).toString();

        const newConversation: Conversation = {
            id: newId,
            messages: []
        };

        // Create the new chat history with the new conversation
        const updatedChatHistory = chatHistory ? [...chatHistory, newConversation] : [newConversation];

        // Update the state with the new chat history
        setChatHistory(updatedChatHistory);

        // Set the new tab as active and ensure it's a string
        setCurrentTab(newId.toString());

        // Force a re-render to ensure the tab is properly focused
        setReloadKey(prev => prev + 1);

        // Update localStorage
        ChatHistory.save(updatedChatHistory);
        console.log("[CHAT] New conversation created");
    };

    const handleCloseTab = async (chatId: string) => {
        setChatToClose(chatId);
        setShowCloseDialog(true);
    }

    const confirmCloseTab = async () => {
        if (!chatToClose || !user?.id) {
            setShowCloseDialog(false);
            return;
        }

        try {
            // Delete from backend
            await deleteMessages(user.id, chatToClose);

            // Update local state
            let updatedHistory = chatHistory.filter((c) => c.id !== chatToClose);

            // If no conversations left, create a default one with Chat 1
            if (updatedHistory.length === 0) {
                updatedHistory = [{ id: "1", messages: [] }];
            }

            setChatHistory(updatedHistory);

            // Update localStorage
            ChatHistory.save(updatedHistory);
            console.log("[CHAT] Conversation deleted from database and localStorage");

            // Update current tab if needed
            setCurrentTab(prev => {
                if (prev === chatToClose) {
                    return updatedHistory[0].id;
                }
                return prev;
            });

            setReloadKey(prev => prev + 1);
        } catch (error) {
            console.error("Error closing tab:", error);
        } finally {
            setShowCloseDialog(false);
            setChatToClose(null);
        }
    }

    return (
        <>
            <Tabs
                value={currentTab}
                onValueChange={setCurrentTab}
                className="w-full"
            >

                {/* --- TAB HEADERS --- */}
                <div className="flex w-full">
                    <TabsList className="flex w-4/5 space-x-1">
                        {chatHistory?.map((chat) => (
                            <div key={chat.id} className="relative flex items-center">

                                {/* The tab button */}
                                <TabsTrigger value={chat.id} className="pr-8">
                                    {`Chat ${chat.id}`}
                                </TabsTrigger>

                                {/* Close (delete) button */}
                                <button
                                    className="absolute right-1 text-muted-foreground hover:text-red-500"
                                    onClick={(e) => {
                                        e.stopPropagation()  // Do NOT switch tabs when clicking X
                                        handleCloseTab(chat.id)
                                    }}
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                        ))}
                    </TabsList>

                    <Button
                        className="w-1/5 ml-4 px-3 py-1"
                        onClick={handleAddConversation}
                    >
                        + New Chat
                    </Button>
                </div>
                {/* --- TAB CONTENTS --- */}
                {chatHistory?.map((chat) => (
                    <TabsContent key={chat.id} value={chat.id.toString()} className="mt-4">
                        {/* Your Chatbot */}
                        <Chatbot
                            key={reloadKey + chat.id}
                            chatId={chat.id}
                            initialMessages={chat.messages}
                        />
                    </TabsContent>
                ))}

            </Tabs>
            <Dialog open={showCloseDialog} onOpenChange={setShowCloseDialog}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>¿Cerrar conversación?</DialogTitle>
                        <DialogDescription>
                            ¿Quieres terminar tu conversación en "Chat {chatToClose}"?
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="mt-4">
                        <Button
                            variant="outline"
                            onClick={() => setShowCloseDialog(false)}
                            className="mr-2"
                        >
                            Cancelar
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={confirmCloseTab}
                        >
                            Terminar conversación
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}
