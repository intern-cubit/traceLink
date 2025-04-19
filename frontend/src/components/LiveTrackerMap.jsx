import React from 'react';
import {
    MapContainer,
    TileLayer,
    Marker,
    Polyline,
    useMap
} from 'react-leaflet';
import L from 'leaflet';
import { useSelector } from 'react-redux';
import { useLiveTracker } from '../hooks/useLiveTracker';
import 'leaflet/dist/leaflet.css';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

// Fix Leaflet's default icon paths using ES module imports
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl,
    iconUrl,
    shadowUrl,
});

function Recenter({ position }) {
    const map = useMap();
    if (position) map.setView(position, map.getZoom());
    return null;
}

/**
 * LiveTrackerMap: Displays live location and movement path for the selected tracker.
 */
export default function LiveTrackerMap() {
    const trackers = useSelector(state => state.tracker.trackers);
    const selectedId = localStorage.getItem('selectedTrackerId') || trackers[0]?.tracker.deviceId;
    const entry = trackers.find(t => t.tracker.deviceId === selectedId);
    const path = useLiveTracker();

    const latest = entry?.latest;
    const position = latest ? [latest.latitude, latest.longitude] : [0, 0];

    console.log('Selected Tracker:', selectedId);
    console.log('Latest Position:', position);
    console.log('Path Length:', path.length);

    return (
        <div className="w-full h-[60vh] rounded-xl overflow-hidden shadow">
            <MapContainer
                center={position}
                zoom={13}
                style={{ width: '100%', height: '100%' }}
                whenCreated={map => map.invalidateSize()}
            >
                <TileLayer
                    attribution="© OpenStreetMap contributors"
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {position && <Recenter position={position} />}
                {position && <Marker position={position} />}
                {path.length > 1 && <Polyline positions={path} weight={4} />}
            </MapContainer>
        </div>
    );
}
