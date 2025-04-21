// backend/routes/userRoutes.js
import { Router } from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
    assignTracker,
    getUserTrackers,
    getLiveLocation,
    getHistory,
} from "../controllers/userController.js";

const router = Router();

router.use(authMiddleware);

router.post("/trackers/:id/history", getHistory);
router.get("/trackers/:id/live", authMiddleware, getLiveLocation);
router.post("/assign-tracker", authMiddleware, assignTracker);
router.get("/trackers", authMiddleware, getUserTrackers);

export default router;
