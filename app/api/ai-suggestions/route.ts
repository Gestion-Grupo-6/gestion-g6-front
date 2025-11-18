import { google } from '@ai-sdk/google';
import { streamText, convertToModelMessages, UIMessage } from "ai";
import { upsertMessages } from "@/api/messages";
import { MessagesPayload } from "@/types/messages";
import {fetchAllPlaces} from "@/api/place";

// Hardcoded system prompt for the assistant
const IDENTITY_PROMPT = `
Eres MilongIA, un asistente conversacional especializado en turismo local.
Responde con recomendaciones útiles, concisas y amigables.
Cuando el usuario pida sugerencias, da primero una respuesta concisa y luego pregunta por sus preferencias (presupuesto, barrio, tipo de comida, fecha/horario).
Prioriza seguridad y claridad: no inventes datos sensibles (como horarios exactos si no estás seguro).
Si el usuario pides enlaces o reservas, explica cómo hacerlo paso a paso, pero nunca inventes información.
`

type LocationContext = {
    lat: number;
    lng: number;
    city?: string;
    country?: string;
    address?: string;
};

type LocationMetadata = {
    location?: LocationContext;
};

const getLocationContext = (messages: UIMessage[]): LocationContext | undefined => {
    for (let i = messages.length - 1; i >= 0; i--) {
        const metadata = messages[i].metadata as LocationMetadata | undefined;
        if (metadata?.location) {
            return metadata.location;
        }
    }
    return undefined;
};

const describeLocation = (location: LocationContext) => {
    const descriptors: string[] = [];
    if (location.city) descriptors.push(location.city);
    if (location.country) descriptors.push(location.country);
    if (location.address) descriptors.push(location.address);
    if (descriptors.length > 0) {
        return descriptors.join(", ");
    }
    return "las coordenadas disponibles";
};

const buildLocationPrompt = (location: LocationContext) => {
    const description = describeLocation(location);
    const coordinates = `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`;
    return `El usuario está en ${description} (lat, lng: ${coordinates}). Usa esta ubicación para enfocar las recomendaciones locales y cercanas a su posición.\n`;
};

const buildInformationPrompt = async () => {

    const places = await fetchAllPlaces()

     // Convert each place object to a JSON string
    const informationStrings: string[] = Array.isArray(places)
      ? places.map((p) => JSON.stringify(p))
      : [JSON.stringify(places)];

    // Return the base instruction plus the array of JSON strings
    return (
      "Solo cuentas con la siguiente información de lugares, no puedes brindar otra información, si te piden algo por fuera de esto, constesta amablemente que no tienes información para responder: " +
      JSON.stringify(informationStrings)
    );
}

const getSystemPrompt = async (userId?: string, userName?: string, locationContext?: LocationContext) => {
    const userPrompt = userId && userName ? `El nombre del usuario es ${userName}. ` : ""
    const locationSystemPrompt = locationContext ? buildLocationPrompt(locationContext) : ""
    const appInformationPrompt = await buildInformationPrompt()

    return IDENTITY_PROMPT + userPrompt + locationSystemPrompt + appInformationPrompt
}

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
