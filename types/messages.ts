import type {UIMessage} from "ai";

export interface Conversation {
  id: string
  messages: Array<UIMessage>
}

export interface MessagesPayload {
  userId: string
  conversationId: string
  messages: Array<UIMessage>
}