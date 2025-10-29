import { Header } from "@/components/header"
import { PlacesList } from "@/components/places-list"
import { FilterSidebar } from "@/components/filter-sidebar"
import { fetchPlaces, HOTELES } from "@/api/place"

export default async function HotelesPage() {
  const hotels = await fetchPlaces(HOTELES)

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
