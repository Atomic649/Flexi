import express from "express";
import {
  getPlatforms,
  getPlatformById,
  createPlatform,
  updatePlatform,
  deletePlatform,
  searchPlatform,
} from "../controllers/platformController";
import authenticateToken from "../middleware/authMiddleware";
// Create express router
const router = express.Router();

// Creating a New Platform 
router.post("/", authenticateToken, createPlatform);

// Getting all Platforms 
router.get("/member/:memberId", authenticateToken, getPlatforms);

// Getting a Platform by ID 
router.get("/:id", authenticateToken, getPlatformById);

// Deleting a Platform by ID 
router.post("/delete/:id", authenticateToken, deletePlatform);

// Updating a Platform by ID
router.put("/:id", authenticateToken, updatePlatform);

// Searching Platform by keyword
router.get("/search/:keyword", authenticateToken, searchPlatform);

export default router;
