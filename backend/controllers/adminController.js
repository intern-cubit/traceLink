// backend/controllers/adminController.js
import GpsTracker from "../models/GpsTracker.js";

export const getTrackers = async (req, res) => {
    try {
        const trackers = await GpsTracker.find();
        res.json(trackers);
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
};

export const createTracker = async (req, res) => {
    const { deviceId, activationKey } = req.body;
    try {
        const existing = await GpsTracker.findOne({ deviceId });
        if (existing)
            return res
                .status(400)
                .json({ message: "Tracker already exists for this Device ID" });

        const tracker = new GpsTracker({
            deviceId,
            activationKey,
        });
        await tracker.save();
        res.status(201).json(tracker);
    } catch (error) {
        console.error("Create Tracker error:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

export const updateTracker = async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;
    try {
        const tracker = await GpsTracker.findByIdAndUpdate(id, updateData, {
            new: true,
        });
        if (!tracker)
            return res.status(404).json({ message: "Tracker not found" });
        res.json(tracker);
    } catch (error) {
        console.error("Update Tracker error:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

export const deleteTracker = async (req, res) => {
    const { id } = req.params;
    try {
        const tracker = await GpsTracker.findByIdAndDelete(id);
        if (!tracker)
            return res.status(404).json({ message: "Tracker not found" });
        res.json({ message: "Tracker deleted successfully" });
    } catch (error) {
        console.error("Delete Tracker error:", error);
        res.status(500).json({ message: "Server Error" });
    }
};
