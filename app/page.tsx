import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { CategoryTabs } from "@/components/category-tabs"
import { FeaturedPlaces } from "@/components/featured-places"
import { fetchPlaces } from "@/lib/api"
import type { Place } from "@/types/place"

export default async function HomePage() {
  const [hotels, restaurants, activities, destinations] = await Promise.all([
    fetchPlaces("hoteles", { limit: 1 }),
    fetchPlaces("restaurantes", { limit: 1 }),
    fetchPlaces("actividades", { limit: 1 }),
  ])

  const featuredPlaces = [
    hotels[0],
    restaurants[0],
    activities[0],
    destinations[0],
  ].filter((place): place is Place => Boolean(place))

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <HeroSection />
        <CategoryTabs />
        <FeaturedPlaces places={featuredPlaces} />
      </main>
    </div>
  )
}
