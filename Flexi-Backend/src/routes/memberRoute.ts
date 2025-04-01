import express from "express";
import {
  createMember,
  getMembers,
  getMemberIDByUserID,
  deleteMember,
  updateMember,
  searchMember,
} from "../controllers/memberController";

// Create express router
const router = express.Router();

//Creating a New Member
router.post("/create", createMember);

// Getting all Members
router.get("/", getMembers);

// Getting a Member by ID
router.get("/userId/:userId", getMemberIDByUserID);

// Deleting a Member by ID 
router.delete("/:uniqueId", deleteMember);

// Updating a Member by ID
router.put("/:uniqueId", updateMember);

// Searching Member by keyword 
router.get("/search/:keyword", searchMember);

export default router;
