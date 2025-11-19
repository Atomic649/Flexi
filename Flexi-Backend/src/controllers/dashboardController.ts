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
          const start = new Date(startDate as string);
          const end = new Date(endDate as string);
          
          // If it's the same date, set the end date to end of day
          if (startDate === endDate) {
            start.setHours(0, 0, 0, 0);
            end.setHours(23, 59, 59, 999);
          } else {
            start.setHours(0, 0, 0, 0);
            end.setHours(23, 59, 59, 999);
          }
          
          dateFilter = {
            gte: start,
            lte: end
          };
        }
        break;
    }

    // Build product filter (for nested ProductItem relation)
    // const productFilter = productName ? { product: productName as string } : {};

    // Build store filter
    const storeFilter = storeId ? { storeId: parseInt(storeId as string) } : {};

// Find business ID by member ID from member table
    const businessId = await prisma.member.findUnique({
      where: { uniqueId: memberId as string },
      select: { businessId: true },
    });


    // Get income from bills (use total field which already accounts for discounts)
    const billsAggregation = await prisma.bill.findMany({
      where: {
       businessAcc : businessId?.businessId ?? 0,
        deleted: false,
        purchaseAt: dateFilter,
        ...storeFilter
      },
      select: {
        total: true,
        discount: true,
        billLevelDiscount: true,
        beforeDiscount: true,
        product: productName
          ? { where: { product: productName as string } }
          : true
      }
    });

    // Calculate income and orders from bills
    let income = 0;
    let orders = 0;
    let totalDiscount = 0;
    let totalBillLevelDiscount = 0;
    let totalBeforeDiscount = 0;
    
    billsAggregation.forEach(bill => {
      // Use the total field which already has discounts applied
      income += Number(bill.total);
      orders += 1;
      totalDiscount += Number(bill.discount || 0);
      totalBillLevelDiscount += Number(bill.billLevelDiscount || 0);
      totalBeforeDiscount += Number(bill.beforeDiscount || 0);
    });

    // Get expenses
    const expensesAggregation = await prisma.expense.aggregate({
      where: {
        businessAcc : businessId?.businessId ?? 0,

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
        businessAcc : businessId?.businessId ?? 0,

        date: dateFilter,
        ...(productName ? { product: productName as string } : {})
      },
      _sum: {
        adsCost: true
      }
    });

    const expense = (expensesAggregation._sum.amount?.toNumber() || 0) + (adsCostAggregation._sum.adsCost?.toNumber() || 0);
    const profitloss = income - expense;

    res.json({
      income,
      expense,
      profitloss,
      orders,
      totalDiscount,
      totalBillLevelDiscount,
      totalBeforeDiscount
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
          const start = new Date(startDate as string);
          const end = new Date(endDate as string);
          
          // If it's the same date, set the end date to end of day
          if (startDate === endDate) {
            start.setHours(0, 0, 0, 0);
            end.setHours(23, 59, 59, 999);
          } else {
            start.setHours(0, 0, 0, 0);
            end.setHours(23, 59, 59, 999);
          }
          
          dateFilter = {
            gte: start,
            lte: end
          };
        }
        break;
    }

    // Build filters
    const productFilter = productName ? { product: productName as string } : {};
    const storeFilter = storeId ? { storeId: parseInt(storeId as string) } : {};
// Find business ID by member ID from member table
    const businessId = await prisma.member.findUnique({
      where: { uniqueId: memberId as string },
      select: { businessId: true },
    });

    // Get bills data grouped by date
    const bills = await prisma.bill.findMany({
      where: {
        businessAcc : businessId?.businessId ?? 0,
        deleted: false,
        purchaseAt: dateFilter,
        ...storeFilter
      },
      select: {
        purchaseAt: true,
        total: true,
        discount: true,
        billLevelDiscount: true,
        beforeDiscount: true,
        product: productName
          ? { where: { product: productName as string } }
          : true
      },
      orderBy: {
        purchaseAt: 'asc'
      }
    });

    // Get expenses data grouped by date
    const expenses = await prisma.expense.findMany({
      where: {
        businessAcc : businessId?.businessId ?? 0,

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
        businessAcc : businessId?.businessId ?? 0,

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
        acc[date] = { 
          income: 0, 
          expense: 0, 
          totalDiscount: 0, 
          billLevelDiscount: 0, 
          beforeDiscount: 0 
        };
      }
      // Use bill.total which already has discounts applied
      acc[date].income += Number(bill.total);
      acc[date].totalDiscount += Number(bill.discount || 0);
      acc[date].billLevelDiscount += Number(bill.billLevelDiscount || 0);
      acc[date].beforeDiscount += Number(bill.beforeDiscount || 0);
      return acc;
    }, {});

    // Group expenses by date
    expenses.forEach(expense => {
      const date = format(new Date(expense.date), 'yyyy-MM-dd');
      if (!billsByDate[date]) {
        billsByDate[date] = { 
          income: 0, 
          expense: 0, 
          totalDiscount: 0, 
          billLevelDiscount: 0, 
          beforeDiscount: 0 
        };
      }
      billsByDate[date].expense += Number(expense.amount);
    });

    // Group ads costs by date
    adsCosts.forEach(adsCost => {
      const date = format(new Date(adsCost.date), 'yyyy-MM-dd');
      if (!billsByDate[date]) {
        billsByDate[date] = { 
          income: 0, 
          expense: 0, 
          totalDiscount: 0, 
          billLevelDiscount: 0, 
          beforeDiscount: 0 
        };
      }
      billsByDate[date].expense += Number(adsCost.adsCost);
    });

    // Convert to array format
    const chartData = Object.keys(billsByDate).map(date => ({
      date,
      income: billsByDate[date].income,
      expense: billsByDate[date].expense,
      profit: billsByDate[date].income - billsByDate[date].expense,
      totalDiscount: billsByDate[date].totalDiscount,
      billLevelDiscount: billsByDate[date].billLevelDiscount,
      beforeDiscount: billsByDate[date].beforeDiscount
    })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    res.json(chartData);

  } catch (error) {
    console.error("Error fetching sales chart data:", error);
    res.status(500).json({ error: "Failed to fetch sales chart data" });
  }
};

// Get Top Products (multi-product support)
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
          const start = new Date(startDate as string);
          const end = new Date(endDate as string);
          
          // If it's the same date, set the end date to end of day
          if (startDate === endDate) {
            start.setHours(0, 0, 0, 0);
            end.setHours(23, 59, 59, 999);
          } else {
            start.setHours(0, 0, 0, 0);
            end.setHours(23, 59, 59, 999);
          }
          
          dateFilter = {
            gte: start,
            lte: end
          };
        }
        break;
    }

    // Build store filter
    const storeFilter = storeId ? { storeId: parseInt(storeId as string) } : {};
// Find business ID by member ID from member table
    const businessId = await prisma.member.findUnique({
      where: { uniqueId: memberId as string },
      select: { businessId: true },
    });

    // Get bills with product items
    const bills = await prisma.bill.findMany({
      where: {
        businessAcc : businessId?.businessId ?? 0,

        deleted: false,
        purchaseAt: dateFilter,
        ...storeFilter
      },
      select: {
        product: true
      }
    });

    // Flatten all product items with discount consideration
    const allProductItems = bills.flatMap(bill => bill.product.map(item => ({
      product: item.product,
      quantity: Number(item.quantity),
      unitPrice: Number(item.unitPrice),
      unitDiscount: Number(item.unitDiscount || 0)
    })));

    // Aggregate by product name (account for unit discounts)
    const productMetrics: Record<string, { name: string; revenue: number; sales: number; orders: number; totalDiscount: number }> = {};
    allProductItems.forEach(item => {
      if (!productMetrics[item.product]) {
        productMetrics[item.product] = {
          name: item.product,
          revenue: 0,
          sales: 0,
          orders: 0,
          totalDiscount: 0
        };
      }
      // Calculate revenue after unit discount
      const grossRevenue = item.unitPrice * item.quantity;
      const discountAmount = item.unitDiscount * item.quantity;
      const netRevenue = grossRevenue - discountAmount;
      
      productMetrics[item.product].revenue += netRevenue;
      productMetrics[item.product].sales += item.quantity;
      productMetrics[item.product].orders += 1;
      productMetrics[item.product].totalDiscount += discountAmount;
    });

    // Convert to array and sort by revenue
    const topProducts = Object.values(productMetrics)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, parseInt(limit as string));

    res.json(topProducts);
  } catch (error) {
    console.error("Error fetching top products:", error);
    res.status(500).json({ error: "Failed to fetch top products" });
  }
};

// Get Revenue by Platform (multi-product support)
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
          const start = new Date(startDate as string);
          const end = new Date(endDate as string);
          
          // If it's the same date, set the end date to end of day
          if (startDate === endDate) {
            start.setHours(0, 0, 0, 0);
            end.setHours(23, 59, 59, 999);
          } else {
            start.setHours(0, 0, 0, 0);
            end.setHours(23, 59, 59, 999);
          }
          
          dateFilter = {
            gte: start,
            lte: end
          };
        }
        break;
    }
// Find business ID by member ID from member table
    const businessId = await prisma.member.findUnique({
      where: { uniqueId: memberId as string },
      select: { businessId: true },
    });


    // Get bills with product items and platform info
    const platformBills = await prisma.bill.findMany({
      where: {
        businessAcc: businessId?.businessId ?? 0,
        deleted: false,
        purchaseAt: dateFilter
      },
      select: {
        platform: true,
        product: true
      }
    });

    // Flatten all product items with platform and discount info
    const allProductItems = platformBills.flatMap(bill => bill.product.map(item => ({
      platform: bill.platform || 'Unknown',
      product: item.product,
      quantity: Number(item.quantity),
      unitPrice: Number(item.unitPrice),
      unitDiscount: Number(item.unitDiscount || 0)
    })));    // Optionally filter by productName
    const filteredItems = productName ? allProductItems.filter(item => item.product === productName) : allProductItems;

    // Aggregate by platform (account for unit discounts)
    const platformMetrics: Record<string, { platform: string; revenue: number; sales: number; orders: number; totalDiscount: number }> = {};
    filteredItems.forEach(item => {
      if (!platformMetrics[item.platform]) {
        platformMetrics[item.platform] = {
          platform: item.platform,
          revenue: 0,
          sales: 0,
          orders: 0,
          totalDiscount: 0
        };
      }
      // Calculate revenue after unit discount
      const grossRevenue = item.unitPrice * item.quantity;
      const discountAmount = item.unitDiscount * item.quantity;
      const netRevenue = grossRevenue - discountAmount;
      
      platformMetrics[item.platform].revenue += netRevenue;
      platformMetrics[item.platform].sales += item.quantity;
      platformMetrics[item.platform].orders += 1;
      platformMetrics[item.platform].totalDiscount += discountAmount;
    });

    // Convert to array and sort by revenue
    const platformRevenue = Object.values(platformMetrics)
      .sort((a, b) => b.revenue - a.revenue);

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
          const start = new Date(startDate as string);
          const end = new Date(endDate as string);
          
          // If it's the same date, set the end date to end of day
          if (startDate === endDate) {
            start.setHours(0, 0, 0, 0);
            end.setHours(23, 59, 59, 999);
          } else {
            start.setHours(0, 0, 0, 0);
            end.setHours(23, 59, 59, 999);
          }
          
          dateFilter = {
            gte: start,
            lte: end
          };
        }
        break;
    }
 // Find business ID by member ID from member table
    const businessId = await prisma.member.findUnique({
      where : { uniqueId: memberId as string },
      select:{ businessId: true },
    });
   
    

    // Get expenses grouped by category
    const expenses = await prisma.expense.findMany({
      where: {
        businessAcc: businessId?.businessId ?? 0,
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
         businessAcc: businessId?.businessId ?? 0,
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

// Get Top Stores (multi-product support)
export const getTopStores = async (req: Request, res: Response) => {
  try {
    const { memberId, period, startDate, endDate, productName, limit = 5 } = req.query;

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
          const start = new Date(startDate as string);
          const end = new Date(endDate as string);
          
          // If it's the same date, set the end date to end of day
          if (startDate === endDate) {
            start.setHours(0, 0, 0, 0);
            end.setHours(23, 59, 59, 999);
          } else {
            start.setHours(0, 0, 0, 0);
            end.setHours(23, 59, 59, 999);
          }
          
          dateFilter = {
            gte: start,
            lte: end
          };
        }
        break;
    }
// Find business ID by member ID from member table
    const businessId = await prisma.member.findUnique({
      where: { uniqueId: memberId as string },
      select: { businessId: true },
    });

    // Get bills with product items
    const bills = await prisma.bill.findMany({
      where: {
        businessAcc : businessId?.businessId ?? 0,

        deleted: false,
        purchaseAt: dateFilter
      },
      select: {
        storeId: true,
        product: true
      }
    });

    // Get store information
    const stores = await prisma.store.findMany({
      where: {
        businessAcc : businessId?.businessId ?? 0,

        deleted: false
      },
      select: {
        id: true,
        accName: true,
        platform: true
      }
    });

    // Create a map of store information
    const storeMap = stores.reduce((acc, store) => {
      acc[store.id] = {
        name: store.accName || 'Unknown Store',
        platform: store.platform || 'Unknown'
      };
      return acc;
    }, {} as Record<number, { name: string; platform: string }>);

    // Flatten all product items with storeId and discount info
    const allProductItems = bills.flatMap(bill => bill.product.map(item => ({
      storeId: bill.storeId,
      quantity: Number(item.quantity),
      unitPrice: Number(item.unitPrice),
      unitDiscount: Number(item.unitDiscount || 0)
    })));

    // Aggregate by storeId (account for unit discounts)
    const storeMetrics: Record<number, { id: number; name: string; platform: string; revenue: number; sales: number; orders: number; totalDiscount: number }> = {};
    allProductItems.forEach(item => {
      const storeInfo = storeMap[item.storeId] || { name: 'Unknown Store', platform: 'Unknown' };
      if (!storeMetrics[item.storeId]) {
        storeMetrics[item.storeId] = {
          id: item.storeId,
          name: storeInfo.name,
          platform: storeInfo.platform,
          revenue: 0,
          sales: 0,
          orders: 0,
          totalDiscount: 0
        };
      }
      // Calculate revenue after unit discount
      const grossRevenue = item.unitPrice * item.quantity;
      const discountAmount = item.unitDiscount * item.quantity;
      const netRevenue = grossRevenue - discountAmount;
      
      storeMetrics[item.storeId].revenue += netRevenue;
      storeMetrics[item.storeId].sales += item.quantity;
      storeMetrics[item.storeId].orders += 1;
      storeMetrics[item.storeId].totalDiscount += discountAmount;
    });

    // Convert to array and sort by revenue
    const topStores = Object.values(storeMetrics)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, parseInt(limit as string));

    res.json(topStores);
  } catch (error) {
    console.error("Error fetching top stores:", error);
    res.status(500).json({ error: "Failed to fetch top stores" });
  }
};