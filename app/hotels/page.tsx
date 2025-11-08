import { Header } from "@/components/header"
import { PlacesList } from "@/components/places-list"
import { FilterSidebar } from "@/components/filter-sidebar"
import { fetchPlaces, fetchPlace, HOTELES, HOTEL, searchPlaces } from "@/api/place"
import { SearchBar } from "@/components/search-bar"
import PlacesClient from "@/components/places-client"
import PlacesPageClient from "@/components/places-page-client"

export default async function HotelesPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams
  const hotels = q
    ? await searchPlaces(HOTELES, { name: q, sort: null, page: null, pageSize: null })
    : await fetchPlaces(HOTELES)

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="bg-primary/10 py-12">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Hoteles</h1>
            <p className="text-lg text-muted-foreground">Encuentra el alojamiento perfecto para tu viaje</p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div>
            <PlacesPageClient initialPlaces={hotels} category="hotel" collection={HOTELES} initialQuery={q || ""} />
          </div>
        </div>
      </main>
    </div>
  )

}
