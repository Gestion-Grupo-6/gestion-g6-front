import { Header } from "@/components/header"
import { PlacesList } from "@/components/places-list"
import { FilterSidebar } from "@/components/filter-sidebar"

const activitiesData = [
  {
    id: 1,
    name: "Tour Pirámides Mayas",
    category: "actividad",
    location: "Yucatán, México",
    rating: 4.7,
    reviews: 234,
    price: 80,
    priceLabel: "$80/persona",
    image: "/mayan-pyramid-chichen-itza.jpg",
    description: "Explora la historia maya en Chichén Itzá",
    amenities: ["Guía incluido", "Transporte", "Comida"],
  },
  {
    id: 2,
    name: "Buceo en Arrecife",
    category: "actividad",
    location: "Cozumel, México",
    rating: 4.9,
    reviews: 456,
    price: 120,
    priceLabel: "$120/persona",
    image: "/scuba-diving-coral-reef-underwater.jpg",
    description: "Descubre el mundo submarino del Caribe",
    amenities: ["Equipo incluido", "Instructor", "Certificación"],
  },
  {
    id: 3,
    name: "Paseo en Globo",
    category: "actividad",
    location: "Teotihuacán, México",
    rating: 4.8,
    reviews: 189,
    price: 150,
    priceLabel: "$150/persona",
    image: "/hot-air-balloon-pyramids-sunrise.jpg",
    description: "Vista aérea de las pirámides al amanecer",
    amenities: ["Desayuno incluido", "Certificado de vuelo"],
  },
  {
    id: 4,
    name: "Tour Gastronómico",
    category: "actividad",
    location: "Oaxaca, México",
    rating: 4.9,
    reviews: 312,
    price: 65,
    priceLabel: "$65/persona",
    image: "/food-tour-market-street-food.jpg",
    description: "Degusta los sabores auténticos de Oaxaca",
    amenities: ["Guía local", "Degustaciones", "Recetas"],
  },
  {
    id: 5,
    name: "Senderismo en Montaña",
    category: "actividad",
    location: "Chiapas, México",
    rating: 4.6,
    reviews: 178,
    price: 45,
    priceLabel: "$45/persona",
    image: "/mountain-hiking-trail-forest-nature.jpg",
    description: "Aventura en la naturaleza selvática",
    amenities: ["Guía", "Equipo básico", "Snacks"],
  },
  {
    id: 6,
    name: "Clase de Cocina Mexicana",
    category: "actividad",
    location: "Puebla, México",
    rating: 4.8,
    reviews: 267,
    price: 55,
    priceLabel: "$55/persona",
    image: "/cooking-class-mexican-cuisine-hands-on.jpg",
    description: "Aprende a cocinar platillos tradicionales",
    amenities: ["Chef profesional", "Ingredientes", "Recetas para llevar"],
  },
]

export default function ActividadesPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="bg-primary/10 py-12">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Actividades</h1>
            <p className="text-lg text-muted-foreground">Experiencias únicas e inolvidables</p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            <aside className="lg:w-64 flex-shrink-0">
              <FilterSidebar category="actividad" />
            </aside>
            <div className="flex-1">
              <PlacesList places={activitiesData} />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
