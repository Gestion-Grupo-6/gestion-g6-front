"use client";

import { useCallback, useMemo, useState } from "react";
import { APIProvider, useMapsLibrary } from "@vis.gl/react-google-maps";
import usePlacesAutocomplete, { getGeocode, getLatLng } from "use-places-autocomplete";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export type ManualLocationSelection = {
  lat: number;
  lng: number;
  address: string;
  city?: string;
  country?: string;
};

type ManualLocationFormProps = {
  onSelect: (selection: ManualLocationSelection) => void;
  onCancel: () => void;
  origin?: { lat: number; lng: number };
};

const extractCityCountry = (components: google.maps.GeocoderAddressComponent[] = []) => {
  let city: string | undefined;
  let country: string | undefined;
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

export function ManualLocationForm({ origin, onSelect, onCancel }: ManualLocationFormProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";

  if (!apiKey) {
    return (
      <div className="space-y-2">
        <Input value="" placeholder="Configura la API de Google Maps" disabled />
        <p className="text-xs text-muted-foreground">
          Configura `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` para habilitar la búsqueda manual.
        </p>
        <div className="flex justify-end">
          <Button variant="ghost" size="sm" onClick={onCancel}>
            Cerrar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <APIProvider apiKey={apiKey} libraries={["places"]}>
      <ManualLocationFormContent origin={origin} onSelect={onSelect} onCancel={onCancel} />
    </APIProvider>
  );
}

type ManualLocationFormContentProps = ManualLocationFormProps;

function ManualLocationFormContent({ origin, onSelect, onCancel }: ManualLocationFormContentProps) {
  const placesLibrary = useMapsLibrary("places");

  if (!placesLibrary) {
    return (
      <div className="space-y-2">
        <Input value="Cargando buscador..." disabled />
        <div className="flex justify-end">
          <Button variant="ghost" size="sm" onClick={onCancel}>
            Cerrar
          </Button>
        </div>
      </div>
    );
  }

  return <ManualLocationFormInner origin={origin} onSelect={onSelect} onCancel={onCancel} />;
}

function ManualLocationFormInner({ origin, onSelect, onCancel }: ManualLocationFormContentProps) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const requestOptions = useMemo(() => {
    if (!origin || typeof google === "undefined") return undefined;
    return {
      location: new google.maps.LatLng(origin.lat, origin.lng),
      radius: 20000,
    };
  }, [origin]);

  const {
    ready,
    value,
    setValue,
    suggestions: { status, data },
    clearSuggestions,
  } = usePlacesAutocomplete({
    debounce: 300,
    requestOptions,
  });

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.value);
    setError(null);
  };

  const handleSuggestionClick = useCallback(
    async (description: string) => {
      setLoading(true);
      setError(null);
      try {
        const results = await getGeocode({ address: description });
        if (results.length === 0) {
          throw new Error("No se encontró ninguna dirección");
        }
        const primary = results[0];
        const { lat, lng } = await getLatLng(primary);
        const { city, country } = extractCityCountry(primary.address_components);
        onSelect({
          address: description,
          lat,
          lng,
          city,
          country,
        });
        setValue(description, false);
        clearSuggestions();
      } catch (err) {
        console.error("No se pudo resolver la dirección seleccionada", err);
        setError("No se pudo resolver la dirección seleccionada.");
      } finally {
        setLoading(false);
      }
    },
    [clearSuggestions, onSelect, setValue],
  );

  return (
    <div className="space-y-2">
      <Input
        value={value}
        onChange={handleInputChange}
        placeholder="Busca una calle, barrio o ciudad"
        disabled={!ready}
        autoComplete="off"
      />

      {status === "OK" && data.length > 0 && (
        <ul className="max-h-60 overflow-auto rounded-md border bg-background text-sm">
          {data.map(({ place_id, description }) => (
            <li key={place_id}>
              <button
                type="button"
                className="w-full px-3 py-2 text-left hover:bg-muted"
                onClick={() => handleSuggestionClick(description)}
                disabled={loading}
              >
                {description}
              </button>
            </li>
          ))}
        </ul>
      )}

      {error && <p className="text-xs text-destructive">{error}</p>}

      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={onCancel}>
          Cancelar
        </Button>
        <p className="text-xs text-muted-foreground">
          {loading ? (
            <span className="flex items-center gap-1">
              <Loader2 className="h-3 w-3 animate-spin" />
              Buscando dirección...
            </span>
          ) : (
            "Selecciona una sugerencia"
          )}
        </p>
      </div>
    </div>
  );
}
