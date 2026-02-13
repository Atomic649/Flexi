import express from "express";
import {
  register,
  login,
  getUsers,
  deleteUser,
  permanentlyDelete,
  updateUser,
  getAvatar,
  logout,
  session,
  changePassword,
  forgotPassword,
  resetPassword,
  verifyEmail,
  resendVerificationEmail,
} from "../controllers/authController";
import { rateLimiter } from "../middleware/rateLimitAndCache";

// Create express router
const router = express.Router();
// Register - Rate limit to 5 attempts per hour per IP to prevent spam bots
router.post("/register", rateLimiter({ windowMs: 60 * 60 * 1000, max: 5 }), register);

// Login
router.post("/login", login);

// Get Users
router.get("/users", getUsers);

// Delete User
router.delete("/delete/:id", deleteUser);

// Permanently Delete User with password verification
router.delete("/permanently-delete/:memberId", permanentlyDelete);

//Change Password
 router.post("/change-password", changePassword);

// Update User
router.put("/update/:id", updateUser);

//Get Avatar
 router.get("/avatar/:name", getAvatar);

 //Logout
router.get("/logout", logout);

// session
router.get("/session/", session);

// Forgot password
router.post("/forgot-password", forgotPassword);

// Reset password
router.post("/reset-password", resetPassword);

// Email verification
router.get("/verify-email", verifyEmail);
router.post("/verify-email", verifyEmail);
router.post("/resend-verification", resendVerificationEmail);

export default router;
