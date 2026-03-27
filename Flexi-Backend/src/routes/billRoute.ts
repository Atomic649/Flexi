import express from "express";
import {
  createBill,
  getBills,
  getBillById,
  deleteBill,
  updateBill,
  searchBill,
  getthisYearSales,
  updateCashStatusById,
  updateDocumentTypeById,
  lookupBillByFlexiId,
  getBillByFlexiId,
  createSplitChildren,
  resetParentSplit,
} from "../controllers/billController";
import authenticateToken from "../middleware/authMiddleware";

// Create express router
const router = express.Router();

// Lookup bill by flexiId (no auth — used for B2B expense auto-fill)
router.get("/lookup/:flexiId", lookupBillByFlexiId);

// Get full bill data by flexiId — authenticated, used for PDF rendering from expense detail
router.get("/flexi/:flexiId", authenticateToken, getBillByFlexiId);

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

// Update Document Type
router.put("/document-type/:id", authenticateToken, updateDocumentTypeById);

// Get Yearly Sales
router.get("/yearly/sales", authenticateToken, getthisYearSales);

// Create split children from a parent Invoice bill
router.post("/split/:parentId", authenticateToken, createSplitChildren);

// Reset split parent back to Quotation (deletes all children)
router.delete("/split/:parentId", authenticateToken, resetParentSplit);

export default router;
