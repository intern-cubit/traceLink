// backend/routes/adminRoutes.js
import { Router } from "express";
import {
    createTracker,
    updateTracker,
    deleteTracker,
    getTrackers,
} from "../controllers/adminController.js";

const router = Router();

// In production, add authentication/authorization for admin routes
router.get("/get-trackers", getTrackers );
router.post("/gps-trackers", createTracker);
router.put("/gps-trackers/:id", updateTracker);
router.delete("/gps-trackers/:id", deleteTracker);

export default router;