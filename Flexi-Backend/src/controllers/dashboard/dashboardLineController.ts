import { Request, Response } from "express";
import { Prisma, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

//---------------------------Line-----------------------------
// Sum of ads cost by date and product if platform is Line
export const sumOfAdsCostLine = async (req: Request, res: Response) => {
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

  try {
    // Get the platform ID for Line
    const platformIdLine = await prisma.platform.findMany({
      where: {
        platform: "Line",
      },
      select: {
        id: true,
      },
    });

    if (platformIdLine.length === 0) {
     // console.log("Line platform not found");
      return res.json(0);
    }

    const linePlatformId = platformIdLine[0].id;

    // console.log("dateFilter",dateFilter);
    // console.log(productFilter);
    // console.log("id :", linePlatformId);

    const adsCosts = await prisma.adsCost.findMany({
      where: {
        businessAcc: Number(businessAcc),
        platformId: linePlatformId,
        ...dateFilter,
        ...productFilter,
      },
      select: {
        adsCost: true,
      },
    });

    console.log(adsCosts);

    const sum = adsCosts.reduce((acc, curr) => acc + curr.adsCost.toNumber(), 0);
    res.json(sum);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "failed to get sum of ads cost" });
  }
};

// ----------Sum of Bills by date and product if platform is Line
export const sumOfBillsLine = async (req: Request, res: Response) => {
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

  const platformFilter: Prisma.BillWhereInput = { platform: "Line" };

  try {
    const bills = await prisma.bill.findMany({
      where: {
        businessAcc: Number(businessAcc),
        ...dateFilter,
        ...productFilter,
        ...platformFilter,
      },
      select: {
        price: true,
      },
    });
    // console.log(dateFilter);
    // console.log(productFilter);
    // console.log(platformFilter);
    // console.log(bills);

    const sum = bills.reduce((acc, curr) => acc + curr.price, 0);
    res.json(sum);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "failed to get sum of bills" });
  }
};

// Count of Bills by date and product if platform is Line
export const countOfBillsLine = async (req: Request, res: Response) => {
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

  const platformFilter: Prisma.BillWhereInput = { platform: "Line" };

  try {
    const count = await prisma.bill.count({
      where: {
        businessAcc: Number(businessAcc),
        ...dateFilter,
        ...productFilter,
        ...platformFilter,
      },
    });

    res.json(count);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "failed to get count of bills" });
  }
};
