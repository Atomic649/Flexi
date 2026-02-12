import express from "express";
import {
  getMonthlyReport,
  getBillsByDateRange,
  searchBillsByCustomer,
  generateInvoicePDF,
  searchBillById,
  getExpenseByDateRange,
  searchBillsByPhone
} from "../controllers/printController";

const router = express.Router();

// Get monthly report data
router.get("/monthly-report", getMonthlyReport);

// Get bills by date range
router.get("/bills-by-date", getBillsByDateRange);

// Search bills by customer name
router.get("/search-by-customer", searchBillsByCustomer);

// Search bills by customer phone
router.get("/search-by-phone", searchBillsByPhone);

// Generate PDF invoice
router.get("/invoice/:billId", generateInvoicePDF);

// Search bill by bill ID
router.get("/search-by-bill-id", searchBillById);

// Get expenses by date range
router.get("/expenses-by-date", getExpenseByDateRange);

export default router;