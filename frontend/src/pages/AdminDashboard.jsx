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
        try {
            const res = await fetch(`${baseURL}/get-trackers`, {
                headers: {
                    "Content-Type": "application/json",
                    authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });
            const data = await res.json();
            if (res.ok) setTrackers(data);
            else throw new Error(data.message);
        } catch (err) {
            toast.error(err.message || "Failed to fetch trackers");
        }
    };

    useEffect(() => { fetchTrackers(); }, []);

    const handleAddDevice = async () => {
        if (!/^\d{15}$/.test(imei)) {
            toast.error("IMEI must be 15 digits");
            return;
        }

        const key = generateActivationKey(
            imei,
            new Set(trackers.map((t) => t.activationKey))
        );
        if (!key) {
            toast.error("Failed to generate activation key");
            return;
        }

        try {
            const res = await fetch(`${baseURL}/gps-trackers`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify({ deviceId: imei, activationKey: key }),
            });
            if (!res.ok) throw new Error();
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
            const res = await fetch(`${baseURL}/gps-trackers/${deleteId}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });
            if (!res.ok) throw new Error();
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

        const key = generateActivationKey(
            editImei,
            new Set(
                trackers
                    .map((t) => t.activationKey)
                    .filter((k) => k !== editTracker.activationKey)
            )
        );
        if (!key) {
            toast.error("Failed to regenerate activation key");
            return;
        }

        try {
            const res = await fetch(`${baseURL}/gps-trackers/${editTracker._id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify({ deviceId: editImei, activationKey: key }),
            });
            if (!res.ok) throw new Error();
            toast.success("Tracker updated");
            setShowEditModal(false);
            setEditTracker(null);
            fetchTrackers();
        } catch {
            toast.error("Failed to update tracker");
        }
    };

    return (
        <div className="bg-black text-white min-h-screen">
            <div className="max-w-4xl mx-auto p-6 space-y-6">
                <div className="flex justify-between items-center">
                    <h2 className="text-3xl font-bold" style={{ color: '#D4AF37' }}>
                        Admin Dashboard
                    </h2>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="flex items-center px-4 py-2 rounded-md border border-white bg-transparent hover:bg-white hover:bg-opacity-10 transition duration-200 font-medium"
                    >
                        <Plus className="mr-2" style={{ color: '#D4AF37' }} />
                        <span style={{ color: '#D4AF37' }}>Add Device</span>
                    </button>
                </div>

                <div className="border-t border-gray-700 pt-6">
                    <h3 className="text-xl font-semibold mb-6" style={{ color: '#D4AF37' }}>
                        Registered Devices
                    </h3>
                    {trackers.length === 0 ? (
                        <p className="text-gray-400">No trackers found.</p>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                            {trackers.map((t) => (
                                <div
                                    key={t._id}
                                    className="bg-gray-900 border border-gray-700 rounded-xl p-5 flex flex-col justify-between"
                                >
                                    <div className="space-y-2">
                                        <h4 className="text-lg font-semibold text-white">
                                            {t.vehicleType || "Unknown Vehicle"}
                                        </h4>
                                        <p className="text-sm">
                                            <span className="font-medium">Device ID:</span> {t.deviceId}
                                        </p>
                                        <p className="text-sm font-mono break-all text-gray-300">
                                            {t.activationKey}
                                        </p>
                                    </div>
                                    <div className="flex justify-end mt-4 space-x-3">
                                        <Pencil
                                            className="cursor-pointer transition-colors"
                                            onClick={() => handleEditClick(t)}
                                            size={18}
                                            style={{ color: '#D4AF37' }}
                                        />
                                        <Trash2
                                            className="cursor-pointer transition-opacity hover:opacity-80"
                                            onClick={() => {
                                                setDeleteId(t._id);
                                                setShowDeleteModal(true);
                                            }}
                                            size={18}
                                            style={{ color: 'white' }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Modals (Add, Delete, Edit) use consistent subdued background with gold accent on headings */}
                {showAddModal && (
                    <Modal title="Add New Device" onClose={() => setShowAddModal(false)}>
                        <DeviceForm
                            imei={imei}
                            onChange={setImei}
                            onCancel={() => { setShowAddModal(false); setImei(''); }}
                            onSubmit={handleAddDevice}
                        />
                    </Modal>
                )}
                {showDeleteModal && (
                    <Modal title="Confirm Delete" onClose={() => setShowDeleteModal(false)}>
                        <p className="text-gray-400 mb-4">Are you sure you want to delete this device?</p>
                        <div className="flex justify-end space-x-3">
                            <button
                                className="px-4 py-2 rounded-md border border-gray-600 text-gray-400 hover:bg-gray-800 transition"
                                onClick={() => setShowDeleteModal(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className="px-5 py-2 rounded-md border border-red-600 text-red-600 hover:bg-red-700 hover:text-white transition font-medium"
                                onClick={confirmDelete}
                            >
                                Delete
                            </button>
                        </div>
                    </Modal>
                )}
                {showEditModal && (
                    <Modal title="Edit Device" onClose={() => { setShowEditModal(false); setEditTracker(null); }}>
                        <DeviceForm
                            imei={editImei}
                            onChange={setEditImei}
                            onCancel={() => { setShowEditModal(false); setEditTracker(null); }}
                            onSubmit={handleUpdateDevice}
                        />
                    </Modal>
                )}
            </div>
        </div>
    );
};

// Reusable Modal and Form components
const Modal = ({ title, children, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
        <div className="bg-gray-900 p-6 rounded-xl w-96 shadow-lg border border-gray-700">
            <h3 className="text-xl font-bold mb-4" style={{ color: '#D4AF37' }}>{title}</h3>
            {children}
        </div>
    </div>
);

const DeviceForm = ({ imei, onChange, onCancel, onSubmit }) => (
    <>
        <input
            type="text"
            value={imei}
            onChange={(e) => onChange(e.target.value)}
            placeholder="15-digit IMEI"
            className="w-full px-4 py-3 rounded-md border border-gray-600 bg-gray-800 text-white focus:ring-2 focus:ring-white focus:outline-none mb-4"
        />
        <div className="flex justify-end space-x-3">
            <button
                className="px-4 py-2 rounded-md border border-gray-600 text-gray-400 hover:bg-gray-800 transition"
                onClick={onCancel}
            >
                Cancel
            </button>
            <button
                className="px-5 py-2 rounded-md border border-white text-white hover:bg-white hover:text-black transition font-medium"
                onClick={onSubmit}
            >
                Submit
            </button>
        </div>
    </>
);

export default AdminDashboard;
