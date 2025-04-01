import express from "express";
import authenticateToken from "../middleware/authMiddleware";
import { pdfExtract, saveDetectExpense} from '../controllers/expensePDFController';
import { autoDeleteExpense } from "../controllers/expenseController";
// Create express router
const router = express.Router();


router.post("/pdfExtract", authenticateToken,pdfExtract)

// Save Detect Expense
router.put("/saveDetect", authenticateToken, saveDetectExpense);

// Auto delete if save is false
router.delete("/autoDelete", authenticateToken, autoDeleteExpense);



export default router;