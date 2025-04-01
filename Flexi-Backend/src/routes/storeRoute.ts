import express from "express";
import {
  createStore,
  getStores,
  updateStore,
  deleteStore,
  getAStore,
} from "../controllers/storeController";
import authenticateToken from "../middleware/authMiddleware";

// create express router
const router = express.Router();

// Create store route
router.post("/", authenticateToken, createStore);

// Get all stores
router.get("/member/:memberId", authenticateToken, getStores);

// Get a store
router.get("/:id", authenticateToken, getAStore);

// Update store
router.put("/:id", authenticateToken, updateStore);

// Delete store
router.post("/delete/:id", authenticateToken, deleteStore);

export default router;
