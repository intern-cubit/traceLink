import React, { useEffect } from 'react';
import {
    MapContainer,
    TileLayer,
    Marker,
    Polyline,
    useMap
} from 'react-leaflet';
import L from 'leaflet';
import { useLiveTracker } from '../hooks/useLiveTracker';
import 'leaflet/dist/leaflet.css';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';


export default function LiveTrackerMap() {
    const { path, latest } = useLiveTracker();
    const position = latest || [0, 0];
    const Recenter = ({ position }) => {
        const map = useMap();
        useEffect(() => {
            if (position) {
                map.setView(position, map.getZoom(), { animate: true });
            }
        }, [position, map]);
        return null;
    };


    return (
        <div className="w-full h-full rounded-xl overflow-hidden">
            <MapContainer
                style={{ width: '100%', height: '84vh' }}
                center={position}
                zoom={13}
                whenCreated={map => map.invalidateSize()}
            >
                <TileLayer
                    attribution="© OpenStreetMap contributors"
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {latest && <Recenter position={position} />}
                {latest && <Marker position={position} />}
                {path.length > 1 && <Polyline positions={path} weight={4} />}
            </MapContainer>
        </div>
    );
}
