// Hardcoded system prompt for the assistant
import {fetchAllPlaces} from "@/api/place";
import {UIMessage} from "ai";
import {fetchReviewsByUser} from "@/api/review";
import {RatingItem} from "@/types/review";

const IDENTITY_PROMPT = `
Eres MilongIA, un asistente conversacional especializado en turismo local.
Responde con recomendaciones útiles, concisas y amigables.
Cuando el usuario pida sugerencias, da primero una respuesta concisa y luego pregunta por sus preferencias (presupuesto, barrio, tipo de comida, fecha/horario).
Prioriza seguridad y claridad: no inventes datos sensibles (como horarios exactos si no estás seguro).
Si el usuario pides enlaces o reservas, explica cómo hacerlo paso a paso, pero nunca inventes información.
En caso de que intente preguntar por información sensible, privada o inapropiada, rechaza amablemente la solicitud.
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

const buildInformationPrompt = async () => {

    const places = await fetchAllPlaces()

    // Convert each place object to a JSON string
    const informationStrings: string[] = places.map((p) => {
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
            Horarios: ${p.openingHours ? JSON.stringify(p.openingHours) : "No disponible"}.`
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
    const namePrompt = `El nombre del usuario es ${userName}. Hoy es ${currentDate.toDateString()} lo puedes utilizar para indicarle locales abiertos ahora.`;
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
    const appInformationPrompt = await buildInformationPrompt()

    return IDENTITY_PROMPT + userPrompt + locationSystemPrompt + appInformationPrompt
}