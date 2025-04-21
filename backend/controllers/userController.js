// backend/controllers/userController.js
import GpsTracker from "../models/GpsTracker.js";
import LatestLocation from "../models/LatestLocation.js";
import LocationHistory from "../models/LocationHistory.js";
import User from "../models/User.js";

// Assign a tracker to a user based on deviceId and activationKey
export const assignTracker = async (req, res) => {
    const { deviceId, activationKey, vehicleType } = req.body;
    const userId = req.user.id;
    try {
        const tracker = await GpsTracker.findOne({ deviceId, activationKey });
        if (!tracker)
            return res
                .status(400)
                .json({ message: "Invalid Device ID or Activation Key" });

        // Associate user if not already assigned
        if (!tracker.userId) {
            tracker.userId = userId;
            // Optionally update vehicle type if provided
            if (vehicleType) tracker.vehicleType = vehicleType;
            await tracker.save();

            // Also update user's tracker list
            await User.findByIdAndUpdate(userId, {
                $push: { trackers: tracker._id },
            });
        }
        res.json({ message: "Tracker assigned successfully", tracker });
    } catch (error) {
        console.error("Assign Tracker error:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

// Get all trackers for the user, including live location and online/offline status
export const getUserTrackers = async (req, res) => {
    const userId = req.user.id;
    try {
        const trackers = await GpsTracker.find({ userId });
        const trackersWithStatus = await Promise.all(
            trackers.map(async (tracker) => {
                const latest = await LatestLocation.findOne({
                    trackerId: tracker._id,
                });
                let status = "offline";
                if (latest) {
                    const diff =
                        Date.now() - new Date(latest.timestamp).getTime();
                    status = diff <= 60000 ? "online" : "offline";
                }
                return { tracker, latest, status };
            })
        );
        res.json(trackersWithStatus);
    } catch (error) {
        console.error("Get Trackers error:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

// Get live location for a specific tracker
export const getLiveLocation = async (req, res) => {
    const { id } = req.params;
    try {
        const latest = await LatestLocation.findOne({ trackerId: id });
        if (!latest)
            return res
                .status(404)
                .json({ message: "No live data for this tracker" });
        const diff = Date.now() - new Date(latest.timestamp).getTime();
        const status = diff <= 60000 ? "online" : "offline";
        res.json({ latest, status });
    } catch (error) {
        console.error("Live Location error:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

// Get historical data for playback (with optional time range)
export const getHistory = async (req, res) => {
    console.log("History Playback request:", req.body);
    const { id } = req.params;
    const { from, to } = req.body;
    const filter = { trackerId: id };
    console.log("History filter:", filter);
    console.log("From:", from, "To:", to);

    if (from || to) {
        filter.timestamp = {};
        if (from) filter.timestamp.$gte = new Date(from);
        if (to) filter.timestamp.$lte = new Date(to);
    }
    try {
        const history = await LocationHistory.find(filter).sort({
            timestamp: 1,
        });
        console.log(history);
        res.json(history);
    } catch (error) {
        console.error("History Playback error:", error);
        res.status(500).json({ message: "Server Error" });
    }
};
