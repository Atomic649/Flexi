import express from "express";
import authenticateToken from "../middleware/authMiddleware";
import { trackEvent,dailyKpiAggregationJob,runDailyKpiNow } from "../controllers/adsEventController";

// Create express router
const router = express.Router();

router.post("/", authenticateToken, trackEvent);

router.get("/daily-kpi/aggregate", authenticateToken, runDailyKpiNow); // temporary dev/test route

// Schedule the daily KPI aggregation job to run at midnight every day
dailyKpiAggregationJob.start();





// Export the router
export default router;