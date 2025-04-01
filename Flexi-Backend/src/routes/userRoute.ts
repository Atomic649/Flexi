import express from 'express';
import { getNumberOfUsers, getUserByID } from '../controllers/userController';
import authenticateToken from '../middleware/authMiddleware';

// Create express router
const router = express.Router(); 

// Get number of registered users
router.get("/users", authenticateToken, getNumberOfUsers);

// Get User by ID
router.get("/profile/:id", authenticateToken, getUserByID);

export default router;