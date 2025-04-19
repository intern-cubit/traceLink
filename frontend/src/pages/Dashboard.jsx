import React, { useEffect } from "react";
import { MapPin, History, PlusCircle, User, Radio, Menu } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { setLoading, setError, setTrackers, selectTracker } from "../features/trackerSlice";

export default function Dashboard() {
    const dispatch = useDispatch();
    const token = useSelector(state => state.auth.token);
    const user = useSelector(state => state.auth.user);
    const trackers = useSelector(state => state.tracker.trackers);
    const selectedTrackerId = useSelector(state => state.tracker.selectedTrackerId);
    const selectedDevice = trackers.find(t => t.tracker.deviceId === selectedTrackerId) || null;

    const [tab, setTab] = React.useState("live");
    const [sidebarOpen, setSidebarOpen] = React.useState(false);

    useEffect(() => {
        const fetchDevices = async () => {
            dispatch(setLoading(true));
            try {
                const response = await fetch(
                    "http://localhost:5000/api/user/trackers",
                    {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",
                            authorization: `Bearer ${token}`,
                        },
                    }
                );
                const data = await response.json();
                if (!response.ok) {
                    dispatch(setError(data.message || 'Failed to fetch trackers'));
                    return;
                }
                // store in Redux
                dispatch(setTrackers(data));
                // default select first
                if (Array.isArray(data) && data.length > 0) {
                    dispatch(selectTracker(data[0].tracker.deviceId));
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
        <div className="flex flex-col md:flex-row min-h-screen">
            {/* Mobile Header */}
            <div className="md:hidden flex items-center justify-between bg-white border-b p-4 shadow-sm">
                <h2 className="text-xl font-semibold text-blue-600">TrackLink</h2>
                <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="text-gray-600 hover:text-gray-900 focus:outline-none"
                >
                    <Menu className="w-6 h-6" />
                </button>
            </div>

            {/* Sidebar */}
            <aside
                className={`bg-white border-r shadow-sm w-full md:w-64 flex-col transition-all duration-300 ease-in-out
          ${sidebarOpen ? 'flex' : 'hidden'} md:flex`}
            >
                <div className="p-6 border-b">
                    <h2 className="text-xl font-semibold text-blue-600">TrackLink</h2>
                    <div className="mt-2 text-sm text-gray-500 flex items-center gap-2">
                        <User className="w-4 h-4" /> {user.fullName}
                    </div>
                </div>
                <div className="flex-1 p-4 space-y-4">
                    <div>
                        <div className="text-xs text-gray-500 mb-1">Devices</div>
                        <div className="space-y-2">
                            {trackers.map(({ tracker }) => (
                                <button
                                    key={tracker.deviceId}
                                    onClick={() => {
                                        dispatch(selectTracker(tracker._id));
                                        setSidebarOpen(false);
                                        localStorage.setItem('selectedTrackerId', tracker._id);
                                    }}
                                    className={`w-full text-left px-3 py-2 rounded-md text-sm flex items-center gap-2 transition
                    ${selectedTrackerId === tracker.deviceId
                                            ? 'bg-blue-100 text-blue-700'
                                            : 'hover:bg-gray-100 text-gray-700'}
                  `}
                                >
                                    <Radio className="w-4 h-4" /> {tracker.vehicleType} ({tracker.deviceId})
                                </button>
                            ))}
                        </div>
                        <button className="mt-3 text-sm text-blue-600 hover:underline flex items-center gap-1">
                            <PlusCircle className="w-4 h-4" /> Add Device
                        </button>
                    </div>
                    <div>
                        <div className="text-xs text-gray-500 mb-1">Tracking</div>
                        <div className="space-y-2">
                            <button
                                onClick={() => { setTab('live'); setSidebarOpen(false); }}
                                className={`w-full text-left px-3 py-2 rounded-md text-sm flex items-center gap-2 transition
                  ${tab === 'live'
                                        ? 'bg-blue-100 text-blue-700'
                                        : 'hover:bg-gray-100 text-gray-700'}
                `}
                            >
                                <MapPin className="w-4 h-4" /> Live Location
                            </button>
                            <button
                                onClick={() => { setTab('history'); setSidebarOpen(false); }}
                                className={`w-full text-left px-3 py-2 rounded-md text-sm flex items-center gap-2 transition
                  ${tab === 'history'
                                        ? 'bg-blue-100 text-blue-700'
                                        : 'hover:bg-gray-100 text-gray-700'}
                `}
                            >
                                <History className="w-4 h-4" /> Location History
                            </button>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 bg-gray-50 p-4 sm:p-6">
                <div className="mb-4">
                    <h3 className="text-xl font-bold text-gray-800">
                        {tab === 'live' ? 'Live Location' : 'Location History'}
                    </h3>
                    <p className="text-sm text-gray-500">
                        Tracking: {selectedDevice?.tracker.vehicleType || '-'} ({selectedDevice?.tracker.deviceId || '-'})
                    </p>
                </div>
                <div className="w-full h-[50vh] sm:h-[60vh] rounded-xl bg-white shadow flex items-center justify-center">
                    <p className="text-gray-400 text-center px-4">
                        {tab === 'live'
                            ? 'Map with Live Location coming soon'
                            : 'Map with History Data coming soon'}
                    </p>
                </div>
            </main>
        </div>
    );
}
