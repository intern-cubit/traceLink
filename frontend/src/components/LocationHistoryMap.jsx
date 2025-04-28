import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { X } from 'lucide-react';
import {
    MapContainer,
    TileLayer,
    Polyline,
    Marker,
    Popup,
    useMap,
    CircleMarker,
    ZoomControl
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useLocationHistory } from '../hooks/useLocationHistory';
import { Calendar, Clock, Battery, Info, Layers, Navigation, ArrowLeft, ArrowRight, Play, Pause, List, Download, Maximize, Minimize } from 'lucide-react';

// Patch Leaflet's default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png'
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

// Convert timestamp to formatted time
const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

export default function LocationHistoryMap({ trackerId }) {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [from, setFrom] = useState(startOfDay(new Date()));
    const [to, setTo] = useState(endOfDay(new Date()));
    const [mapRef, setMapRef] = useState(null);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [playback, setPlayback] = useState(false);
    const [activePointIndex, setActivePointIndex] = useState(0);
    const [showRawData, setShowRawData] = useState(false);
    const [mapLayer, setMapLayer] = useState({
        name: 'Standard',
        url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        attribution: '&copy; OpenStreetMap contributors'
    });

    // Fetch location history data
    const { history, loading, error } = useLocationHistory(trackerId, from, to);

    // Extract positions from history for the map
    const positions = history.map(({ latitude, longitude }) => [latitude, longitude]);

    // Define marker icons
    const startIcon = createColoredLocationIcon('#4CAF50'); // Green for start point
    const endIcon = createColoredLocationIcon('#F44336');   // Red for end point
    const activeIcon = createColoredLocationIcon('#2196F3'); // Blue for active point

    // Toggle map layer
    const cycleMapLayer = () => {
        const layers = [
            {
                name: 'Standard',
                url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
                attribution: '&copy; OpenStreetMap contributors'
            },
            {
                name: 'Satellite',
                url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
                attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
            }
        ];

        const currentIndex = layers.findIndex(layer => layer.name === mapLayer.name);
        const nextIndex = (currentIndex + 1) % layers.length;
        setMapLayer(layers[nextIndex]);
    };

    // Handle playback animation
    useEffect(() => {
        let interval;
        if (playback && history.length > 0) {
            interval = setInterval(() => {
                setActivePointIndex((prevIndex) => {
                    const nextIndex = prevIndex + 1;
                    if (nextIndex >= history.length) {
                        setPlayback(false);
                        return 0;
                    }

                    // Center map on the active point
                    if (mapRef) {
                        const point = history[nextIndex];
                        mapRef.setView([point.latitude, point.longitude], mapRef.getZoom(), {
                            animate: true
                        });
                    }

                    return nextIndex;
                });
            }, 1000); // Move to next point every second
        }

        return () => clearInterval(interval);
    }, [playback, history, mapRef]);

    // Toggle fullscreen mode
    const toggleFullscreen = () => {
        setIsFullscreen(!isFullscreen);
        // Allow the resize to complete before invalidating map size
        setTimeout(() => {
            if (mapRef) {
                mapRef.invalidateSize();
            }
        }, 100);
    };

    // Navigation controls for playback
    const handlePrevPoint = () => {
        if (activePointIndex > 0) {
            const newIndex = activePointIndex - 1;
            setActivePointIndex(newIndex);

            if (mapRef && history[newIndex]) {
                const point = history[newIndex];
                mapRef.setView([point.latitude, point.longitude], mapRef.getZoom(), {
                    animate: true
                });
            }
        }
    };

    const handleNextPoint = () => {
        if (activePointIndex < history.length - 1) {
            const newIndex = activePointIndex + 1;
            setActivePointIndex(newIndex);

            if (mapRef && history[newIndex]) {
                const point = history[newIndex];
                mapRef.setView([point.latitude, point.longitude], mapRef.getZoom(), {
                    animate: true
                });
            }
        }
    };

    // Download history data as CSV
    const downloadCSV = () => {
        if (history.length === 0) return;

        const headers = "Timestamp,Latitude,Longitude,Battery,Main\n";
        const csvData = history.map(point =>
            `${new Date(point.timestamp).toISOString()},${point.latitude},${point.longitude},${point.battery},${point.main}`
        ).join("\n");

        const blob = new Blob([headers + csvData], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        const date = selectedDate.toISOString().split('T')[0];
        a.setAttribute('download', `location-history-${date}.csv`);
        a.setAttribute('href', url);
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    return (
        <div className={`relative ${isFullscreen ? 'fixed inset-0 bg-white' : 'h-full w-full'}`}>
            {/* Date Picker Controls */}
            <div className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-white p-2 rounded-md shadow-md">
                <Calendar className="w-4 h-4 text-blue-600" />
                <DatePicker
                    selected={selectedDate}
                    onChange={(date) => {
                        setSelectedDate(date);
                        setFrom(date ? startOfDay(new Date(date)) : null);
                        setTo(date ? endOfDay(new Date(date)) : null);
                        setActivePointIndex(0);
                    }}
                    dateFormat="MMM d, yyyy"
                    className="border-0 text-sm p-0 w-32 focus:outline-none focus:ring-0"
                />
            </div>

            {/* Map Layer Selector */}
            <div className="absolute md:top-16 md:left-4 top-4 right-4 z-10">
                <button
                    onClick={cycleMapLayer}
                    className="bg-white p-2 rounded-md shadow-md hover:bg-gray-100 text-gray-700 flex items-center gap-2 text-sm"
                >
                    <Layers className="w-4 h-4" />
                    <span>{mapLayer.name}</span>
                </button>
            </div>

            {/* Loading and Error States */}
            {loading && (
                <div className="absolute top-16 right-4 z-10 bg-white p-2 rounded-md shadow-md text-sm">
                    <div className="flex items-center gap-2">
                        <div className="animate-spin w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                        <span>Loading history...</span>
                    </div>
                </div>
            )}

            {error && (
                <div className="absolute top-16 right-4 z-10 bg-red-50 p-2 rounded-md shadow-md text-sm text-red-600 flex items-center gap-2">
                    <Info className="w-4 h-4" />
                    <span>{error}</span>
                </div>
            )}

            {/* Map Container */}
            {!selectedDate ? (
                <div className="h-full flex items-center justify-center bg-gray-50 text-gray-500">
                    <div className="flex flex-col items-center gap-2">
                        <Calendar className="w-8 h-8" />
                        <p>Please select a date to view location history</p>
                    </div>
                </div>
            ) : !loading && !error && positions.length > 0 ? (
                <div className="h-full -z-10">
                    <MapContainer
                        center={activeIcon ? positions[activePointIndex] : [0, 0]}
                        zoom={13}
                        style={{ height: '100%', width: '100%' }}
                        zoomControl={false}
                        
                        whenCreated={(map) => {
                            setMapRef(map);
                            map.invalidateSize();
                        }}
                    >
                        <ResizeHandler />
                        <TileLayer
                            attribution={mapLayer.attribution}
                            url={mapLayer.url}
                        />

                        {/* Route line */}
                        <Polyline
                            positions={positions}
                            pathOptions={{
                                color: '#3B82F6',
                                weight: 4,
                                opacity: 0.7
                            }}
                        />

                        {/* Markers for each point */}
                        {history.map((point, idx) => {
                            const pos = [point.latitude, point.longitude];
                            const isEnd = idx === history.length - 1;
                            const isStart = idx === 0;
                            const isActive = idx === activePointIndex;

                            // Only show start, end and active markers
                            if (isStart || isEnd || isActive) {
                                let icon;
                                if (isStart) icon = startIcon;
                                else if (isEnd) icon = endIcon;
                                else if (isActive) icon = activeIcon;

                                return (
                                    <Marker key={idx} position={pos} icon={icon}>
                                        <Popup>
                                            <div className="space-y-2 text-sm">
                                                <div className="font-medium border-b pb-1">
                                                    {isStart ? 'Start Point' : isEnd ? 'End Point' : 'Location Point'}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Clock className="w-4 h-4 text-gray-600" />
                                                    <span>{new Date(point.timestamp).toLocaleString()}</span>
                                                </div>
                                                <div className="text-xs text-gray-600">
                                                    {point.latitude.toFixed(5)}, {point.longitude.toFixed(5)}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Battery className="w-4 h-4 text-gray-600" />
                                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                                        <div
                                                            className="bg-green-500 h-2 rounded-full"
                                                            style={{ width: `${point.battery}%` }}
                                                        ></div>
                                                    </div>
                                                    <span>{point.battery}%</span>
                                                </div>
                                            </div>
                                        </Popup>
                                    </Marker>
                                );
                            } else {
                                // Smaller circle markers for intermediate points
                                return (
                                    <CircleMarker
                                        key={idx}
                                        center={pos}
                                        radius={4}
                                        pathOptions={{
                                            color: '#3B82F6',
                                            fillColor: '#93C5FD',
                                            fillOpacity: 0.7
                                        }}
                                    >
                                        <Popup>
                                            <div className="space-y-2 text-sm">
                                                <div className="flex items-center gap-2">
                                                    <Clock className="w-4 h-4 text-gray-600" />
                                                    <span>{new Date(point.timestamp).toLocaleString()}</span>
                                                </div>
                                                <div className="text-xs text-gray-600">
                                                    {point.latitude.toFixed(5)}, {point.longitude.toFixed(5)}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Battery className="w-4 h-4 text-gray-600" />
                                                    <span>{point.battery}%</span>
                                                </div>
                                            </div>
                                        </Popup>
                                    </CircleMarker>
                                );
                            }
                        })}
                    </MapContainer>

                    {/* Playback Controls */}
                    {history.length > 0 && (
                        <div className="absolute md:bottom-6 bottom-20 left-4 right-4 md:left-1/2 md:right-auto md:transform md:-translate-x-1/2 z-10 bg-white rounded-lg shadow-md py-2 px-4 flex items-center justify-between">
                            <div className="text-sm font-medium">
                                {history[activePointIndex] &&
                                    formatTime(history[activePointIndex].timestamp)
                                }
                            </div>

                            <div className="flex items-center gap-4">
                                <button
                                    onClick={handlePrevPoint}
                                    disabled={activePointIndex === 0}
                                    className={`p-1 rounded-full ${activePointIndex === 0 ? 'text-gray-300' : 'text-gray-700 hover:bg-gray-100'}`}
                                >
                                    <ArrowLeft className="w-5 h-5" />
                                </button>

                                <button
                                    onClick={() => setPlayback(!playback)}
                                    className="p-1 rounded-full text-blue-600 hover:bg-blue-50"
                                >
                                    {playback ?
                                        <Pause className="w-5 h-5" /> :
                                        <Play className="w-5 h-5" />
                                    }
                                </button>

                                <button
                                    onClick={handleNextPoint}
                                    disabled={activePointIndex === history.length - 1}
                                    className={`p-1 rounded-full ${activePointIndex === history.length - 1 ? 'text-gray-300' : 'text-gray-700 hover:bg-gray-100'}`}
                                >
                                    <ArrowRight className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setShowRawData(!showRawData)}
                                    className="p-1 rounded-full text-gray-700 hover:bg-gray-100"
                                    title="Show data table"
                                >
                                    <List className="w-5 h-5" />
                                </button>

                                <button
                                    onClick={downloadCSV}
                                    className="p-1 rounded-full text-gray-700 hover:bg-gray-100"
                                    title="Download CSV"
                                >
                                    <Download className="w-5 h-5" />
                                </button>

                                <button
                                    onClick={toggleFullscreen}
                                    className="p-1 rounded-full text-gray-700 hover:bg-gray-100"
                                    title="Toggle fullscreen"
                                >
                                    {isFullscreen ?
                                        <Minimize className="w-5 h-5" /> :
                                        <Maximize className="w-5 h-5" />
                                    }
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Data Table */}
                    {/* Data Table */}
                    {showRawData && history.length > 0 && (
                        <div className="absolute bottom-20 left-4 right-4 z-10 bg-white rounded-lg shadow-lg max-h-64 overflow-y-auto border border-gray-200">
                            <div className="sticky top-0 bg-white px-4 py-3 border-b flex justify-between items-center">
                                <h3 className="text-sm font-semibold text-gray-800">Location History Data</h3>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-gray-500">{history.length} points</span>
                                    <button
                                        onClick={downloadCSV}
                                        className="text-gray-600 hover:text-gray-800 p-1"
                                        title="Download CSV"
                                    >
                                        <Download className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => setShowRawData(false)}
                                        className="text-gray-600 hover:text-gray-800 p-1"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead>
                                        <tr>
                                            <th className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky top-0 border-b">Time</th>
                                            <th className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky top-0 border-b">Coordinates</th>
                                            <th className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky top-0 border-b">Battery</th>
                                            <th className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky top-0 border-b">Power Status</th>
                                            <th className="px-4 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider sticky top-0 border-b">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {history.map((point, idx) => (
                                            <tr
                                                key={idx}
                                                className={`hover:bg-gray-50 transition-colors ${idx === activePointIndex ? 'bg-blue-50' : ''}`}
                                                onClick={() => {
                                                    setActivePointIndex(idx);
                                                    if (mapRef) {
                                                        mapRef.setView([point.latitude, point.longitude], mapRef.getZoom(), {
                                                            animate: true
                                                        });
                                                    }
                                                }}
                                            >
                                                <td className="px-4 py-2 whitespace-nowrap text-xs">
                                                    <div className="font-medium text-gray-900">{formatTime(point.timestamp)}</div>
                                                    <div className="text-gray-500 text-xs">{new Date(point.timestamp).toLocaleDateString()}</div>
                                                </td>
                                                <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-700">
                                                    {point.latitude.toFixed(5)}, {point.longitude.toFixed(5)}
                                                </td>
                                                <td className="px-4 py-2 whitespace-nowrap">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-16 bg-gray-200 rounded-full h-1.5">
                                                            <div
                                                                className={`h-1.5 rounded-full ${point.battery > 20 ? 'bg-green-500' : 'bg-red-500'}`}
                                                                style={{ width: `${point.battery}%` }}
                                                            ></div>
                                                        </div>
                                                        <span className="text-xs text-gray-700">{point.battery}%</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-2 whitespace-nowrap text-xs">
                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${point.main === 'ON' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                                        }`}>
                                                        {point.main}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-2 whitespace-nowrap text-right text-xs">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation(); // Prevent row click
                                                            setActivePointIndex(idx); // Set this point as active
                                                            // Use a higher zoom level (16) for the focus action
                                                            if (mapRef) {
                                                                mapRef.flyTo([point.latitude, point.longitude], 16, {
                                                                    duration: 1.5 // Smooth animation
                                                                });
                                                            }
                                                        }}
                                                        className="text-blue-600 hover:text-blue-800 px-2 py-1 rounded hover:bg-blue-50"
                                                    >
                                                        <Navigation className="w-3 h-3 inline" />
                                                        <span className="ml-1">Focus</span>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="py-2 px-4 bg-gray-50 border-t flex justify-between items-center text-xs text-gray-500">
                                <div>
                                    Showing all {history.length} data points
                                </div>
                                <div>
                                    <button
                                        className="text-blue-600 hover:text-blue-800"
                                        onClick={downloadCSV}
                                    >
                                        Export data
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                !loading && !error && (
                    <div className="h-full flex items-center justify-center bg-gray-50 text-gray-500">
                        <div className="flex flex-col items-center gap-2">
                            <Info className="w-8 h-8" />
                            <p className='text-center'>No location history available for the selected date</p>
                        </div>
                    </div>
                )
            )}
        </div>
    );
}