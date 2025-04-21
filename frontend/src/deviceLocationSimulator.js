import fetch from "node-fetch";

// Simulated base location (e.g., Bengaluru)
const baseLatitude = 12.9716;
const baseLongitude = 77.5946;

const BACKEND_URL = process.env.VITE_BACKEND_URL || "http://localhost:5000";
const endpoint = `${BACKEND_URL}/api/device/location`;
const deviceId = "1234567890"; // change if needed

function randomOffset() {
    return +(Math.random() * 0.40004 - 0.20002).toFixed(6); // ±0.20002
}

function formatDate(date) {
    const dd = String(date.getDate()).padStart(2, "0");
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const yyyy = date.getFullYear();
    return `${dd}-${mm}-${yyyy}`;
}

function formatTime(date) {
    return date.toTimeString().split(" ")[0];
}

async function sendLocation() {
    const now = new Date();

    const payload = {
        deviceId,
        latitude: +(baseLatitude + randomOffset()).toFixed(6),
        longitude: +(baseLongitude + randomOffset()).toFixed(6),
        date: formatDate(now),
        time: formatTime(now),
        main: 1,
        battery: Math.floor(Math.random() * 101), // 0 to 100%
    };

    try {
        const response = await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            console.error("Server responded with status:", response.status);
            return;
        }

        const data = await response.json();
    } catch (err) {
        console.error("Error sending location:", err);
    }
}

sendLocation();
setInterval(sendLocation, 5000);
