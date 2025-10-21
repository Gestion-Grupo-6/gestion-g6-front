import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { CategoryTabs } from "@/components/category-tabs"
import { FeaturedPlaces } from "@/components/featured-places"

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <HeroSection />
        <CategoryTabs />
        <FeaturedPlaces />
      </main>
    </div>
  )
}
