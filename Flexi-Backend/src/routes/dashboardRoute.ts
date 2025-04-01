import express from "express";
import {
  calculateProfit,
  sumOfAdsCost,
  sumOfBills,
} from "../controllers/dashboard/dashboardToTalController";
import authenticateToken from "../middleware/authMiddleware";
import {
  countOfBillsFacebook,
  sumOfAdsCostFacebook,
  sumOfBillsFacebook,
} from "../controllers/dashboard/dashboardFacebookController";
import {
  sumOfAdsCostTiktok,
  sumOfBillsTiktok,
  countOfBillsTiktok,
} from "../controllers/dashboard/dashboardTiktokController";
import {
  sumOfBillsLine,
  sumOfAdsCostLine,
  countOfBillsLine,
} from "../controllers/dashboard/dashboardLineController";
import {
  sumOfAdsCostShopee,
  sumOfBillsShopee,
  countOfBillsShopee,
} from "../controllers/dashboard/dashboardShopeeController";
import {
  sumOfAdsCostYoutube,
  sumOfBillsYoutube,
  countOfBillsYoutube,
} from "../controllers/dashboard/dashboardYoutubeController";
import {
  sumOfAdsCostGoogle,
  sumOfBillsGoogle,
  countOfBillsGoogle,
} from "../controllers/dashboard/dashboardGoogleController";

// Create express router
const router = express.Router();

//---------------------------Total-----------------------------
// Get Sum of Ads Cost by date and product
router.get("/sumOfAdsCost/:businessAcc", authenticateToken, sumOfAdsCost);
// Get Sum of Bills
router.get("/sumOfBill/:businessAcc", authenticateToken, sumOfBills);
// Calculate Profit
router.get("/calculateProfit/:businessAcc", authenticateToken, calculateProfit);

//---------------------------Facebook-----------------------------
// Get sum of Facebook Ads Cost
router.get(
  "/sumOfAdsCost/facebook/:businessAcc",
  authenticateToken,
  sumOfAdsCostFacebook
);

// Get sum of Facebook Bill
router.get(
  "/sumOfBill/facebook/:businessAcc",
  authenticateToken,
  sumOfBillsFacebook
);

// Count of Facebook Bills
router.get(
  "/count/facebook/:businessAcc",
  authenticateToken,
  countOfBillsFacebook
);
//-------------------------Tiktok-------------------------------
// Get sum of Tiktok Ads Cost
router.get(
  "/sumOfAdsCost/tiktok/:businessAcc",
  authenticateToken,
  sumOfAdsCostTiktok
);

// Get sum of Tiktok Bill
router.get(
  "/sumOfBill/tiktok/:businessAcc",
  authenticateToken,
  sumOfBillsTiktok
);

// Count of Tiktok Bills
router.get("/count/tiktok/:businessAcc", authenticateToken, countOfBillsTiktok);

//-------------------------Line-------------------------------
// Get sum of Line Ads Cost
router.get(
  "/sumOfAdsCost/line/:businessAcc",
  authenticateToken,
  sumOfAdsCostLine
);

// Get sum of Line Bill
router.get("/sumOfBill/line/:businessAcc", authenticateToken, sumOfBillsLine);

// Count of Line Bills
router.get("/count/line/:businessAcc", authenticateToken, countOfBillsLine);

//-------------------------Shopee-------------------------------
// Get sum of Shopee Ads Cost
router.get(
  "/sumOfAdsCost/shopee/:businessAcc",
  authenticateToken,
  sumOfAdsCostShopee
);
// Get sum of Shopee Bill
router.get(
  "/sumOfBill/shopee/:businessAcc",
  authenticateToken,
  sumOfBillsShopee
);

// Count of Shopee Bills
router.get("/count/shopee/:businessAcc", authenticateToken, countOfBillsShopee);

//-------------------------Youtube-------------------------------
// Get sum of Youtube Ads Cost
router.get(
  "/sumOfAdsCost/youtube/:businessAcc",
  authenticateToken,
  sumOfAdsCostYoutube
);
// Get sum of Youtube Bill
router.get(
  "/sumOfBill/youtube/:businessAcc",
  authenticateToken,
  sumOfBillsYoutube
);

// Count of Youtube Bills
router.get(
  "/count/youtube/:businessAcc",
  authenticateToken,
  countOfBillsYoutube
);

//-------------------------Google-------------------------------
// Get sum of Google Ads Cost
router.get(
  "/sumOfAdsCost/google/:businessAcc",
  authenticateToken,
  sumOfAdsCostGoogle
);
// Get sum of Google Bill
router.get(
  "/sumOfBill/google/:businessAcc",
  authenticateToken,
  sumOfBillsGoogle
);

// Count of Google Bills
router.get("/count/google/:businessAcc", authenticateToken, countOfBillsGoogle);

// ----------------------------------------------------------------

export default router;
