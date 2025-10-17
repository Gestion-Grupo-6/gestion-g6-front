import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { PlaceDetail } from "@/components/place-detail"
import { notFound } from "next/navigation"

const destinationsData = {
  "1": {
    id: 1,
    name: "Playa del Carmen",
    category: "destino",
    location: "Quintana Roo, México",
    rating: 4.6,
    reviews: 892,
    price: 0,
    priceLabel: "Gratis",
    images: [
      "/caribbean-beach-turquoise-water.jpg",
      "/playa-del-carmen-fifth-avenue-shopping.jpg",
      "/beach-club-lounge-chairs-palm-trees.jpg",
      "/nightlife-bars-restaurants-street.jpg",
    ],
    description:
      "Paraíso caribeño con playas de arena blanca y aguas turquesas. Playa del Carmen combina la belleza natural del Caribe con una vibrante vida urbana. Disfruta de playas espectaculares, la famosa Quinta Avenida con sus tiendas y restaurantes, parques temáticos cercanos, y una vida nocturna animada. Punto de partida perfecto para explorar la Riviera Maya.",
    amenities: [
      "Playas públicas",
      "Vida nocturna vibrante",
      "Quinta Avenida (compras)",
      "Deportes acuáticos",
      "Parques temáticos cercanos",
      "Ferry a Cozumel",
      "Cenotes cercanos",
      "Gastronomía internacional",
    ],
    address: "Playa del Carmen, Quintana Roo, México",
    phone: "Oficina de turismo: +52 984 873 2804",
    email: "turismo@playadelcarmen.gob.mx",
    website: "www.playadelcarmen.com",
    bestTime: "Noviembre a Abril (temporada seca)",
    howToGet: "Aeropuerto de Cancún (45 min en auto), autobuses ADO desde principales ciudades",
  },
}

export default function DestinoDetailPage({ params }: { params: { id: string } }) {
  const place = destinationsData[params.id as keyof typeof destinationsData]

  if (!place) {
    notFound()
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <PlaceDetail place={place} />
      </main>
      <Footer />
    </div>
  )
}
