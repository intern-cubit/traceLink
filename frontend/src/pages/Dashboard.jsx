import React, { useEffect, useMemo, useState } from "react";
import {
    MapPin, History, PlusCircle, User, Radio, Menu, X
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import {
    setLoading, setError, setTrackers, selectTracker
} from "../features/trackerSlice";
import LiveTrackerMap from '../components/LiveTrackerMap';
import LocationHistoryMap from "../components/LocationHistoryMap";

export default function Dashboard() {
    const dispatch = useDispatch();
    const token = useSelector((state) => state.auth.token);
    const user = useSelector((state) => state.auth.user);
    const trackers = useSelector((state) => state.tracker.trackers);
    const selectedTrackerId = useSelector((state) => state.tracker.selectedTrackerId);
    console.log("Trackers:", trackers);
    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

    const [tab, setTab] = useState("live");
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // ✅ UseMemo avoids unnecessary recalculations every render
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
        <div className="flex flex-col md:flex-row min-h-screen bg-gray-100">

            {/* Mobile Header */}
            <header className="md:hidden flex items-center justify-between bg-white border-b p-4 shadow-sm">
                <h2 className="text-xl font-bold text-blue-600">TrackLink</h2>
                <button
                    onClick={() => setSidebarOpen(true)}
                    className="text-gray-700 hover:text-blue-600 focus:outline-none"
                    aria-label="Open menu"
                >
                    <Menu className="w-6 h-6" />
                </button>
            </header>

            {/* Sidebar */}
            <aside
                className={`bg-white border-r shadow-md w-full md:w-64 flex-col z-50 fixed inset-y-0 left-0 transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:static md:flex`}
            >
                <div className="p-6 border-b flex items-center justify-between md:block">
                    <h2 className="text-2xl font-bold text-blue-600">TrackLink</h2>
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="md:hidden text-gray-600 hover:text-blue-600"
                        aria-label="Close menu"
                    >
                        <X className="w-5 h-5" />
                    </button>
                    <div className="mt-2 text-sm text-gray-600 flex items-center gap-2 md:mt-3">
                        <User className="w-4 h-4" /> {user?.fullName}
                    </div>
                </div>

                <div className="flex-1 p-4 overflow-y-auto space-y-6">
                    <div>
                        <p className="text-xs uppercase font-semibold text-gray-400 mb-2">Devices</p>
                        <div className="space-y-2">
                            {trackers.map(({ tracker }) => (
                                <button
                                    key={tracker.deviceId}
                                    onClick={() => {
                                        dispatch(selectTracker(tracker._id));
                                        setSidebarOpen(false);
                                        localStorage.setItem('selectedTrackerId', tracker._id);
                                    }}
                                    className={`w-full text-left px-3 py-2 rounded-md text-sm flex items-center gap-2 font-medium transition
                    ${selectedTrackerId === tracker._id
                                            ? 'bg-blue-100 text-blue-700'
                                            : 'hover:bg-gray-100 text-gray-700'}`}
                                >
                                    <Radio className="w-4 h-4" /> {tracker.vehicleType} ({tracker.deviceId})
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={() => alert("Add device functionality coming soon!")}
                            className="mt-4 text-sm text-blue-600 hover:underline flex items-center gap-1"
                        >
                            <PlusCircle className="w-4 h-4" /> Add Device
                        </button>
                    </div>

                    <div>
                        <p className="text-xs uppercase font-semibold text-gray-400 mb-2">Tracking</p>
                        <div className="space-y-2">
                            <button
                                onClick={() => { setTab('live'); setSidebarOpen(false); }}
                                className={`w-full text-left px-3 py-2 rounded-md text-sm flex items-center gap-2 font-medium transition
                  ${tab === 'live'
                                        ? 'bg-blue-100 text-blue-700'
                                        : 'hover:bg-gray-100 text-gray-700'}`}
                            >
                                <MapPin className="w-4 h-4" /> Live Location
                            </button>
                            <button
                                onClick={() => { setTab('history'); setSidebarOpen(false); }}
                                className={`w-full text-left px-3 py-2 rounded-md text-sm flex items-center gap-2 font-medium transition
                  ${tab === 'history'
                                        ? 'bg-blue-100 text-blue-700'
                                        : 'hover:bg-gray-100 text-gray-700'}`}
                            >
                                <History className="w-4 h-4" /> Location History
                            </button>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Overlay for mobile */}
            {sidebarOpen && (
                <div
                    onClick={() => setSidebarOpen(false)}
                    className="fixed inset-0 bg-black opacity-30 md:hidden z-30"
                />
            )}

            {/* Main Content */}
            <main className="flex-1 bg-gray-50 relative overflow-hidden">
                {/* Overlayed Header Text */}
                <div className="hidden md:block absolute top-4 left-4 z-10 bg-white/70 backdrop-blur-md px-4 py-2 rounded-lg shadow text-sm">
                    <h3 className="text-lg font-semibold text-gray-800">
                        {tab === "live" ? "Live Location" : "Location History"}
                    </h3>
                    <p className="text-gray-600">
                        Tracking: {selectedDevice?.tracker.vehicleType || "-"} ({selectedDevice?.tracker.deviceId || "-"} )
                    </p>
                </div>

                {/* Map */}
                <div className="absolute inset-0 z-0">
                    {tab === "live" ? (
                        <LiveTrackerMap />
                    ) : selectedTrackerId ? (
                        <LocationHistoryMap trackerId={selectedTrackerId} />
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-400 text-center px-4">
                            Select a device to view location history
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
