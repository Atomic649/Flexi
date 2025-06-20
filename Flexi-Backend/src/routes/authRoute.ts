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
} from "../controllers/authController";

// Create express router
const router = express.Router();
// Register
router.post("/register", register);

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

export default router;
