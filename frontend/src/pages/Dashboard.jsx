import React, { useEffect } from "react";
import {
    MapPin, History, PlusCircle, User, Radio, Menu
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { setLoading, setError, setTrackers, selectTracker } from "../features/trackerSlice";
import LiveTrackerMap from '../components/LiveTrackerMap';

export default function Dashboard() {
    const dispatch = useDispatch();
    const token = useSelector(state => state.auth.token);
    const user = useSelector(state => state.auth.user);
    const trackers = useSelector(state => state.tracker.trackers);
    const selectedTrackerId = useSelector(state => state.tracker.selectedTrackerId);
    const selectedDevice = trackers.find(t => t.tracker._id === selectedTrackerId) || null;

    const [tab, setTab] = React.useState("live");
    const [sidebarOpen, setSidebarOpen] = React.useState(false);

    useEffect(() => {
        const fetchDevices = async () => {
            dispatch(setLoading(true));
            try {
                const response = await fetch("http://localhost:5000/api/user/trackers", {
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
            <div className="md:hidden flex items-center justify-between bg-white border-b p-4 shadow-md z-10">
                <h2 className="text-xl font-bold text-blue-600">TrackLink</h2>
                <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="text-gray-600 hover:text-blue-600"
                >
                    <Menu className="w-6 h-6" />
                </button>
            </div>

            {/* Sidebar */}
            <aside
                className={`bg-white border-r shadow-md w-full md:w-64 flex-col transition-all duration-300 ease-in-out z-20
                ${sidebarOpen ? 'flex fixed top-0 left-0 h-full' : 'hidden'} md:flex`}
            >
                <div className="p-6 border-b">
                    <h2 className="text-2xl font-bold text-blue-600">TrackLink</h2>
                    <div className="mt-2 text-sm text-gray-600 flex items-center gap-2">
                        <User className="w-4 h-4" /> {user.fullName}
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
                        <button className="mt-4 text-sm text-blue-600 hover:underline flex items-center gap-1">
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

            {/* Main Content */}
            <main className="flex-1 flex flex-col p-4 sm:p-6">
                <div className="mb-4">
                    <h3 className="text-xl font-semibold text-gray-800">
                        {tab === 'live' ? 'Live Location' : 'Location History'}
                    </h3>
                    <p className="text-sm text-gray-500">
                        Tracking: {selectedDevice?.tracker.vehicleType || '-'} ({selectedDevice?.tracker.deviceId || '-'})
                    </p>
                </div>
                <div className="flex-1 overflow-hidden rounded-xl bg-white shadow-lg">
                    {tab === 'live' ? (
                        <LiveTrackerMap />
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-400 text-center px-4">
                            {selectedDevice ? 'Location History coming soon' : 'Select a device to view location history'}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
