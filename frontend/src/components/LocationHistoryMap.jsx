import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

import {
    MapContainer,
    TileLayer,
    Polyline,
    Marker,
    useMap,
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import { useLocationHistory } from '../hooks/useLocationHistory';
import iconUrl from "leaflet/dist/images/marker-icon.png";
import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";

// Patch Leaflet’s defaults once, at module load time
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconUrl,
    iconRetinaUrl,
    shadowUrl
});

// Helper: Create a custom location (pin) icon using inline SVG with the specified color
const createColoredLocationIcon = (color) => {
    const svgIcon = `
        <svg xmlns="http://www.w3.org/2000/svg" width="25" height="41" viewBox="0 0 25 41">
            <path d="M12.5 0C5.6 0 0 5.6 0 12.5C0 22.2 12.5 41 12.5 41S25 22.2 25 12.5C25 5.6 19.4 0 12.5 0zM12.5 18.8c-3.3 0-6-2.7-6-6s2.7-6 6-6 6 2.7 6 6-2.7 6-6 6z" fill="${color}"/>
        </svg>
    `;
    const encoded = encodeURIComponent(svgIcon)
        .replace(/'/g, "%27")
        .replace(/"/g, "%22");
    const iconUrl = `data:image/svg+xml,${encoded}`;

    return new L.Icon({
        iconUrl,
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [0, -41],
        shadowUrl:
            "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
        shadowSize: [41, 41],
    });
};

function ResizeHandler() {
    const map = useMap();
    React.useEffect(() => {
        const onResize = () => map.invalidateSize();
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, [map]);
    return null;
}

export default function LocationHistoryMap({ trackerId }) {
    const [from, setFrom] = useState(null);
    const [to, setTo] = useState(null);

    const { history, loading, error } = useLocationHistory(trackerId, from, to);

    // extract [lat, lng]
    const positions = history.map(({ latitude, longitude }) => [latitude, longitude]);

    const latestIcon = createColoredLocationIcon('red');    // latest (first item)
    const oldestIcon = createColoredLocationIcon('blue');   // oldest (last item)
    const intermediateIcon = createColoredLocationIcon('#FFA500'); // orange-ish

    return (
        <div className="flex flex-col h-full">
            <div className="flex space-x-4 mb-4">
                <DatePicker
                    selected={from}
                    onChange={setFrom}
                    showTimeSelect
                    placeholderText="From…"
                />
                <DatePicker
                    selected={to}
                    onChange={setTo}
                    showTimeSelect
                    placeholderText="To…"
                />
            </div>

            {loading && <p>🔄 Loading history…</p>}
            {error && <p className="text-red-600">⚠️ {error}</p>}

            {!loading && !error && positions.length > 0 ? (
                <MapContainer
                    center={positions[0]}
                    zoom={13}
                    className="flex-1 rounded-xl overflow-hidden"
                    whenCreated={map => map.invalidateSize()}
                >
                    <ResizeHandler />
                    <TileLayer
                        attribution="© OpenStreetMap contributors"
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <Polyline positions={positions} weight={4} />
                    {positions.map((pos, idx) => {
                        if (idx === 0) {
                            return <Marker key={idx} position={pos} icon={latestIcon} />;
                        } else if (idx === positions.length - 1) {
                            return <Marker key={idx} position={pos} icon={oldestIcon} />;
                        } else {
                            return <Marker key={idx} position={pos} icon={intermediateIcon} />;
                        }
                    })}
                </MapContainer>
            ) : (
                !loading && !error && (
                    <div className="flex-1 flex items-center justify-center text-gray-500">
                        No history for the selected period.
                    </div>
                )
            )}
        </div>
    );
}
