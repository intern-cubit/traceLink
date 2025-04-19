const endpoint = "https://tracelink.onrender.com/api/device/location";
const deviceId = "1234567890"; // change if needed

// Utility: generate random float in given range
function randomInRange(min, max) {
    return +(Math.random() * (max - min) + min).toFixed(6);
}

// Utility: format date as DD-MM-YYYY
function formatDate(date) {
    const dd = String(date.getDate()).padStart(2, "0");
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const yyyy = date.getFullYear();
    return `${dd}-${mm}-${yyyy}`;
}

// Utility: format time as HH:MM:SS
function formatTime(date) {
    return date.toTimeString().split(" ")[0];
}

// Send one payload
async function sendLocation() {
    const now = new Date();
    const payload = {
        deviceId,
        latitude: randomInRange(15.0, 16.0),
        longitude: randomInRange(77.0, 78.0),
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
            console.error("Server responded with status", response.status);
            return;
        }

        const data = await response.json();
        console.log("Response:", data);
    } catch (err) {
        console.error("Error sending location:", err);
    }
}

// Initial send
sendLocation();
// Continue every 5 seconds
setInterval(sendLocation, 5000);
