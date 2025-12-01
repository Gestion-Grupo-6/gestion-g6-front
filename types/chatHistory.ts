import { Conversation } from "@/types/messages";

/**
 * ChatHistory utility class
 * Handles all localStorage operations for chat conversations
 */
export class ChatHistory {
    private static readonly STORAGE_KEY = 'milongia_chat_history'

    /**
     * Serialize conversations for localStorage storage
     */
    private static serialize(conversations: Conversation[]): string {
        try {
            // Deep clone to avoid mutating original objects, keeping only essential fields
            const serializable = conversations.map(conv => ({
                id: conv.id,
                messages: conv.messages.map(msg => ({
                    id: msg.id,
                    role: msg.role,
                    parts: msg.parts,
                    metadata: msg.metadata || undefined
                }))
            }))
            return JSON.stringify(serializable)
        } catch (e) {
            console.error("Error serializing conversations:", e)
            return JSON.stringify([{ id: "1", messages: [] }])
        }
    }

    /**
     * Deserialize conversations from localStorage
     */
    private static deserialize(data: string): Conversation[] {
        try {
            const parsed = JSON.parse(data)
            if (!parsed || !Array.isArray(parsed)) {
                throw new Error("Invalid format")
            }
            return parsed
        } catch (e) {
            console.error("Error deserializing conversations:", e)
            return [{ id: "1", messages: [] }]
        }
    }

    /**
     * Get chat history from localStorage
     */
    static load(): Conversation[] {
        try {
            const stored = localStorage.getItem(this.STORAGE_KEY)
            if (stored) {
                const parsed = this.deserialize(stored)
                if (parsed && Array.isArray(parsed) && parsed.length > 0) {
                    console.log("[CHAT] Loaded conversations from localStorage")
                    return parsed
                }
            }
        } catch (e) {
            console.error("Failed to load from localStorage:", e)
        }

        // Fallback to default
        const defaultChat = [{ id: "1", messages: [] }]
        this.save(defaultChat)
        console.log("[CHAT] Starting with default conversation")
        return defaultChat
    }

    /**
     * Save chat history to localStorage
     */
    static save(conversations: Conversation[]): void {
        try {
            localStorage.setItem(this.STORAGE_KEY, this.serialize(conversations))
        } catch (e) {
            console.error("Failed to save to localStorage:", e)
        }
    }

    /**
     * Clear chat history from localStorage
     */
    static clear(): void {
        try {
            localStorage.removeItem(this.STORAGE_KEY)
            console.log("[CHAT] Cleared localStorage")
        } catch (e) {
            console.error("Failed to clear localStorage:", e)
        }
    }
}
