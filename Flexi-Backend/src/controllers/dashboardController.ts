import { Request, Response } from "express";
import { format } from "date-fns";
import { flexiDBPrismaClient } from "../../lib/PrismaClient1";


// Create instance of PrismaClient
const prisma = flexiDBPrismaClient;

// Get Dashboard Metrics
export const getDashboardMetrics = async (req: Request, res: Response) => {
  try {
  const { memberId, period, startDate, endDate, productName, platform, projectId } = req.query;

    if (!memberId) {
      return res.status(400).json({ error: "Member ID is required" });
    }

    // Build date filter based on period
    let dateFilter: any = {};
    const now = new Date();
    
    switch (period) {
      case 'today': {
        const todayStart = new Date(now);
        todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date(now);
        todayEnd.setHours(23, 59, 59, 999);
        dateFilter = { gte: todayStart, lte: todayEnd };
        break;
      }
      case 'yesterday': {
        const yStart = new Date(now);
        yStart.setDate(yStart.getDate() - 1);
        yStart.setHours(0, 0, 0, 0);
        const yEnd = new Date(yStart);
        yEnd.setHours(23, 59, 59, 999);
        dateFilter = { gte: yStart, lte: yEnd };
        break;
      }
      case 'thisWeek': {
        const wStart = new Date(now);
        wStart.setDate(wStart.getDate() - wStart.getDay());
        wStart.setHours(0, 0, 0, 0);
        const wEnd = new Date(now);
        wEnd.setHours(23, 59, 59, 999);
        dateFilter = { gte: wStart, lte: wEnd };
        break;
      }
      case 'lastWeek': {
        const lwStart = new Date(now);
        lwStart.setDate(lwStart.getDate() - lwStart.getDay() - 7);
        lwStart.setHours(0, 0, 0, 0);
        const lwEnd = new Date(lwStart);
        lwEnd.setDate(lwEnd.getDate() + 6);
        lwEnd.setHours(23, 59, 59, 999);
        dateFilter = { gte: lwStart, lte: lwEnd };
        break;
      }
      case 'thisMonth': {
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
        dateFilter = { gte: monthStart, lte: monthEnd };
        break;
      }
      case 'lastMonth': {
        const lmStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lmEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
        dateFilter = { gte: lmStart, lte: lmEnd };
        break;
      }
      case 'thisYear': {
        const tyStart = new Date(now.getFullYear(), 0, 1);
        const tyEnd = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
        dateFilter = { gte: tyStart, lte: tyEnd };
        break;
      }
      case 'lastYear': {
        const lyStart = new Date(now.getFullYear() - 1, 0, 1);
        const lyEnd = new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59, 999);
        dateFilter = { gte: lyStart, lte: lyEnd };
        break;
      }
      case 'yearBeforeLast': {
        const yblStart = new Date(now.getFullYear() - 2, 0, 1);
        const yblEnd = new Date(now.getFullYear() - 2, 11, 31, 23, 59, 59, 999);
        dateFilter = { gte: yblStart, lte: yblEnd };
        break;
      }
      case 'custom':
        if (startDate && endDate) {
          const start = new Date(startDate as string);
          const end = new Date(endDate as string);
          start.setHours(0, 0, 0, 0);
          end.setHours(23, 59, 59, 999);
          dateFilter = { gte: start, lte: end };
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
      ...(projectId ? { projectId: parseInt(projectId as string) } : {}),
    };

    const billsAggregation = await prisma.bill.findMany({
      where: {
        ...baseWhere,
        isSplitChild: false // Only consider parent bills for income calculation to avoid double counting
      },
      select: {
        total: true,
        discount: true,
        billLevelDiscount: true,
        beforeDiscount: true,
        isSplitChild: true,
      },
    });

    // Count all bills (all DocumentTypes) for subValue orders
    const allBillsCount = await prisma.bill.count({
      where: {
        ...baseWhere,
        isSplitChild: false
      }    });

    // Calculate income and orders from bills
    let income = 0;
    let orders = 0;
    let totalDiscount = 0;
    let totalBillLevelDiscount = 0;
    let totalBeforeDiscount = 0;
    
    billsAggregation.forEach(bill => {
      // Use the total field which already has discounts applied
      income += Number(bill.total);
      if (!bill.isSplitChild && Number(bill.total) > 0) orders += 1;
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
        save: true,
        ...(projectId ? { projectId: parseInt(projectId as string) } : {}),
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
    const { memberId, period, startDate, endDate, productName, platform, platformId, projectId } = req.query;

    if (!memberId) {
      return res.status(400).json({ error: "Member ID is required" });
    }

    // Build date filter
    let dateFilter: any = {};
    const now = new Date();

    switch (period) {
      case 'today': {
        const todayStart = new Date(now);
        todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date(now);
        todayEnd.setHours(23, 59, 59, 999);
        dateFilter = { gte: todayStart, lte: todayEnd };
        break;
      }
      case 'yesterday': {
        const yStart = new Date(now);
        yStart.setDate(yStart.getDate() - 1);
        yStart.setHours(0, 0, 0, 0);
        const yEnd = new Date(yStart);
        yEnd.setHours(23, 59, 59, 999);
        dateFilter = { gte: yStart, lte: yEnd };
        break;
      }
      case 'thisWeek': {
        const wStart = new Date(now);
        wStart.setDate(wStart.getDate() - wStart.getDay());
        wStart.setHours(0, 0, 0, 0);
        const wEnd = new Date(now);
        wEnd.setHours(23, 59, 59, 999);
        dateFilter = { gte: wStart, lte: wEnd };
        break;
      }
      case 'lastWeek': {
        const lwStart = new Date(now);
        lwStart.setDate(lwStart.getDate() - lwStart.getDay() - 7);
        lwStart.setHours(0, 0, 0, 0);
        const lwEnd = new Date(lwStart);
        lwEnd.setDate(lwEnd.getDate() + 6);
        lwEnd.setHours(23, 59, 59, 999);
        dateFilter = { gte: lwStart, lte: lwEnd };
        break;
      }
      case 'thisMonth': {
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
        dateFilter = { gte: monthStart, lte: monthEnd };
        break;
      }
      case 'lastMonth': {
        const lmStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lmEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
        dateFilter = { gte: lmStart, lte: lmEnd };
        break;
      }
      case 'thisYear': {
        const tyStart = new Date(now.getFullYear(), 0, 1);
        const tyEnd = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
        dateFilter = { gte: tyStart, lte: tyEnd };
        break;
      }
      case 'lastYear': {
        const lyStart = new Date(now.getFullYear() - 1, 0, 1);
        const lyEnd = new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59, 999);
        dateFilter = { gte: lyStart, lte: lyEnd };
        break;
      }
      case 'yearBeforeLast': {
        const yblStart = new Date(now.getFullYear() - 2, 0, 1);
        const yblEnd = new Date(now.getFullYear() - 2, 11, 31, 23, 59, 59, 999);
        dateFilter = { gte: yblStart, lte: yblEnd };
        break;
      }
      case 'custom':
        if (startDate && endDate) {
          const start = new Date(startDate as string);
          const end = new Date(endDate as string);
          start.setHours(0, 0, 0, 0);
          end.setHours(23, 59, 59, 999);
          dateFilter = { gte: start, lte: end };
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
        isSplitChild: false,
        ...platformFilter,
        ...(productName
          ? {
              product: {
                some: { productList: { name: productName as string } },
              },
            }
          : {}),
        ...(projectId ? { projectId: parseInt(projectId as string) } : {}),
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
        save: true,
        ...(projectId ? { projectId: parseInt(projectId as string) } : {}),
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

    const emptyDateEntry = () => ({
      income: 0,
      expense: 0,
      adsCost: 0,
      totalDiscount: 0,
      billLevelDiscount: 0,
      beforeDiscount: 0,
    });

    // Group bills by date
    const billsByDate = bills.reduce((acc: any, bill) => {
      const date = format(new Date(bill.purchaseAt), 'yyyy-MM-dd');
      if (!acc[date]) acc[date] = emptyDateEntry();
      acc[date].income += Number(bill.total);
      acc[date].totalDiscount += Number(bill.discount || 0);
      acc[date].billLevelDiscount += Number(bill.billLevelDiscount || 0);
      acc[date].beforeDiscount += Number(bill.beforeDiscount || 0);
      return acc;
    }, {});

    // Group expenses by date
    expenses.forEach(expense => {
      const date = format(new Date(expense.date), 'yyyy-MM-dd');
      if (!billsByDate[date]) billsByDate[date] = emptyDateEntry();
      billsByDate[date].expense += Number(expense.amount);
    });

    // Group ads costs by date (separate from expense)
    adsCosts.forEach(adsCost => {
      const date = format(new Date(adsCost.date), 'yyyy-MM-dd');
      if (!billsByDate[date]) billsByDate[date] = emptyDateEntry();
      billsByDate[date].adsCost += Number(adsCost.adsCost);
    });

    // Convert to array format
    const chartData = Object.keys(billsByDate).map(date => ({
      date,
      income: billsByDate[date].income,
      expense: billsByDate[date].expense,
      adsCost: billsByDate[date].adsCost,
      profit: billsByDate[date].income - billsByDate[date].expense - billsByDate[date].adsCost,
      totalDiscount: billsByDate[date].totalDiscount,
      billLevelDiscount: billsByDate[date].billLevelDiscount,
      beforeDiscount: billsByDate[date].beforeDiscount,
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
  const { memberId, period, startDate, endDate, productName, platform, platformId, projectId, limit = 5 } = req.query;

    if (!memberId) {
      return res.status(400).json({ error: "Member ID is required" });
    }

    // Build date filter
    let dateFilter: any = {};
    const now = new Date();

    switch (period) {
      case 'today': {
        const todayStart = new Date(now);
        todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date(now);
        todayEnd.setHours(23, 59, 59, 999);
        dateFilter = { gte: todayStart, lte: todayEnd };
        break;
      }
      case 'yesterday': {
        const yStart = new Date(now);
        yStart.setDate(yStart.getDate() - 1);
        yStart.setHours(0, 0, 0, 0);
        const yEnd = new Date(yStart);
        yEnd.setHours(23, 59, 59, 999);
        dateFilter = { gte: yStart, lte: yEnd };
        break;
      }
      case 'thisWeek': {
        const wStart = new Date(now);
        wStart.setDate(wStart.getDate() - wStart.getDay());
        wStart.setHours(0, 0, 0, 0);
        const wEnd = new Date(now);
        wEnd.setHours(23, 59, 59, 999);
        dateFilter = { gte: wStart, lte: wEnd };
        break;
      }
      case 'lastWeek': {
        const lwStart = new Date(now);
        lwStart.setDate(lwStart.getDate() - lwStart.getDay() - 7);
        lwStart.setHours(0, 0, 0, 0);
        const lwEnd = new Date(lwStart);
        lwEnd.setDate(lwEnd.getDate() + 6);
        lwEnd.setHours(23, 59, 59, 999);
        dateFilter = { gte: lwStart, lte: lwEnd };
        break;
      }
      case 'thisMonth': {
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
        dateFilter = { gte: monthStart, lte: monthEnd };
        break;
      }
      case 'lastMonth': {
        const lmStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lmEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
        dateFilter = { gte: lmStart, lte: lmEnd };
        break;
      }
      case 'thisYear': {
        const tyStart = new Date(now.getFullYear(), 0, 1);
        const tyEnd = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
        dateFilter = { gte: tyStart, lte: tyEnd };
        break;
      }
      case 'lastYear': {
        const lyStart = new Date(now.getFullYear() - 1, 0, 1);
        const lyEnd = new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59, 999);
        dateFilter = { gte: lyStart, lte: lyEnd };
        break;
      }
      case 'yearBeforeLast': {
        const yblStart = new Date(now.getFullYear() - 2, 0, 1);
        const yblEnd = new Date(now.getFullYear() - 2, 11, 31, 23, 59, 59, 999);
        dateFilter = { gte: yblStart, lte: yblEnd };
        break;
      }
      case 'custom':
        if (startDate && endDate) {
          const start = new Date(startDate as string);
          const end = new Date(endDate as string);
          start.setHours(0, 0, 0, 0);
          end.setHours(23, 59, 59, 999);
          dateFilter = { gte: start, lte: end };
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
        //DocumentType: "Receipt",
        deleted: false,
        purchaseAt: dateFilter,
        isSplitChild: false,
        ...platformFilter,
        ...(productName
          ? {
              product: {
                some: { productList: { name: productName as string } },
              },
            }
          : {}),
        ...(projectId ? { projectId: parseInt(projectId as string) } : {}),
      },
      select: {
        billLevelDiscount: true,
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

    // Flatten all product items with discount consideration (including proportional bill-level discount)
    const allProductItems = bills.flatMap(bill => {
      const billLevelDiscount = Number(bill.billLevelDiscount || 0);
      const billGrossRevenue = bill.product.reduce((sum, item) =>
        sum + Number(item.unitPrice) * Number(item.quantity), 0);
      return bill.product.map(item => {
        const grossRevenue = Number(item.unitPrice) * Number(item.quantity);
        const proportion = billGrossRevenue > 0 ? grossRevenue / billGrossRevenue : 0;
        return {
          productName: item.productList?.name ?? String(item.product),
          quantity: Number(item.quantity),
          unitPrice: Number(item.unitPrice),
          unitDiscount: Number(item.unitDiscount || 0),
          unit: item.unit || "Unit",
          proportionalBillDiscount: proportion * billLevelDiscount
        };
      });
    });
    // Aggregate by product name (account for unit discounts and bill-level discount)
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
      // Calculate revenue after unit discount and proportional bill-level discount
      const grossRevenue = item.unitPrice * item.quantity;
      const discountAmount = item.unitDiscount * item.quantity;
      const netRevenue = grossRevenue - discountAmount - item.proportionalBillDiscount;

      productMetrics[item.productName].revenue += netRevenue;
      productMetrics[item.productName].sales += item.quantity;
      productMetrics[item.productName].orders += 1;
      productMetrics[item.productName].totalDiscount += discountAmount + item.proportionalBillDiscount;
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
    const { memberId, period, startDate, endDate, productName, projectId } = req.query;

    if (!memberId) {
      return res.status(400).json({ error: "Member ID is required" });
    }

    // Build date filter
    let dateFilter: any = {};
    const now = new Date();

    switch (period) {
      case 'today': {
        const todayStart = new Date(now);
        todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date(now);
        todayEnd.setHours(23, 59, 59, 999);
        dateFilter = { gte: todayStart, lte: todayEnd };
        break;
      }
      case 'yesterday': {
        const yStart = new Date(now);
        yStart.setDate(yStart.getDate() - 1);
        yStart.setHours(0, 0, 0, 0);
        const yEnd = new Date(yStart);
        yEnd.setHours(23, 59, 59, 999);
        dateFilter = { gte: yStart, lte: yEnd };
        break;
      }
      case 'thisWeek': {
        const wStart = new Date(now);
        wStart.setDate(wStart.getDate() - wStart.getDay());
        wStart.setHours(0, 0, 0, 0);
        const wEnd = new Date(now);
        wEnd.setHours(23, 59, 59, 999);
        dateFilter = { gte: wStart, lte: wEnd };
        break;
      }
      case 'lastWeek': {
        const lwStart = new Date(now);
        lwStart.setDate(lwStart.getDate() - lwStart.getDay() - 7);
        lwStart.setHours(0, 0, 0, 0);
        const lwEnd = new Date(lwStart);
        lwEnd.setDate(lwEnd.getDate() + 6);
        lwEnd.setHours(23, 59, 59, 999);
        dateFilter = { gte: lwStart, lte: lwEnd };
        break;
      }
      case 'thisMonth': {
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
        dateFilter = { gte: monthStart, lte: monthEnd };
        break;
      }
      case 'lastMonth': {
        const lmStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lmEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
        dateFilter = { gte: lmStart, lte: lmEnd };
        break;
      }
      case 'thisYear': {
        const tyStart = new Date(now.getFullYear(), 0, 1);
        const tyEnd = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
        dateFilter = { gte: tyStart, lte: tyEnd };
        break;
      }
      case 'lastYear': {
        const lyStart = new Date(now.getFullYear() - 1, 0, 1);
        const lyEnd = new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59, 999);
        dateFilter = { gte: lyStart, lte: lyEnd };
        break;
      }
      case 'yearBeforeLast': {
        const yblStart = new Date(now.getFullYear() - 2, 0, 1);
        const yblEnd = new Date(now.getFullYear() - 2, 11, 31, 23, 59, 59, 999);
        dateFilter = { gte: yblStart, lte: yblEnd };
        break;
      }
      case 'custom':
        if (startDate && endDate) {
          const start = new Date(startDate as string);
          const end = new Date(endDate as string);
          start.setHours(0, 0, 0, 0);
          end.setHours(23, 59, 59, 999);
          dateFilter = { gte: start, lte: end };
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
        //DocumentType: "Receipt",
        purchaseAt: dateFilter,
         isSplitChild: false, // Exclude split child bills to avoid duplicates
        ...(projectId ? { projectId: parseInt(projectId as string) } : {}),
      },
      select: {
        platform: true,
        billLevelDiscount: true,
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

    // Flatten all product items with platform and discount info (including proportional bill-level discount)
    const allProductItems = platformBills.flatMap(bill => {
      const billLevelDiscount = Number(bill.billLevelDiscount || 0);
      const billGrossRevenue = bill.product.reduce((sum, item) =>
        sum + Number(item.unitPrice) * Number(item.quantity), 0);
      return bill.product.map(item => {
        const grossRevenue = Number(item.unitPrice) * Number(item.quantity);
        const proportion = billGrossRevenue > 0 ? grossRevenue / billGrossRevenue : 0;
        return {
          platform: bill.platform,
          productName: item.productList?.name ?? String(item.product),
          quantity: Number(item.quantity),
          unitPrice: Number(item.unitPrice),
          unitDiscount: Number(item.unitDiscount || 0),
          proportionalBillDiscount: proportion * billLevelDiscount
        };
      });
    });    // Optionally filter by productName
    const filteredItems = productName ? allProductItems.filter(item => item.productName === productName) : allProductItems;

    // Aggregate by platform (account for unit discounts and bill-level discount)
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
      // Calculate revenue after unit discount and proportional bill-level discount
      const grossRevenue = item.unitPrice * item.quantity;
      const discountAmount = item.unitDiscount * item.quantity;
      const netRevenue = grossRevenue - discountAmount - item.proportionalBillDiscount;

      platformMetrics[item.platform].revenue += netRevenue;
      platformMetrics[item.platform].sales += item.quantity;
      platformMetrics[item.platform].orders += 1;
      platformMetrics[item.platform].totalDiscount += discountAmount + item.proportionalBillDiscount;
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
    const { memberId, period, startDate, endDate, projectId } = req.query;

    if (!memberId) {
      return res.status(400).json({ error: "Member ID is required" });
    }

    // Build date filter
    let dateFilter: any = {};
    const now = new Date();

    switch (period) {
      case 'today': {
        const todayStart = new Date(now);
        todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date(now);
        todayEnd.setHours(23, 59, 59, 999);
        dateFilter = { gte: todayStart, lte: todayEnd };
        break;
      }
      case 'yesterday': {
        const yStart = new Date(now);
        yStart.setDate(yStart.getDate() - 1);
        yStart.setHours(0, 0, 0, 0);
        const yEnd = new Date(yStart);
        yEnd.setHours(23, 59, 59, 999);
        dateFilter = { gte: yStart, lte: yEnd };
        break;
      }
      case 'thisWeek': {
        const wStart = new Date(now);
        wStart.setDate(wStart.getDate() - wStart.getDay());
        wStart.setHours(0, 0, 0, 0);
        const wEnd = new Date(now);
        wEnd.setHours(23, 59, 59, 999);
        dateFilter = { gte: wStart, lte: wEnd };
        break;
      }
      case 'lastWeek': {
        const lwStart = new Date(now);
        lwStart.setDate(lwStart.getDate() - lwStart.getDay() - 7);
        lwStart.setHours(0, 0, 0, 0);
        const lwEnd = new Date(lwStart);
        lwEnd.setDate(lwEnd.getDate() + 6);
        lwEnd.setHours(23, 59, 59, 999);
        dateFilter = { gte: lwStart, lte: lwEnd };
        break;
      }
      case 'thisMonth': {
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
        dateFilter = { gte: monthStart, lte: monthEnd };
        break;
      }
      case 'lastMonth': {
        const lmStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lmEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
        dateFilter = { gte: lmStart, lte: lmEnd };
        break;
      }
      case 'thisYear': {
        const tyStart = new Date(now.getFullYear(), 0, 1);
        const tyEnd = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
        dateFilter = { gte: tyStart, lte: tyEnd };
        break;
      }
      case 'lastYear': {
        const lyStart = new Date(now.getFullYear() - 1, 0, 1);
        const lyEnd = new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59, 999);
        dateFilter = { gte: lyStart, lte: lyEnd };
        break;
      }
      case 'yearBeforeLast': {
        const yblStart = new Date(now.getFullYear() - 2, 0, 1);
        const yblEnd = new Date(now.getFullYear() - 2, 11, 31, 23, 59, 59, 999);
        dateFilter = { gte: yblStart, lte: yblEnd };
        break;
      }
      case 'custom':
        if (startDate && endDate) {
          const start = new Date(startDate as string);
          const end = new Date(endDate as string);
          start.setHours(0, 0, 0, 0);
          end.setHours(23, 59, 59, 999);
          dateFilter = { gte: start, lte: end };
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
        save: true,
        ...(projectId ? { projectId: parseInt(projectId as string) } : {}),
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

// Get Expense by Custom Group
export const getExpenseByCustomGroup = async (req: Request, res: Response) => {
  try {
    const { memberId, period, startDate, endDate, projectId, groupBy = 'customGroup' } = req.query;

    if (!memberId) {
      return res.status(400).json({ error: "Member ID is required" });
    }

    let dateFilter: any = {};
    const now = new Date();

    switch (period) {
      case 'today': {
        const todayStart = new Date(now);
        todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date(now);
        todayEnd.setHours(23, 59, 59, 999);
        dateFilter = { gte: todayStart, lte: todayEnd };
        break;
      }
      case 'yesterday': {
        const yStart = new Date(now);
        yStart.setDate(yStart.getDate() - 1);
        yStart.setHours(0, 0, 0, 0);
        const yEnd = new Date(yStart);
        yEnd.setHours(23, 59, 59, 999);
        dateFilter = { gte: yStart, lte: yEnd };
        break;
      }
      case 'thisWeek': {
        const wStart = new Date(now);
        wStart.setDate(wStart.getDate() - wStart.getDay());
        wStart.setHours(0, 0, 0, 0);
        const wEnd = new Date(now);
        wEnd.setHours(23, 59, 59, 999);
        dateFilter = { gte: wStart, lte: wEnd };
        break;
      }
      case 'lastWeek': {
        const lwStart = new Date(now);
        lwStart.setDate(lwStart.getDate() - lwStart.getDay() - 7);
        lwStart.setHours(0, 0, 0, 0);
        const lwEnd = new Date(lwStart);
        lwEnd.setDate(lwEnd.getDate() + 6);
        lwEnd.setHours(23, 59, 59, 999);
        dateFilter = { gte: lwStart, lte: lwEnd };
        break;
      }
      case 'thisMonth': {
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
        dateFilter = { gte: monthStart, lte: monthEnd };
        break;
      }
      case 'lastMonth': {
        const lmStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lmEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
        dateFilter = { gte: lmStart, lte: lmEnd };
        break;
      }
      case 'thisYear': {
        const tyStart = new Date(now.getFullYear(), 0, 1);
        const tyEnd = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
        dateFilter = { gte: tyStart, lte: tyEnd };
        break;
      }
      case 'lastYear': {
        const lyStart = new Date(now.getFullYear() - 1, 0, 1);
        const lyEnd = new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59, 999);
        dateFilter = { gte: lyStart, lte: lyEnd };
        break;
      }
      case 'yearBeforeLast': {
        const yblStart = new Date(now.getFullYear() - 2, 0, 1);
        const yblEnd = new Date(now.getFullYear() - 2, 11, 31, 23, 59, 59, 999);
        dateFilter = { gte: yblStart, lte: yblEnd };
        break;
      }
      case 'custom': {
        if (startDate && endDate) {
          const start = new Date(startDate as string);
          const end = new Date(endDate as string);
          start.setHours(0, 0, 0, 0);
          end.setHours(23, 59, 59, 999);
          dateFilter = { gte: start, lte: end };
        }
        break;
      }
    }

    const businessId = await prisma.member.findUnique({
      where: { uniqueId: memberId as string },
      select: { businessId: true },
    });

    const projectFilter = projectId ? { projectId: parseInt(projectId as string) } : {};
    const baseExpenseWhere = {
      businessAcc: businessId?.businessId ?? 0,
      deleted: false,
      save: true,
      date: dateFilter,
      ...projectFilter,
    };

    const [totalAgg, groupedExpenses, allExpenses] = await Promise.all([
      prisma.expense.aggregate({
        where: baseExpenseWhere,
        _sum: { amount: true },
      }),
      groupBy === 'note'
        ? prisma.expense.findMany({
            where: baseExpenseWhere,
            select: { note: true, amount: true },
          })
        : groupBy === 'group'
        ? prisma.expense.findMany({
            where: { ...baseExpenseWhere, group: { not: null } },
            select: { group: true, amount: true },
          })
        : prisma.expense.findMany({
            where: {
              ...baseExpenseWhere,
              customGroup: { not: null },
              AND: [{ customGroup: { not: "" } }],
            },
            select: { customGroup: true, amount: true },
          }),
      // Fallback for customGroup mode when projectId set and no customGroups exist
      groupBy === 'customGroup' && projectId
        ? prisma.expense.findMany({
            where: baseExpenseWhere,
            select: { sName: true, desc: true, amount: true },
          })
        : Promise.resolve([] as { sName: string | null; desc: string | null; amount: any }[]),
    ]);

    const total = totalAgg._sum.amount?.toNumber() ?? 0;

    const groupMap: Record<string, number> = {};

    if (groupBy === 'note') {
      for (const e of groupedExpenses as { note: string | null; amount: any }[]) {
        const key = e.note?.trim() || "No note";
        groupMap[key] = (groupMap[key] ?? 0) + Number(e.amount);
      }
    } else if (groupBy === 'group') {
      for (const e of groupedExpenses as { group: string | null; amount: any }[]) {
        const key = e.group || "Other";
        groupMap[key] = (groupMap[key] ?? 0) + Number(e.amount);
      }
    } else if ((groupedExpenses as any[]).length > 0) {
      for (const e of groupedExpenses as { customGroup: string | null; amount: any }[]) {
        const key = e.customGroup!.trim();
        groupMap[key] = (groupMap[key] ?? 0) + Number(e.amount);
      }
    } else if (projectId && (allExpenses as any[]).length > 0) {
      for (const e of allExpenses as { sName: string | null; desc: string | null; amount: any }[]) {
        const key = e.sName?.trim() || e.desc?.trim() || "Other";
        groupMap[key] = (groupMap[key] ?? 0) + Number(e.amount);
      }
    }

    const namedTotal = Object.values(groupMap).reduce((sum, v) => sum + v, 0);
    const othersAmount = total - namedTotal;

    const named = Object.entries(groupMap).map(([group, amount]) => ({
      group,
      amount,
      percentage: total > 0 ? Math.round((amount / total) * 1000) / 10 : 0,
    })).sort((a, b) => b.amount - a.amount);

    const result = othersAmount > 0.01
      ? [...named, {
          group: "Others",
          amount: othersAmount,
          percentage: total > 0 ? Math.round((othersAmount / total) * 1000) / 10 : 0,
        }]
      : named;

    res.json({ data: result, total });
  } catch (error) {
    console.error("Error fetching expense by custom group:", error);
    res.status(500).json({ error: "Failed to fetch expense by custom group" });
  }
};

// Get Accounts Payable and Receivable
export const getAccountsPayableReceivable = async (req: Request, res: Response) => {
  try {
    const { memberId, period, startDate, endDate, projectId } = req.query;

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
        //DocumentType: "Invoice",
        purchaseAt: dateFilter,
        isSplitChild: false, // Exclude split child bills to avoid duplicates
        ...(projectId ? { projectId: parseInt(projectId as string) } : {}),
      },
      select: { totalInvoice: true },
    });

    const accountsPayable = invoiceBills.reduce(
      (sum, bill) => sum + Number(bill.totalInvoice || 0),
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
        ...(projectId ? { projectId: parseInt(projectId as string) } : {}),
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

// Get Income / Expense Detail Lists
export const getIncomeExpenseDetail = async (req: Request, res: Response) => {
  try {
    const { memberId, period, startDate, endDate, productName, platform, projectId } = req.query;

    if (!memberId) {
      return res.status(400).json({ error: "Member ID is required" });
    }

    let dateFilter: any = {};
    const now = new Date();

    switch (period) {
      case 'today': {
        const s = new Date(now); s.setHours(0, 0, 0, 0);
        const e = new Date(now); e.setHours(23, 59, 59, 999);
        dateFilter = { gte: s, lte: e };
        break;
      }
      case 'yesterday': {
        const s = new Date(now); s.setDate(s.getDate() - 1); s.setHours(0, 0, 0, 0);
        const e = new Date(s); e.setHours(23, 59, 59, 999);
        dateFilter = { gte: s, lte: e };
        break;
      }
      case 'thisWeek': {
        const s = new Date(now); s.setDate(s.getDate() - s.getDay()); s.setHours(0, 0, 0, 0);
        const e = new Date(now); e.setHours(23, 59, 59, 999);
        dateFilter = { gte: s, lte: e };
        break;
      }
      case 'lastWeek': {
        const s = new Date(now); s.setDate(s.getDate() - s.getDay() - 7); s.setHours(0, 0, 0, 0);
        const e = new Date(s); e.setDate(e.getDate() + 6); e.setHours(23, 59, 59, 999);
        dateFilter = { gte: s, lte: e };
        break;
      }
      case 'thisMonth': {
        dateFilter = {
          gte: new Date(now.getFullYear(), now.getMonth(), 1),
          lte: new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999),
        };
        break;
      }
      case 'lastMonth': {
        dateFilter = {
          gte: new Date(now.getFullYear(), now.getMonth() - 1, 1),
          lte: new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999),
        };
        break;
      }
      case 'thisYear': {
        dateFilter = {
          gte: new Date(now.getFullYear(), 0, 1),
          lte: new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999),
        };
        break;
      }
      case 'lastYear': {
        dateFilter = {
          gte: new Date(now.getFullYear() - 1, 0, 1),
          lte: new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59, 999),
        };
        break;
      }
      case 'yearBeforeLast': {
        dateFilter = {
          gte: new Date(now.getFullYear() - 2, 0, 1),
          lte: new Date(now.getFullYear() - 2, 11, 31, 23, 59, 59, 999),
        };
        break;
      }
      case 'custom': {
        if (startDate && endDate) {
          const s = new Date(startDate as string); s.setHours(0, 0, 0, 0);
          const e = new Date(endDate as string); e.setHours(23, 59, 59, 999);
          dateFilter = { gte: s, lte: e };
        }
        break;
      }
    }

    const businessId = await prisma.member.findUnique({
      where: { uniqueId: memberId as string },
      select: { businessId: true },
    });

    const biz = businessId?.businessId ?? 0;

    // Income: all bills (matching main metrics — no DocumentType filter)
    const bills = await prisma.bill.findMany({
      where: {
        businessAcc: biz,
        deleted: false,
        purchaseAt: Object.keys(dateFilter).length ? dateFilter : undefined,
        ...(platform ? { platform: platform as any } : {}),
        ...(productName ? { product: { some: { productList: { name: productName as string } } } } : {}),
        isSplitChild: false, // Exclude split child bills to avoid duplicates
        ...(projectId ? { projectId: parseInt(projectId as string) } : {}),
      },
      select: {
        id: true,
        cName: true,
        cLastName: true,
        purchaseAt: true,
        total: true,
        note: true,
        platform: true,
      },
      orderBy: { purchaseAt: 'desc' },
    });

    // Expense: saved expenses (excluding Invoice type, excluding zero amount)
    const expenses = await prisma.expense.findMany({
      where: {
        businessAcc: biz,
        deleted: false,
        save: true,
        date: Object.keys(dateFilter).length ? dateFilter : undefined,
        amount: { gt: 0 },
        ...(projectId ? { projectId: parseInt(projectId as string) } : {}),
      },
      select: {
        id: true,
        sName: true,
        date: true,
        amount: true,
        note: true,
        desc: true,
      },
      orderBy: { date: 'desc' },
    });

    res.json({
      bills: bills.map((b) => ({
        id: b.id,
        name: [b.cName, b.cLastName].filter(Boolean).join(' '),
        date: b.purchaseAt,
        amount: Number(b.total || 0),
        note: b.note ?? null,
        platform: b.platform,
      })),
      expenses: expenses.map((e) => ({
        id: e.id,
        name: e.sName ?? null,
        date: e.date,
        amount: Number(e.amount || 0),
        note: e.note ?? null,
        desc: e.desc ?? null,
      })),
    });
  } catch (error) {
    console.error("Error fetching income/expense detail:", error);
    res.status(500).json({ error: "Failed to fetch income/expense detail" });
  }
};

// Get Accounts Payable/Receivable Detail Lists
export const getAPARDetail = async (req: Request, res: Response) => {
  try {
    const { memberId, period, startDate, endDate, projectId } = req.query;

    if (!memberId) {
      return res.status(400).json({ error: "Member ID is required" });
    }

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

    // Invoice Bills: customers owe you (Accounts Receivable)
    // Include: standalone bills (no split group) + all split children
    // Exclude: split parent bills (they have children and total=0)
    const invoiceBills = await prisma.bill.findMany({
      where: {
        businessAcc: businessId?.businessId ?? 0,
        deleted: false,
        purchaseAt: Object.keys(dateFilter).length ? dateFilter : undefined,
        totalInvoice: { gt: 0 },
        OR: [
          { isSplitChild: true },
          { isSplitChild: false, splitGroupId: null },
        ],
        ...(projectId ? { projectId: parseInt(projectId as string) } : {}),
      },
      select: {
        id: true,
        cName: true,
        cLastName: true,
        purchaseAt: true,
        totalInvoice: true,
        priceValid: true,
        note: true,
        invoiceId: true,
      },
      orderBy: { purchaseAt: 'desc' },
    });

    // Invoice Expenses: you owe suppliers (Accounts Payable)
    const invoiceExpenses = await prisma.expense.findMany({
      where: {
        businessAcc: businessId?.businessId ?? 0,
        deleted: false,
        DocumentType: "Invoice",
        date: Object.keys(dateFilter).length ? dateFilter : undefined,
        save: true,
        ...(projectId ? { projectId: parseInt(projectId as string) } : {}),
      },
      select: {
        id: true,
        sName: true,
        date: true,
        debtAmount: true,
        dueDate: true,
        note: true,
      },
      orderBy: { date: 'desc' },
    });

    console.log("Invoice Bills:", invoiceBills);

    res.json({
      invoiceBills: invoiceBills.map((b) => ({
        id: b.id,
        name: [b.cName, b.cLastName].filter(Boolean).join(' '),
        date: b.purchaseAt,
        amount: Number(b.totalInvoice || 0),
        dueDate: b.priceValid ?? null,
        note: b.note ?? null,
        invoiceId: b.invoiceId ?? null,
      })),
      invoiceExpenses: invoiceExpenses.map((e) => ({
        id: e.id,
        name: e.sName ?? null,
        date: e.date,
        amount: Number(e.debtAmount || 0),
        dueDate: e.dueDate ?? null,
        note: e.note ?? null,
      })),
    });
  } catch (error) {
    console.error("Error fetching AP/AR detail:", error);
    res.status(500).json({ error: "Failed to fetch AP/AR detail" });
  }
};

// Get Top Platforms (multi-product support)
export const getTopStores = async (req: Request, res: Response) => {
  try {
    const { memberId, period, startDate, endDate, productName, platform, platformId, projectId, limit = 5 } = req.query;

    if (!memberId) {
      return res.status(400).json({ error: "Member ID is required" });
    }

    // Build date filter
    let dateFilter: any = {};
    const now = new Date();

    switch (period) {
      case 'today': {
        const todayStart = new Date(now);
        todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date(now);
        todayEnd.setHours(23, 59, 59, 999);
        dateFilter = { gte: todayStart, lte: todayEnd };
        break;
      }
      case 'yesterday': {
        const yStart = new Date(now);
        yStart.setDate(yStart.getDate() - 1);
        yStart.setHours(0, 0, 0, 0);
        const yEnd = new Date(yStart);
        yEnd.setHours(23, 59, 59, 999);
        dateFilter = { gte: yStart, lte: yEnd };
        break;
      }
      case 'thisWeek': {
        const wStart = new Date(now);
        wStart.setDate(wStart.getDate() - wStart.getDay());
        wStart.setHours(0, 0, 0, 0);
        const wEnd = new Date(now);
        wEnd.setHours(23, 59, 59, 999);
        dateFilter = { gte: wStart, lte: wEnd };
        break;
      }
      case 'lastWeek': {
        const lwStart = new Date(now);
        lwStart.setDate(lwStart.getDate() - lwStart.getDay() - 7);
        lwStart.setHours(0, 0, 0, 0);
        const lwEnd = new Date(lwStart);
        lwEnd.setDate(lwEnd.getDate() + 6);
        lwEnd.setHours(23, 59, 59, 999);
        dateFilter = { gte: lwStart, lte: lwEnd };
        break;
      }
      case 'thisMonth': {
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
        dateFilter = { gte: monthStart, lte: monthEnd };
        break;
      }
      case 'lastMonth': {
        const lmStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lmEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
        dateFilter = { gte: lmStart, lte: lmEnd };
        break;
      }
      case 'thisYear': {
        const tyStart = new Date(now.getFullYear(), 0, 1);
        const tyEnd = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
        dateFilter = { gte: tyStart, lte: tyEnd };
        break;
      }
      case 'lastYear': {
        const lyStart = new Date(now.getFullYear() - 1, 0, 1);
        const lyEnd = new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59, 999);
        dateFilter = { gte: lyStart, lte: lyEnd };
        break;
      }
      case 'yearBeforeLast': {
        const yblStart = new Date(now.getFullYear() - 2, 0, 1);
        const yblEnd = new Date(now.getFullYear() - 2, 11, 31, 23, 59, 59, 999);
        dateFilter = { gte: yblStart, lte: yblEnd };
        break;
      }
      case 'custom':
        if (startDate && endDate) {
          const start = new Date(startDate as string);
          const end = new Date(endDate as string);
          start.setHours(0, 0, 0, 0);
          end.setHours(23, 59, 59, 999);
          dateFilter = { gte: start, lte: end };
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
        //DocumentType: "Receipt",
        deleted: false,
        purchaseAt: dateFilter,
        ...platformFilter,
        isSplitChild: false, // Exclude split child bills to avoid duplicates
        ...(projectId ? { projectId: parseInt(projectId as string) } : {}),
      },
      select: {
        platform: true,
        platformId: true,
        billLevelDiscount: true,
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

    // Flatten all product items with platform identifiers and discount info (including proportional bill-level discount)
    const allProductItems = bills.flatMap(bill => {
      const billLevelDiscount = Number(bill.billLevelDiscount || 0);
      const billGrossRevenue = bill.product.reduce((sum, item) =>
        sum + Number(item.unitPrice) * Number(item.quantity), 0);
      return bill.product.map(item => {
        const grossRevenue = Number(item.unitPrice) * Number(item.quantity);
        const proportion = billGrossRevenue > 0 ? grossRevenue / billGrossRevenue : 0;
        return {
          platformId: bill.platformId ?? null,
          platformLabel: bill.platform ?? null,
          productName: item.productList?.name ?? String(item.product),
          quantity: Number(item.quantity),
          unitPrice: Number(item.unitPrice),
          unitDiscount: Number(item.unitDiscount || 0),
          unit: item.unit || 'Unit',
          proportionalBillDiscount: proportion * billLevelDiscount
        };
      });
    });

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

      // Calculate revenue after unit discount and proportional bill-level discount
      const grossRevenue = item.unitPrice * item.quantity;
      const discountAmount = item.unitDiscount * item.quantity;
      const netRevenue = grossRevenue - discountAmount - item.proportionalBillDiscount;

      platformMetrics[key].revenue += netRevenue;
      platformMetrics[key].sales += item.quantity;
      platformMetrics[key].orders += 1;
      platformMetrics[key].totalDiscount += discountAmount + item.proportionalBillDiscount;
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