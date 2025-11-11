import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { CategoryTabs } from "@/components/category-tabs"
import { FeaturedPlaces } from "@/components/featured-places"
import { PlacesList } from "@/components/places-list"
import type { Place } from "@/types/place"
import { Footer } from "@/components/footer"
import { ACTIVIDADES, fetchPlaces, HOTELES, RESTAURANTES, searchPlaces } from "@/api/place"
import { LocationConsentRequester } from "@/components/location-consent-requester"

export default async function HomePage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams
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
    <div className="min-h-screen w-full flex flex-col">
      <LocationConsentRequester />
      <Header />
      <main className="flex-1">
        <HeroSection />
        {q ? (
          <div className="container mx-auto px-4 py-6">
            {await (async () => {
              const [hs, rs, as] = await Promise.all([
                searchPlaces(HOTELES, { name: q, sort: null, page: null, pageSize: null }),
                searchPlaces(RESTAURANTES, { name: q, sort: null, page: null, pageSize: null }),
                searchPlaces(ACTIVIDADES, { name: q, sort: null, page: null, pageSize: null }),
              ])
              const results: Place[] = [...hs, ...rs, ...as]
              if (results.length === 0) {
                return (
                  <p className="text-muted-foreground">No se encontraron resultados para "{q}".</p>
                )
              }
              return <PlacesList places={results} />
            })()}
          </div>
        ) : (
          <>
            <CategoryTabs />
            <FeaturedPlaces places={featuredPlaces} />
          </>
        )}
      </main>
      <Footer />
    </div>
  )
}
