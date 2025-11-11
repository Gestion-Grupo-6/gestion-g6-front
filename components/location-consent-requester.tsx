"use client";

import { useEffect } from "react";
import {
  getStoredLocation,
  markLocationStatus,
  setStoredLocation,
} from "@/lib/location-storage";

const GEOLOCATION_OPTIONS: PositionOptions = {
  enableHighAccuracy: true,
  timeout: 10000,
  maximumAge: 300000,
};

export function LocationConsentRequester() {
  useEffect(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      markLocationStatus("unavailable");
      return;
    }

    if (getStoredLocation()) {
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setStoredLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          timestamp: Date.now(),
        });
      },
      (error) => {
        console.warn("El usuario no concedió permisos de ubicación", error);
        markLocationStatus(error.code === error.PERMISSION_DENIED ? "denied" : "unavailable");
      },
      GEOLOCATION_OPTIONS,
    );
  }, []);

  return null;
}
