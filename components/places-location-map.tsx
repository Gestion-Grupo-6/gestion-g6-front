"use client";

import { useMemo, useState, useEffect } from "react";
import {
  APIProvider,
  Map,
  AdvancedMarker,
  MapCameraChangedEvent,
} from "@vis.gl/react-google-maps";
import { useTheme } from "next-themes";
import { Place } from "@/types/place";

type PlacesLocationMapProps = {
  places: Place[];
  mapId?: string;
  userLocation?: { lat: number; lng: number } | null;
};

export function PlacesLocationMap({
  places,
  mapId,
  userLocation,
}: PlacesLocationMapProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";
  const { resolvedTheme, theme } = useTheme();
  const activeTheme =
    resolvedTheme === "dark" || theme === "dark" ? "dark" : "light";

  const initialCenter = useMemo(() => {
    if (userLocation) {
      return { lat: userLocation.lat, lng: userLocation.lng };
    }
    if (places.length > 0 && places[0].location) {
      return { lat: places[0].location.lat, lng: places[0].location.lng };
    }
    return { lat: -34.6037, lng: -58.3816 }; // Default to Buenos Aires
  }, [places, userLocation]);

  const [mapCenter, setMapCenter] = useState(initialCenter);

  useEffect(() => {
    setMapCenter(initialCenter);
  }, [initialCenter]);

  const handleCameraChange = (event: MapCameraChangedEvent) => {
    setMapCenter(event.detail.center);
  };

  const mapColorScheme = activeTheme === "dark" ? "DARK" : "LIGHT";
  const mapKey = `places-location-map-${mapColorScheme}`;

  if (!apiKey) {
    return (
      <div className="flex h-full w-full items-center justify-center rounded-md border border-dashed border-muted text-sm text-muted-foreground">
        Configura `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` para mostrar el mapa.
      </div>
    );
  }

  return (
    <APIProvider apiKey={apiKey}>
      <div className="h-[600px] w-full overflow-hidden rounded-xl">
        <Map
          key={mapKey}
          mapId={mapId || process.env.NEXT_PUBLIC_MAP_ID}
          defaultZoom={16}
          center={mapCenter}
          onCameraChanged={handleCameraChange}
          gestureHandling="greedy"
          colorScheme={mapColorScheme}
          mapTypeControl={false}
          streetViewControl={false}
        >
          {places
            .filter((place) => place.location)
            .map((place) => (
              <AdvancedMarker
                key={place.id}
                position={{ lat: place.location!.lat, lng: place.location!.lng }}
              />
            ))}
        </Map>
      </div>
    </APIProvider>
  );
}
