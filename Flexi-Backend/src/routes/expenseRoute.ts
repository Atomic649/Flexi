import express from "express";
import {
  createExpense,
  getExpenses,
  getExpenseById,
  updateExpenseById, 
  searchExpenseByDate,
  getThisYearExpensesAPI,
  deleteExpenseById
} from "../controllers/expenseController";
import authenticateToken from "../middleware/authMiddleware";
// Create express router
const router = express.Router();

// Creating a New Expense
router.post("/", authenticateToken, createExpense);

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


export default router;
