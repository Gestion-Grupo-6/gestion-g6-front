import type {UIMessage} from "ai";

export interface Messages {
  userId: string
  messages: Array<UIMessage>
}

export interface MessagesPayload {
  userId: string
  messages: Array<UIMessage>
}