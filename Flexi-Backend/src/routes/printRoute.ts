import express from "express";
import {
  getMonthlyReport,
  getBillsByDateRange,
  searchBillsByCustomer,
  generateInvoicePDF,
} from "../controllers/printController";

const router = express.Router();

// Get monthly report data
router.get("/monthly-report", getMonthlyReport);

// Get bills by date range
router.get("/bills-by-date", getBillsByDateRange);

// Search bills by customer name
router.get("/search-by-customer", searchBillsByCustomer);

// Generate PDF invoice
router.get("/invoice/:billId", generateInvoicePDF);

export default router;