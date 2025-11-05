import { Header } from "@/components/header"
import { PlacesList } from "@/components/places-list"
import { FilterSidebar } from "@/components/filter-sidebar"
import { fetchPlaces, fetchPlace, HOTELES, HOTEL, searchPlaces, filterPlaces } from "@/api/place"
import { SearchBar } from "@/components/search-bar"

export default async function HotelesPage({ searchParams }: { searchParams: Promise<Record<string, any>> }) {
  const params = await searchParams
  const q = params.q as string | undefined
  const attributesParam = params.attributes as string | string[] | undefined

  let hotels

  if (attributesParam) {
    // attributes may be a comma separated string or an array
    const attrs = Array.isArray(attributesParam)
      ? attributesParam
      : String(attributesParam).split(",").map((s) => decodeURIComponent(s))

    // call backend filter endpoint via helper
    hotels = await filterPlaces(HOTELES, attrs)
  } else if (q) {
    hotels = await searchPlaces(HOTELES, { name: q, sort: null, page: null, pageSize: null })
  } else {
    hotels = (await Promise.all((await fetchPlaces(HOTELES)).map((s) => fetchPlace(HOTEL, s.id)))).filter(
      (r): r is NonNullable<typeof r> => r !== null,
    )
  }

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
