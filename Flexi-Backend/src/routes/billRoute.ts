import express from "express";
import {
  createBill,
  getBills,
  getBillById,
  deleteBill,
  updateBill,
  searchBill,
  updateCashStatusById,
} from "../controllers/billController";
import authenticateToken from "../middleware/authMiddleware";

// Create express router
const router = express.Router();

//creating a New Bill*
router.post("/", authenticateToken, createBill);

// Get all Bills by Business ID
router.get("/member/:memberId", authenticateToken, getBills);

// Get a Bill by ID
router.get("/:id", authenticateToken, getBillById);

// Deleting a Bill by ID*
router.delete("/:id", authenticateToken, deleteBill);

// Updating a Bill by ID*
router.put("/:id", authenticateToken, updateBill);

// Searching Bill by keyword
router.get("/:keyword", authenticateToken, searchBill);

// Update Cash Status
router.put("/cash/:id", authenticateToken, updateCashStatusById);

export default router;
