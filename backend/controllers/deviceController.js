// backend/controllers/deviceController.js
import LatestLocation from "../models/LatestLocation.js";
import LocationHistory from "../models/LocationHistory.js";
import GpsTracker from "../models/GpsTracker.js";
import { io } from "../index.js";

export const locationUpdate = async (req, res) => {
    const { deviceId, latitude, longitude, date, time, main, battery } =
        req.body;

    try {
        const tracker = await GpsTracker.findOne({ deviceId });

        if (!tracker) {
            return res.status(400).json({ message: "Invalid Device ID" });
        }

        const trackerId = tracker._id;
        const userId = tracker.userId?.toString(); // ensure string type for room

        const [day, month, year] = date.split("-");
        const formattedTimestamp = new Date(`${year}-${month}-${day}T${time}`);

        // Upsert latest location
        await LatestLocation.findOneAndUpdate(
            { trackerId },
            {
                timestamp: formattedTimestamp,
                latitude,
                longitude,
                main,
                battery,
            },
            { upsert: true, new: true }
        );

        // Save to location history
        const locationRecord = new LocationHistory({
            trackerId,
            timestamp: formattedTimestamp,
            latitude,
            longitude,
            main,
            battery,
        });
        await locationRecord.save();

        // Emit ONLY to the owner of the device
        if (userId) {
            io.to(userId).emit("locationUpdate", {
                deviceId,
                latitude,
                longitude,
                timestamp: formattedTimestamp,
                main,
                battery,
            });
        }

        res.json({ message: "Location updated successfully" });
    } catch (error) {
        console.error("Device Location Update error:", error);
        res.status(500).json({ message: "Server Error" });
    }
};