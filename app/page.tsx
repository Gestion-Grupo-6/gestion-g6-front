import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { CategoryTabs } from "@/components/category-tabs"
import { FeaturedPlaces } from "@/components/featured-places"
import type { Place } from "@/types/place"
import { Footer } from "@/components/footer"
import { ACTIVIDADES, fetchPlaces, HOTELES, RESTAURANTES } from "@/api/place"

export default async function HomePage() {
  const [hotels, restaurants, activities] = await Promise.all([
    fetchPlaces(HOTELES, { limit: 1 }),
    fetchPlaces(RESTAURANTES, { limit: 1 }),
    fetchPlaces(ACTIVIDADES, { limit: 1 }),
  ])

  const featuredPlaces = [
    hotels[0],
    restaurants[0],
    activities[0]
  ].filter((place): place is Place => Boolean(place))

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <HeroSection />
        <CategoryTabs />
        <FeaturedPlaces places={featuredPlaces} />
      </main>
      <Footer />
    </div>
  )
}
