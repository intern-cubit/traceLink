// backend/models/GpsTracker.js
import mongoose from "mongoose";

const gpsTrackerSchema = new mongoose.Schema(
    {
        deviceId: { 
            type: String, 
            required: true, 
            unique: true 
        }, // IMEI
        deviceName: { 
            type: String, 
        }, // Device name
        activationKey: { 
            type: String, 
            required: true 
        },
        userId: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: "User" 
        }, // assigned user
        vehicleType: {
            type: String,
            enum: ["car", "bus", "truck", "scooty", "bike"],
            default: "car",
        },
    },
    { timestamps: true }
);

export default mongoose.model("GpsTracker", gpsTrackerSchema);