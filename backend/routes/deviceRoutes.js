// backend/routes/deviceRoutes.js
import { Router } from "express";
import { locationUpdate } from "../controllers/deviceController.js";

const router = Router();

// This endpoint is public since it is used by the device for location updates
router.post("/location", locationUpdate);

export default router;