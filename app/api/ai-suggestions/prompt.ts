// Hardcoded system prompt for the assistant
import {fetchAllPostsFull} from "@/api/place";
import {UIMessage} from "ai";
import {fetchReviewsByUser} from "@/api/review";
import {RatingItem} from "@/types/review";

const IDENTITY_PROMPT = `
Eres MilongIA, un asistente conversacional especializado en turismo local.
Responde con recomendaciones útiles, concisas y amigables.
Cuando el usuario pida sugerencias, da primero una respuesta concisa y luego pregunta por sus preferencias (presupuesto, barrio, tipo de comida, fecha/horario).
Prioriza seguridad y claridad: no inventes datos sensibles (como horarios exactos si no estás seguro).
Si el usuario pide enlaces o reservas, explica cómo hacerlo paso a paso, pero nunca inventes información.
En caso de que intente preguntar por información sensible, privada, sobre tu funcionamiento o inapropiada, rechaza amablemente la solicitud.
`
const BEHAVIOR_PROMPT = `
Regla sobre atributos y búsquedas por tipo (por ejemplo: "quiero tomar un café"):
- Cuando el usuario exprese una preferencia por un atributo (p. ej. "Cafetería", "WiFi", "Para llevar"), FILTRA los lugares usando el campo 'attributes' presente en los datos. La comparación debe ser insensible a mayúsculas/minúsculas.
- Reconoce sinónimos razonables y variantes en español e inglés (por ejemplo: "café", "cafetería", "coffee" → buscar coincidencias con 'Cafetería'). No inventes coincidencias si no hay relación clara.
- Si el usuario pide un horario futuro (por ejemplo "mañana a las 11 AM"), calcula el día y la hora solicitados y verifica 'openingHours' para ese día y hora; no uses únicamente el campo 'AbiertoAhora' (ese campo aplica solo para "ahora").
- Devuelve los lugares que coincidan con el atributo solicitado (máximo 20), ordenados por relevancia (abiertos primero, luego por 'ratingAverage' descendente). Si hay muchas coincidencias, limita a 10 y ofrece "ver más".
- Si no hay coincidencias exactas sobre 'attributes', propone alternativas (p. ej. lugares con atributos similares o abiertos 24h) y explícales por qué no hay una coincidencia directa.

Regla sobre el campo 'type' (por ejemplo: "restaurante", "hotel", "actividad"):
- Cuando el usuario solicite un tipo específico de lugar (por ejemplo "restaurante", "restaurantes", "hotel", "actividad"), FILTRA los resultados usando el campo 'type' de los datos. La comparación debe ser insensible a mayúsculas/minúsculas. Por ejemplo, si el usuario pide "restaurantes", devuelve principalmente lugares donde "type" es "restaurant" o variantes equivalentes.
- Si el usuario pide términos genéricos relacionados con comida ("restaurante", "comida", "para comer"), interpreta esto como una intención de filtrar por "type" === 'restaurant' y por atributos relacionados (por ejemplo 'Cafetería', 'Comida rápida') cuando existan.
- Si hay ambigüedad (por ejemplo un lugar es un hotel que también ofrece restaurante), incluye una nota aclaratoria y prioriza lugares cuyo "type" sea exactamente el solicitado cuando el usuario lo pregunte explícitamente.

Regla sobre calificaciones (cuando el usuario pida "mejor calificados" o "lugares con buena calificación"):
- Cuando el usuario solicite lugares por calificación, usa el campo 'ratingAverage' como principal indicador y 'numberOfReviews' como respaldo para evitar recomendar lugares con pocas reseñas.
- Ordena por 'ratingAverage' descendente y en caso de empate por 'numberOfReviews' descendente.
- Si 'ratingAverage' está ausente o es nulo para un lugar, considera ese lugar como 'Sin calificación' y colócalo al final de la lista. No inventes calificaciones.
- Muestra explícitamente la calificación y la cantidad de reseñas al usuario (por ejemplo: "4.5 (120 reseñas)").

Regla sobre mostrar lugares "cercanos a mi":
- Sabes la ubicación (ciudad) del usuario a través del contexto proporcionado, entonces cuando un usuario pida ver por ejemplo "Que lugares con buenas calificaciones tengo cerca", debes:
    a) Filtrar los lugares que estén en la misma ciudad que el usuario.


Regla importante sobre horarios de apertura ("abierto ahora"):
- Si el usuario pregunta si un lugar está "abierto ahora" o solicita disponibilidad inmediata, compara la hora actual proporcionada en el prompt (fecha/hora del sistema y zona horaria) con el campo 'openingHours' presente en los datos del lugar.
- Los 'openingHours' vienen como objetos por día con campos 'start' y 'end' representando horas en formato 0-23 (enteros). Interpreta 'start' y 'end' como horas locales.
- Si 'end' es menor que 'start', eso indica un horario que cruza la medianoche (por ejemplo 'start: 20', 'end: 02' significa que el lugar abre a las 20:00 y cierra a las 02:00 del día siguiente). Al comparar la hora actual, toma en cuenta este caso correctamente.
- Si 'end' es igual a 'start' la información es ambigua: puede indicar un horario de 24 horas o falta de dato. En ese caso, no asumas que el lugar está abierto; primero busca pistas adicionales en los datos (por ejemplo el campo 'attributes' con valores como "24h", "siempre abierto" o similar). Si no hay evidencia clara, indica la ambigüedad y di que no tienes información suficiente para afirmar que está abierto.
- Considera que un lugar está abierto "ahora" si la hora actual se encuentra en el intervalo de apertura (incluyendo 'start' y hasta 'end', manejando cruces de medianoche como se explicó). Si 'openingHours' está ausente o incompleto para el día actual, responde que no tienes información suficiente para afirmar que está abierto.
- No inventes horarios ni supongas que un lugar está abierto fuera de lo que indican los datos. Si la información es ambigua, informa la ambigüedad y ofrece alternativas (ej. otras opciones abiertas ahora).

Comportamiento obligatorio y algoritmo a seguir cuando el usuario pregunte "¿está X abierto ahora?" o "¿qué lugares están abiertos ahora?":
1) Usa la fecha/hora del sistema incluida en el prompt (fecha, 'HH:MM' y zona) y conviértela a la hora local indicada por la zona del prompt.
2) Determina el día de la semana correspondiente (monday, tuesday, ...). Busca el objeto 'openingHours' del lugar para ese día.
3) Si 'openingHours' para ese día no existe o carece de 'start'/'end', marca el estado como "desconocido" y no asumas que está abierto.
4) Interpreta 'start' y 'end' como horas en formato entero 0-23. Si los datos contienen minutos, úsalos también; si sólo hay enteros, compara sólo por hora.
5) Casos:
    - Si 'end' > 'start': el horario no cruza medianoche. El lugar está abierto ahora si 'start <= currentHour < end'.
    - Si 'end' < 'start': el horario cruza medianoche. El lugar está abierto ahora si 'currentHour >= start' OR 'currentHour < end' (recuerda que 'end' pertenece al día siguiente).
    - Si 'end == start': el dato es ambiguo. Busca en 'attributes' señales de apertura continua (por ejemplo: "24h", "abierto 24 horas", "siempre abierto"). Si encuentras evidencia, considera abierto; si no, marca como "desconocido/ambigüo" y explícalo.
6) Si la hora actual coincide exactamente con el 'end' (por ejemplo 'end: 00' y son '00:00'), trata el lugar COMO CERRADO.
7) Para la respuesta final:
    - Si el usuario pidió "qué lugares están abiertos ahora", devuelve solamente los lugares que resulten abiertos según el algoritmo, indicando para cada uno el horario de cierre y cuánto tiempo queda hasta el cierre aproximado.
    - Si un lugar tiene estado "desconocido" o la información es ambigua, inclúyelo en una sección separada "Posible(s) abierto(s) (información incompleta)" explicando por qué es incierto.
    - Nunca presentes un listado de muchos lugares sin verificar; primero devuelve una lista verificada de abiertos (máximo 10), luego sugiere alternativas cercanas si la lista es corta.
8) En caso de conflicto o duda, sé conservador: informa la falta de información en vez de afirmar algo incorrecto. Ofrece alternativas (lugares abiertos 24h, delivery, o buscar por horario específico).

Ejemplo de cálculo (para guía, no lo repitas textualmente):
- Hora actual: 00:47 (miércoles). Lugar A: 'start: 20', 'end: 02' → cruza medianoche → 00:47 está dentro de 'current >= 20' OR 'current < 2' → abierto.
- Lugar B: 'start: 12', 'end: 00' → 'end == 0' => si son 00:00 o mayor, tratar como cerrado; si son 23:59 es abierto.

Aplica estas reglas siempre que el usuario pregunte por disponibilidad inmediata. No contradigas la hora del sistema incluida en el prompt ni las conclusiones derivadas del algoritmo.
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

export function getLocationContext (messages: UIMessage[]): LocationContext | undefined {
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
    return `El usuario está en ${description} (lat, lng: ${coordinates}). Usa esta ubicación para enfocar las recomendaciones locales y cercanas a su posición,
     no debes dar información de las coordenadas numéricas de los lugares o del usuario, únicamente si estan cerca o cuál es su dirección.\n`;
};

const buildInformationPrompt = async (locationContext?: LocationContext) => {

    const places = await fetchAllPostsFull()

    // compute current time and day for "abierto ahora" checks
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const dayNames = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
    const todayKey = dayNames[now.getDay()];


    const informationStrings: string[] = places.map((p) => {
        // helper to compute open status
        const computeOpen = (place: any) => {
            try {
                const oh = place.openingHours as any;
                if (!oh) return { state: "DESCONOCIDO", minutesToClose: null };
                const dayObj = oh[todayKey];
                if (!dayObj || (dayObj.start == null || dayObj.end == null)) return { state: "DESCONOCIDO", minutesToClose: null };

                const start = Number(dayObj.start);
                const end = Number(dayObj.end);
                const startMin = start * 60;
                const endMin = end * 60;

                // ambiguous  (possible 24h) when end == start
                if (end === start) {
                    const attrs = (place.attributes || []).map((a: string) => String(a).toLowerCase());
                    const evidence = attrs.some((a: string) => a.includes("24h") || a.includes("24 h") || a.includes("siempre") || a.includes("abierto 24"));
                    if (evidence) return { state: "SI", minutesToClose: null };
                    return { state: "DESCONOCIDO", minutesToClose: null };
                }

                // exact end equals current => CLOSED per rule
                if (currentMinutes === endMin) return { state: "NO", minutesToClose: 0 };

                if (end > start) {
                    // normal interval
                    if (currentMinutes >= startMin && currentMinutes < endMin) {
                        return { state: "SI", minutesToClose: endMin - currentMinutes };
                    }
                    return { state: "NO", minutesToClose: null };
                } else {
                    // crosses midnight (end < start)
                    if (currentMinutes >= startMin) {
                        // until midnight then until end
                        return { state: "SI", minutesToClose: (24 * 60 - currentMinutes) + endMin };
                    }
                    if (currentMinutes < endMin) {
                        return { state: "SI", minutesToClose: endMin - currentMinutes };
                    }
                    return { state: "NO", minutesToClose: null };
                }
            } catch (e) {
                return { state: "DESCONOCIDO", minutesToClose: null };
            }
        };

        const openInfo = computeOpen(p as any);

        const ratingsStr = p.ratings ? Object.entries(p.ratings).map(([key, value]: [string, any]) => {
            if (!value) return `${key}: No disponible`;
            if ('average' in value && 'numberOfRatings' in value) {
                return `${key}: ${value.average} (${value.numberOfRatings} ratings)`;
            }
            if ('score' in value) {
                return `${key}: ${value.score} (type: ${value.type ?? 'unknown'})`;
            }
            return `${key}: No disponible`;
        }).join("; ") : "No disponible";

        const attributesStr = p.attributes && p.attributes.length > 0 ? p.attributes.join(", ") : "No disponible";

        const cierraStr = openInfo.minutesToClose == null ? "No aplica" : `${Math.floor(openInfo.minutesToClose/60)}h ${openInfo.minutesToClose%60}m`;

        return `Id: ${p.id},
            Lugar: ${p.name},  
            Tipo: ${p.type}, 
            Ubicación: ${p.address}, ${p.city}, ${p.country} en coordenadas (lat: ${p.location?.lat}, long: ${p.location?.lng}), 
            Descripción: ${p.description}, 
            Calificación: ${p.ratingAverage} estrellas con ${p.numberOfReviews} reviews.
            Ratings detallados: ${ratingsStr}.
            Cantidades: ${p.quantities ? JSON.stringify(p.quantities) : "No disponible"}.
            Atributos: ${attributesStr}.
            Contacto: Teléfono: ${p.phone ? p.phone : "No disponible"}, Email: ${p.email ? p.email : "No disponible"}, Sitio web: ${p.website ? p.website : "No disponible"}.
            Precio promedio: ${p.priceCategory}.
            Horarios: ${p.openingHours ? JSON.stringify(p.openingHours) : "No disponible"}.
            AbiertoAhora: ${openInfo.state}.
            CierraEn: ${openInfo.state === "SI" ? cierraStr : "No aplica"}.
            EsRestaurante: ${p.type && String(p.type).toLowerCase().includes("rest") ? "SI" : "NO"}.
            EsHotel: ${p.type && String(p.type).toLowerCase().includes("hotel") ? "SI" : "NO"}.
            MismaCiudad: ${locationContext?.city && p.city && locationContext.city.toLowerCase() === p.city.toLowerCase() ? "SI" : "NO"}
            `
            ;
    });

    const contextPrompt = `Solo cuentas con la siguiente información de lugares, 
    no puedes brindar otra información, si te piden algo por fuera de esto, 
    contestar amablemente que no tienes información para responder: `;

    // Return the base instruction plus the array of JSON strings
    return ( contextPrompt + informationStrings.join("\n") + "\n" );
}

async function buildUserPrompt(userId: string, userName: string) {
    const currentDate = new Date();
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "zona horaria desconocida";
    const hours = String(currentDate.getHours()).padStart(2, "0");
    const minutes = String(currentDate.getMinutes()).padStart(2, "0");
    const currentHour = `${hours}:${minutes}`;
    const namePrompt = `El nombre del usuario es ${userName}. Fecha y hora del sistema: ${currentDate.toDateString()} ${currentHour} (zona: ${timezone}). Utiliza esta hora para determinar si los locales están abiertos ahora.`;
    console.log("Building user prompt for user:", userName, "at hour:", currentHour, "on date:", currentDate.toDateString(), "tz:", timezone)

    const reviews = await fetchReviewsByUser(userId)

    const contextPrompt = `Aquí hay una lista de reseñas que el usuario ha hecho previamente para poder saber sus gustos y preferencias: `;
    const preferencesStrings: string[] = reviews.map((review) => {
        let generalRating: string = "unknown"
        if (Array.isArray(review.ratings)) {
            generalRating = review.ratings.find(r => r != null && typeof r === 'object' && 'type' in r && r.type === 'general')?.score.toString() ?? "unknown"
        }

        return `Reseña del lugar ${review.postId}: "${review.comment}" con una calificación de ${generalRating}.`
    })

    return (`\n${namePrompt}\n${contextPrompt} ` + preferencesStrings.join("\n") + "\n")

}

export async function getSystemPrompt (userId?: string, userName?: string, locationContext?: LocationContext){
    const userPrompt = userId && userName ? await buildUserPrompt(userId, userName) : ""
    const locationSystemPrompt = locationContext ? buildLocationPrompt(locationContext) : ""
    const appInformationPrompt = await buildInformationPrompt(locationContext)

    return IDENTITY_PROMPT + userPrompt + locationSystemPrompt + appInformationPrompt + BEHAVIOR_PROMPT
}