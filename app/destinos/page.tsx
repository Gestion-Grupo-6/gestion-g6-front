import { Header } from "@/components/header"
import { PlacesList } from "@/components/places-list"
import { FilterSidebar } from "@/components/filter-sidebar"
import { fetchPlaces } from "@/lib/api"

export default async function DestinosPage() {
  const destinations = await fetchPlaces("destinos")
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="bg-primary/10 py-12">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Destinos</h1>
            <p className="text-lg text-muted-foreground">Explora los lugares más increíbles</p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            <aside className="lg:w-64 flex-shrink-0">
              <FilterSidebar category="destino" />
            </aside>
            <div className="flex-1">
              <PlacesList places={destinations} />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
