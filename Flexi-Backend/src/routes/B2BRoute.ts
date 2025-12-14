import express from "express";
import authenticateToken from "../middleware/authMiddleware";
import { cacheMiddleware, rateLimiter } from "../middleware/rateLimitAndCache";
import {
  getAllOffices,
  getAllCoaches,
  getAllBanks,
  getAllAgencies,
  getAllAccounts,
  getAllOrms,
  getProductDetailsById,
} from "../controllers/B2BController";

// Create express router
const router = express.Router();

const b2bLimiter = rateLimiter({ windowMs: 60_000, max: 60 });
const b2bCache = cacheMiddleware(30_000);

// Get all offices
router.get("/office", authenticateToken, b2bLimiter, b2bCache, getAllOffices);

// Get all coaches
router.get("/coach", authenticateToken, b2bLimiter, b2bCache, getAllCoaches);

// Get all banks
router.get("/bank", authenticateToken, b2bLimiter, b2bCache, getAllBanks);

// Get all agencies
router.get("/agency", authenticateToken, b2bLimiter, b2bCache, getAllAgencies);

// Get all accounts
router.get("/account", authenticateToken, b2bLimiter, b2bCache, getAllAccounts);

// Get all orms
router.get("/orm", authenticateToken, b2bLimiter, b2bCache, getAllOrms);

// Get product details by id
router.get("/product/:id", authenticateToken, getProductDetailsById);



// Export the router
export default router;
