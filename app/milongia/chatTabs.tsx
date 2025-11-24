"use client"

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { X } from "lucide-react"
import {useState} from "react"
import {Conversation, MessagesPayload} from "@/types/messages";
import {useAuth} from "@/contexts/AuthContext";
import {UIMessage} from "ai";
import {upsertMessages} from "@/api/messages";
import {Chatbot} from "@/app/milongia/chatbot";
import { Button } from "@/components/ui/button"

export default function ChatTabs() {
    const [reloadKey, setReloadKey] = useState(Date.now())
    const { user, isAuthenticated } = useAuth()
    const [ chatHistory, setChatHistory ] = useState< Conversation[] | undefined>(
        user?.chatHistory || new Array<Conversation>({
            id: 1,
            messages: []
        } as unknown as Conversation));

    const [ currentTab, setCurrentTab ] = useState<string>(
        chatHistory && chatHistory.length > 0 ? chatHistory[0].id : "1"
    );

    const handleMessageChange = (chatId: string, messages: UIMessage[]) => {
        const conversation = chatHistory?.find((c) => c.id === chatId);
        if (!conversation) return;

        // Prevent infinite loop — update only if changed
        const areEqual =
            JSON.stringify(conversation.messages) === JSON.stringify(messages);

        if (areEqual) return;

        conversation.messages = messages;

        const newChatHistory = chatHistory?.map((c) =>
            c.id === chatId ? conversation : c
        );

        // Update in backend
        const messagesPayload: MessagesPayload = {
            userId: user!.id,
            conversationId: chatId,
            messages: messages
        };
        upsertMessages(messagesPayload).then(() => {
            console.log("Mensajes actualizados en el backend para el usuario:", user!.id);
        }).catch((error) => {
            console.error("Error al actualizar los mensajes en el backend:", error);
        });

        setChatHistory(newChatHistory);
        if(user){
            user.chatHistory = newChatHistory;
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

        const newChatHistory = chatHistory ? [...chatHistory, newConversation] : [newConversation];

        if (!user?.id || !isAuthenticated) {
            console.log("El usuario no está autenticado o no tiene ID.")
        }else{
            const newMessagesPayload: MessagesPayload = {
                userId: user.id,
                conversationId: newId,
                messages: new Array<UIMessage>()
            };
            await upsertMessages(newMessagesPayload);
        }

        setChatHistory(newChatHistory);
        setCurrentTab(newId);
        setReloadKey(Date.now());
    };

    const handleCloseTab = async (chatId: string) => {
        if (!user?.id || !isAuthenticated) {
            console.log("El usuario no está autenticado o no tiene ID.")
        }
        const emptyMessagesPayload: MessagesPayload = {
            userId: user!.id,
            conversationId: chatId,
            messages: new Array<UIMessage>()
        };
        await upsertMessages(emptyMessagesPayload);
        console.log("Conversación eliminada. ID: ", user!.id);
        // Aquí podrías actualizar el estado local si es necesario
        const aux = chatHistory?.filter((c) => c.id !== chatId);
        setChatHistory(aux);
        setChatHistory((prev) => prev?.filter((c) => c.id !== chatId))
        setCurrentTab((prev: string) => {
            if (prev === chatId && chatHistory) {
                const remainingChats = chatHistory.filter(c => c.id !== chatId);
                return remainingChats.length > 0 ? remainingChats[0].id : "";
            }
            return prev;
        });
        setReloadKey(prev => prev + 1);
    }

    return (
        <Tabs defaultValue={currentTab} className="w-full">

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
                <TabsContent key={chat.id} value={chat.id} className="mt-4">
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
    )
}
