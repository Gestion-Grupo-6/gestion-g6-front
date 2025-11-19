import { google } from '@ai-sdk/google';
import { streamText, convertToModelMessages } from "ai";
import { upsertMessages } from "@/api/messages";
import { MessagesPayload } from "@/types/messages";
import {getLocationContext, getSystemPrompt} from "@/app/api/ai-suggestions/prompt";


export const runtime = "nodejs";

// Declaracion del modelo
const model = google(process.env.GEMINI_MODEL || "gemini-2.5-flash-lite");

export async function POST(req: Request) {
    try {
        const { id, messages } = await req.json().catch(() => null)
        const safeMessages = Array.isArray(messages) ? messages : []

        const userId = id?.split(":")[0] || undefined
        const userName = id?.split(":")[1] || undefined

        // convert UI messages (from useChat) to model messages
        const modelMessages = convertToModelMessages(safeMessages)

        const systemPrompt = await getSystemPrompt(userId, userName, getLocationContext(safeMessages));

        // call streamText with system + messages (docs recommend system/messages)
        const result = streamText({
            model: model,
            system: systemPrompt,
            messages: modelMessages,
            // optional providerOptions, tools, or other streamText params can go here
        })
        // Important: return the UI-stream-formatted response so the client (useChat) understands it
        return result.toUIMessageStreamResponse({
            originalMessages: safeMessages,
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
