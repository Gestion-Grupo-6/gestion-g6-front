"use client";

import { useCallback, useState, type CSSProperties } from "react";
import {
    APIProvider,
    Map,
    AdvancedMarker,
    useMapsLibrary,
    type MapCameraChangedEvent,
} from "@vis.gl/react-google-maps";
import usePlacesAutocomplete, { getGeocode, getLatLng } from "use-places-autocomplete";
type LatLngLiteral = {
    lat: number;
    lng: number;
};

const DEFAULT_CENTER: LatLngLiteral = { lat: -34.6037, lng: -58.3816 };

export default function MapPage() {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";

    return (
        <APIProvider apiKey={apiKey} libraries={["places"]}>
            <MapContent />
        </APIProvider>
    );
}

function MapContent() {
    const [selectedLocation, setSelectedLocation] = useState<LatLngLiteral | null>(null);
    const [mapCenter, setMapCenter] = useState<LatLngLiteral>(DEFAULT_CENTER);
    const [zoom, setZoom] = useState<number>(11);
    const placesLibrary = useMapsLibrary("places");

    const handleSelect = (coords: LatLngLiteral) => {
        setSelectedLocation(coords);
        setMapCenter(coords);
        setZoom(16);
    };

    const handleClearSelection = () => {
        setSelectedLocation(null);
        setMapCenter(DEFAULT_CENTER);
        setZoom(11);
    };

    const handleCameraChanged = useCallback((event: MapCameraChangedEvent) => {
        const { center, zoom } = event.detail;
        if (center) {
            setMapCenter(center);
        }
        if (typeof zoom === "number") {
            setZoom(zoom);
        }
    }, []);

    return (
        <div style={mapWrapperStyle}>
            {placesLibrary && (
                <PlacesAutocomplete
                    onSelect={handleSelect}
                    onClear={handleClearSelection}
                    canClear={Boolean(selectedLocation)}
                />
            )}

            <Map
                mapId={process.env.NEXT_PUBLIC_MAP_ID}
                defaultCenter={DEFAULT_CENTER}
                defaultZoom={11}
                center={mapCenter}
                zoom={zoom}
                onCameraChanged={handleCameraChanged}
            >
                {selectedLocation && (
                    <AdvancedMarker position={selectedLocation} />
                )}
            </Map>
        </div>
    );
}

const mapWrapperStyle: CSSProperties = {
    position: "relative",
    height: "100vh",
    width: "100%",
};

type PlacesAutocompleteProps = {
    onSelect: (coords: LatLngLiteral) => void;
    onClear: () => void;
    canClear: boolean;
};

function PlacesAutocomplete({ onSelect, onClear, canClear }: PlacesAutocompleteProps) {
    const {
        ready,
        value,
        setValue,
        suggestions: { status, data },
        clearSuggestions,
    } = usePlacesAutocomplete({ debounce: 300 });

    const resolveAddress = async (address: string) => {
        setValue(address, false);
        clearSuggestions();

        try {
            const results = await getGeocode({ address });
            const { lat, lng } = await getLatLng(results[0]);
            onSelect({ lat, lng });
        } catch (error) {
            console.error("Error al obtener las coordenadas del lugar seleccionado", error);
        }
    };

    const handleClearClick = () => {
        setValue("", false);
        clearSuggestions();
        onClear();
    };

    return (
        <div style={searchContainerStyle}>
            <input
                value={value}
                onChange={(event) => setValue(event.target.value)}
                placeholder="Buscar un lugar..."
                style={inputStyle}
                disabled={!ready}
            />

            {status === "OK" && data.length > 0 && (
                <ul style={suggestionsListStyle}>
                    {data.map(({ place_id, description }) => (
                        <li key={place_id}>
                            <button
                                type="button"
                                style={suggestionButtonStyle}
                                onClick={() => resolveAddress(description)}
                            >
                                {description}
                            </button>
                        </li>
                    ))}
                </ul>
            )}

            <button
                type="button"
                onClick={handleClearClick}
                disabled={!canClear}
                style={{
                    ...clearButtonStyle,
                    opacity: canClear ? 1 : 0.5,
                    cursor: canClear ? "pointer" : "not-allowed",
                }}
            >
                Limpiar selección
            </button>
        </div>
    );
}

const searchContainerStyle: CSSProperties = {
    position: "absolute",
    top: "16px",
    left: "50%",
    transform: "translateX(-50%)",
    zIndex: 10,
    backgroundColor: "#ffffff",
    padding: "12px",
    borderRadius: "8px",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
    width: "min(420px, 90%)",
};

const inputStyle: CSSProperties = {
    width: "100%",
    padding: "10px 14px",
    borderRadius: "6px",
    border: "1px solid #cfcfcf",
    fontSize: "0.95rem",
};

const suggestionsListStyle: CSSProperties = {
    marginTop: "6px",
    padding: 0,
    listStyle: "none",
    maxHeight: "240px",
    overflowY: "auto",
    border: "1px solid #e5e7eb",
    borderRadius: "6px",
    backgroundColor: "#fff",
    boxShadow: "0 10px 25px rgba(0,0,0,0.12)",
};

const suggestionButtonStyle: CSSProperties = {
    width: "100%",
    textAlign: "left",
    padding: "8px 12px",
    border: "none",
    backgroundColor: "transparent",
    cursor: "pointer",
    fontSize: "0.9rem",
};

const clearButtonStyle: CSSProperties = {
    marginTop: "8px",
    width: "100%",
    border: "none",
    borderRadius: "6px",
    padding: "8px 12px",
    fontSize: "0.9rem",
    backgroundColor: "#e4e4e7",
    color: "#1f2933",
};
