// src/pages/DashboardPage.jsx
import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchUserTrackers } from "../thunks/trackerThunk";
import { logout } from "../features/authSlice";
import DeviceSwitcher from "../components/DeviceSwitcher";
import TrackerTabs from "../components/TrackerTabs";
import { io } from "socket.io-client";

export default function Dashboard2() {
    const dispatch = useDispatch();
    const user = useSelector((state) => state.auth.user);
    console.log(user)
    const { trackers, loading, error, selectedTrackerId } = useSelector((state) => state.tracker);
    const [activeTab, setActiveTab] = useState("live");

    useEffect(() => {
        dispatch(fetchUserTrackers());

        const socket = io(); // connects to the same-origin server
        socket.on("locationUpdate", (data) => {
            dispatch({ type: "tracker/updateTrackerLocation", payload: data });
        });

        return () => socket.disconnect();
    }, [dispatch]);

    const current = trackers.find(t => t.tracker.deviceId === selectedTrackerId);

    return (
        <div className="min-h-screen flex flex-col md:flex-row bg-gray-100">
            {/* Sidebar */}
            <aside className="hidden md:flex md:flex-col w-64 bg-white shadow-md">
                <div className="p-6 border-b text-center">
                    <h1 className="text-2xl font-bold text-blue-600">TrackMate</h1>
                </div>
                <nav className="flex-1 px-4 py-6 space-y-4">
                    <button
                        onClick={() => {
                            dispatch(logout());
                            window.location.href = "/login";
                        }}
                        className="text-red-600 hover:text-red-800 font-medium"
                    >
                        Logout
                    </button>
                    <DeviceSwitcher />
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-4 md:p-8">
                {/* Mobile Header */}
                <header className="flex items-center justify-between bg-white p-4 md:hidden shadow mb-4">
                    <h1 className="text-xl font-bold text-blue-600">TrackMate</h1>
                    <button
                        onClick={() => {
                            dispatch(logout());
                            window.location.href = "/login";
                        }}
                        className="text-red-600"
                    >
                        Logout
                    </button>
                </header>

                <h2 className="text-2xl font-semibold mb-4">
                    Welcome, {user?.username || "Explorer"}!
                </h2>

                {loading && <p>Loading trackers…</p>}
                {error && <p className="text-red-600">{error}</p>}

                {!loading && trackers.length > 0 && (
                    <>
                        <DeviceSwitcher />
                        <TrackerTabs activeTab={activeTab} onChange={setActiveTab} />

                        {current && (
                            <div className="mb-4">
                                <p><strong>Device:</strong> {current.tracker.deviceName}</p>
                                <p>
                                    <strong>Status:</strong>{" "}
                                    <span className={current.status === "online" ? "text-green-600" : "text-red-600"}>
                                        {current.status.toUpperCase()}
                                    </span>
                                </p>
                            </div>
                        )}

                        <div className="bg-white rounded-lg shadow h-96 flex items-center justify-center text-gray-400">
                            {activeTab === "live"
                                ? "🌐 Live map goes here…"
                                : "📜 Location history goes here…"}
                        </div>
                    </>
                )}

                {!loading && trackers.length === 0 && (
                    <p>No trackers assigned — click “+ Add Device” to begin.</p>
                )}
            </main>
        </div>
    );
}
