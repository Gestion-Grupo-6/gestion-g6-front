import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { PlaceDetail } from "@/components/place-detail"
import { notFound } from "next/navigation"

const restaurantsData = {
  "1": {
    id: 1,
    name: "La Cocina del Chef",
    category: "restaurante",
    location: "Ciudad de México",
    rating: 4.9,
    reviews: 567,
    price: 50,
    priceLabel: "$$",
    images: [
      "/elegant-restaurant-interior.jpg",
      "/restaurant-kitchen-chef-cooking.jpg",
      "/gourmet-food-plating-presentation.jpg",
      "/restaurant-terrace-outdoor-dining.jpg",
    ],
    description:
      "Cocina mexicana contemporánea con ingredientes locales de la más alta calidad. Nuestro chef ejecutivo combina técnicas tradicionales con toques modernos para crear platillos únicos que celebran los sabores de México. Ambiente elegante y acogedor perfecto para cualquier ocasión.",
    amenities: [
      "Reservaciones en línea",
      "Terraza al aire libre",
      "Bar de cocteles",
      "Menú vegetariano",
      "Menú vegano",
      "Opciones sin gluten",
      "Estacionamiento valet",
      "Música en vivo fines de semana",
    ],
    address: "Av. Presidente Masaryk 393, Polanco, 11560 Ciudad de México",
    phone: "+52 55 1234 5678",
    email: "reservas@lacocinadelchef.com",
    website: "www.lacocinadelchef.com",
    hours: "Lunes a Domingo: 13:00 - 23:00",
  },
}

export default function RestauranteDetailPage({ params }: { params: { id: string } }) {
  const place = restaurantsData[params.id as keyof typeof restaurantsData]

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
