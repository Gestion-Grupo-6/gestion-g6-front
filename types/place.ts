export interface Place {
  id: string
  name: string
  category: string
  type?: string | null
  price: number | null
  priceCategory: string | null
  images: string[]
  description: string
  attributes: string[]
  address: string
  city: string
  country: string
  phone: string | null
  email: string | null
  website: string | null
  rating: number | null
  ratings?: Record<string, number> | null
  reviews: number | null
}


export interface PlaceCreatePayload {
  ownerId?: string
  name: string
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
