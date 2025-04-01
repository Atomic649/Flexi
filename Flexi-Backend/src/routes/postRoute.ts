import express from "express";
import { createPost, getPostsByAuthorId } from "../controllers/postController";
import authenticateToken from "../middleware/authMiddleware";

// Create express router
const router = express.Router();

// create a post
router.post("/",authenticateToken, createPost);

// Get all posts by authorId
router.get("/:authorId", authenticateToken, getPostsByAuthorId);


export default router;