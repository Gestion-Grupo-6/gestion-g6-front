import { convertToModelMessages, generateText, streamText, UIMessage } from "ai"
import { openai } from "@ai-sdk/openai"

const model = openai("gpt-5")

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json()

  const systemPrompt = `Eres MilongIA, un asistente de viajes experto especializado en Argentina y destinos de habla hispana. Tu personalidad es cálida, entusiasta y conocedora, como un amigo local que conoce los mejores lugares.

Tu trabajo es:
- Hacer preguntas inteligentes sobre las preferencias del usuario (tipo de comida, presupuesto, ambiente, actividades favoritas, ocasión especial, etc.)
- Sugerir lugares específicos y reales basados en sus respuestas
- Proporcionar detalles útiles como ubicación exacta, rango de precios, horarios, y qué hace especial cada lugar
- Incluir tips locales y recomendaciones personalizadas
- Ser amigable, entusiasta y auténtico en tus respuestas

Enfócate especialmente en:
- Restaurantes de comida argentina y cocina local
- Hoteles boutique y alojamientos con encanto
- Actividades culturales y experiencias auténticas
- Lugares relacionados con el tango y la cultura argentina

Siempre responde en español y sé específico con tus recomendaciones. Usa un tono conversacional y cercano.`

  const systemMessage = { role: "system", content: systemPrompt, id: "system" } as unknown as UIMessage
  const prompt = convertToModelMessages([systemMessage, ...messages])

  console.log("Prompt sent to model:", prompt)

  const result = generateText({
    model: model,
    prompt: prompt,
    providerOptions: {
      openai: {
        textVerbosity: 'low', // 'low' for concise, 'medium' (default), or 'high' for verbose
      },
    },
    abortSignal: req.signal,
    temperature: 0.8,
  })

  return result
}
