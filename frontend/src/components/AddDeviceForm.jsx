import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AddDeviceForm() {
    const [form, setForm] = useState({
        deviceId: "",
        activationKey: "",
        vehicleType: "",
    });
    const [message, setMessage] = useState("");
    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage("");

        try {
            const response = await fetch(`${BACKEND_URL}/api/user/assign-tracker`, {
                method: "POST",
                headers: { 
                    authorization: `Bearer ${localStorage.getItem("token")}`,
                    "Content-Type": "application/json"
                 },
                body: JSON.stringify(form),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to assign device.");
            }

            setMessage("🎉 Device successfully assigned!");
            navigate("/dashboard")
        } catch (err) {
            setMessage(`❌ ${err.message}`);
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg space-y-6"
        >
            <h2 className="text-2xl font-bold text-center text-gray-800">Add a New Device</h2>
            {message && <div className="text-center text-sm text-red-600">{message}</div>}

            <div>
                <label className="block mb-1 font-medium text-sm text-gray-700">
                    Device ID
                </label>
                <input
                    name="deviceId"
                    value={form.deviceId}
                    onChange={handleChange}
                    placeholder="1234567890"
                    required
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>

            <div>
                <label className="block mb-1 font-medium text-sm text-gray-700">
                    Activation Key
                </label>
                <input
                    name="activationKey"
                    value={form.activationKey}
                    onChange={handleChange}
                    placeholder="72F7-36C1-A831"
                    required
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>

            <div>
                <label className="block mb-1 font-medium text-sm text-gray-700">
                    Vehicle Type
                </label>
                <input
                    name="vehicleType"
                    value={form.vehicleType}
                    onChange={handleChange}
                    placeholder="Bike, Car, UFO..."
                    required
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>

            <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-300"
            >
                Assign Tracker
            </button>
        </form>
    );
}
