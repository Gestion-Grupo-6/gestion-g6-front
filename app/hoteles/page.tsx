import { Header } from "@/components/header"
import { PlacesList } from "@/components/places-list"
import { FilterSidebar } from "@/components/filter-sidebar"

const hotelsData = [
  {
    id: 1,
    name: "Hotel Paraíso",
    category: "hotel",
    location: "Cancún, México",
    rating: 4.8,
    reviews: 342,
    price: 150,
    priceLabel: "$150/noche",
    image: "/luxury-beach-hotel-resort.jpg",
    description: "Resort de lujo frente al mar con todas las comodidades",
    amenities: ["WiFi", "Piscina", "Spa", "Restaurante"],
  },
  {
    id: 2,
    name: "Hotel Boutique Centro",
    category: "hotel",
    location: "Ciudad de México",
    rating: 4.6,
    reviews: 189,
    price: 95,
    priceLabel: "$95/noche",
    image: "/boutique-hotel-modern-interior.jpg",
    description: "Hotel boutique en el corazón de la ciudad",
    amenities: ["WiFi", "Desayuno", "Bar"],
  },
  {
    id: 3,
    name: "Eco Lodge Selva",
    category: "hotel",
    location: "Chiapas, México",
    rating: 4.9,
    reviews: 156,
    price: 120,
    priceLabel: "$120/noche",
    image: "/eco-lodge-jungle-nature.jpg",
    description: "Experiencia única en medio de la selva",
    amenities: ["WiFi", "Tours", "Restaurante"],
  },
  {
    id: 4,
    name: "Hotel Playa Dorada",
    category: "hotel",
    location: "Puerto Vallarta, México",
    rating: 4.7,
    reviews: 423,
    price: 180,
    priceLabel: "$180/noche",
    image: "/beach-resort-sunset-ocean-view.jpg",
    description: "Resort todo incluido frente al Pacífico",
    amenities: ["WiFi", "Piscina", "Spa", "Todo incluido"],
  },
  {
    id: 5,
    name: "Hotel Colonial",
    category: "hotel",
    location: "Guanajuato, México",
    rating: 4.5,
    reviews: 267,
    price: 85,
    priceLabel: "$85/noche",
    image: "/colonial-hotel-architecture-colorful.jpg",
    description: "Encanto colonial en ciudad histórica",
    amenities: ["WiFi", "Desayuno", "Terraza"],
  },
  {
    id: 6,
    name: "Hotel Moderno Business",
    category: "hotel",
    location: "Monterrey, México",
    rating: 4.4,
    reviews: 312,
    price: 110,
    priceLabel: "$110/noche",
    image: "/modern-business-hotel-lobby.jpg",
    description: "Hotel de negocios con instalaciones modernas",
    amenities: ["WiFi", "Gimnasio", "Centro de negocios"],
  },
]

export default function HotelesPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="bg-primary/10 py-12">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Hoteles</h1>
            <p className="text-lg text-muted-foreground">Encuentra el alojamiento perfecto para tu viaje</p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            <aside className="lg:w-64 flex-shrink-0">
              <FilterSidebar category="hotel" />
            </aside>
            <div className="flex-1">
              <PlacesList places={hotelsData} />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
