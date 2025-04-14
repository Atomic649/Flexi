import { Request, Response } from "express";
import { PrismaClient as PrismaClient1 } from "../generated/client1";


//Create  instance of PrismaClient
const prisma = new PrismaClient1();

const dailyReport = async (req: Request, res: Response) => {
  const { memberId } = req.params;
  try {
    const bills = await prisma.bill.findMany({
      where: {
        memberId: memberId,
      },
       select: {
        purchaseAt: true,
        amount: true,
        price: true,
      },
      take: 100, // Limit to 100 records
    });

    // Group by date and sum adsCost
    const adsCost = await prisma.adsCost.findMany({
      where: {
        memberId: memberId,
      },
      select: {
        date: true,
        adsCost: true,
      },
      take: 100, // Limit to 100 records
    });

    // Group by purchaseAt and sum amount and price
    const dailyBills = bills.reduce((acc: any, bill) => {
      const date = bill.purchaseAt.toISOString().split("T")[0];
      if (!acc[date]) {
        acc[date] = {
          date: date,
          amount: 0,
          price: 0,
        };
      }
      acc[date].amount += bill.amount;
      acc[date].price += bill.price;
      return acc;
    }, {});

    // Group by date and sum adsCost
    const dailyAdsCost = adsCost.reduce((acc: any, adsCost) => {
      const date = adsCost.date.toISOString().split("T")[0];
      if (!acc[date]) {
        acc[date] = {
          date: date,
          adsCost: 0,
        };
      }
      acc[date].adsCost += adsCost.adsCost;
      return acc;
    }, {});

    // Merge dailyBills and dailyAdsCost
    const result = Object.keys(dailyBills).map((date) => {
      const adsCost = dailyAdsCost[date]?.adsCost || 0;
      const price = dailyBills[date].price;
      const profit = price - adsCost;
      const percentageAds = adsCost ? parseFloat(((adsCost / price) * 100).toFixed(2)) : 0.00;
      const ROI = adsCost ? parseFloat(((profit / adsCost) ).toFixed(1)) : 0.00;
      return {
        date: date,
        amount: dailyBills[date].amount,
        sale: price,
        adsCost: adsCost,
        profit: profit,
        percentageAds: percentageAds,
        ROI: ROI,
      };
    });

    res.json(result);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "failed to get bills" });
  
  }


};
const monthlyReport = async (req: Request, res: Response) => {
  const { memberId } = req.params;
  try {
    const bills = await prisma.bill.findMany({
      where: {
        memberId: memberId,
      },
      select: {
        purchaseAt: true,
        amount: true,
        price: true,
      },
      take: 100, // Limit to 100 records
    });

    console.log(bills);

    // Group by month and sum adsCost
    const adsCost = await prisma.adsCost.findMany({
      where: {
        memberId: memberId,
      },
      select: {
        date: true,
        adsCost: true,
      },
      take: 100, // Limit to 100 records
    });

    console.log(adsCost);

    // Group by mounth of purchaseAt and sum amount and price
    const monthlyBills = bills.reduce((acc: any, bill) => {
      const date = bill.purchaseAt.toISOString().split("-").slice(0, 2).join("-");
      if (!acc[date]) {
        acc[date] = {
          date: date,
          amount: 0,
          price: 0,
        };
      }
      acc[date].amount += bill.amount;
      acc[date].price += bill.price;
      return acc;
    }, {});

    console.log(monthlyBills);

    // Group by month of date and sum adsCost
    const monthlyAdsCost = adsCost.reduce((acc: any, adsCost) => {
      const date = adsCost.date.toISOString().split("-").slice(0, 2).join("-");
      if (!acc[date]) {
        acc[date] = {
          date: date,
          adsCost: 0,
        };
      }
      acc[date].adsCost += adsCost.adsCost;
      return acc;
    }, {});
    console.log(monthlyAdsCost);

    // Merge monthlyBills and monthlyAdsCost
    const result = Object.keys(monthlyBills).map((date) => {
      const adsCost = monthlyAdsCost[date]?.adsCost || 0;
      const price = monthlyBills[date].price;
      const profit = price - adsCost;
      const percentageAds = adsCost ? parseFloat(((adsCost / price) * 100).toFixed(2)) : 0.00;
      const ROI = adsCost ? parseFloat(((profit / adsCost) ).toFixed(1)) : 0.00;
      return {
        month: date,
        amount: monthlyBills[date].amount,
        sale: price,
        adsCost: adsCost,
        profit: profit,
        percentageAds: percentageAds,
        ROI: ROI,
      };
    });

    res.json(result);
      } catch (e) {
    console.error(e);
    res.status(500).json({ message: "failed to get bills" });
  }
};
// get all adsCost and Expenses list
const getListofAdsandExpenses = async (req: Request, res: Response) => {
  const { memberId } = req.params;

  try {
    const adsCost = await prisma.adsCost.findMany({
      where: {
        memberId: memberId,
      },
      select: {
        date: true,
        adsCost: true,
        platform: {
          select: {
            platform: true,
            accName: true,
          },
        },
      },
      take: 100, // Limit to 100 records
    });

    const expenses = await prisma.expense.findMany({
      where: {
        memberId: memberId,
        save: true,
      },
      select: {
        date: true,
        amount: true,
        note: true,
        desc: true,
      },
      take: 100, // Limit to 100 records
    });

    // Change both name adscost and amount to expenses and merge them
    const result = adsCost
      .map((adsCost) => {
        return {
          date: adsCost.date,
          expenses: adsCost.adsCost,
          type: "ads",
          note: `${adsCost.platform.platform} ${adsCost.platform.accName}`,
        };
      })
      .concat(
        expenses.map((expense) => {
          return {
            date: expense.date,
            expenses: expense.amount,
            type: "expense",
            note: expense.note || "",
            desc: expense.desc || "",
          };
        })
      )
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    res.json(result);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "failed to get ads and expenses" });
  }
};

export { dailyReport, monthlyReport, getListofAdsandExpenses };