"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { ManualLocationForm, ManualLocationSelection } from "@/components/manual-location-form";
import { StoredLocation } from "@/lib/location-storage";
import { reverseGeocodeLocation } from "@/lib/reverse-geocode";
import { Loader2, MapPin, RefreshCw, XCircle } from "lucide-react";
import { useLocationContext } from "@/contexts/LocationContext";

const GEOLOCATION_OPTIONS: PositionOptions = {
  enableHighAccuracy: true,
  timeout: 10000,
  maximumAge: 300000,
};

export function HeaderLocationWidget() {
  const {
    location: storedLocation,
    status: locationStatus,
    setLocation,
    setStatus,
    clearLocation,
  } = useLocationContext();
  const [manualOpen, setManualOpen] = useState(false);
  const [requesting, setRequesting] = useState(false);
  const [resolvingLabel, setResolvingLabel] = useState(false);

  useEffect(() => {
    if (!storedLocation) {
      setResolvingLabel(false);
      return;
    }
    if (storedLocation.city && storedLocation.country) {
      setResolvingLabel(false);
      return;
    }

    let isActive = true;
    setResolvingLabel(true);
    reverseGeocodeLocation(storedLocation.lat, storedLocation.lng)
      .then((result) => {
        if (!isActive) {
          return;
        }
        if (result.city || result.country || result.address) {
          const enriched: StoredLocation = {
            ...storedLocation,
            ...result,
          };
          setLocation(enriched);
        }
      })
      .finally(() => {
        if (isActive) {
          setResolvingLabel(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, [storedLocation, setLocation]);

  const requestLocation = useCallback(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      return;
    }
    setManualOpen(false);
    setRequesting(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const nextLocation: StoredLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          timestamp: Date.now(),
        };
        setLocation(nextLocation);
        setStatus("granted");
        setRequesting(false);
      },
      (error) => {
        const nextStatus = error.code === error.PERMISSION_DENIED ? "denied" : "unavailable";
        setStatus(nextStatus);
        setRequesting(false);
      },
      GEOLOCATION_OPTIONS,
    );
  }, [setLocation, setStatus]);

  const disableLocation = useCallback(() => {
    clearLocation();
    setManualOpen(false);
  }, [clearLocation]);

  const handleManualSelect = useCallback(
    (selection: ManualLocationSelection) => {
      const nextLocation: StoredLocation = {
        lat: selection.lat,
        lng: selection.lng,
        timestamp: Date.now(),
        address: selection.address,
        city: selection.city,
        country: selection.country,
      };
      setLocation(nextLocation);
      setStatus("granted");
      setManualOpen(false);
    },
    [setLocation, setStatus],
  );

  const locationLabel = useMemo(() => {
    if (!storedLocation) {
      return null;
    }
    if (storedLocation.city && storedLocation.country) {
      return `${storedLocation.city}, ${storedLocation.country}`;
    }
    if (storedLocation.address) {
      return storedLocation.address;
    }
    return `${storedLocation.lat.toFixed(3)}, ${storedLocation.lng.toFixed(3)}`;
  }, [storedLocation]);

  return (
    <div className="border-t border-border">
      <div className="container mx-auto px-4 py-3">
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <div className="flex flex-1 flex-col gap-3 md:flex-row md:items-center">
            <div className="flex flex-1 flex-col gap-1">
              <div className="flex items-center gap-1 text-xs uppercase tracking-wide text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>Ubicación</span>
              </div>
            {storedLocation ? (
              <>
                <p className="text-sm font-medium text-foreground">
                  Estás en {locationLabel ?? "cargando..."}
                </p>
                {resolvingLabel && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Obteniendo detalles de la ubicación
                  </p>
                )}
                {locationStatus === "denied" && (
                  <p className="text-xs text-destructive">Permiso de ubicación denegado.</p>
                )}
              </>
            ) : (
              <>
                <p className="text-sm text-muted-foreground">
                  No has activado la ubicación todavía.
                </p>
                {locationStatus === "denied" && (
                  <p className="text-xs text-destructive">
                    Permiso denegado anteriormente. Vuelve a solicitarlo.
                  </p>
                )}
                {locationStatus === "unavailable" && (
                  <p className="text-xs text-muted-foreground">
                    Tu navegador no encontró una posición válida recientemente.
                  </p>
                )}
              </>
            )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={requestLocation}
              disabled={requesting}
              className="inline-flex items-center gap-1"
            >
              {requesting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Solicitando...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4" />
                  {storedLocation ? "Actualizar ubicación" : "Solicitar ubicación"}
                </>
              )}
            </Button>

            {storedLocation && (
              <Button size="sm" variant="ghost" onClick={disableLocation} className="inline-flex items-center gap-1">
                <XCircle className="h-4 w-4" />
                Desactivar
              </Button>
            )}

            <div className="relative">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setManualOpen((prev) => !prev)}
                className="inline-flex items-center gap-1"
              >
                <MapPin className="h-4 w-4" />
                Definir manualmente
              </Button>

              {manualOpen && (
                <div className="absolute right-0 top-full z-40 mt-2 w-[min(90vw,18rem)] rounded-lg border bg-background p-4 shadow-lg">
                  <ManualLocationForm
                    origin={storedLocation ?? undefined}
                    onSelect={handleManualSelect}
                    onCancel={() => setManualOpen(false)}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
