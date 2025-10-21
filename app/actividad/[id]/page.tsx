import { Header } from "@/components/header"
import { PlaceDetail } from "@/components/place-detail"
import { notFound } from "next/navigation"

const activitiesData = {
  "1": {
    id: 1,
    name: "Tour Pirámides Mayas",
    category: "actividad",
    location: "Yucatán, México",
    rating: 4.7,
    reviews: 234,
    price: 80,
    priceLabel: "$80/persona",
    images: [
      "/mayan-pyramid-chichen-itza.jpg",
      "/mayan-ruins-archaeological-site.jpg",
      "/tour-group-exploring-ancient-temple.jpg",
      "/cenote-natural-pool-yucatan.jpg",
    ],
    description:
      "Explora la historia maya en Chichén Itzá, una de las Siete Maravillas del Mundo Moderno. Este tour completo incluye visita guiada por un experto arqueólogo, tiempo libre para explorar, visita a un cenote sagrado y comida tradicional yucateca. Aprende sobre la fascinante civilización maya y su legado.",
    amenities: [
      "Guía certificado incluido",
      "Transporte con A/C",
      "Comida tradicional",
      "Entrada a Chichén Itzá",
      "Visita a cenote",
      "Agua embotellada",
      "Seguro de viajero",
      "Grupos pequeños (máx 15 personas)",
    ],
    address: "Salida desde hoteles en Cancún y Playa del Carmen",
    phone: "+52 984 123 4567",
    email: "tours@mayaexperience.com",
    website: "www.mayaexperience.com",
    duration: "10 horas (7:00 AM - 5:00 PM)",
    includes: "Transporte, guía, entradas, comida, agua",
  },
}

export default function ActividadDetailPage({ params }: { params: { id: string } }) {
  const place = activitiesData[params.id as keyof typeof activitiesData]

  if (!place) {
    notFound()
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <PlaceDetail place={place} />
      </main>
    </div>
  )
}
