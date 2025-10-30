export interface Place {
  id: string
  name: string
  category: string
  type?: string | null
  location: string
  rating: number | null
  ratings?: Record<string, number> | null
  reviews: number | null
  price: number | null
  priceLabel: string | null
  priceCategory?: string | null
  images: string[]
  description: string
  amenities: string[]
  address: string 
  phone: string | null
  email: string | null
  website: string | null
  hours?: string | null
  duration?: string | null
  includes?: string | null
  bestTime?: string | null
  howToGet?: string | null
}


export interface PlaceCreatePayload {
  name: string
  ownerId?: string
  category: string
  price: number
  priceCategory?: string
  images: string[]
  description: string
  attributes: string[]
  address: string
  city: string
  country: string
  phone: string
  email: string
  website: string
}