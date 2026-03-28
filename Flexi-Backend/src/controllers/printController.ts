import { Request, Response } from "express";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { PrismaClient as PrismaClient1 } from "../generated/client1/client";
import { console } from "inspector";
import { flexiDBPrismaClient } from "../../lib/PrismaClient1";

const prisma = flexiDBPrismaClient;

// Get monthly report data
export const getMonthlyReport = async (req: Request, res: Response) => {
  try {
    const { memberId, year, month } = req.query;

    if (!memberId) {
      return res.status(400).json({ error: "Member ID is required" });
    }

    // Parse year and month from query params
    const reportYear = parseInt(year as string) || new Date().getFullYear();
    const reportMonth = parseInt(month as string) || new Date().getMonth() + 1;

    // Create date range for the month
    const startDate = startOfMonth(new Date(reportYear, reportMonth - 1));
    const endDate = endOfMonth(new Date(reportYear, reportMonth - 1));

    // Format dates for the query
    const formattedStartDate = format(startDate, "yyyy-MM-dd");
    const formattedEndDate = format(endDate, "yyyy-MM-dd");

    // Find business ID by member ID from member table
    const businessId = await prisma.member.findUnique({
      where : { uniqueId: String(memberId) },
      select:{ businessId: true },
    });

    // Get all bills for the member within the date range
    const bills = await prisma.bill.findMany({
      where: {       
        businessAcc : businessId?.businessId ?? 0,
        purchaseAt: {
          gte: new Date(formattedStartDate),
          lte: new Date(formattedEndDate),
        },
      },
      orderBy: {
        purchaseAt: "desc",
      },
      include: {
        product: {
          include: {
            productList: {
              select: { name: true },
            },
          },
        },
      },
    });

    console.log("🚀 Monthly Report - Bills Data:", bills);

//  find tatal sales from total in bills table
    const totalSales = bills.reduce((sum, bill) => Number(bill.total) + sum, 0);
    const paidBills = bills.filter((bill) => bill.cashStatus);
    const unpaidBills = bills.filter((bill) => !bill.cashStatus);

    const reportStats = {
      totalSales: totalSales,
      totalOrders: bills.length,
      paidOrders: paidBills.length,
      unpaidOrders: unpaidBills.length,
      averageOrderValue: bills.length > 0 ? totalSales / bills.length : 0,
      bills,
    };

    console.log("🚀 Monthly Report Data:", reportStats);
  

    return res.status(200).json(reportStats);
  } catch (error) {
    console.error("Error generating monthly report:", error);
    return res.status(500).json({ error: "Failed to generate monthly report" });
  }
};

// Get bills by date range
export const getBillsByDateRange = async (req: Request, res: Response) => {
  try {
    const { memberId, startDate, endDate } = req.query;

    if (!memberId || !startDate || !endDate) {
      return res.status(400).json({
        error: "Member ID, start date, and end date are required",
      });
    }

    console.log("startDate:", startDate, "endDate:", endDate);

    // Ensure full day coverage for the date range
    const start = new Date(`${startDate}T00:00:00.000Z`);
    const end = new Date(`${endDate}T23:59:59.999Z`);
    // Find business ID by member ID from member table
    const businessId = await prisma.member.findUnique({
      where : { uniqueId: String(memberId) },
      select:{ businessId: true },
    });
    // Get ALL bills in date range (for summary calculations)
    const allBills = await prisma.bill.findMany({
      where: {
        businessAcc: businessId?.businessId ?? 0,
        purchaseAt: { gte: start, lte: end },
      },
      orderBy: { purchaseAt: "desc" },
      include: {
        product: {
          include: { productList: { select: { name: true } } },
        },
      },
    });

    // Build a lookup: parent flexiId → parent quotationId
    const parentQuotationIdMap = new Map<string, string | null>();
    allBills.forEach((b: any) => {
      if (!b.isSplitChild && b.flexiId) {
        parentQuotationIdMap.set(b.flexiId, b.quotationId ?? null);
      }
    });

    // Collect unique splitGroupIds from child bills to fetch all siblings
    const childSplitGroupIds = [
      ...new Set(
        allBills
          .filter((b: any) => b.isSplitChild && b.splitGroupId)
          .map((b: any) => b.splitGroupId as string),
      ),
    ];

    // Fetch ALL siblings for those groups (may be outside the date range)
    const siblingsMap = new Map<string, any[]>();
    if (childSplitGroupIds.length > 0) {
      const allSiblings = await (prisma.bill as any).findMany({
        where: {
          splitGroupId: { in: childSplitGroupIds },
          isSplitChild: true,
        },
        select: { id: true, splitPercent: true, totalInvoice: true, DocumentType: true, splitGroupId: true, cashStatus: true },
      });
      childSplitGroupIds.forEach((groupId) => {
        siblingsMap.set(
          groupId,
          allSiblings.filter((s: any) => s.splitGroupId === groupId),
        );
      });
    }

    // Keep only child bills (isSplitChild === true) and regular bills (no splitGroupId)
    // Attach parentQuotationId + splitSiblings to child bills
    const bills = allBills
      .filter((b: any) => b.isSplitChild === true || b.splitGroupId === null)
      .map((b: any) => ({
        ...b,
        parentQuotationId: b.isSplitChild && b.splitGroupId
          ? parentQuotationIdMap.get(b.splitGroupId) ?? null
          : null,
        splitSiblings: b.isSplitChild && b.splitGroupId
          ? siblingsMap.get(b.splitGroupId) ?? []
          : [],
      }));

    // totalSale from ALL bills (parent + child)
    const totalSale = allBills.reduce((sum, b) => sum + Number(b.total || 0), 0);

    // amount + parentBills: count only parent/non-child bills (isSplitChild === false)
    const parentBills = allBills.filter((b: any) => !b.isSplitChild);
    const paidParentCount = parentBills.filter((b) => b.cashStatus).length;
    const amount = `${paidParentCount}/${parentBills.length}`;

    // accountReceivable: totalInvoice of parent + non-child bills only
    const accountReceivable = parentBills.reduce((sum, b) => sum + Number((b as any).totalInvoice || 0), 0);

    // averageSale: (totalSale + totalInvoice of ALL bills) / parentBills count
    const totalInvoiceAll = allBills.reduce((sum, b) => sum + Number((b as any).totalInvoice || 0), 0);
    const averageSale = parentBills.length > 0 ? (totalSale + totalInvoiceAll) / parentBills.length : 0;

    // Total expenses in the date range
    const expenses = await prisma.expense.findMany({
      where: {
        businessAcc: businessId?.businessId ?? 0,
        date: { gte: start, lte: end },
        save: true,
      },
      select: { amount: true },
    });
    const totalExpense = expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);

    // Ads spend in the date range
    const adsCosts = await prisma.adsCost.findMany({
      where: {
        businessAcc: businessId?.businessId ?? 0,
        date: { gte: start, lte: end },
      },
      select: { adsCost: true },
    });
    const adsSpend = adsCosts.reduce((sum, a) => sum + Number(a.adsCost || 0), 0);

    const summary = {
      totalSale,
      totalExpense,
      accountReceivable,
      adsSpend,
      amount,
      averageSale,
    };

    console.log("🚀 Get Bills By Date Range API - Summary:", summary);
    return res.status(200).json({ summary, bills });
  } catch (error) {
    console.error("Error fetching bills by date range:", error);
    return res
      .status(500)
      .json({ error: "Failed to fetch bills by date range" });
  }
};

// get Expense by date range
export const getExpenseByDateRange = async (req: Request, res: Response) => {
  try {
    const { memberId, startDate, endDate } = req.query;

    if (!memberId || !startDate || !endDate) {
      return res.status(400).json({
        error: "Member ID, start date, and end date are required",
      });
    }

    console.log("startDate:", startDate, "endDate:", endDate);

    // Ensure full day coverage for the date range
    const start = new Date(`${startDate}T00:00:00.000Z`);
    const end = new Date(`${endDate}T23:59:59.999Z`);
    // Find business ID by member ID from member table
    const businessId = await prisma.member.findUnique({
      where : { uniqueId: String(memberId) },
      select:{ businessId: true },
    });
    // Get expenses within the date range
    const expenses = await prisma.expense.findMany({
      where: {
        businessAcc : businessId?.businessId ?? 0,

        date: {
          gte: start,
          lte: end,
        },
        save: true, // Only fetch saved expenses
      },
      orderBy: {
        date: "desc",
      },
    });

    console.log("🚀 Get Expenses By Date Range API:", expenses);
    return res.status(200).json(expenses);
  } catch (error) {
    console.error("Error fetching expenses by date range:", error);
    return res
      .status(500)
      .json({ error: "Failed to fetch expenses by date range" });
  }
};

// Search bills by customer name or partial name
export const searchBillsByCustomer = async (req: Request, res: Response) => {
  try {
    const { memberId, customerName } = req.query;

    console.log("Search Bills By Customer API - memberId:", memberId, "customerName:", customerName);

    if (!memberId || !customerName) {
      return res.status(400).json({
        error: "Member ID and customer name are required",
      });
    }
    // Find business ID by member ID from member table
    const businessId = await prisma.member.findUnique({
      where : { uniqueId: String(memberId) },
      select:{ businessId: true },
    });

    // Search by customer name or last name with case-insensitive search
    const bills = await prisma.bill.findMany({
      where: {
        businessAcc : businessId?.businessId ?? 0,
       

        OR: [
          {
            cName: {
              contains: customerName as string,
              mode: "insensitive",
            },
          },
          {
            cLastName: {
              contains: customerName as string,
              mode: "insensitive",
            },
          },
        ],
      },
      orderBy: {
        purchaseAt: "desc",
      },
      include: {
        product: {
          include: {
            productList: {
              select: { name: true },
            },
          },
        },
      },
    });

    console.log("🚀 Search Bills By Customer API:", bills);

    return res.status(200).json(bills);
  } catch (error) {
    console.error("Error searching bills by customer:", error);
    return res
      .status(500)
      .json({ error: "Failed to search bills by customer" });
  }
};

// Search bills by customer phone
export const searchBillsByPhone = async (req: Request, res: Response) => {
  try {
    const { memberId, customerPhone } = req.query;

    console.log("Search Bills By Phone API - memberId:", memberId, "customerPhone:", customerPhone);

    if (!memberId || !customerPhone) {
      return res.status(400).json({
        error: "Member ID and customer phone are required",
      });
    }
    // Find business ID by member ID from member table
    const businessId = await prisma.member.findUnique({
      where : { uniqueId: String(memberId) },
      select:{ businessId: true },
    });

    // Search by customer name or last name with case-insensitive search
    const bills = await prisma.bill.findMany({
      where: {
        businessAcc : businessId?.businessId ?? 0,     

        cPhone: {
          contains: customerPhone as string,
          mode: "insensitive", // Just in case, though usually phone is numeric
        },
      },
      orderBy: {
        purchaseAt: "desc",
      },
      include: {
        product: {
          include: {
            productList: {
              select: { name: true },
            },
          },
        },
      },
      take : 20, // Limit results
    });

    console.log("🚀 Search Bills By Phone API:", bills);

    return res.status(200).json(bills);
  } catch (error) {
    console.error("Error searching bills by phone:", error);
    return res
      .status(500)
      .json({ error: "Failed to search bills by phone" });
  }
};

// Generate PDF invoice
export const generateInvoicePDF = async (req: Request, res: Response) => {
  try {
    const { billId } = req.params;

    if (!billId) {
      return res.status(400).json({ error: "Bill ID is required" });
    }

    // Find the bill
    const bill = await prisma.bill.findUnique({
      where: {
        id: parseInt(billId),
      },
    });

    if (!bill) {
      return res.status(404).json({ error: "Bill not found" });
    }

    // In a real implementation, generate a PDF here
    // For now, we'll return the bill data
    return res.status(200).json({
      message: "PDF generation would happen here",
      bill,
    });
  } catch (error) {
    console.error("Error generating invoice PDF:", error);
    return res.status(500).json({ error: "Failed to generate invoice PDF" });
  }
};

// Search by bill ID
export const searchBillById = async (req: Request, res: Response) => {
  try {
    const { billId, memberId } = req.query;

    if (!billId || !memberId) {
      return res.status(400).json({ error: "Bill ID and Member ID are required" });
    }
    // Find business ID by member ID from member table
    const businessId = await prisma.member.findUnique({
      where : { uniqueId: String(memberId) },
      select:{ businessId: true },
    });
    // Always use endsWith for flexible search
    const bill = await prisma.bill.findFirst({
      where: {
        businessAcc: businessId?.businessId ?? 0,
        OR: [
          { billId: { endsWith: billId as string } },
          { quotationId: { endsWith: billId as string } },
          { invoiceId: { endsWith: billId as string } },
        ],
      },
      include: {
        product: {
          include: {
            productList: {
              select: { name: true },
            },
          },
        },
      },
    });

    if (!bill) {
      // Instead of 404 error, return 200 with null (no bill found)
      return res.status(200).json(null);
    }
    return res.status(200).json(bill);
  } catch (error) {
    console.error("Error searching bill by ID:", error);
    return res.status(500).json({ error: "Failed to search bill by ID" });
  }
}

