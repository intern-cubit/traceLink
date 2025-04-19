// backend/models/User.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        username: { 
            type: String, 
            required: true, 
            unique: true 
        },
        fullName: { 
            type: String 
        },
        email: { 
            type: String, 
            required: true, 
            unique: true 
        },
        passwordHash: { 
            type: String, 
            required: true 
        },
        // Array of trackers the user has assigned
        trackers: [{ 
            type: mongoose.Schema.Types.ObjectId, 
            ref: "GpsTracker" 
        }],
    },
    { timestamps: true }
);

export default mongoose.model("User", userSchema);
