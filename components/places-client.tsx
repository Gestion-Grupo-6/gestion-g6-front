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
  const [sortOrder, setSortOrder] = useState<string | null>(null)

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
        <div className="mb-4 flex justify-end">
          <select
            className="border rounded px-2 py-1 text-sm"
            value={sortOrder ?? ""}
            onChange={async (e) => {
              const v = e.target.value || null
              setSortOrder(v)
              const body: Record<string, any> = {}
              if (v) body.sort = v
              // trim null/empty
              Object.keys(body).forEach((k) => {
                const val = (body as any)[k]
                if (val === null) delete (body as any)[k]
                if (Array.isArray(val) && val.length === 0) delete (body as any)[k]
              })
              await applyFilters(body)
            }}
          >
            <option value="">-</option>
            <option value="asc">Precio: menor a mayor</option>
            <option value="desc">Precio: mayor a menor</option>
          </select>
        </div>
        {loading ? (
          <p className="text-sm text-muted-foreground">Cargando resultados...</p>
        ) : (
          <PlacesList places={places} />
        )}
      </div>
    </div>
  )
}
