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
  location?: {
    lat: number
    lng: number
  } | null
  openingHours?: {
    monday?: { start?: number; end?: number }
    tuesday?: { start?: number; end?: number }
    wednesday?: { start?: number; end?: number }
    thursday?: { start?: number; end?: number }
    friday?: { start?: number; end?: number }
    saturday?: { start?: number; end?: number }
    sunday?: { start?: number; end?: number }
  } | null
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
  location?: {
    lat: number
    lng: number
  }
  openingHours?: {
    monday?: { start?: number; end?: number }
    tuesday?: { start?: number; end?: number }
    wednesday?: { start?: number; end?: number }
    thursday?: { start?: number; end?: number }
    friday?: { start?: number; end?: number }
    saturday?: { start?: number; end?: number }
    sunday?: { start?: number; end?: number }
  }
}
