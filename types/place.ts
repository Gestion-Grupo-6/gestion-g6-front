export interface Place {
  id: string
  name: string
  category: string
  location: string
  rating: number | null
  reviews: number | null
  price: number | null
  priceLabel: string | null
  images: string[]
  description: string
  amenities: string[]
  address: string | null
  phone: string | null
  email: string | null
  website: string | null
  checkIn?: string | null
  checkOut?: string | null
  hours?: string | null
  duration?: string | null
  includes?: string | null
  bestTime?: string | null
  howToGet?: string | null
}
