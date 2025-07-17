import express from "express";
import authenticateToken from "../middleware/authMiddleware";
import {
  getDashboardMetrics,
  getSalesChartData,
  getTopProducts,
  getTopStores,
  getRevenueByPlatform,
  getExpenseBreakdown
} from "../controllers/dashboardController";

const router = express.Router();

// Dashboard metrics endpoint - GET /dashboard/metrics
router.get("/metrics", authenticateToken, getDashboardMetrics);

// Sales chart data endpoint - GET /dashboard/sales-chart
router.get("/sales-chart", authenticateToken, getSalesChartData);

// Top products endpoint - GET /dashboard/top-products
router.get("/top-products", authenticateToken, getTopProducts);

// Top stores endpoint - GET /dashboard/top-stores
router.get("/top-stores", authenticateToken, getTopStores);

// Revenue by platform endpoint - GET /dashboard/revenue-by-platform
router.get("/revenue-by-platform", authenticateToken, getRevenueByPlatform);

// Expense breakdown endpoint - GET /dashboard/expense-breakdown
router.get("/expense-breakdown", authenticateToken, getExpenseBreakdown);

export default router;