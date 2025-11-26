"use client"

import React, { useState } from "react"
import { Place } from "@/types/place"
import { PlacesList } from "@/components/places-list"
import { FilterSidebar } from "@/components/filter-sidebar"
import { SearchBar } from "@/components/search-bar"
import { searchPlacesAdvanced } from "@/api/place"
import { PlacesLocationMap } from "./places-location-map"
import { useLocationContext } from "@/contexts/LocationContext"

import { Button } from "./ui/button"

interface Props {
  initialPlaces: Place[]
  category: string
  collection: string
  initialQuery?: string
}

export default function PlacesPageClient({ initialPlaces, category, collection, initialQuery }: Props) {
  const [places, setPlaces] = useState<Place[]>(initialPlaces || [])
  const [loading, setLoading] = useState(false)
  const [sortOrder, setSortOrder] = useState<string | null>(null)
  const [currentFilters, setCurrentFilters] = useState<Record<string, any> | null>(null)
  const [viewMode, setViewMode] = useState<"list" | "map">("list")
  const { location } = useLocationContext()

  async function applyFilters(body: Record<string, any>) {
    try {
        if (sortOrder && !body.sort) {
          body = { ...body, sort: sortOrder }
      }
      console.log("[Filter] Applying filters - request body:", body)
      setLoading(true)
      const results = await searchPlacesAdvanced(collection, body)
      setPlaces(results)
        // persist the last-applied filters so sort can re-apply them later
        setCurrentFilters(body)
    } catch (e) {
      console.error("Error applying filters:", e)
    } finally {
      setLoading(false)
    }
  }

  function clearFilters() {
    setPlaces(initialPlaces || [])
    setViewMode("list")
  }

  function toggleViewMode() {
    setViewMode(prev => prev === "list" ? "map" : "list")
  }

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <aside className="lg:w-64 flex-shrink-0">
        <FilterSidebar 
          category={category} 
          onApply={applyFilters} 
          onClear={clearFilters}
        />
      </aside>

      <div className="flex-1">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div className="flex-1">
            <SearchBar defaultValue={initialQuery || ""} inputClassName="w-full" formClassName="mb-0 flex items-center gap-3" />
          </div>

          <div className="ml-4 flex items-center gap-2">
            <span className="inline-flex items-center h-9 text-sm font-medium">Ordenar por precio:</span>
            <select
              className="h-9 border rounded px-2 text-sm align-middle"
              value={sortOrder ?? ""}
              onChange={async (e) => {
                const v = e.target.value || null
                setSortOrder(v)
                // merge current filters with new sort
                const base = currentFilters ? { ...currentFilters } : {}
                const body: Record<string, any> = v ? { ...base, sort: v } : { ...base }
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
              <option value="asc">Menor a mayor</option>
              <option value="desc">Mayor a menor</option>
            </select>
          </div>
        </div>

        {loading ? (
          <p className="text-sm text-muted-foreground">Cargando resultados...</p>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-muted-foreground">
                Mostrando {places.length} {places.length === 1 ? "resultado" : "resultados"}
              </p>
              <Button
                variant={viewMode === "map" ? "secondary" : "default"}
                onClick={toggleViewMode}
              >
                {viewMode === "map" ? "Ver resultados en lista" : "Ver resultados en mapa"}
              </Button>
            </div>
            {viewMode === 'list' ? (
              <PlacesList places={places} />
            ) : (
              <PlacesLocationMap places={places} userLocation={location} />
            )}
          </>
        )}
      </div>
    </div>
  )
}
