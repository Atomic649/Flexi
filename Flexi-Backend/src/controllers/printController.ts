import { Request, Response } from "express";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { PrismaClient as PrismaClient1 } from "../generated/client1";
import { console } from "inspector";

const prisma = new PrismaClient1();

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

    // Get all bills for the member within the date range
    const bills = await prisma.bill.findMany({
      where: {
        memberId: memberId as string,
        purchaseAt: {
          gte: new Date(formattedStartDate),
          lte: new Date(formattedEndDate),
        },
      },
      orderBy: {
        purchaseAt: "desc",
      },
      include: {
        product: true
      }
    });

    // Calculate report statistics
    const Sales = bills.reduce(
      (sum, bill) =>
        sum + (bill.product && Array.isArray(bill.product)
          ? bill.product.reduce((itemSum, item) => itemSum + Number(item.unitPrice) * Number(item.quantity), 0)
          : 0),
      0
    );

  const Discount = bills.reduce(
    (sum, bill) =>
      sum + (bill.product && Array.isArray(bill.product)
        ? bill.product.reduce((itemSum, item) => itemSum + Number(item.unitDiscount) * Number(item.quantity), 0)
        : 0),
    0
  );

  const totalSales = Sales - Discount;

    const paidBills = bills.filter((bill) => bill.cashStatus);
    const unpaidBills = bills.filter((bill) => !bill.cashStatus);

    const reportStats = {
      totalSales,
      totalOrders: bills.length,
      paidOrders: paidBills.length,
      unpaidOrders: unpaidBills.length,
      averageOrderValue: bills.length > 0 ? totalSales / bills.length : 0,
      bills,
    };

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

    // Get bills within the date range
    const bills = await prisma.bill.findMany({
      where: {
        memberId: memberId as string,
        purchaseAt: {
          gte: start,
          lte: end,
        },
      },
      orderBy: {
        purchaseAt: "desc",
      },
      include: {
        product: true // Ensure product items are included for multi-product support
      }
    });

    console.log("🚀 Get Bills By Date Range API:", bills);
    return res.status(200).json(bills);
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

    // Get expenses within the date range
    const expenses = await prisma.expense.findMany({
      where: {
        memberId: memberId as string,
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

    if (!memberId || !customerName) {
      return res.status(400).json({
        error: "Member ID and customer name are required",
      });
    }

    // Search by customer name or last name with case-insensitive search
    const bills = await prisma.bill.findMany({
      where: {
        memberId: memberId as string,
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
    });

    return res.status(200).json(bills);
  } catch (error) {
    console.error("Error searching bills by customer:", error);
    return res
      .status(500)
      .json({ error: "Failed to search bills by customer" });
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

    // Always use endsWith for flexible search
    const bill = await prisma.bill.findFirst({
      where: {
        billId: { endsWith: billId as string },
        memberId: memberId as string,
      },
      include: {
        product: true, // Include products if needed
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

