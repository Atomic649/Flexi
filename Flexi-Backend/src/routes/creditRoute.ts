import express from "express";
import authenticateToken from "../middleware/authMiddleware";
import { checkCredit, createCredit, deleteCredit, getCreditors, sumCrediting, sumCreditors } from "../controllers/creditController";

// Create express router
const router = express.Router();

// check credit
router.get("/check/:creditorId/:ownerId",authenticateToken, checkCredit);

// create a credit
router.post("/",authenticateToken, createCredit);

// UnCredit
 router.delete("/", authenticateToken, deleteCredit);

// get all credits
router.get("/:ownerId",authenticateToken, getCreditors);

// count of all creditors
router.get("/count/creditor/:ownerId",authenticateToken, sumCreditors);

// count of all crediting
router.get("/count/crediting/:creditorId",authenticateToken, sumCrediting);

export default router;