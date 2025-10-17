import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { PlacesList } from "@/components/places-list"
import { FilterSidebar } from "@/components/filter-sidebar"

const restaurantsData = [
  {
    id: 1,
    name: "La Cocina del Chef",
    category: "restaurante",
    location: "Ciudad de México",
    rating: 4.9,
    reviews: 567,
    price: 50,
    priceLabel: "$$",
    image: "/elegant-restaurant-interior.jpg",
    description: "Cocina mexicana contemporánea con ingredientes locales",
    amenities: ["Reservaciones", "Terraza", "Bar", "Menú vegetariano"],
  },
  {
    id: 2,
    name: "Mariscos El Puerto",
    category: "restaurante",
    location: "Mazatlán, México",
    rating: 4.7,
    reviews: 389,
    price: 35,
    priceLabel: "$$",
    image: "/seafood-restaurant-ocean-view.jpg",
    description: "Los mejores mariscos frescos del Pacífico",
    amenities: ["Vista al mar", "Terraza", "Música en vivo"],
  },
  {
    id: 3,
    name: "Taquería La Esquina",
    category: "restaurante",
    location: "Guadalajara, México",
    rating: 4.8,
    reviews: 892,
    price: 15,
    priceLabel: "$",
    image: "/authentic-mexican-taqueria-street-food.jpg",
    description: "Tacos auténticos al estilo tradicional",
    amenities: ["Para llevar", "Servicio rápido"],
  },
  {
    id: 4,
    name: "Restaurante Gourmet",
    category: "restaurante",
    location: "Puebla, México",
    rating: 4.9,
    reviews: 234,
    price: 75,
    priceLabel: "$$$",
    image: "/fine-dining-gourmet-restaurant-elegant.jpg",
    description: "Alta cocina con fusión de sabores",
    amenities: ["Reservaciones", "Sommelier", "Menú degustación"],
  },
  {
    id: 5,
    name: "Café Bohemio",
    category: "restaurante",
    location: "Oaxaca, México",
    rating: 4.6,
    reviews: 445,
    price: 20,
    priceLabel: "$",
    image: "/bohemian-cafe-cozy-atmosphere.jpg",
    description: "Café artesanal y comida orgánica",
    amenities: ["WiFi", "Terraza", "Menú vegano"],
  },
  {
    id: 6,
    name: "Asador Premium",
    category: "restaurante",
    location: "Monterrey, México",
    rating: 4.8,
    reviews: 512,
    price: 60,
    priceLabel: "$$$",
    image: "/steakhouse-premium-meat-grill.jpg",
    description: "Cortes premium y parrilladas especiales",
    amenities: ["Reservaciones", "Bar", "Cava de vinos"],
  },
]

export default function RestaurantesPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="bg-primary/10 py-12">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Restaurantes</h1>
            <p className="text-lg text-muted-foreground">Descubre la mejor gastronomía local</p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            <aside className="lg:w-64 flex-shrink-0">
              <FilterSidebar category="restaurante" />
            </aside>
            <div className="flex-1">
              <PlacesList places={restaurantsData} />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
