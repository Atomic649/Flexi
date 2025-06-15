import express from "express";
import authenticateToken from "../middleware/authMiddleware";
import {
  getAllOffices,
  getAllCoaches,
  getAllBanks,
  getAllAgencies,
  getAllAccounts,
  getAllOrms
} from "../controllers/B2BController";

// Create express router
const router = express.Router();

// Get all offices
router.get("/office", authenticateToken, getAllOffices);

// Get all coaches
router.get("/coach", authenticateToken, getAllCoaches);

// Get all banks
router.get("/bank", authenticateToken, getAllBanks);

// Get all agencies
router.get("/agency", authenticateToken, getAllAgencies);

// Get all accounts
router.get("/account", authenticateToken, getAllAccounts);

// Get all orms
router.get("/orm", authenticateToken, getAllOrms);



// Export the router
export default router;
