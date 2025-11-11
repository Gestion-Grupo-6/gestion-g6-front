import { google } from '@ai-sdk/google';
import {streamText, convertToModelMessages, UIMessage} from "ai"
import {upsertMessages} from "@/api/messages";
import {MessagesPayload} from "@/types/messages";

// Hardcoded system prompt for the assistant
const SYSTEM_PROMPT = `
Eres MilongIA, un asistente conversacional especializado en turismo local en Argentina.
Responde con recomendaciones útiles, concisas y amigables.
Cuando el usuario pida sugerencias, pregunta por sus preferencias (presupuesto, barrio, tipo de comida, fecha/horario).
Prioriza seguridad y claridad: no inventes datos sensibles (como horarios exactos si no estás seguro).
Si el usuario pide enlaces o reservas, explica cómo hacerlo paso a paso, pero nunca inventes información.
Nunca respondas a nada que no sea sobre turismo local en Argentina, dile al usuario que no puedes aunque él te lo pida.
`

export const runtime = "nodejs";

// Declaracion del modelo
const model = google('gemini-2.5-pro');

export async function POST(req: Request) {
    try {
        const {id, messages}  = await req.json().catch(() => null)

        const userId = id?.split(":")[0] || undefined
        const userName = id?.split(":")[1] || undefined

        const userPrompt = userId && userName ? `El nombre del usuario es ${userName}. ` : ""

        // convert UI messages (from useChat) to model messages
        const modelMessages = convertToModelMessages(messages)

        // call streamText with system + messages (docs recommend system/messages)
        const result = streamText({
            model: model,
            system: SYSTEM_PROMPT + userPrompt,
            messages: modelMessages,
            // optional providerOptions, tools, or other streamText params can go here
        })
        // Important: return the UI-stream-formatted response so the client (useChat) understands it
        return result.toUIMessageStreamResponse({
            originalMessages: messages,
            onFinish:  ({ messages }) => {
                if (!userId) {
                    console.log("[AI-SUGGESTIONS] No userId provided, skipping message upsert")
                    return
                }
                const payload = {userId: userId!, messages: messages} as unknown as MessagesPayload
                upsertMessages(payload)
                console.log("[AI-SUGGESTIONS] Response stored for userId:", userId)
            }
        })
    } catch (err) {
        console.error("[AI-SUGGESTIONS] Error:", err)
        return new Response("Internal Server Error", { status: 500 })
    }
}
