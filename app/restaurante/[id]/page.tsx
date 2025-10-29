import { fetchPlace, RESTAURANT } from "@/api/place"
import { Header } from "@/components/header"
import { PlaceDetail } from "@/components/place-detail"
import { notFound } from "next/navigation"

type PageProps = {
  params: Promise<{ id: string }>
}

export default async function RestauranteDetailPage({ params }: PageProps) {
  const { id } = await params
  const place = await fetchPlace(RESTAURANT, id)

  if (!place) {
    notFound()
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <PlaceDetail place={place} />
      </main>
    </div>
  )
}
