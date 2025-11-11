import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { PlacesList } from "@/components/places-list"
import { SearchForm } from "@/components/search-form"
import type { Place } from "@/types/place"
import { searchPlaces, HOTELES, RESTAURANTES, ACTIVIDADES } from "@/api/place"

export default async function BuscarPage({ searchParams }: { searchParams: Promise<{ q?: string; c?: string }> }) {
  const { q, c } = await searchParams

  const cat = (c || "").toLowerCase()
  const selectedCollections =
    cat === "hoteles"
      ? [HOTELES]
      : cat === "restaurantes"
        ? [RESTAURANTES]
        : cat === "actividades"
          ? [ACTIVIDADES]
          : [HOTELES, RESTAURANTES, ACTIVIDADES]

  const results: Place[] = q
    ? (
        await Promise.all(
          selectedCollections.map((col) => searchPlaces(col, { name: q, sort: null, page: null, pageSize: null })),
        )
      ).flat()
    : []

  return (
    <div className="min-h-screen w-full flex flex-col">
      <Header />
      <main className="flex-1 w-full">
        <div className="container mx-auto px-4 py-6">
          <SearchForm defaultQuery={q || ""} defaultCategory={c || ""} />
          {q ? (
            results.length > 0 ? (
              <div className="mt-6">
                <PlacesList places={results} />
              </div>
            ) : (
              <p className="mt-6 text-muted-foreground">No se encontraron resultados para "{q}".</p>
            )
          ) : (
            <p className="mt-6 text-muted-foreground">Ingresa un término para buscar.</p>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
