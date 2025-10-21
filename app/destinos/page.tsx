import { Header } from "@/components/header"
import { PlacesList } from "@/components/places-list"
import { FilterSidebar } from "@/components/filter-sidebar"

const destinationsData = [
  {
    id: 1,
    name: "Playa del Carmen",
    category: "destino",
    location: "Quintana Roo, México",
    rating: 4.6,
    reviews: 892,
    price: 0,
    priceLabel: "Gratis",
    image: "/caribbean-beach-turquoise-water.jpg",
    description: "Paraíso caribeño con playas de arena blanca",
    amenities: ["Playas", "Vida nocturna", "Compras", "Deportes acuáticos"],
  },
  {
    id: 2,
    name: "San Miguel de Allende",
    category: "destino",
    location: "Guanajuato, México",
    rating: 4.8,
    reviews: 567,
    price: 0,
    priceLabel: "Gratis",
    image: "/placeholder.svg?height=300&width=400",
    description: "Ciudad colonial llena de arte y cultura",
    amenities: ["Arquitectura", "Galerías", "Festivales", "Gastronomía"],
  },
  {
    id: 3,
    name: "Barrancas del Cobre",
    category: "destino",
    location: "Chihuahua, México",
    rating: 4.7,
    reviews: 234,
    price: 0,
    priceLabel: "Gratis",
    image: "/placeholder.svg?height=300&width=400",
    description: "Impresionante sistema de cañones",
    amenities: ["Senderismo", "Tren", "Miradores", "Naturaleza"],
  },
  {
    id: 4,
    name: "Tulum",
    category: "destino",
    location: "Quintana Roo, México",
    rating: 4.9,
    reviews: 1023,
    price: 0,
    priceLabel: "Gratis",
    image: "/placeholder.svg?height=300&width=400",
    description: "Ruinas mayas frente al mar Caribe",
    amenities: ["Ruinas", "Playas", "Cenotes", "Yoga"],
  },
  {
    id: 5,
    name: "Valle de Guadalupe",
    category: "destino",
    location: "Baja California, México",
    rating: 4.8,
    reviews: 445,
    price: 0,
    priceLabel: "Gratis",
    image: "/placeholder.svg?height=300&width=400",
    description: "Ruta del vino con viñedos y bodegas",
    amenities: ["Viñedos", "Catas", "Restaurantes", "Paisajes"],
  },
  {
    id: 6,
    name: "Guanajuato Capital",
    category: "destino",
    location: "Guanajuato, México",
    rating: 4.7,
    reviews: 678,
    price: 0,
    priceLabel: "Gratis",
    image: "/placeholder.svg?height=300&width=400",
    description: "Ciudad patrimonio con callejones y túneles",
    amenities: ["Museos", "Teatro", "Callejoneadas", "Arquitectura"],
  },
]

export default function DestinosPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="bg-primary/10 py-12">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Destinos</h1>
            <p className="text-lg text-muted-foreground">Explora los lugares más increíbles</p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            <aside className="lg:w-64 flex-shrink-0">
              <FilterSidebar category="destino" />
            </aside>
            <div className="flex-1">
              <PlacesList places={destinationsData} />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
