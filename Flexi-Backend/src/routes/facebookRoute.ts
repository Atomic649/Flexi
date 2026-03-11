import express from "express";
import authenticateToken from "../middleware/authMiddleware";
import { getFacebookDailySpend, getFacebookDailySpendRange, getFacebookCampaignDailySpend, getFacebookAdAccounts, getFacebookCampaigns, getFacebookAdSets, getFacebookAds, runFacebookAdsCostIngestion, facebookAdsCostCronJob, saveFacebookToken, exchangeFacebookToken, getFacebookStatus, facebookLogout, facebookAuthInit, facebookAuthCallback, saveFacebookTokenFromFragment, facebookFragmentCallback } from "../controllers/faceBookControllor";

const router = express.Router();

router.get("/daily-spend", authenticateToken, getFacebookDailySpend);
router.get("/daily-spend/range", authenticateToken, getFacebookDailySpendRange);
router.get("/daily-spend/campaign", authenticateToken, getFacebookCampaignDailySpend);
router.post("/daily-spend/ingest", authenticateToken, runFacebookAdsCostIngestion);
router.get("/ad-accounts", authenticateToken, getFacebookAdAccounts);
router.get("/campaigns", authenticateToken, getFacebookCampaigns);
router.get("/adsets", authenticateToken, getFacebookAdSets);
router.get("/ads", authenticateToken, getFacebookAds);

// Mobile OAuth flow — PUBLIC (no auth, Facebook redirects here)
router.get("/auth", facebookAuthInit);
router.get("/callback", facebookAuthCallback);
// Bridge page navigates here with token in query; server saves to DB and HTTP 302 redirects to app
router.get("/fragment-callback", facebookFragmentCallback);
// Called by the OAuth bridge page to save the token from the URL fragment to DB
router.post("/fragment-token", saveFacebookTokenFromFragment);

// Exchange short-lived token for long-lived token (server-side)
router.post("/exchange", authenticateToken, exchangeFacebookToken);

// Save Facebook access token for a member
router.post("/token", authenticateToken, saveFacebookToken);

// Get login status from DB (true/false)
router.get("/status", authenticateToken, getFacebookStatus);

// Set login=false in DB (logout)
router.post("/logout", authenticateToken, facebookLogout);

// Schedule daily ads cost ingestion at 00:09
facebookAdsCostCronJob.start();

export default router;
