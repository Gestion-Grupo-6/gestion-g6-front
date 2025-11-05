import { Header } from "@/components/header"
import { PlacesList } from "@/components/places-list"
import { FilterSidebar } from "@/components/filter-sidebar"
import { fetchPlaces, fetchPlace, RESTAURANTES, RESTAURANT, searchPlaces, filterPlaces } from "@/api/place"
import { SearchBar } from "@/components/search-bar"
export default async function RestaurantesPage({ searchParams }: { searchParams: Promise<Record<string, any>> }) {
  const params = await searchParams
  const q = params.q as string | undefined
  const attributesParam = params.attributes as string | string[] | undefined

  let restaurants

  if (attributesParam) {
    const attrs = Array.isArray(attributesParam)
      ? attributesParam
      : String(attributesParam).split(",").map((s) => decodeURIComponent(s))

    restaurants = await filterPlaces(RESTAURANTES, attrs)
  } else if (q) {
    restaurants = await searchPlaces(RESTAURANTES, { name: q, sort: null, page: null, pageSize: null })
  } else {
    restaurants = (await Promise.all((await fetchPlaces(RESTAURANTES)).map((s) => fetchPlace(RESTAURANT, s.id)))).filter(
      (r): r is NonNullable<typeof r> => r !== null,
    )
  }

  
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
