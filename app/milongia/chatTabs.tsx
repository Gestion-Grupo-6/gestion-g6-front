"use client"

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { X } from "lucide-react"
import {useEffect, useState} from "react"
import {Conversation, MessagesPayload} from "@/types/messages";
import {useAuth} from "@/contexts/AuthContext";
import {UIMessage} from "ai";
import {deleteMessages, upsertMessages} from "@/api/messages";
import {Chatbot} from "@/app/milongia/chatbot";
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export default function ChatTabs() {
    const [reloadKey, setReloadKey] = useState(Date.now())
    const { user, isAuthenticated } = useAuth()
    const [chatToClose, setChatToClose] = useState<string | null>(null)
    const [showCloseDialog, setShowCloseDialog] = useState(false)
    const [ chatHistory, setChatHistory ] = useState<Conversation[] | undefined>(
        user?.chatHistory || new Array<Conversation>({
            id: 1,
            messages: []
        } as unknown as Conversation));

    const [currentTab, setCurrentTab] = useState<string>(
        chatHistory && chatHistory.length > 0 ? chatHistory[0].id.toString() : "1"
    );

    // Update currentTab when chatHistory changes (e.g., on initial load)
    useEffect(() => {
        if (chatHistory && chatHistory.length > 0 && !chatHistory.some(chat => chat.id.toString() === currentTab)) {
            setCurrentTab(chatHistory[chatHistory.length - 1].id.toString());
        }
    }, [chatHistory]);

    const handleMessageChange = async (chatId: string, messages: UIMessage[]) => {
        if (!user?.id) {
            console.error("User not authenticated or missing ID");
            return;
        }

        try {
            const conversation = chatHistory?.find((c) => c.id === chatId);
            if (!conversation) {
                console.error(`Conversation with id ${chatId} not found`);
                return;
            }

            // Only update if messages have actually changed
            const messagesChanged = 
                JSON.stringify(conversation.messages) !== JSON.stringify(messages);
            
            if (!messagesChanged) return;

            // Update local state first for immediate UI update
            const updatedConversation = { ...conversation, messages };
            const newChatHistory = chatHistory?.map((c) =>
                c.id === chatId ? updatedConversation : c
            ) || [];

            setChatHistory(newChatHistory);

            // Then update in the backend
            const messagesPayload: MessagesPayload = {
                userId: user.id,
                conversationId: chatId,
                messages: messages
            };

            await upsertMessages(messagesPayload);
            console.log("Messages updated in the backend for user:", user.id);

            // Update user context if needed
            if (user) {
                user.chatHistory = newChatHistory;
            }
        } catch (error) {
            console.error("Error updating messages:", error);
        }
    };


    const handleAddConversation = async () => {
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

        // Save to backend if user is authenticated
        if (user?.id && isAuthenticated) {
            try {
                const newMessagesPayload: MessagesPayload = {
                    userId: user.id,
                    conversationId: newId,
                    messages: []
                };
                await upsertMessages(newMessagesPayload);
            } catch (error) {
                console.error("Error creating new conversation:", error);
                // Revert the UI if there's an error
                setChatHistory(prev => prev?.filter(c => c.id !== newId) || []);
                setCurrentTab(prev => prev === newId ? '' : prev);
            }
        } else {
            console.log("El usuario no está autenticado o no tiene ID.");
        }
    };

    const handleCloseTab = async (chatId: string) => {
        setChatToClose(chatId);
        setShowCloseDialog(true);
    }

    const confirmCloseTab = async () => {
        if (!chatToClose || !user?.id || !isAuthenticated) {
            setShowCloseDialog(false);
            return;
        }

        try {

            await deleteMessages(user.id, chatToClose);
            
            // Update local state
            setChatHistory(prev => {
                const updated = prev?.filter((c) => c.id !== chatToClose) || [];
                return updated;
            });

            // Update current tab if needed
            setCurrentTab(prev => {
                if (prev === chatToClose && chatHistory) {
                    const remainingChats = chatHistory.filter(c => c.id !== chatToClose);
                    return remainingChats.length > 0 ? remainingChats[0].id : "";
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
                        onChangeMessagesAction={handleMessageChange}
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
