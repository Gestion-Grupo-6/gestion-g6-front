"use client";

export const USER_LOCATION_STORAGE_KEY = "userLocation";
export const USER_LOCATION_STATUS_KEY = "userLocationStatus";

export type LocationStatus = "granted" | "denied" | "unavailable";

export type StoredLocation = {
  lat: number;
  lng: number;
  timestamp: number;
  address?: string;
  city?: string;
  country?: string;
};

const isBrowser = () => typeof window !== "undefined";

export function getStoredLocation(): StoredLocation | null {
  if (!isBrowser()) return null;
  const raw = window.localStorage.getItem(USER_LOCATION_STORAGE_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as Partial<StoredLocation>;
    if (
      typeof parsed?.lat === "number" &&
      typeof parsed?.lng === "number" &&
      typeof parsed?.timestamp === "number"
    ) {
      return {
        lat: parsed.lat,
        lng: parsed.lng,
        timestamp: parsed.timestamp,
        address: typeof parsed.address === "string" ? parsed.address : undefined,
        city: typeof parsed.city === "string" ? parsed.city : undefined,
        country: typeof parsed.country === "string" ? parsed.country : undefined,
      };
    }
    return null;
  } catch (error) {
    console.warn("No se pudo parsear la ubicación almacenada", error);
    return null;
  }
}

export function setStoredLocation(value: StoredLocation) {
  if (!isBrowser()) return;
  window.localStorage.setItem(USER_LOCATION_STORAGE_KEY, JSON.stringify(value));
  window.localStorage.setItem(USER_LOCATION_STATUS_KEY, "granted");
}

export function clearStoredLocation() {
  if (!isBrowser()) return;
  window.localStorage.removeItem(USER_LOCATION_STORAGE_KEY);
  window.localStorage.removeItem(USER_LOCATION_STATUS_KEY);
}

export function getLocationStatus(): LocationStatus | null {
  if (!isBrowser()) return null;
  const raw = window.localStorage.getItem(USER_LOCATION_STATUS_KEY);
  if (!raw) return null;
  if (raw === "granted" || raw === "denied" || raw === "unavailable") {
    return raw;
  }
  return null;
}

export function setLocationStatus(status: LocationStatus) {
  if (!isBrowser()) return;
  window.localStorage.setItem(USER_LOCATION_STATUS_KEY, status);
}

export function markLocationStatus(status: "denied" | "unavailable") {
  setLocationStatus(status);
}
