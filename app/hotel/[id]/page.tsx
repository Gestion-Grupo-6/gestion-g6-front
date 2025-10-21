import { Header } from "@/components/header"
import { PlaceDetail } from "@/components/place-detail"
import { notFound } from "next/navigation"

const hotelsData = {
  "1": {
    id: 1,
    name: "Hotel Paraíso",
    category: "hotel",
    location: "Cancún, México",
    rating: 4.8,
    reviews: 342,
    price: 150,
    priceLabel: "$150/noche",
    images: [
      "/luxury-beach-hotel-resort.jpg",
      "/hotel-pool-area.jpg",
      "/hotel-room-interior-luxury.jpg",
      "/hotel-restaurant-dining.png",
    ],
    description:
      "Resort de lujo frente al mar con todas las comodidades. Disfruta de una experiencia inolvidable con vistas espectaculares al Caribe, servicio de primera clase y amenidades exclusivas. Nuestras habitaciones están diseñadas para tu máximo confort con decoración elegante y tecnología moderna.",
    amenities: [
      "WiFi gratuito",
      "Piscina infinity",
      "Spa completo",
      "3 Restaurantes",
      "Bar en la playa",
      "Gimnasio 24h",
      "Servicio a habitación",
      "Estacionamiento",
    ],
    address: "Blvd. Kukulcan Km 12.5, Zona Hotelera, 77500 Cancún, Q.R.",
    phone: "+52 998 123 4567",
    email: "info@hotelparaiso.com",
    website: "www.hotelparaiso.com",
    checkIn: "15:00",
    checkOut: "12:00",
  },
}

export default function HotelDetailPage({ params }: { params: { id: string } }) {
  const place = hotelsData[params.id as keyof typeof hotelsData]

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
