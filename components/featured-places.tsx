import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, MapPin } from "lucide-react"
import Link from "next/link"

const featuredPlaces = [
  {
    id: 1,
    name: "Hotel Paraíso",
    category: "hotel",
    location: "Cancún, México",
    rating: 4.8,
    reviews: 342,
    price: "$150",
    image: "/luxury-beach-hotel-resort.jpg",
    description: "Resort de lujo frente al mar",
  },
  {
    id: 2,
    name: "La Cocina del Chef",
    category: "restaurante",
    location: "Ciudad de México",
    rating: 4.9,
    reviews: 567,
    price: "$$",
    image: "/elegant-restaurant-interior.jpg",
    description: "Cocina mexicana contemporánea",
  },
  {
    id: 3,
    name: "Tour Pirámides Mayas",
    category: "actividad",
    location: "Yucatán, México",
    rating: 4.7,
    reviews: 234,
    price: "$80",
    image: "/mayan-pyramid-chichen-itza.jpg",
    description: "Explora la historia maya",
  },
  {
    id: 4,
    name: "Playa del Carmen",
    category: "destino",
    location: "Quintana Roo, México",
    rating: 4.6,
    reviews: 892,
    price: "Gratis",
    image: "/caribbean-beach-turquoise-water.jpg",
    description: "Paraíso caribeño",
  },
]

export function FeaturedPlaces() {
  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3 text-balance">Lugares destacados</h2>
          <p className="text-lg text-muted-foreground">Los favoritos de nuestra comunidad</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredPlaces.map((place) => (
            <Link key={place.id} href={`/${place.category}/${place.id}`}>
              <Card className="group overflow-hidden hover:shadow-xl transition-all duration-300 h-full">
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src={place.image || "/placeholder.svg"}
                    alt={place.name}
                    className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-300"
                  />
                  <Badge className="absolute top-3 right-3 bg-background/90 text-foreground">{place.category}</Badge>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-bold text-lg text-foreground mb-2 group-hover:text-primary transition-colors">
                    {place.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3">{place.description}</p>

                  <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                    <MapPin className="h-4 w-4" />
                    <span>{place.location}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-semibold text-foreground">{place.rating}</span>
                      <span className="text-sm text-muted-foreground">({place.reviews})</span>
                    </div>
                    <span className="font-bold text-primary">{place.price}</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
