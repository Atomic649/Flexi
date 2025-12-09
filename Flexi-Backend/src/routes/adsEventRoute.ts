import express from "express";
import authenticateToken from "../middleware/authMiddleware";
import { trackEvent } from "../controllers/adsEventController";

// Create express router
const router = express.Router();

router.post("/", authenticateToken, trackEvent);



// Export the router
export default router;