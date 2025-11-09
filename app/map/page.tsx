"use client";

import { useState } from "react";
import {
    APIProvider,
    Map,
    AdvancedMarker,
    InfoWindow,
    useMapsLibrary
} from "@vis.gl/react-google-maps"

import {
    Combobox,
    ComboboxInput,
    ComboboxPopover,
    ComboboxList,
    ComboboxOption
} from "@reach/combobox";

import "@reach/combobox/styles.css";

export default function Intro() {
    const position = { lat: -34.6037, lng: -58.3816 }; // Buenos Aires, Argentina
    const [open, setOpen] = useState(false);
    const [selected, setSelected] = useState(null);

    return (
        <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""}>
            <div style={{ height: "100vh", width: "100%" }}>
                <div className="places-container">
                    <PlacesAutocomplete setSelected={setSelected} />
                </div>
                <Map defaultZoom={9} defaultCenter={position} mapId={process.env.NEXT_PUBLIC_MAP_ID}>
                    <AdvancedMarker position={position} onClick={() => setOpen(true)}>

                    </AdvancedMarker>
                    {open && (<InfoWindow position={position} onCloseClick={() => setOpen(false)}>
                        <p>Hola, Buenos Aires!</p>
                    </InfoWindow>)}
                </Map>
            </div>
            <Geocoding />
        </APIProvider>
    );
}

function Geocoding() {
    const geocodingApiLoaded = useMapsLibrary("geocoding");
    return null;
}

const  PlacesAutocomplete = ({ setSelected }) => {
    const {
        ready,
        value,
        setValue,
        suggestions: { status, data },
        clearSuggestions
    } = useMapsLibrary("places");

    return <Combobox>

    </Combobox>;
}