import express from "express";
import {
  createMember,
  getMembers,
  getMemberIDByUserID,
  deleteMember,
  updateMember,
  searchMember,
  getMembersByBusinessId,
  inviteMemberByUsername,
  softDeleteMember
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

// Get members by businessId
router.get("/business/:businessId", getMembersByBusinessId);

// Invite member by username
router.post("/invite", inviteMemberByUsername);

//softDeleteMember
router.delete("/soft/:uniqueId", softDeleteMember);
export default router;
