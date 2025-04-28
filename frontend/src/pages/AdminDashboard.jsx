import React, { useEffect, useState } from "react";
import { Trash2, Plus, Pencil } from "lucide-react";
import toast from "react-hot-toast";

const generateActivationKey = (imei, existingKeys = new Set()) => {
    if (!/^\d{15}$/.test(imei)) return null;

    const base36Hash = (input) => {
        let hash = 0;
        for (let i = 0; i < input.length; i++) {
            hash = (hash * 33 + input.charCodeAt(i)) >>> 0;
        }
        return hash.toString(36).toUpperCase();
    };

    const randomAlphanumeric = (length) => {
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        let result = "";
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    };

    const formatWithDashes = (input) => input.match(/.{1,4}/g).join("-");

    let attempts = 0;
    let key;
    do {
        const part1 = base36Hash(imei).padStart(8, "0").slice(0, 8);
        const part2 = randomAlphanumeric(8);
        const rawKey = (part1 + part2).slice(0, 16);
        key = formatWithDashes(rawKey);
        attempts++;
        if (attempts > 10) return null;
    } while (existingKeys.has(key));

    return key;
};

const AdminDashboard = () => {
    const [trackers, setTrackers] = useState([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);

    const [imei, setImei] = useState("");
    const [editImei, setEditImei] = useState("");
    const [deleteId, setDeleteId] = useState(null);
    const [editTracker, setEditTracker] = useState(null);

    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
    const baseURL = `${BACKEND_URL}/api/admin`;

    const fetchTrackers = async () => {
        const response = await fetch(`${baseURL}/get-trackers`, {
            headers: {
                "Content-Type": "application/json",
                authorization: `Bearer ${localStorage.getItem("token")}`,
            },
        });
        const data = await response.json();
        if (response.ok) setTrackers(data);
        else toast.error(data.message || "Failed to fetch trackers");
    };

    useEffect(() => {
        fetchTrackers();
    }, []);

    const handleAddDevice = async () => {
        if (!/^\d{15}$/.test(imei)) {
            toast.error("IMEI must be 15 digits");
            return;
        }

        const key = generateActivationKey(imei, new Set(trackers.map(t => t.activationKey)));
        if (!key) {
            toast.error("Failed to generate activation key");
            return;
        }

        try {
            const response = await fetch(`${baseURL}/gps-trackers`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify({ deviceId: imei, activationKey: key }),
            });
            if (!response.ok) throw new Error();
            toast.success("Tracker added");
            setShowAddModal(false);
            setImei("");
            fetchTrackers();
        } catch {
            toast.error("Failed to add tracker");
        }
    };

    const confirmDelete = async () => {
        try {
            const response = await fetch(`${baseURL}/gps-trackers/${deleteId}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });
            if (!response.ok) throw new Error();
            toast.success("Tracker deleted");
            setTrackers((prev) => prev.filter((t) => t._id !== deleteId));
            setShowDeleteModal(false);
        } catch {
            toast.error("Failed to delete tracker");
        }
    };

    const handleEditClick = (tracker) => {
        setEditTracker(tracker);
        setEditImei(tracker.deviceId);
        setShowEditModal(true);
    };

    const handleUpdateDevice = async () => {
        if (!/^\d{15}$/.test(editImei)) {
            toast.error("IMEI must be 15 digits");
            return;
        }

        const key = generateActivationKey(editImei, new Set(trackers.map(t => t.activationKey).filter(k => k !== editTracker.activationKey)));
        if (!key) {
            toast.error("Failed to regenerate activation key");
            return;
        }

        try {
            const response = await fetch(`${baseURL}/gps-trackers/${editTracker._id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify({ deviceId: editImei, activationKey: key }),
            });
            if (!response.ok) throw new Error();
            toast.success("Tracker updated");
            setShowEditModal(false);
            setEditTracker(null);
            fetchTrackers();
        } catch {
            toast.error("Failed to update tracker");
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Admin Dashboard</h2>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                    <Plus className="mr-2" /> Add Device
                </button>
            </div>

            <div className="border-t pt-6">
                <h3 className="text-xl font-semibold mb-4">Registered Devices</h3>
                {trackers.length === 0 ? (
                    <p className="text-gray-600">No trackers found.</p>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {trackers.map((t) => (
                            <div
                                key={t._id}
                                className="bg-white shadow-md rounded-xl p-4 border flex flex-col justify-between"
                            >
                                <div className="space-y-1">
                                    <h4 className="text-md font-semibold text-gray-800">
                                        {t.vehicleType || "Unknown Vehicle"}
                                    </h4>
                                    <p className="text-sm text-gray-600">
                                        <span className="font-medium">Device ID:</span> {t.deviceId}
                                    </p>
                                    <p className="text-sm text-gray-500 font-mono break-all">
                                        {t.activationKey}
                                    </p>
                                </div>
                                <div className="flex justify-end mt-4 space-x-2">
                                    <Pencil
                                        className="text-blue-600 cursor-pointer hover:text-blue-800 transition"
                                        onClick={() => handleEditClick(t)}
                                    />
                                    <Trash2
                                        className="text-red-600 cursor-pointer hover:text-red-800 transition"
                                        onClick={() => {
                                            setDeleteId(t._id);
                                            setShowDeleteModal(true);
                                        }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Add Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-xl w-96 space-y-4 shadow-lg">
                        <h3 className="text-lg font-bold">Add New Device</h3>
                        <input
                            type="text"
                            value={imei}
                            onChange={(e) => setImei(e.target.value)}
                            placeholder="15-digit IMEI"
                            className="border px-3 py-2 rounded w-full"
                        />
                        <div className="flex justify-end space-x-2">
                            <button
                                className="bg-gray-300 px-4 py-2 rounded"
                                onClick={() => {
                                    setShowAddModal(false);
                                    setImei("");
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                                onClick={handleAddDevice}
                            >
                                Submit
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-xl w-80 space-y-4 shadow-lg">
                        <h3 className="text-lg font-bold text-red-600">Confirm Delete</h3>
                        <p>Are you sure you want to delete this device?</p>
                        <div className="flex justify-end space-x-2">
                            <button
                                className="bg-gray-300 px-4 py-2 rounded"
                                onClick={() => setShowDeleteModal(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                                onClick={confirmDelete}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {showEditModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-xl w-96 space-y-4 shadow-lg">
                        <h3 className="text-lg font-bold">Edit Device</h3>
                        <input
                            type="text"
                            value={editImei}
                            onChange={(e) => setEditImei(e.target.value)}
                            placeholder="15-digit IMEI"
                            className="border px-3 py-2 rounded w-full"
                        />
                        <div className="flex justify-end space-x-2">
                            <button
                                className="bg-gray-300 px-4 py-2 rounded"
                                onClick={() => {
                                    setShowEditModal(false);
                                    setEditTracker(null);
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                                onClick={handleUpdateDevice}
                            >
                                Update
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
