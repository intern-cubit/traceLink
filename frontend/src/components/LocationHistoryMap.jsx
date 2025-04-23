import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

import {
    MapContainer,
    TileLayer,
    Polyline,
    Marker,
    Popup,
    useMap,
    CircleMarker
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import { useLocationHistory } from '../hooks/useLocationHistory';
import iconUrl from "leaflet/dist/images/marker-icon.png";
import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";

// Patch Leaflet’s default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconUrl,
    iconRetinaUrl,
    shadowUrl
});

// Helper: SVG marker icon with custom color
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

// Map resize handler
function ResizeHandler() {
    const map = useMap();
    useEffect(() => {
        const onResize = () => map.invalidateSize();
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, [map]);
    return null;
}

// Utility: Convert date to start and end of day
const startOfDay = (date) => new Date(date.setHours(0, 0, 0, 0));
const endOfDay = (date) => new Date(date.setHours(23, 59, 59, 999));

export default function LocationHistoryMap({ trackerId }) {
    const [selectedDate, setSelectedDate] = useState(null);
    const [from, setFrom] = useState(null);
    const [to, setTo] = useState(null);

    // This should always run, regardless of selectedDate
    const { history, loading, error } = useLocationHistory(
        trackerId,
        from,
        to
    );

    // Only update map positions if there's valid history
    const positions = history.map(({ latitude, longitude }) => [latitude, longitude]);

    const latestIcon = createColoredLocationIcon('red');
    const oldestIcon = createColoredLocationIcon('green');

    return (
        <div className="flex flex-col h-full relative">
            {/* Date Picker Overlay */}
            <div className="absolute top-4 right-4 z-50 flex flex-col items-center gap-2">
                <label className="hidden md:block text-sm text-gray-700 font-medium">Select Date</label>
                <DatePicker
                    selected={selectedDate}
                    onChange={
                        (date) => {
                            setSelectedDate(date);
                            setFrom(date ? startOfDay(new Date(date)) : null);
                            setTo(date ? endOfDay(new Date(date)) : null);
                        }
                    }
                    placeholderText="Select date"
                    dateFormat="P"
                    className="border px-3 py-1 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
            </div>

            {loading && <p>🔄 Loading history…</p>}
            {error && <p className="text-red-600">⚠️ {error}</p>}

            {!selectedDate ?
                <div className="h-full flex-1 flex items-center justify-center text-gray-500">
                    🗓️ Please select a date to view location history.
                </div>
                : !loading && !error && positions.length > 0 ? (
                    <div style={{ height: '100%' }}>
                        <MapContainer
                            center={positions[0]}
                            zoom={13}
                            style={{ height: '100%', width: '100%', zIndex: 0 }}
                            whenCreated={(map) => map.invalidateSize()}
                        >
                            <ResizeHandler />
                            <TileLayer
                                attribution="© OpenStreetMap contributors"
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />
                            <Polyline positions={positions} weight={4} />
                            {history.map((point, idx) => {
                                const pos = [point.latitude, point.longitude];
                                const icon = idx === 0 ? latestIcon : oldestIcon;

                                if (idx === 0 || idx === history.length - 1) {
                                    return (
                                        <Marker key={idx} position={pos} icon={icon}>
                                            <Popup>
                                                <div className="space-y-1 text-sm">
                                                    <p><strong>📍 Time:</strong> {new Date(point.timestamp).toLocaleString()}</p>
                                                    <p><strong>🧭 Lat:</strong> {point.latitude.toFixed(5)}</p>
                                                    <p><strong>🧭 Lng:</strong> {point.longitude.toFixed(5)}</p>
                                                    <p><strong>🔌 Main:</strong> {point.main}</p>
                                                    <p><strong>🔋 Battery:</strong> {point.battery}</p>
                                                </div>
                                            </Popup>
                                        </Marker>
                                    );
                                } else {
                                    return (
                                        <CircleMarker
                                            key={idx}
                                            center={pos}
                                            radius={7}
                                            pathOptions={{ color: 'blue', fillColor: 'lightblue', fillOpacity: 0.9 }}
                                        >
                                            <Popup>
                                                <div className="space-y-1 text-sm">
                                                    <p><strong>📍 Time:</strong> {new Date(point.timestamp).toLocaleString()}</p>
                                                    <p><strong>🧭 Lat:</strong> {point.latitude.toFixed(5)}</p>
                                                    <p><strong>🧭 Lng:</strong> {point.longitude.toFixed(5)}</p>
                                                    <p><strong>🔌 Main:</strong> {point.main}</p>
                                                    <p><strong>🔋 Battery:</strong> {point.battery}</p>
                                                </div>
                                            </Popup>
                                        </CircleMarker>
                                    );
                                }
                            })}
                        </MapContainer>
                    </div>
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
