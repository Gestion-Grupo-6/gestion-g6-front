"use client";

import { useMemo } from "react";
import { APIProvider, Map, AdvancedMarker } from "@vis.gl/react-google-maps";
import { useTheme } from "next-themes";

type PlaceLocationMapProps = {
  lat: number;
  lng: number;
  mapId?: string;
};

export function PlaceLocationMap({ lat, lng, mapId }: PlaceLocationMapProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";
  const { resolvedTheme, theme } = useTheme();
  const activeTheme = resolvedTheme === "dark" || theme === "dark" ? "dark" : "light";

  const center = useMemo(() => ({ lat, lng }), [lat, lng]);
  const mapColorScheme = activeTheme === "dark" ? "DARK" : "LIGHT";
  const mapKey = `place-location-map-${mapColorScheme}-${lat}-${lng}`;

  if (!apiKey) {
    return (
      <div className="flex h-full w-full items-center justify-center rounded-md border border-dashed border-muted text-sm text-muted-foreground">
        Configura `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` para mostrar el mapa.
      </div>
    );
  }

  return (
    <APIProvider apiKey={apiKey}>
      <div className="h-full w-full overflow-hidden rounded-b-xl">
        <Map
          key={mapKey}
          mapId={mapId || process.env.NEXT_PUBLIC_MAP_ID}
          defaultZoom={15}
          defaultCenter={center}
          gestureHandling="greedy"
          colorScheme={mapColorScheme}
          mapTypeControl={false}
          streetViewControl={false}
        >
          <AdvancedMarker position={center} />
        </Map>
      </div>
    </APIProvider>
  );
}
