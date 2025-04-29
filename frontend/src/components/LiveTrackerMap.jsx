import React, { useEffect, useRef, useState } from 'react';
import {
    MapContainer,
    TileLayer,
    Marker,
    Polyline,
    useMap,
    CircleMarker,
    Tooltip,
} from 'react-leaflet';
import L from 'leaflet';
import { useLiveTracker } from '../hooks/useLiveTracker';
import 'leaflet/dist/leaflet.css';
import { Layers, Maximize, Minimize, Navigation, Plus, Minus, Crosshair } from 'lucide-react';

// Fix for default Leaflet icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

// Vehicle Icon
const vehicleIcon = new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30],
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    shadowSize: [41, 41]
});

// MapController component to handle map functions
const MapController = ({ onMapReady, shouldCenterMap, onCentered, followVehicle, position }) => {
    const map = useMap();

    // Run once when map is ready
    useEffect(() => {
        if (map) {
            onMapReady(map);
        }
    }, [map, onMapReady]);

    // Handle centering when requested
    useEffect(() => {
        if (shouldCenterMap && position && position[0] !== 0) {
            map.setView(position, map.getZoom(), { animate: true });
            onCentered();
        }
    }, [shouldCenterMap, position, map, onCentered]);

    // Handle follow mode
    useEffect(() => {
        if (followVehicle && position && position[0] !== 0) {
            map.setView(position, map.getZoom(), { animate: true });
        }
    }, [position, followVehicle, map]);

    return null;
};

// Layer Controller component
const LayerController = ({ currentLayer }) => {
    const map = useMap();

    useEffect(() => {
        // We don't do anything here since the TileLayer will be updated
        // by React when its props change
    }, [currentLayer, map]);

    return null;
};

// Map Controls
const MapControls = ({ onCenterMap, onZoomIn, onZoomOut, onToggleFullscreen, onToggleFollow, isFollowing }) => {
    return (
        <div className="absolute bottom-6 right-4 flex flex-col gap-2 z-[1000]">
            <button onClick={onCenterMap} className="bg-black border border-gold-300 p-2 rounded-full shadow-md hover:bg-gray-900 text-white" title="Center on Vehicle">
                <Crosshair className="w-5 h-5 text-yellow-400" />
            </button>
            <button onClick={onZoomIn} className="bg-black border border-gold-300 p-2 rounded-full shadow-md hover:bg-gray-900 text-white" title="Zoom In">
                <Plus className="w-5 h-5 text-yellow-400" />
            </button>
            <button onClick={onZoomOut} className="bg-black border border-gold-300 p-2 rounded-full shadow-md hover:bg-gray-900 text-white" title="Zoom Out">
                <Minus className="w-5 h-5 text-yellow-400" />
            </button>
            <button onClick={onToggleFullscreen} className="bg-black border border-gold-300 p-2 rounded-full shadow-md hover:bg-gray-900 text-white" title="Fullscreen">
                <Maximize className="w-5 h-5 text-yellow-400" />
            </button>
            <button
                onClick={onToggleFollow}
                className={`p-2 flex justify-center items-center rounded-full shadow-md border ${isFollowing ? 'bg-yellow-500 border-yellow-600 text-black hover:bg-yellow-600' : 'bg-black border-yellow-400 text-white hover:bg-gray-900'}`}
                title={isFollowing ? "Following ON" : "Following OFF"}
            >
                <Navigation className="w-5 h-5" />
            </button>
        </div>
    );
};

export default function LiveTrackerMap() {
    const { path, latest, deviceDetails, speed } = useLiveTracker();
    const [mapInstance, setMapInstance] = useState(null);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [followVehicle, setFollowVehicle] = useState(true);
    const [shouldCenterMap, setShouldCenterMap] = useState(false);

    const lastPosition = latest && latest.length === 2 ? latest : [51.505, -0.09];

    const mapLayers = [
        {
            name: 'Dark',
            url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
            attribution: '&copy; OpenStreetMap contributors &copy; Carto'
        },
        {
            name: 'Satellite',
            url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
            attribution: 'Tiles &copy; Esri'
        }
    ];

    const [currentLayerIndex, setCurrentLayerIndex] = useState(0);
    const currentLayer = mapLayers[currentLayerIndex];

    const handleMapReady = (map) => {
        setMapInstance(map);
    };

    const handleCenterMap = () => {
        if (latest) {
            setShouldCenterMap(true);
        }
    };

    const handleCentered = () => {
        setShouldCenterMap(false);
    };

    const handleZoomIn = () => {
        if (mapInstance) {
            mapInstance.setZoom(mapInstance.getZoom() + 1);
        }
    };

    const handleZoomOut = () => {
        if (mapInstance) {
            mapInstance.setZoom(mapInstance.getZoom() - 1);
        }
    };

    const toggleFullscreen = () => {
        setIsFullscreen(!isFullscreen);
        setTimeout(() => {
            if (mapInstance) {
                mapInstance.invalidateSize();
            }
        }, 300);
    };

    const cycleMapLayer = () => {
        setCurrentLayerIndex((currentLayerIndex + 1) % mapLayers.length);
    };

    const toggleFollow = () => setFollowVehicle(prev => !prev);

    return (
        <div className={`relative ${isFullscreen ? 'fixed inset-0' : 'w-full h-full'} z-0 bg-black`}>
            <MapContainer
                center={lastPosition}
                zoom={14}
                style={{ width: '100%', height: '100%' }}
                zoomControl={false}
                className="rounded-none md:rounded-lg overflow-hidden shadow-lg"
            >
                <TileLayer
                    key={currentLayer.name}
                    attribution={currentLayer.attribution}
                    url={currentLayer.url}
                />

                {latest && (
                    <>
                        <Marker position={latest} icon={vehicleIcon}>
                            <Tooltip permanent direction="top" offset={[0, -20]} className="bg-black text-yellow-400 p-1 rounded shadow border border-yellow-400">
                                {speed ? `${speed} km/h` : 'Stationary'}
                            </Tooltip>
                        </Marker>
                        <CircleMarker
                            center={latest}
                            radius={8}
                            fillColor="#ffc107"
                            fillOpacity={0.3}
                            color="#ffc107"
                            weight={2}
                        />
                        <MapController
                            onMapReady={handleMapReady}
                            shouldCenterMap={shouldCenterMap}
                            onCentered={handleCentered}
                            followVehicle={followVehicle}
                            position={latest}
                        />
                        <LayerController currentLayer={currentLayer} />
                    </>
                )}
                {path.length > 1 && (
                    <Polyline positions={path} color="#ffc107" weight={3} opacity={0.8} dashArray="6,10" />
                )}
            </MapContainer>

            {/* Controls */}
            <MapControls
                onCenterMap={handleCenterMap}
                onZoomIn={handleZoomIn}
                onZoomOut={handleZoomOut}
                onToggleFullscreen={toggleFullscreen}
                onToggleFollow={toggleFollow}
                isFollowing={followVehicle}
            />

            {/* Layer Switch Button */}
            <div className="absolute top-4 left-4 z-[1000]">
                <button
                    onClick={cycleMapLayer}
                    className="bg-black flex items-center gap-2 px-3 py-2 rounded-md shadow hover:bg-gray-900 text-white border border-yellow-400"
                >
                    <Layers className="w-4 h-4 text-yellow-400" />
                    {currentLayer.name}
                </button>
            </div>

            {/* Last Updated Info */}
            <div className="absolute bottom-6 left-4 bg-black/90 backdrop-blur-sm px-3 py-2 rounded shadow-md z-[1000] text-xs text-white border border-yellow-400">
                Last updated: <span className="font-semibold text-yellow-400">
                    {deviceDetails?.timestamp
                        ? new Date(deviceDetails.timestamp).toLocaleString()
                        : 'Loading...'}
                </span>
            </div>

            {/* Exit Fullscreen Button */}
            {isFullscreen && (
                <button
                    onClick={toggleFullscreen}
                    className="absolute top-4 right-4 bg-black p-2 rounded-full shadow hover:bg-gray-900 z-[1000] text-white border border-yellow-400"
                    title="Exit Fullscreen"
                >
                    <Minimize className="w-5 h-5 text-yellow-400" />
                </button>
            )}
        </div>
    );
}