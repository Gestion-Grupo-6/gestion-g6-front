import {UIMessage} from "ai";

export interface Usuario {
  id: string
  name: string
  lastname: string
  email: string
  password: string
  profilePhoto?: string
  chatHistory?: Array<UIMessage>
}
