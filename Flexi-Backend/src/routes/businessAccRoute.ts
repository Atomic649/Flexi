import express from "express";
import {
  createBusinessAcc,
  getBusinessAcc,
  getBusinessAccByUserId,
  updateBusinessAcc,
  deleteBusinessAcc,
  searchBusinessAcc,
  getBusinessDetail,
  AddMoreBusinessAcc,
  updateBusinessAvatar,
  getBusinessAvatar,
  updateBusinessLogo,
  addPartnerMember,
  updateBusinessDefaults,
} from "../controllers/businessAccController";
import authenticateToken from "../middleware/authMiddleware";

// Create express router
const router = express.Router();

// Specific routes first (must come before /:id routes)
// Create New Business Acc 
router.post("/register", createBusinessAcc);

// Add more New Business Acc 
router.post("/AddMoreAcc", AddMoreBusinessAcc);

// Add Partner Member to Business Account
router.post("/:businessId/add-partner-member", addPartnerMember);

// Update Business Avatar by id
router.put("/avatar/:id", authenticateToken, updateBusinessAvatar);

// Update Business Logo by memberId
router.put("/logo/:memberId", authenticateToken, updateBusinessLogo);

// Update default paymentTerm and remark
router.put("/document-defaults/:memberId", authenticateToken, updateBusinessDefaults);

// Get routes
router.get("/", authenticateToken, getBusinessAcc);

// Getting a Business Account by ID 
router.get("/userId/:userId", getBusinessAccByUserId);

// Getting a Business Detail by ID 
router.get("/detail/:memberId", getBusinessDetail);

// get business Avatar by memberId
router.get("/avatar/:memberId", getBusinessAvatar);

// Searching Business Account by keyword 
router.get("/search/:keyword", authenticateToken, searchBusinessAcc);

// Generic routes last (catch-all patterns)
// Updating a Business Account by ID
router.put("/:memberId", authenticateToken, updateBusinessAcc);

// Deleting a Business Account by ID 
router.delete("/:id", authenticateToken, deleteBusinessAcc);

export default router;
