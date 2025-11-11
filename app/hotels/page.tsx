import { Header } from "@/components/header"
import { PlacesList } from "@/components/places-list"
import { FilterSidebar } from "@/components/filter-sidebar"
import { fetchPlaces, HOTELES, searchPlaces } from "@/api/place"
import { SearchBar } from "@/components/search-bar"

export default async function HotelesPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams
  const hotels = q
    ? await searchPlaces(HOTELES, { name: q, sort: null, page: null, pageSize: null })
    : await fetchPlaces(HOTELES)

  return (
    <div className="min-h-screen w-full flex flex-col">
      <Header />
      <main className="flex-1 w-full">
        <div className="bg-primary/10 py-12 w-full">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Hoteles</h1>
            <p className="text-lg text-muted-foreground">Encuentra el alojamiento perfecto para tu viaje</p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8 w-full">
          <SearchBar defaultValue={q || ""} />
          <div className="flex flex-col lg:flex-row gap-8">
            <aside className="lg:w-64 flex-shrink-0">
              <FilterSidebar category="hotel" />
            </aside>
            <div className="flex-1">
              <PlacesList places={hotels} />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
