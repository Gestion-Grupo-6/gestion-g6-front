"use client"

import React, { useState } from "react"
import { Place } from "@/types/place"
import { PlacesList } from "@/components/places-list"
import { FilterSidebar } from "@/components/filter-sidebar"
import { searchPlacesAdvanced } from "@/api/place"

interface Props {
  initialPlaces: Place[]
  category: string
  collection: string
}

export default function PlacesClient({ initialPlaces, category, collection }: Props) {
  const [places, setPlaces] = useState<Place[]>(initialPlaces || [])
  const [loading, setLoading] = useState(false)

  async function applyFilters(body: Record<string, any>) {
    try {
      console.log("[Filter] Applying filters - request body:", body)
      setLoading(true)
      // call advanced search endpoint
      const results = await searchPlacesAdvanced(collection, body)
      setPlaces(results)
    } catch (e) {
      console.error("Error applying filters:", e)
    } finally {
      setLoading(false)
    }
  }

  function clearFilters() {
    setPlaces(initialPlaces || [])
  }

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <aside className="lg:w-64 flex-shrink-0">
        <FilterSidebar category={category} onApply={applyFilters} onClear={clearFilters} />
      </aside>
      <div className="flex-1">
        {loading ? (
          <p className="text-sm text-muted-foreground">Cargando resultados...</p>
        ) : (
          <PlacesList places={places} />
        )}
      </div>
    </div>
  )
}
