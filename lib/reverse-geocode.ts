"use client";

export type ReverseGeocodeResult = {
  address?: string;
  city?: string;
  country?: string;
};

type GeocodeAddressComponent = {
  long_name: string;
  types: string[];
};

type GeocodeResult = {
  formatted_address?: string;
  address_components?: GeocodeAddressComponent[];
};

type GeocodeResponse = {
  status: string;
  results: GeocodeResult[];
  error_message?: string;
};

const GOOGLE_GEOCODE_ENDPOINT = "https://maps.googleapis.com/maps/api/geocode/json";

const componentHasType = (component: GeocodeAddressComponent, type: string) => component.types.includes(type);

const resolveCity = (components: GeocodeAddressComponent[] = []) => {
  const cityCandidate = components.find((component) =>
    ["locality", "postal_town", "administrative_area_level_2", "administrative_area_level_1"].some((type) =>
      componentHasType(component, type),
    ),
  );
  return cityCandidate?.long_name;
};

const resolveCountry = (components: GeocodeAddressComponent[] = []) => {
  const countryComponent = components.find((component) => componentHasType(component, "country"));
  return countryComponent?.long_name;
};

export async function reverseGeocodeLocation(lat: number, lng: number): Promise<ReverseGeocodeResult> {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    console.warn("No se ha configurado NEXT_PUBLIC_GOOGLE_MAPS_API_KEY para el geocoding inverso");
    return {};
  }

  try {
    const url = new URL(GOOGLE_GEOCODE_ENDPOINT);
    url.searchParams.set("latlng", `${lat},${lng}`);
    url.searchParams.set("language", "es");
    url.searchParams.set("key", apiKey);

    const response = await fetch(url.toString());
    if (!response.ok) {
      console.warn("No se pudo consultar la API de Google Maps para geocodificación inversa", response.status);
      return {};
    }

    const data = (await response.json()) as GeocodeResponse;
    if (data.status !== "OK") {
      console.warn("La API de Google Maps devolvió un status inesperado", data.status, data.error_message);
      return {};
    }

    const primary = data.results[0];
    if (!primary) {
      return {};
    }

    const components = primary.address_components ?? [];
    return {
      address: primary.formatted_address,
      city: resolveCity(components),
      country: resolveCountry(components),
    };
  } catch (error) {
    console.warn("Error en la geocodificación inversa con Google Maps", error);
    return {};
  }
}
