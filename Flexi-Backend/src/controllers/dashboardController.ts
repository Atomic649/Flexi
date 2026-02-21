import { Request, Response } from "express";
import { format } from "date-fns";
import { flexiDBPrismaClient } from "../../lib/PrismaClient1";


// Create instance of PrismaClient
const prisma = flexiDBPrismaClient;

// Get Dashboard Metrics
export const getDashboardMetrics = async (req: Request, res: Response) => {
  try {
  const { memberId, period, startDate, endDate, productName, platform } = req.query;

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
    }// Find business ID by member ID from member table
    const businessId = await prisma.member.findUnique({
      where: { uniqueId: memberId as string },
      select: { businessId: true },
    });


    // Get income from bills (use total field which already accounts for discounts)
    const baseWhere = {
      businessAcc: businessId?.businessId ?? 0,
      deleted: false,
      purchaseAt: dateFilter,
      ...(platform ? { platform: platform as any } : {}),
      ...(productName
        ? {
            product: {
              some: { productList: { name: productName as string } },
            },
          }
        : {}),
    };

    const billsAggregation = await prisma.bill.findMany({
      where: {
        ...baseWhere,
        DocumentType: "Receipt",
      },
      select: {
        total: true,
        discount: true,
        billLevelDiscount: true,
        beforeDiscount: true,
      },
    });

    // Count all bills (all DocumentTypes) for subValue orders
    const allBillsCount = await prisma.bill.count({
      where: baseWhere,
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
        ...(productName ? { productList: { name: productName as string } } : {}),
        ...(platform ? { platform: { is: { platform: platform as any } } } : {})
      },
      _sum: {
        adsCost: true
      }
    });

    const adsCostValue = adsCostAggregation._sum.adsCost?.toNumber() || 0;
    const expenseOnly = expensesAggregation._sum.amount?.toNumber() || 0;
    //const expense = expenseOnly + adsCostValue;
     const expense = expenseOnly;


  const profitloss = income - expense;
  const forcastProfitloss = income - adsCostValue;
  const adsPercentage = income > 0 ? (adsCostValue / income) * 100 : 0;

    res.json({
      income,
      expense,
      profitloss,
      orders,
      allOrders: allBillsCount,
      totalDiscount,
      totalBillLevelDiscount,
      totalBeforeDiscount,
      adscost: adsCostValue,
      forcastProfitloss,
      adsPercentage
    });

  } catch (error) {
    console.error("Error fetching dashboard metrics:", error);
    res.status(500).json({ error: "Failed to fetch dashboard metrics" });
  }
};

// Get Sales Chart Data
export const getSalesChartData = async (req: Request, res: Response) => {
  try {
    const { memberId, period, startDate, endDate, productName, platform, platformId } = req.query;

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

    const platformFilter = platform
      ? { platform: platform as any }
      : platformId
      ? { platformId: parseInt(platformId as string) }
      : {};
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
        DocumentType: "Receipt",
        ...platformFilter,
        ...(productName
          ? {
              product: {
                some: { productList: { name: productName as string } },
              },
            }
          : {}),
      },
      select: {
        purchaseAt: true,
        total: true,
        discount: true,
        billLevelDiscount: true,
        beforeDiscount: true,
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
    const adsPlatformFilter = platform
      ? { platform: { is: { platform: platform as any } } }
      : platformId
      ? { platformId: parseInt(platformId as string) }
      : {};

    const adsCosts = await prisma.adsCost.findMany({
      where: {
        businessAcc : businessId?.businessId ?? 0,

        date: dateFilter,
        ...(productName ? { productList: { name: productName as string } } : {}),
        ...adsPlatformFilter
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
  const { memberId, period, startDate, endDate, productName, platform, platformId, limit = 5 } = req.query;

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
    const platformFilter = platform
      ? { platform: platform as any }
      : platformId
      ? { platformId: parseInt(platformId as string) }
      : {};
// Find business ID by member ID from member table
    const businessId = await prisma.member.findUnique({
      where: { uniqueId: memberId as string },
      select: { businessId: true },
    });

    // Get bills with product items
    const bills = await prisma.bill.findMany({
      where: {
        businessAcc : businessId?.businessId ?? 0,
        DocumentType: "Receipt",
        deleted: false,
        purchaseAt: dateFilter,
        ...platformFilter,
        ...(productName
          ? {
              product: {
                some: { productList: { name: productName as string } },
              },
            }
          : {}),
      },
      select: {
        product: {
          select: {
            product: true,
            productList: { select: { name: true } },
            quantity: true,
            unitPrice: true,
            unitDiscount: true,
            unit: true
          }
        }
      }
    });

    // Flatten all product items with discount consideration
    const allProductItems = bills.flatMap(bill => bill.product.map(item => ({
      productName: item.productList?.name ?? String(item.product),
      quantity: Number(item.quantity),
      unitPrice: Number(item.unitPrice),
      unitDiscount: Number(item.unitDiscount || 0),
      unit: item.unit || "Unit"
    })));
    // Aggregate by product name (account for unit discounts)
    const productMetrics: Record<string, { name: string; revenue: number; sales: number; orders: number; totalDiscount: number; unit: string }> = {};
    allProductItems.forEach(item => {
      if (!productMetrics[item.productName]) {
        productMetrics[item.productName] = {
          name: item.productName,
          revenue: 0,
          sales: 0,
          orders: 0,
          totalDiscount: 0,
          unit: item.unit
        };
      }
      // Calculate revenue after unit discount
      const grossRevenue = item.unitPrice * item.quantity;
      const discountAmount = item.unitDiscount * item.quantity;
      const netRevenue = grossRevenue - discountAmount;

      productMetrics[item.productName].revenue += netRevenue;
      productMetrics[item.productName].sales += item.quantity;
      productMetrics[item.productName].orders += 1;
      productMetrics[item.productName].totalDiscount += discountAmount;
      if (!productMetrics[item.productName].unit && item.unit) {
        productMetrics[item.productName].unit = item.unit;
      }
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
        DocumentType: "Receipt",
        purchaseAt: dateFilter
      },
      select: {
        platform: true,
        product: {
          select: {
            product: true,
            productList: { select: { name: true } },
            quantity: true,
            unitPrice: true,
            unitDiscount: true,
          }
        }
      }
    });

    // Flatten all product items with platform and discount info
    const allProductItems = platformBills.flatMap(bill => bill.product.map(item => ({
      platform: bill.platform,
      productName: item.productList?.name ?? String(item.product),
      quantity: Number(item.quantity),
      unitPrice: Number(item.unitPrice),
      unitDiscount: Number(item.unitDiscount || 0)
    })));    // Optionally filter by productName
    const filteredItems = productName ? allProductItems.filter(item => item.productName === productName) : allProductItems;

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

// Get Accounts Payable and Receivable
export const getAccountsPayableReceivable = async (req: Request, res: Response) => {
  try {
    const { memberId, period, startDate, endDate } = req.query;

    if (!memberId) {
      return res.status(400).json({ error: "Member ID is required" });
    }

    // Build date filter using UTC to match how dates are stored in the DB
    let dateFilter: any = {};
    const now = new Date();

    switch (period) {
      case 'today': {
        const todayStart = new Date();
        todayStart.setUTCHours(0, 0, 0, 0);
        const todayEnd = new Date();
        todayEnd.setUTCHours(23, 59, 59, 999);
        dateFilter = { gte: todayStart, lte: todayEnd };
        break;
      }
      case 'thisMonth': {
        const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
        const monthEnd = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0, 23, 59, 59, 999));
        dateFilter = { gte: monthStart, lte: monthEnd };
        break;
      }
      case 'custom': {
        if (startDate && endDate) {
          const start = new Date(startDate as string);
          const end = new Date(endDate as string);
          start.setUTCHours(0, 0, 0, 0);
          end.setUTCHours(23, 59, 59, 999);
          dateFilter = { gte: start, lte: end };
        }
        break;
      }
    }

    const businessId = await prisma.member.findUnique({
      where: { uniqueId: memberId as string },
      select: { businessId: true },
    });

    // Accounts Payable: Bills with DocumentType "Invoice" → sum totalQuotation (owed by your customers)
    const invoiceBills = await prisma.bill.findMany({
      where: {
        businessAcc: businessId?.businessId ?? 0,
        deleted: false,
        DocumentType: "Invoice",
        purchaseAt: dateFilter,
      },
      select: { totalQuotation: true },
    });

    const accountsPayable = invoiceBills.reduce(
      (sum, bill) => sum + Number(bill.totalQuotation || 0),
      0
    );

    // Accounts Receivable: Expenses with DocumentType "Invoice" → sum debtAmount
    const invoiceExpenses = await prisma.expense.findMany({
      where: {
        businessAcc: businessId?.businessId ?? 0,
        deleted: false,
        DocumentType: "Invoice",
        date: dateFilter,
        save: true,
      },
      select: { debtAmount: true },
    });

    const accountsReceivable = invoiceExpenses.reduce(
      (sum, expense) => sum + Number(expense.debtAmount || 0),
      0
    );

    res.json({ accountsPayable, accountsReceivable });
  } catch (error) {
    console.error("Error fetching accounts payable/receivable:", error);
    res.status(500).json({ error: "Failed to fetch accounts payable/receivable" });
  }
};

// Get Top Platforms (multi-product support)
export const getTopStores = async (req: Request, res: Response) => {
  try {
    const { memberId, period, startDate, endDate, productName, platform, platformId, limit = 5 } = req.query;

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
    const platformFilter = platform
      ? { platform: platform as any }
      : platformId
      ? { platformId: parseInt(platformId as string) }
      : {};

    const bills = await prisma.bill.findMany({
      where: {
        businessAcc : businessId?.businessId ?? 0,
        DocumentType: "Receipt",
        deleted: false,
        purchaseAt: dateFilter,
        ...platformFilter
      },
      select: {
        platform: true,
        platformId: true,
        product: {
          select: {
            product: true,
            productList: { select: { name: true } },
            quantity: true,
            unitPrice: true,
            unitDiscount: true,
            unit: true
          }
        }
      }
    });

    // Get platform information
    const platforms = await prisma.platform.findMany({
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

//    console.log("Platforms:", platforms);

    // Create a map of platform information
    const platformMap = platforms.reduce((acc, platform) => {
      acc[platform.id] = {
        name: platform.accName || 'Unknown Platform',
        platform: platform.platform || 'Unknown'
      };
      return acc;
    }, {} as Record<number, { name: string; platform: string }>);

    // Flatten all product items with platform identifiers and discount info
    const allProductItems = bills.flatMap(bill => bill.product.map(item => ({
      platformId: bill.platformId ?? null,
      platformLabel: bill.platform ?? null,
      productName: item.productList?.name ?? String(item.product),
      quantity: Number(item.quantity),
      unitPrice: Number(item.unitPrice),
      unitDiscount: Number(item.unitDiscount || 0),
      unit: item.unit || 'Unit'
    })));

    const filteredItems = productName
      ? allProductItems.filter(item => item.productName === productName)
      : allProductItems;

    // Aggregate by platform (prefer platformId when present, otherwise platform string)
    type PlatformKey = string | number;
    const platformMetrics: Record<PlatformKey, { id: number | null; name: string; platform: string; revenue: number; sales: number; orders: number; totalDiscount: number; unit: string }> = {};

    filteredItems.forEach(item => {
      const key: PlatformKey = item.platformId ?? item.platformLabel ?? 'unknown';
      const platformInfo = item.platformId && platformMap[item.platformId]
        ? platformMap[item.platformId]
        : {
            name: item.platformLabel || 'Unknown Platform',
            platform: item.platformLabel || 'Unknown',
          };

      if (!platformMetrics[key]) {
        platformMetrics[key] = {
          id: item.platformId,
          name: platformInfo.name,
          platform: platformInfo.platform,
          revenue: 0,
          sales: 0,
          orders: 0,
          totalDiscount: 0,
          unit: item.unit,
        };
      }

      // Calculate revenue after unit discount
      const grossRevenue = item.unitPrice * item.quantity;
      const discountAmount = item.unitDiscount * item.quantity;
      const netRevenue = grossRevenue - discountAmount;

      platformMetrics[key].revenue += netRevenue;
      platformMetrics[key].sales += item.quantity;
      platformMetrics[key].orders += 1;
      platformMetrics[key].totalDiscount += discountAmount;
      if (!platformMetrics[key].unit && item.unit) {
        platformMetrics[key].unit = item.unit;
      }
    });

    // Convert to array and sort by revenue
    const topPlatforms = Object.values(platformMetrics)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, parseInt(limit as string));
    
//console.log("Top Platforms:", topPlatforms);
    res.json(topPlatforms);
  } catch (error) {
    console.error("Error fetching top platforms:", error);
    res.status(500).json({ error: "Failed to fetch top platforms" });
  }
};