"use client";

import { useMemo, useState, useEffect } from "react";
import {
  APIProvider,
  Map,
  AdvancedMarker,
  MapCameraChangedEvent,
  InfoWindow,
} from "@vis.gl/react-google-maps";
import { useTheme } from "next-themes";
import { Place } from "@/types/place";
import Link from "next/link";
import { getImage } from "@/contexts/SupabaseContext";
import { Star } from "lucide-react";

type PlacesLocationMapProps = {
  places: Place[];
  mapId?: string;
  userLocation?: { lat: number; lng: number } | null;
};

function MapPlaceCard({ place }: { place: Place }) {
  const mainImage = getImage(place.images?.[0]);
  return (
    <Link href={`/${place.category}/${String(place.id)}`}>
      <div className="w-64 overflow-hidden rounded-lg shadow-md">
        <img
          src={mainImage}
          alt={place.name}
          className="h-32 w-full object-cover"
        />
        <div className="p-3">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="truncate font-bold text-lg text-foreground">
              {place.name}
            </h3>
            {place.priceCategory && (
              <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">
                {place.priceCategory}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 mb-2">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-primary text-primary" />
              <span className="font-semibold text-foreground">
                {place.rating?.toFixed(1)}
              </span>
            </div>
            <span className="text-sm text-muted-foreground">
              ({place.numberOfReviews} opiniones)
            </span>
          </div>
          <p className="text-sm capitalize text-muted-foreground">
            {place.category}
          </p>
        </div>
      </div>
    </Link>
  );
}

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
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);

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
          defaultZoom={18}
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
                onClick={() => setSelectedPlace(place)}
              />
            ))}

          {selectedPlace && selectedPlace.location && (
            <InfoWindow
              position={{
                lat: selectedPlace.location.lat,
                lng: selectedPlace.location.lng,
              }}
              onCloseClick={() => setSelectedPlace(null)}
              pixelOffset={[0, -40]}
            >
              <MapPlaceCard place={selectedPlace} />
            </InfoWindow>
          )}
        </Map>
      </div>
    </APIProvider>
  );
}
