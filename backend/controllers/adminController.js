// backend/controllers/adminController.js
import GpsTracker from "../models/GpsTracker.js";
import { v4 as uuidv4 } from "uuid";

const generateActivationKey = () => {
    const segments = [];
    for (let i = 0; i < 3; i++) {
        segments.push(uuidv4().replace(/-/g, "").substr(0, 4).toUpperCase());
    }
    return segments.join("-");
};

export const createTracker = async (req, res) => {
    const { deviceId, vehicleType } = req.body;
    try {
        const existing = await GpsTracker.findOne({ deviceId });
        if (existing)
            return res
                .status(400)
                .json({ message: "Tracker already exists for this Device ID" });

        const activationKey = generateActivationKey();
        const tracker = new GpsTracker({
            deviceId,
            activationKey,
            vehicleType,
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