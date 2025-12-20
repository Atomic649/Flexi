import express from "express";
import authenticateToken from "../middleware/authMiddleware";
import { getFacebookDailySpend, getFacebookDailySpendRange, getFacebookCampaignDailySpend, getFacebookAdAccounts, getFacebookCampaigns, getFacebookAdSets, getFacebookAds } from "../controllers/faceBookControllor";

const router = express.Router();

router.get("/daily-spend", authenticateToken, getFacebookDailySpend);
router.get("/daily-spend/range", authenticateToken, getFacebookDailySpendRange);
router.get("/daily-spend/campaign", authenticateToken, getFacebookCampaignDailySpend);
router.get("/ad-accounts", authenticateToken, getFacebookAdAccounts);
router.get("/campaigns", authenticateToken, getFacebookCampaigns);
router.get("/adsets", authenticateToken, getFacebookAdSets);
router.get("/ads", authenticateToken, getFacebookAds);

export default router;
