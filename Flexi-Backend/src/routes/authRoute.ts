import express from "express";
import {
  register,
  login,
  getUsers,
  deleteUser,
  updateUser,
  getAvatar,
  logout,
  session,
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

// Update User
router.put("/update/:id", updateUser);

//Get Avatar
 router.get("/avatar/:name", getAvatar);

 //Logout
router.get("/logout", logout);

// session
router.get("/session/", session);

export default router;
