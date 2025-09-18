import express from "express";
import {
  createExpense,
  createExpenseWithOCR,
  getExpenses,
  getExpenseById,
  updateExpenseById, 
  searchExpenseByDate,
  getThisYearExpensesAPI,
  deleteExpenseById,
  generateWHTDocument,
  updateExpenseWithOCRData
} from "../controllers/expenseController";
import authenticateToken from "../middleware/authMiddleware";
// Create express router
const router = express.Router();

// Creating a New Expense
router.post("/", authenticateToken, createExpense);

// Creating a New Expense with OCR
router.post("/ocr", authenticateToken, createExpenseWithOCR);

// Getting all Expenses
router.get("/all/:memberId", authenticateToken, getExpenses);

// Getting a Expense by ID 
router.get("/:id", authenticateToken, getExpenseById);

// Updating a Expense by ID
router.put("/:id", authenticateToken, updateExpenseById);

// Searching Expense by date
router.get("/search/:date", authenticateToken, searchExpenseByDate);

// Delete a Expense by ID
router.delete("/:id", authenticateToken, deleteExpenseById);

// Get this year's expenses by memberId
router.get("/year/expense", authenticateToken, getThisYearExpensesAPI);

router.post("/generate-wht-document", authenticateToken, generateWHTDocument);

// Update expense with selected OCR data
router.put("/update-ocr/:id", authenticateToken, updateExpenseWithOCRData);

export default router;
