"use client";

// NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyAiF6_AClAqvtTJhN54WhKnkHuyHRePOkg
// NEXT_PUBLIC_MAP_ID=87a2f01c6cc58e67d4a4977e

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  APIProvider,
  AdvancedMarker,
  Map,
  type MapCameraChangedEvent,
  useMapsLibrary,
} from "@vis.gl/react-google-maps";
import usePlacesAutocomplete, { getGeocode, getLatLng } from "use-places-autocomplete";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getStoredLocation } from "@/lib/location-storage";
import { useTheme } from "next-themes";

type LatLngLiteral = { lat: number; lng: number };

const DEFAULT_CENTER: LatLngLiteral = { lat: -34.6037, lng: -58.3816 };

export type LocationValue = {
  address: string;
  city: string;
  country: string;
  location?: LatLngLiteral | null;
};

type LocationSelectorProps = {
  value: LocationValue;
  onChange: (value: LocationValue, options?: { confirmed?: boolean }) => void;
  inputId?: string;
  placeholder?: string;
};

export function LocationSelector({ value, onChange, inputId, placeholder }: LocationSelectorProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";

  if (!apiKey) {
    return (
      <div className="space-y-2">
        <Input
          id={inputId}
          value={value.address}
          onChange={(event) =>
            onChange(
              {
                ...value,
                address: event.target.value,
                location: null,
              },
              { confirmed: false },
            )
          }
          placeholder={placeholder}
        />
        <p className="text-sm text-muted-foreground">
          Configura NEXT_PUBLIC_GOOGLE_MAPS_API_KEY para habilitar el buscador inteligente.
        </p>
      </div>
    );
  }

  return (
    <APIProvider apiKey={apiKey} libraries={["places"]}>
      <LocationSelectorInner value={value} onChange={onChange} inputId={inputId} placeholder={placeholder} />
    </APIProvider>
  );
}

function LocationSelectorInner(props: LocationSelectorProps) {
  const placesLibrary = useMapsLibrary("places");

  if (!placesLibrary) {
    return (
      <Input
        id={props.inputId}
        value={props.value.address}
        disabled
        readOnly
        placeholder="Cargando buscador..."
      />
    );
  }

  return <LocationSelectorContent {...props} />;
}

function LocationSelectorContent({ value, onChange, inputId, placeholder }: LocationSelectorProps) {
  const [mapVisible, setMapVisible] = useState(false);
  const [pendingSelection, setPendingSelection] = useState<LocationValue | null>(null);
  const [confirmedLocation, setConfirmedLocation] = useState<LatLngLiteral | null>(null);
  const [mapCenter, setMapCenter] = useState<LatLngLiteral>(value.location ?? DEFAULT_CENTER);
  const [mapZoom, setMapZoom] = useState(value.location ? 16 : 11);
  const [userLocation, setUserLocation] = useState<LatLngLiteral | null>(null);
  const { resolvedTheme, theme } = useTheme();
  const activeTheme = resolvedTheme === "dark" || theme === "dark" ? "dark" : "light";

  useEffect(() => {
    const stored = getStoredLocation();
    if (stored) {
      setUserLocation({ lat: stored.lat, lng: stored.lng });
    }
  }, []);

  useEffect(() => {
    if (value.location) {
      setConfirmedLocation(value.location);
      setMapCenter(value.location);
      setMapZoom((currentZoom) => (currentZoom < 13 ? 13 : currentZoom));
    }
  }, [value.location]);

  const requestOptions = useMemo(() => {
    if (!userLocation) return undefined;
    const { lat, lng } = userLocation;
    return {
      location: new google.maps.LatLng(lat, lng),
      radius: 20000,
    };
  }, [userLocation]);

  const {
    ready,
    value: searchValue,
    setValue,
    suggestions: { status, data },
    clearSuggestions,
  } = usePlacesAutocomplete({ debounce: 300, requestOptions });

  const mapColorScheme = (activeTheme === "dark" ? "DARK" : "LIGHT") as "DARK" | "LIGHT";
  const mapThemeKey = `location-selector-map-${mapColorScheme}`;

  useEffect(() => {
    if (value.address && value.address !== searchValue) {
      setValue(value.address, false);
    }
    if (!value.address && searchValue) {
      setValue("", false);
      setConfirmedLocation(null);
    }
  }, [value.address, searchValue, setValue]);

  useEffect(() => {
    if (!value.address) {
      setMapVisible(false);
      setPendingSelection(null);
    }
  }, [value.address]);

  const markerPosition = useMemo(() => {
    if (pendingSelection?.location) return pendingSelection.location;
    return confirmedLocation;
  }, [pendingSelection, confirmedLocation]);

  const extractCityCountry = (components: google.maps.GeocoderAddressComponent[] = []) => {
    let city = "";
    let country = "";
    components.forEach((component) => {
      if (!country && component.types.includes("country")) {
        country = component.long_name;
      }
      if (
        !city &&
        (component.types.includes("locality") ||
          component.types.includes("postal_town") ||
          component.types.includes("administrative_area_level_2") ||
          component.types.includes("administrative_area_level_1"))
      ) {
        city = component.long_name;
      }
    });
    return { city, country };
  };

  const resolveAddress = useCallback(
    async (address: string) => {
      try {
        const results = await getGeocode({ address });
        const primary = results[0];
        const { lat, lng } = await getLatLng(primary);
        const { city, country } = extractCityCountry(primary.address_components);
        return {
          address,
          city: city || value.city,
          country: country || value.country,
          location: { lat, lng },
        };
      } catch (error) {
        console.error("No se pudo obtener la ubicación seleccionada", error);
        return null;
      }
    },
    [value.city, value.country],
  );

  const handleSuggestionClick = async (description: string) => {
    const selection = await resolveAddress(description);
    if (!selection) return;
    setPendingSelection(selection);
    setMapCenter(selection.location ?? DEFAULT_CENTER);
    setMapZoom(selection.location ? 16 : 11);
    setMapVisible(true);
    setValue(description, false);
    clearSuggestions();
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newAddress = event.target.value;
    setValue(newAddress);
    onChange(
      {
        ...value,
        address: newAddress,
        location: null,
      },
      { confirmed: false },
    );
  };

  const handleClearSelection = () => {
    setPendingSelection(null);
    setConfirmedLocation(null);
    setMapVisible(false);
    setMapCenter(DEFAULT_CENTER);
    setMapZoom(11);
    setValue("", false);
    clearSuggestions();
    onChange(
      {
        address: "",
        city: "",
        country: "",
        location: null,
      },
      { confirmed: false },
    );
  };

  const handleConfirmSelection = () => {
    if (!pendingSelection) return;
    const nextSelection = {
      address: pendingSelection.address,
      city: pendingSelection.city,
      country: pendingSelection.country,
      location: pendingSelection.location,
    };
    onChange(nextSelection, { confirmed: true });
    setConfirmedLocation(pendingSelection.location ?? null);
    setPendingSelection(null);
    setMapVisible(false);
    setMapCenter(nextSelection.location ?? DEFAULT_CENTER);
    setMapZoom(nextSelection.location ? 16 : 11);
  };

  const handleCameraChanged = (event: MapCameraChangedEvent) => {
    const { center, zoom } = event.detail;
    if (center) {
      setMapCenter(center);
    }
    if (typeof zoom === "number") {
      setMapZoom(zoom);
    }
  };

  return (
    <div className="space-y-2">
      <Input
        id={inputId}
        value={searchValue}
        onChange={handleInputChange}
        placeholder={placeholder}
        disabled={!ready}
        autoComplete="off"
      />

      {status === "OK" && data.length > 0 && (
        <ul className="rounded-md border bg-background text-sm">
          {data.map(({ place_id, description }) => (
            <li key={place_id}>
              <button
                type="button"
                className="w-full px-3 py-2 text-left hover:bg-muted"
                onClick={() => handleSuggestionClick(description)}
              >
                {description}
              </button>
            </li>
          ))}
        </ul>
      )}

      {mapVisible && (
        <div className="space-y-2 rounded-md border p-3">
          <div className="h-72 w-full overflow-hidden rounded">
            <Map
              key={mapThemeKey}
              mapId={process.env.NEXT_PUBLIC_MAP_ID}
              defaultCenter={DEFAULT_CENTER}
              defaultZoom={11}
              center={mapCenter}
              zoom={mapZoom}
              onCameraChanged={handleCameraChanged}
              colorScheme={mapColorScheme}
              mapTypeControl={false}
              streetViewControl={false}
            >
              {markerPosition && <AdvancedMarker position={markerPosition} />}
            </Map>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" onClick={handleClearSelection}>
              Limpiar selección
            </Button>
            <Button type="button" onClick={handleConfirmSelection} disabled={!pendingSelection}>
              Confirmar selección
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
