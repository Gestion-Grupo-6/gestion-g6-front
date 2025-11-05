import { Header } from "@/components/header"
import { PlacesList } from "@/components/places-list"
import { FilterSidebar } from "@/components/filter-sidebar"
import { fetchPlaces, fetchPlace, RESTAURANTES, RESTAURANT, searchPlaces } from "@/api/place"
import { SearchBar } from "@/components/search-bar"

export default async function RestaurantesPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams
  const restaurants = q
    ? await searchPlaces(RESTAURANTES, { name: q, sort: null, page: null, pageSize: null })
    : (await Promise.all((await fetchPlaces(RESTAURANTES)).map((s) => fetchPlace(RESTAURANT, s.id)))).filter(
        (r): r is NonNullable<typeof r> => r !== null,
      )

  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="bg-primary/10 py-12">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Restaurantes</h1>
            <p className="text-lg text-muted-foreground">Descubre la mejor gastronomía local</p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <SearchBar defaultValue={q || ""} />
          <div className="flex flex-col lg:flex-row gap-8">
            <aside className="lg:w-64 flex-shrink-0">
              <FilterSidebar category="restaurant" />
            </aside>
            <div className="flex-1">
              <PlacesList places={restaurants} />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
