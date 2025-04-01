import express from "express";
import {
  createProduct,
  getProductById,
  updateProduct,
  deleteProduct,
  getProductByMemberId,
  getProductChoice,
} from "../controllers/productController";
import authenticateToken from "../middleware/authMiddleware";
// create express router
const router = express.Router();

// Create product route
router.post("/", authenticateToken, createProduct);

//Get product by member ID
router.get("/member/:memberId", authenticateToken, getProductByMemberId);

// Get product by ID
router.get("/:id", authenticateToken, getProductById);

// Delete product by apdate deleted status
router.post("/delete/:id", authenticateToken, deleteProduct);


// Update product
router.put("/:id", authenticateToken, updateProduct);

//get product choice by member ID
router.get("/choice/:memberId", authenticateToken, getProductChoice);


export default router;
