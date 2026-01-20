import express from "express";
import authenticateToken from "../middleware/authMiddleware";
import { getFacebookDailySpend, getFacebookDailySpendRange, getFacebookCampaignDailySpend, getFacebookAdAccounts, getFacebookCampaigns, getFacebookAdSets, getFacebookAds, runFacebookAdsCostIngestion, facebookAdsCostCronJob, saveFacebookToken } from "../controllers/faceBookControllor";

const router = express.Router();

router.get("/daily-spend", authenticateToken, getFacebookDailySpend);
router.get("/daily-spend/range", authenticateToken, getFacebookDailySpendRange);
router.get("/daily-spend/campaign", authenticateToken, getFacebookCampaignDailySpend);
router.post("/daily-spend/ingest", authenticateToken, runFacebookAdsCostIngestion);
router.get("/ad-accounts", authenticateToken, getFacebookAdAccounts);
router.get("/campaigns", authenticateToken, getFacebookCampaigns);
router.get("/adsets", authenticateToken, getFacebookAdSets);
router.get("/ads", authenticateToken, getFacebookAds);

// Save Facebook access token for a member
router.post("/token", authenticateToken, saveFacebookToken);

// Schedule daily ads cost ingestion at 00:09
facebookAdsCostCronJob.start();

export default router;
