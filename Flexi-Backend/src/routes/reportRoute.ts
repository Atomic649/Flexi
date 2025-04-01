import express from 'express';
import authenticateToken from '../middleware/authMiddleware';
import { dailyReport, getListofAdsandExpenses, monthlyReport } from '../controllers/reportController';


// Create express router
const router = express.Router();

// get daily report
router.get('/daily/:memberId', authenticateToken, dailyReport);

// get monthly report
router.get('/monthly/:memberId', authenticateToken, monthlyReport);

// get adsCost and Expense List
router.get('/ads&expense/:memberId', authenticateToken, getListofAdsandExpenses);

export default router;