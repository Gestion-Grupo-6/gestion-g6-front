import { Header } from "@/components/header"
import { PlacesList } from "@/components/places-list"
import { FilterSidebar } from "@/components/filter-sidebar"
import { fetchPlaces, fetchPlace, RESTAURANTES, RESTAURANT, searchPlaces, searchPlacesAdvanced } from "@/api/place"
import { SearchBar } from "@/components/search-bar"
import PlacesClient from "@/components/places-client"
export default async function RestaurantesPage({ searchParams }: { searchParams: Promise<Record<string, any>> }) {
  const params = await searchParams
  const q = params.q as string | undefined
  const attributesParam = params.attributes as string | string[] | undefined
  const minPriceCategory = params.minimumPriceCategory as string | undefined
  const maxPriceCategory = params.maximumPriceCategory as string | undefined
  const minimumRating = params.minimumRating ? Number(params.minimumRating) : undefined
  const maximumRating = params.maximumRating ? Number(params.maximumRating) : undefined
  const sort = params.sort as string | undefined
  const page = params.page !== undefined ? Number(params.page) : undefined
  const pageSize = params.pageSize !== undefined ? Number(params.pageSize) : undefined

  let restaurants

  // If any advanced filter params are present, use advanced search endpoint
  if (attributesParam || minPriceCategory || maxPriceCategory || minimumRating !== undefined || maximumRating !== undefined) {
    const attributes = Array.isArray(attributesParam)
      ? attributesParam
      : attributesParam
      ? String(attributesParam).split(",").map((s) => decodeURIComponent(s))
      : []

    const body = {
      name: q ?? null,
      city: null,
      category: null,
      minimumPriceCategory: minPriceCategory ?? null,
      maximumPriceCategory: maxPriceCategory ?? null,
      minimumRating: minimumRating ?? null,
      maximumRating: maximumRating ?? null,
      attributes: attributes,
      quantities: null,
      openNow: false,
      sort: sort ?? null,
      page: page ?? null,
      pageSize: pageSize ?? null,
    }

    restaurants = await searchPlacesAdvanced(RESTAURANTES, body)
  } else if (q) {
    restaurants = await searchPlaces(RESTAURANTES, { name: q, sort: null, page: null, pageSize: null })
  } else {
    restaurants = await fetchPlaces(RESTAURANTES)
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
                <div>
                  <PlacesClient initialPlaces={restaurants} category="restaurant" collection={RESTAURANTES} />
                </div>
        </div>
      </main>
    </div>
  )
}
