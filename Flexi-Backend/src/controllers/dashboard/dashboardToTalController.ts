import { Request, Response } from "express";
import { Prisma, PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

//-----------------------------TOTAL---------------------------

// Sum of ads cost by date and product
export const sumOfAdsCost = async (req: Request, res: Response) => {
  const { businessAcc } = req.params;
  const { product } = req.query;
  const { startDate, endDate } = req.query;
  const productFilter: Prisma.AdsCostWhereInput = product
    ? { product: { equals: String(product) } }
    : {};
  const dateFilter: Prisma.AdsCostWhereInput =
    startDate && endDate
      ? {
          date: {
            gte: new Date(startDate as string),
            lte: new Date(endDate as string),
          },
        }
      : {};

  // console.log(dateFilter);
  // console.log(productFilter);

  try {
    const adsCosts = await prisma.adsCost.findMany({
      where: {
        businessAcc: Number(businessAcc),
        ...dateFilter,
        ...(product ? productFilter : {}),
      },
      select: {
        adsCost: true,
      },
    });
    // console.log(adsCosts);

    const sum = adsCosts.reduce((acc, curr) => acc + curr.adsCost.toNumber(), 0);
    res.json(sum);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "failed to get sum of ads cost" });
  }
};

// Sum of Bills by date and product
export const sumOfBills = async (req: Request, res: Response) => {
  const { businessAcc } = req.params;
  const { product } = req.query;
  const { startDate, endDate } = req.query;

  const productFilter: Prisma.BillWhereInput = product
    ? { product: { equals: String(product) } }
    : {};
  const dateFilter: Prisma.BillWhereInput =
    startDate && endDate
      ? {
          purchaseAt: {
            gte: new Date(startDate as string),
            lte: new Date(endDate as string),
          },
        }
      : {};

  // console.log(productFilter);
  // console.log(dateFilter);

  try {
    const bills = await prisma.bill.findMany({
      where: {
        businessAcc: Number(businessAcc),
        ...dateFilter,
        ...(product ? productFilter : {}),
      },
      select: {
        price: true,
      },
    });

    // console.log("including", bills);

    const sum = bills.reduce((acc, curr) => acc + curr.price, 0);
    res.json(
      sum,
    );
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "failed to get sum of bills" });
  }
};

// Calculate Profit by subtracting sum of ads cost from sum of bills
export const calculateProfit = async (req: Request, res: Response) => {
  const { businessAcc } = req.params;
  const { product } = req.query;
  const { startDate, endDate } = req.query;

  const productFilter: Prisma.AdsCostWhereInput & Prisma.BillWhereInput =
    product ? { product: { equals: String(product) } } : {};

  let dateFilterForAdsCost: Prisma.AdsCostWhereInput = {};
  let dateFilterForBills: Prisma.BillWhereInput = {};

  if (startDate && endDate) {
    const start = new Date(startDate as string);
    const end = new Date(endDate as string);

    if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
      dateFilterForAdsCost = {
        date: {
          gte: start,
          lte: end,
        },
      };

      dateFilterForBills = {
        purchaseAt: {
          gte: start,
          lte: end,
        },
      };
    } else {
      return res.status(400).json({ message: "Invalid date format" });
    }
  }

  // console.log(productFilter);
  // console.log(dateFilterForAdsCost);
  // console.log(dateFilterForBills);

  try {
    const adsCosts = await prisma.adsCost.findMany({
      where: {
        businessAcc: Number(businessAcc),
        ...productFilter,
        ...dateFilterForAdsCost,
      },
      select: {
        adsCost: true,
      },
    });

    const sumOfAdsCost = adsCosts.reduce((acc, curr) => acc + curr.adsCost.toNumber(), 0);
    // console.log(sumOfAdsCost);

    const bills = await prisma.bill.findMany({
      where: {
        businessAcc: Number(businessAcc),
        ...productFilter,
        ...dateFilterForBills,
      },
      select: {
        price: true,
      },
    });

    const sumOfBills = bills.reduce((acc, curr) => acc + curr.price, 0);
    // console.log(sumOfBills);

    const profit = sumOfBills - sumOfAdsCost;
    res.json(
      
      profit,
    );
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "failed to calculate profit" });
  }
};

