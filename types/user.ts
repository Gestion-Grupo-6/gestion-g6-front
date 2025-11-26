import {UIMessage} from "ai";
import {Conversation} from "@/types/messages";

export interface Usuario {
  id: string
  name: string
  lastname: string
  email: string
  password: string
  profilePhoto?: string
  chatHistory?: Array<Conversation>
}
