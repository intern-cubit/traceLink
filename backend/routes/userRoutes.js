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

router.post("/assign-tracker",authMiddleware, assignTracker);
router.get("/trackers",assignTracker, getUserTrackers);
router.get("/trackers/:id/live", getLiveLocation);
router.get("/trackers/:id/history", getHistory);

export default router;
