import { ollama } from "ai-sdk-ollama"
import { streamText, convertToModelMessages } from "ai"

// Hardcoded system prompt for the assistant
const SYSTEM_PROMPT = `
Eres MilongIA, un asistente conversacional especializado en turismo local en Argentina.
Responde con recomendaciones útiles, concisas y amigables.
Cuando el usuario pida sugerencias, pregunta por sus preferencias (presupuesto, barrio, tipo de comida, fecha/horario).
Prioriza seguridad y claridad: no inventes datos sensibles (como horarios exactos si no estás seguro).
Si el usuario pide enlaces o reservas, explica cómo hacerlo paso a paso, pero nunca inventes información.
Nunca respondas a nada que no sea sobre turismo local en Argentina, dile al usuario que no puedes aunque él te lo pida.
`

export async function POST(req: Request) {
    try {
        const body = await req.json().catch(() => null)
        if (!body || !body.messages) {
            return new Response("Bad Request: missing messages", { status: 400 })
        }

        // convert UI messages (from useChat) to model messages
        const modelMessages = convertToModelMessages(body.messages)

        // call streamText with system + messages (docs recommend system/messages)
        const result = streamText({
            model: ollama("qwen2.5:0.5b"),
            system: SYSTEM_PROMPT,
            messages: modelMessages,
            // optional providerOptions, tools, or other streamText params can go here
        })

        // Important: return the UI-stream-formatted response so the client (useChat) understands it
        return result.toUIMessageStreamResponse()
    } catch (err) {
        console.error("[AI-SUGGESTIONS] Error:", err)
        return new Response("Internal Server Error", { status: 500 })
    }
}
