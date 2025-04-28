import React, { useEffect, useMemo, useState } from "react";
import {
    MapPin, History, PlusCircle, User, Radio, Menu, X,
    Settings, Bell, Battery, Clock, Calendar, ChevronDown
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import {
    setLoading, setError, setTrackers, selectTracker
} from "../features/trackerSlice";
import LiveTrackerMap from '../components/LiveTrackerMap';
import LocationHistoryMap from "../components/LocationHistoryMap";
import { useNavigate } from "react-router-dom";
import LastUpdate from "../components/LastUpdate";

export default function Dashboard() {
    const dispatch = useDispatch();
    const token = useSelector((state) => state.auth.token);
    const user = useSelector((state) => state.auth.user);
    const trackers = useSelector((state) => state.tracker.trackers);
    const selectedTrackerId = useSelector((state) => state.tracker.selectedTrackerId);
    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
    const navigate = useNavigate();

    const [tab, setTab] = useState("live");
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [statsExpanded, setStatsExpanded] = useState(true);
    const [dateRange, setDateRange] = useState("today");

    // Device stats (in a real app, these would come from the API)
    const deviceStats = {
        batteryLevel: "85%",
        lastUpdated: "2 min ago",
        status: "Active"
    };

    // UseMemo avoids unnecessary recalculations every render
    const selectedDevice = useMemo(() => {
        return trackers.find(t => t.tracker._id === selectedTrackerId) || null;
    }, [trackers, selectedTrackerId]);

    useEffect(() => {
        const fetchDevices = async () => {
            dispatch(setLoading(true));
            try {
                const response = await fetch(`${BACKEND_URL}/api/user/trackers`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        authorization: `Bearer ${token}`,
                    },
                });
                const data = await response.json();
                if (!response.ok) {
                    dispatch(setError(data.message || 'Failed to fetch trackers'));
                    return;
                }
                dispatch(setTrackers(data));
                localStorage.setItem('trackers', JSON.stringify(data));

                if (Array.isArray(data) && data.length > 0) {
                    dispatch(selectTracker(data[0].tracker._id));
                }
            } catch (error) {
                dispatch(setError(error.toString()));
            } finally {
                dispatch(setLoading(false));
            }
        };

        if (token) fetchDevices();
    }, [dispatch, token]);

    return (
        <div className="flex flex-col md:flex-row h-screen bg-black overflow-hidden">
            {/* Mobile Header */}
            <header className="md:hidden flex items-center justify-between bg-black p-3 border-b border-gray-800 shadow-sm">
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="text-white hover:text-yellow-400 focus:outline-none"
                        aria-label="Open menu"
                    >
                        <Menu className="w-5 h-5" />
                    </button>
                    <h2 className="text-lg font-bold text-yellow-400">TrackLink</h2>
                </div>
                <div className="flex items-center gap-3">
                    <button className="text-white hover:text-yellow-400">
                        <Bell className="w-5 h-5" />
                    </button>
                    <button className="text-white hover:text-yellow-400">
                        <Settings className="w-5 h-5" />
                    </button>
                </div>
            </header>

            {/* Sidebar */}
            <aside
                className={`bg-gray-900 border-r border-gray-800 shadow-md w-full md:w-64 flex-col z-50 fixed inset-y-0 left-0 transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:static md:flex`}
            >
                <div className="p-4 border-b border-gray-800 flex items-center justify-between md:block">
                    <h2 className="text-xl font-bold text-yellow-400">TrackLink</h2>
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="md:hidden text-white hover:text-yellow-400"
                        aria-label="Close menu"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-3 border-b border-gray-800 bg-gray-800">
                    <div className="flex items-center gap-2">
                        <div className="bg-yellow-500 text-black p-2 rounded-full">
                            <User className="w-4 h-4" />
                        </div>
                        <div>
                            <p className="font-medium text-sm text-white">{user?.fullName}</p>
                            <p className="text-xs text-gray-400">{user?.email}</p>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {/* Devices Section */}
                    <div className="p-3 border-b border-gray-800">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-xs uppercase font-semibold text-gray-400">My Devices</p>
                            <button
                                onClick={() => navigate("/add-device")}
                                className="text-xs text-yellow-400 hover:text-yellow-300 flex items-center gap-1"
                            >
                                <PlusCircle className="w-3 h-3" /> Add
                            </button>
                        </div>
                        <div className="space-y-1">
                            {trackers.map(({ tracker }) => (
                                <button
                                    key={tracker.deviceId}
                                    onClick={() => {
                                        dispatch(selectTracker(tracker._id));
                                        localStorage.setItem('selectedTrackerId', tracker._id);
                                        setSidebarOpen(false);
                                    }}
                                    className={`w-full text-left px-2 py-2 rounded-md text-sm flex items-center gap-2 transition
                    ${selectedTrackerId === tracker._id
                                            ? 'bg-yellow-900 text-yellow-400 font-medium'
                                            : 'hover:bg-gray-800 text-gray-300'}`}
                                >
                                    <div
                                        className={`w-2 h-2 rounded-full ${tracker && tracker.status === "online" ? "bg-green-500" : "bg-gray-600"
                                            }`}
                                    ></div>
                                    {tracker.vehicleType} <span className="text-xs text-gray-500">({tracker.deviceId.slice(-4)})</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Tracking Options */}
                    <div className="p-3">
                        <p className="text-xs uppercase font-semibold text-gray-400 mb-2">Tracking</p>
                        <div className="space-y-1">
                            <button
                                onClick={() => { setTab('live'); setSidebarOpen(false); }}
                                className={`w-full text-left px-2 py-2 rounded-md text-sm flex items-center gap-2 transition
                  ${tab === 'live'
                                        ? 'bg-yellow-900 text-yellow-400 font-medium'
                                        : 'hover:bg-gray-800 text-gray-300'}`}
                            >
                                <MapPin className="w-4 h-4" /> Live Location
                            </button>
                            <button
                                onClick={() => { setTab('history'); setSidebarOpen(false); }}
                                className={`w-full text-left px-2 py-2 rounded-md text-sm flex items-center gap-2 transition
                  ${tab === 'history'
                                        ? 'bg-yellow-900 text-yellow-400 font-medium'
                                        : 'hover:bg-gray-800 text-gray-300'}`}
                            >
                                <History className="w-4 h-4" /> Location History
                            </button>
                            <button
                                className="w-full text-left px-2 py-2 rounded-md text-sm flex items-center gap-2 transition
                  hover:bg-gray-800 text-gray-300"
                            >
                                <Bell className="w-4 h-4" /> Alerts & Notifications
                            </button>
                            <button
                                className="w-full text-left px-2 py-2 rounded-md text-sm flex items-center gap-2 transition
                  hover:bg-gray-800 text-gray-300"
                            >
                                <Settings className="w-4 h-4" /> Settings
                            </button>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Overlay for mobile */}
            {sidebarOpen && (
                <div
                    onClick={() => setSidebarOpen(false)}
                    className="fixed inset-0 bg-black opacity-40 md:hidden z-30"
                />
            )}

            {/* Main Content */}
            <main className="flex-1 flex flex-col bg-black relative overflow-hidden">
                {/* Desktop Header */}
                <div className="hidden md:flex items-center justify-between bg-gray-900 px-4 py-3 border-b border-gray-800 shadow-sm">
                    <div className="flex items-center gap-2">
                        <h3 className="font-medium text-white">
                            {tab === "live" ? "Live Tracking" : "Location History"}
                        </h3>
                        {selectedDevice && (
                            <span className="text-sm text-gray-400">
                                • {selectedDevice.tracker.vehicleType} ({selectedDevice.tracker.deviceId})
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="text-white hover:text-yellow-400">
                            <Bell className="w-5 h-5" />
                        </button>
                        <button className="text-white hover:text-yellow-400">
                            <Settings className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Floating Device Stats Panel */}
                {selectedDevice && (
                    <div className="hidden md:block absolute top-16 right-4 z-10 bg-gray-900 border border-gray-800 rounded-lg shadow-md w-64 overflow-hidden">
                        <div
                            className="flex items-center justify-between p-3 bg-gray-800 cursor-pointer"
                            onClick={() => setStatsExpanded(!statsExpanded)}
                        >
                            <div className="font-medium text-sm flex items-center gap-2 text-white">
                                <div
                                    className={`w-2 h-2 rounded-full ${selectedDevice && selectedDevice.status === "online" ? "bg-green-500" : "bg-gray-600"
                                        }`}
                                ></div>

                                {selectedDevice.tracker.vehicleType}
                            </div>
                            <ChevronDown className={`w-4 h-4 transition-transform text-white ${statsExpanded ? 'rotate-180' : ''}`} />
                        </div>

                        {statsExpanded && (
                            <div className="p-3 space-y-3">
                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2 text-gray-400">
                                        <Battery className="w-4 h-4" /> Battery
                                    </div>
                                    <div className="font-medium text-white">
                                        {selectedDevice?.battery || selectedDevice?.tracker?.battery || selectedDevice?.latest?.battery || 'N/A'}
                                    </div>
                                </div>

                                <LastUpdate selectedDevice={selectedDevice} />

                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2 text-gray-400">
                                        <Radio className="w-4 h-4" /> Status
                                    </div>
                                    <div className={`font-medium ${selectedDevice && selectedDevice.status === "online" ? "text-green-400" : "text-gray-300"}`}>
                                        {selectedDevice && selectedDevice.status ? selectedDevice.status : "Status unavailable"}
                                    </div>
                                </div>

                                <div className="mt-2 grid grid-cols-2 gap-2">
                                    <button className="bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700 text-xs py-1 rounded">
                                        Device Details
                                    </button>
                                    <button className="bg-yellow-500 hover:bg-yellow-600 text-black text-xs py-1 rounded">
                                        View Alerts
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Map Container */}
                <div className="flex-1 relative">
                    {tab === "live" ? (
                        <LiveTrackerMap />
                    ) : selectedTrackerId ? (
                        <LocationHistoryMap trackerId={selectedTrackerId} />
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-500 text-center px-4">
                            Select a device to view location history
                        </div>
                    )}

                    {/* Mobile-only Bottom Bar */}
                    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 shadow-lg flex items-center justify-around p-2">
                        <button
                            onClick={() => setTab('live')}
                            className={`flex flex-col items-center p-2 ${tab === 'live' ? 'text-yellow-400' : 'text-gray-400'}`}
                        >
                            <MapPin className="w-5 h-5" />
                            <span className="text-xs mt-1">Live</span>
                        </button>
                        <button
                            onClick={() => setTab('history')}
                            className={`flex flex-col items-center p-2 ${tab === 'history' ? 'text-yellow-400' : 'text-gray-400'}`}
                        >
                            <History className="w-5 h-5" />
                            <span className="text-xs mt-1">History</span>
                        </button>
                        {selectedDevice && (
                            <div className="flex flex-col items-center p-2 text-gray-400">
                                <Battery className="w-5 h-5" />
                                <span className="text-xs mt-1">{deviceStats.batteryLevel}</span>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}