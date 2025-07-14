import { Request, Response } from "express";
import { PrismaClient as PrismaClient1 } from "../generated/client1";
import { format } from "date-fns";

// Create instance of PrismaClient
const prisma = new PrismaClient1();

// Get Dashboard Metrics
export const getDashboardMetrics = async (req: Request, res: Response) => {
  try {
    const { memberId, period, startDate, endDate, productName, storeId } = req.query;

    if (!memberId) {
      return res.status(400).json({ error: "Member ID is required" });
    }

    // Build date filter based on period
    let dateFilter: any = {};
    const now = new Date();
    
    switch (period) {
      case 'today':
        const todayStart = new Date(now);
        todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date(now);
        todayEnd.setHours(23, 59, 59, 999);
        dateFilter = {
          gte: todayStart,
          lte: todayEnd
        };
        break;
      case 'thisMonth':
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
        dateFilter = {
          gte: monthStart,
          lte: monthEnd
        };
        break;
      case 'custom':
        if (startDate && endDate) {
          dateFilter = {
            gte: new Date(startDate as string),
            lte: new Date(endDate as string)
          };
        }
        break;
    }

    // Build product filter
    const productFilter = productName ? { product: productName as string } : {};

    // Build store filter
    const storeFilter = storeId ? { storeId: parseInt(storeId as string) } : {};

    // Get income from bills
    const billsAggregation = await prisma.bill.aggregate({
      where: {
        memberId: memberId as string,
        deleted: false,
        purchaseAt: dateFilter,
        ...productFilter,
        ...storeFilter
      },
      _sum: {
        price: true,
        amount: true
      },
      _count: {
        id: true
      }
    });

    // Get expenses
    const expensesAggregation = await prisma.expense.aggregate({
      where: {
        memberId: memberId as string,
        deleted: false,
        date: dateFilter,
        save: true
      },
      _sum: {
        amount: true
      }
    });

    // Get ads cost
    const adsCostAggregation = await prisma.adsCost.aggregate({
      where: {
        memberId: memberId as string,
        date: dateFilter,
        ...(productName ? { product: productName as string } : {})
      },
      _sum: {
        adsCost: true
      }
    });

    const income = billsAggregation._sum.price || 0;
    const expense = (expensesAggregation._sum.amount?.toNumber() || 0) + (adsCostAggregation._sum.adsCost?.toNumber() || 0);
    const profitloss = income - expense;
    const orders = billsAggregation._count.id || 0;

    res.json({
      income,
      expense,
      profitloss,
      orders
    });

  } catch (error) {
    console.error("Error fetching dashboard metrics:", error);
    res.status(500).json({ error: "Failed to fetch dashboard metrics" });
  }
};

// Get Sales Chart Data
export const getSalesChartData = async (req: Request, res: Response) => {
  try {
    const { memberId, period, startDate, endDate, productName, storeId } = req.query;

    if (!memberId) {
      return res.status(400).json({ error: "Member ID is required" });
    }

    // Build date filter
    let dateFilter: any = {};
    const now = new Date();
    
    switch (period) {
      case 'today':
        const todayStart = new Date(now);
        todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date(now);
        todayEnd.setHours(23, 59, 59, 999);
        dateFilter = {
          gte: todayStart,
          lte: todayEnd
        };
        break;
      case 'thisMonth':
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
        dateFilter = {
          gte: monthStart,
          lte: monthEnd
        };
        break;
      case 'custom':
        if (startDate && endDate) {
          dateFilter = {
            gte: new Date(startDate as string),
            lte: new Date(endDate as string)
          };
        }
        break;
    }

    // Build filters
    const productFilter = productName ? { product: productName as string } : {};
    const storeFilter = storeId ? { storeId: parseInt(storeId as string) } : {};

    // Get bills data grouped by date
    const bills = await prisma.bill.findMany({
      where: {
        memberId: memberId as string,
        deleted: false,
        purchaseAt: dateFilter,
        ...productFilter,
        ...storeFilter
      },
      select: {
        purchaseAt: true,
        price: true,
        amount: true
      },
      orderBy: {
        purchaseAt: 'asc'
      }
    });

    // Get expenses data grouped by date
    const expenses = await prisma.expense.findMany({
      where: {
        memberId: memberId as string,
        deleted: false,
        date: dateFilter,
        save: true
      },
      select: {
        date: true,
        amount: true
      }
    });

    // Get ads cost data grouped by date
    const adsCosts = await prisma.adsCost.findMany({
      where: {
        memberId: memberId as string,
        date: dateFilter,
        ...(productName ? { product: productName as string } : {})
      },
      select: {
        date: true,
        adsCost: true
      }
    });

    // Group bills by date
    const billsByDate = bills.reduce((acc: any, bill) => {
      const date = format(new Date(bill.purchaseAt), 'yyyy-MM-dd');
      if (!acc[date]) {
        acc[date] = { income: 0, expense: 0 };
      }
      acc[date].income += Number(bill.price) * Number(bill.amount);
      return acc;
    }, {});

    // Group expenses by date
    expenses.forEach(expense => {
      const date = format(new Date(expense.date), 'yyyy-MM-dd');
      if (!billsByDate[date]) {
        billsByDate[date] = { income: 0, expense: 0 };
      }
      billsByDate[date].expense += Number(expense.amount);
    });

    // Group ads costs by date
    adsCosts.forEach(adsCost => {
      const date = format(new Date(adsCost.date), 'yyyy-MM-dd');
      if (!billsByDate[date]) {
        billsByDate[date] = { income: 0, expense: 0 };
      }
      billsByDate[date].expense += Number(adsCost.adsCost);
    });

    // Convert to array format
    const chartData = Object.keys(billsByDate).map(date => ({
      date,
      income: billsByDate[date].income,
      expense: billsByDate[date].expense,
      profit: billsByDate[date].income - billsByDate[date].expense
    })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    res.json(chartData);

  } catch (error) {
    console.error("Error fetching sales chart data:", error);
    res.status(500).json({ error: "Failed to fetch sales chart data" });
  }
};

// Get Top Products
export const getTopProducts = async (req: Request, res: Response) => {
  try {
    const { memberId, period, startDate, endDate, storeId, limit = 5 } = req.query;

    if (!memberId) {
      return res.status(400).json({ error: "Member ID is required" });
    }

    // Build date filter
    let dateFilter: any = {};
    const now = new Date();
    
    switch (period) {
      case 'today':
        const todayStart = new Date(now);
        todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date(now);
        todayEnd.setHours(23, 59, 59, 999);
        dateFilter = {
          gte: todayStart,
          lte: todayEnd
        };
        break;
      case 'thisMonth':
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
        dateFilter = {
          gte: monthStart,
          lte: monthEnd
        };
        break;
      case 'custom':
        if (startDate && endDate) {
          dateFilter = {
            gte: new Date(startDate as string),
            lte: new Date(endDate as string)
          };
        }
        break;
    }

    // Build store filter
    const storeFilter = storeId ? { storeId: parseInt(storeId as string) } : {};

    // Get bills data grouped by product
    const bills = await prisma.bill.findMany({
      where: {
        memberId: memberId as string,
        deleted: false,
        purchaseAt: dateFilter,
        ...storeFilter
      },
      select: {
        product: true,
        price: true,
        amount: true
      }
    });

    // Group by product and calculate metrics
    const productMetrics = bills.reduce((acc: any, bill) => {
      const productName = bill.product;
      if (!acc[productName]) {
        acc[productName] = {
          name: productName,
          revenue: 0,
          sales: 0,
          orders: 0
        };
      }
      acc[productName].revenue += Number(bill.price) * Number(bill.amount);
      acc[productName].sales += Number(bill.amount);
      acc[productName].orders += 1;
      return acc;
    }, {});

    // Convert to array and sort by revenue
    const topProducts = Object.values(productMetrics)
      .sort((a: any, b: any) => b.revenue - a.revenue)
      .slice(0, parseInt(limit as string));

    res.json(topProducts);

  } catch (error) {
    console.error("Error fetching top products:", error);
    res.status(500).json({ error: "Failed to fetch top products" });
  }
};

// Get Revenue by Platform
export const getRevenueByPlatform = async (req: Request, res: Response) => {
  try {
    const { memberId, period, startDate, endDate, productName } = req.query;

    if (!memberId) {
      return res.status(400).json({ error: "Member ID is required" });
    }

    // Build date filter
    let dateFilter: any = {};
    const now = new Date();
    
    switch (period) {
      case 'today':
        const todayStart = new Date(now);
        todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date(now);
        todayEnd.setHours(23, 59, 59, 999);
        dateFilter = {
          gte: todayStart,
          lte: todayEnd
        };
        break;
      case 'thisMonth':
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
        dateFilter = {
          gte: monthStart,
          lte: monthEnd
        };
        break;
      case 'custom':
        if (startDate && endDate) {
          dateFilter = {
            gte: new Date(startDate as string),
            lte: new Date(endDate as string)
          };
        }
        break;
    }

    // Build product filter
    const productFilter = productName ? { product: productName as string } : {};

    // Get bills with platform information
    const bills = await prisma.bill.findMany({
      where: {
        memberId: memberId as string,
        deleted: false,
        purchaseAt: dateFilter,
        ...productFilter
      },
      select: {
        platform: true,
        price: true,
        amount: true
      }
    });

    // Group by platform
    const platformMetrics = bills.reduce((acc: any, bill) => {
      const platform = bill.platform || 'Unknown';
      if (!acc[platform]) {
        acc[platform] = {
          platform,
          revenue: 0,
          sales: 0,
          orders: 0
        };
      }
      acc[platform].revenue += Number(bill.price) * Number(bill.amount);
      acc[platform].sales += Number(bill.amount);
      acc[platform].orders += 1;
      return acc;
    }, {});

    // Convert to array and sort by revenue
    const platformRevenue = Object.values(platformMetrics)
      .sort((a: any, b: any) => b.revenue - a.revenue);

    res.json(platformRevenue);

  } catch (error) {
    console.error("Error fetching revenue by platform:", error);
    res.status(500).json({ error: "Failed to fetch revenue by platform" });
  }
};

// Get Expense Breakdown
export const getExpenseBreakdown = async (req: Request, res: Response) => {
  try {
    const { memberId, period, startDate, endDate } = req.query;

    if (!memberId) {
      return res.status(400).json({ error: "Member ID is required" });
    }

    // Build date filter
    let dateFilter: any = {};
    const now = new Date();
    
    switch (period) {
      case 'today':
        const todayStart = new Date(now);
        todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date(now);
        todayEnd.setHours(23, 59, 59, 999);
        dateFilter = {
          gte: todayStart,
          lte: todayEnd
        };
        break;
      case 'thisMonth':
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
        dateFilter = {
          gte: monthStart,
          lte: monthEnd
        };
        break;
      case 'custom':
        if (startDate && endDate) {
          dateFilter = {
            gte: new Date(startDate as string),
            lte: new Date(endDate as string)
          };
        }
        break;
    }

    // Get expenses grouped by category
    const expenses = await prisma.expense.findMany({
      where: {
        memberId: memberId as string,
        deleted: false,
        date: dateFilter,
        save: true
      },
      select: {
        group: true,
        amount: true
      }
    });

    // Get ads costs
    const adsCosts = await prisma.adsCost.findMany({
      where: {
        memberId: memberId as string,
        date: dateFilter
      },
      select: {
        adsCost: true
      }
    });

    // Group expenses by category
    const expenseBreakdown = expenses.reduce((acc: any, expense) => {
      const category = expense.group || 'Other';
      if (!acc[category]) {
        acc[category] = {
          category,
          amount: 0,
          type: 'expense' as const
        };
      }
      acc[category].amount += Number(expense.amount);
      return acc;
    }, {});

    // Add ads costs as a separate category
    const totalAdsCost = adsCosts.reduce((sum, ad) => sum + Number(ad.adsCost), 0);
    if (totalAdsCost > 0) {
      expenseBreakdown['Advertising'] = {
        category: 'Advertising',
        amount: totalAdsCost,
        type: 'ads' as const
      };
    }

    // Convert to array and sort by amount
    const breakdown = Object.values(expenseBreakdown)
      .sort((a: any, b: any) => b.amount - a.amount);

    res.json(breakdown);

  } catch (error) {
    console.error("Error fetching expense breakdown:", error);
    res.status(500).json({ error: "Failed to fetch expense breakdown" });
  }
};