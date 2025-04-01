import express from "express";

import { createComment, getComments } from "../controllers/commentController";
import authenticateToken from "../middleware/authMiddleware";

// Create express router
const router = express.Router();

// create a comment by postId
router.post("/",authenticateToken, createComment);

//Get all comments by postId
router.get("/:postId",authenticateToken, getComments);




export default router;