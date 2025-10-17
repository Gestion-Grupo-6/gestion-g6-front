import Image from "next/image"
import Link from "next/link"
import { Star, MapPin } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface PlaceCardProps {
  id: string
  name: string
  category: string
  location: string
  rating: number
  reviewCount: number
  image: string
  description: string
  priceRange?: string
}

export function PlaceCard({
  id,
  name,
  category,
  location,
  rating,
  reviewCount,
  image,
  description,
  priceRange,
}: PlaceCardProps) {
  return (
    <Link href={`/lugar/${id}`}>
      <Card className="group overflow-hidden transition-all hover:shadow-lg">
        <div className="relative aspect-[4/3] overflow-hidden">
          <Image
            src={image || "/placeholder.svg"}
            alt={name}
            fill
            className="object-cover transition-transform group-hover:scale-105"
          />
          <Badge className="absolute top-3 left-3 bg-background/90 text-foreground hover:bg-background/90">
            {category}
          </Badge>
        </div>
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="font-semibold text-lg text-foreground line-clamp-1">{name}</h3>
            {priceRange && (
              <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">{priceRange}</span>
            )}
          </div>

          <div className="flex items-center gap-1 mb-2">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-primary text-primary" />
              <span className="font-semibold text-foreground">{rating.toFixed(1)}</span>
            </div>
            <span className="text-sm text-muted-foreground">({reviewCount} opiniones)</span>
          </div>

          <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
            <MapPin className="h-4 w-4" />
            <span className="line-clamp-1">{location}</span>
          </div>

          <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>
        </CardContent>
      </Card>
    </Link>
  )
}
