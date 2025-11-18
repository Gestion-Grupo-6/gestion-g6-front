"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  addLocationChangeListener,
  clearStoredLocation,
  getLocationStatus,
  getStoredLocation,
  setLocationStatus,
  setStoredLocation,
  type LocationStatus,
  type StoredLocation,
} from "@/lib/location-storage";

type LocationContextValue = {
  location: StoredLocation | null;
  status: LocationStatus | null;
  refreshLocation: () => void;
  setLocation: (value: StoredLocation) => void;
  setStatus: (status: LocationStatus | null) => void;
  clearLocation: () => void;
};

const LocationContext = createContext<LocationContextValue | undefined>(undefined);

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const [location, setLocationState] = useState<StoredLocation | null>(null);
  const [status, setStatusState] = useState<LocationStatus | null>(null);

  const refreshLocation = useCallback(() => {
    setLocationState(getStoredLocation());
    setStatusState(getLocationStatus());
  }, []);

  useEffect(() => {
    refreshLocation();
  }, [refreshLocation]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const handleStorage = () => refreshLocation();
    window.addEventListener("storage", handleStorage);
    const removeCustomListener = addLocationChangeListener(handleStorage);
    return () => {
      window.removeEventListener("storage", handleStorage);
      removeCustomListener();
    };
  }, [refreshLocation]);

  const updateLocation = useCallback((value: StoredLocation) => {
    setStoredLocation(value);
    setLocationState(value);
  }, []);

  const updateStatus = useCallback((value: LocationStatus | null) => {
    if (value) {
      setLocationStatus(value);
    }
    setStatusState(value);
  }, []);

  const clearLocation = useCallback(() => {
    clearStoredLocation();
    setLocationState(null);
    setStatusState(null);
  }, []);

  const value = useMemo(
    () => ({
      location,
      status,
      refreshLocation,
      setLocation: updateLocation,
      setStatus: updateStatus,
      clearLocation,
    }),
    [location, status, refreshLocation, updateLocation, updateStatus, clearLocation],
  );

  return <LocationContext.Provider value={value}>{children}</LocationContext.Provider>;
}

export function useLocationContext() {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error("useLocationContext must be used within a LocationProvider");
  }
  return context;
}
