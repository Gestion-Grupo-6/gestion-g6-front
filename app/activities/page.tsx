import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { PlacesList } from "@/components/places-list"
import { FilterSidebar } from "@/components/filter-sidebar"
import { ACTIVIDADES, fetchPlaces, searchPlaces } from "@/api/place"
import { SearchBar } from "@/components/search-bar"
import PlacesClient from "@/components/places-client"
import PlacesPageClient from "@/components/places-page-client"

export default async function ActividadesPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams
  const activities = q
    ? await searchPlaces(ACTIVIDADES, { name: q, sort: null, page: null, pageSize: null })
    : await searchPlaces(ACTIVIDADES, { name: undefined, sort: null, page: null, pageSize: null })

  return (
    <div className="min-h-screen w-full flex flex-col">
      <Header />
      <main className="flex-1 w-full">
        <div className="bg-primary/10 py-12 w-full">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Actividades</h1>
            <p className="text-lg text-muted-foreground">Experiencias únicas e inolvidables</p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div>
            <PlacesPageClient initialPlaces={activities} category="activity" collection={ACTIVIDADES} initialQuery={q || ""} />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
