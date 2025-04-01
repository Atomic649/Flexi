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

 
  
} from "../controllers/businessAccController";
import authenticateToken from "../middleware/authMiddleware";

// Create express router
const router = express.Router();

// Create New Business Acc 
router.post("/register", createBusinessAcc);

// Add more New Business Acc 
router.post("/AddMoreAcc",AddMoreBusinessAcc);

// Getting all Business Accounts
router.get("/", authenticateToken, getBusinessAcc);

// Getting a Business Account by ID 
router.get("/userId/:userId", getBusinessAccByUserId);

// Getting a Business Detail by ID 
router.get("/detail/:memberId", getBusinessDetail);

// Updating a Business Account by ID
router.put("/:id", authenticateToken, updateBusinessAcc);

// Deleting a Business Account by ID 
router.delete("/:id", authenticateToken, deleteBusinessAcc);

// Searching Business Account by keyword 
router.get("/search/:keyword", authenticateToken, searchBusinessAcc);

// Update Business Avatar by id
 router.put("/avatar/:id", authenticateToken, updateBusinessAvatar);

 // get business Avatar by memberId
 router.get("/avatar/:memberId", getBusinessAvatar);

export default router;
