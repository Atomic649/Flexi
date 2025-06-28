import express from "express";
import {
  createProduct,
  getProductById,
  updateProduct,
  deleteProduct,
  getProductByMemberId,
  getProductChoice,
  getProductChoiceWithPrice,
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

//get product choice with price by member ID
 router.get("/choiceprice/:memberId", authenticateToken, getProductChoiceWithPrice);


export default router;
