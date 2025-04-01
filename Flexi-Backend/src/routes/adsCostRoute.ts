import express from "express";
import {
  getAdsCosts,
  getAdsCostsByDate,
  getAdsCostById,
  createManyAdsCosts,
  createAdsCost,
  updateAdsCost,
  deleteAdsCost,
  SearchAdsCostByDate,
  updateAdsDateById,
} from "../controllers/adsCostController";
import authenticateToken from "../middleware/authMiddleware";

// Create express router
const router = express.Router();

// Create a New Ads Cost 
router.post("/", authenticateToken, createAdsCost);

// Create Many Ads Costs
router.post("/many", authenticateToken, createManyAdsCosts);

// Getting all Ads Costs by Date
router.get("/date/:businessAcc",authenticateToken, getAdsCostsByDate);

// Getting all Ads Costs
router.get("/business/:businessAcc",authenticateToken, getAdsCosts);

// Getting a Ads Cost by ID 
router.get("/:id",authenticateToken,getAdsCostById);

// Updating a Ads Cost by ID 
router.put("/:id",authenticateToken, updateAdsCost);

// Updating Date by ID 
router.put("/date/:id",authenticateToken, updateAdsDateById);

// Delete a Ads Cost by ID 
router.delete("/:id", authenticateToken,deleteAdsCost);

// Searching Ads Cost by date 
router.get("/search/:date",authenticateToken, SearchAdsCostByDate);

export default router;
