import { Request, Response } from "express";
import { PrismaClient as PrismaClient1 } from "../generated/client1";


//Create  instance of PrismaClient
const prisma = new PrismaClient1();

const dailyReport = async (req: Request, res: Response) => {
  const { memberId } = req.params;
  try {
     // Find business ID by member ID from member table
    const businessId = await prisma.member.findUnique({
      where : { uniqueId: memberId },
      select:{ businessId: true },
    });
    const bills = await prisma.bill.findMany({
      where: {
        businessAcc : businessId?.businessId ?? 0,
        deleted: false,
      },
       select: {
        purchaseAt: true,        
        total: true,
        discount: true,
        billLevelDiscount: true,
        beforeDiscount: true,
        product: true,
      },
     });

    // Group by date and sum adsCost
    const adsCost = await prisma.adsCost.findMany({
      where: {
        memberId: memberId,
      },
      select: {
        date: true,
        adsCost: true,
      }, });

    // Group by purchaseAt and sum amount and total
    const dailyBills = bills.reduce((acc: any, bill) => {
      const date = bill.purchaseAt.toISOString().split("T")[0];
      if (!acc[date]) {
        acc[date] = {
          date: date,
          amount: 0,
          total: 0,
          totalDiscount: 0,
          billLevelDiscount: 0,
          beforeDiscount: 0,
        };
      }
      // Sum amount from all product items (quantity)
      if (bill.product && Array.isArray(bill.product)) {
        acc[date].amount += bill.product.reduce((sum: number, item: any) => sum + Number(item.quantity), 0);
      }
      acc[date].total += bill.total;
      acc[date].totalDiscount += (bill.discount || 0);
      acc[date].billLevelDiscount += (bill.billLevelDiscount || 0);
      acc[date].beforeDiscount += (bill.beforeDiscount || 0);
      return acc;
    }, {});

    // Group by date and sum adsCost
    // Fix: Split the adsCost entries first and then sum them properly
    const dailyAdsCost = adsCost.reduce((acc: any, ad) => {
      const date = ad.date.toISOString().split("T")[0];
      if (!acc[date]) {
        acc[date] = {
          date: date,
          adsCost: 0,
        };
      }
      acc[date].adsCost += Number(ad.adsCost);
      return acc;
    }, {});

    // Merge dailyBills and dailyAdsCost
    const result = Object.keys(dailyBills).map((date) => {
      const adsCost = dailyAdsCost[date]?.adsCost ? Number(dailyAdsCost[date].adsCost) : 0;
      const price = dailyBills[date].total;
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
        totalDiscount: dailyBills[date].totalDiscount,
        billLevelDiscount: dailyBills[date].billLevelDiscount,
        beforeDiscount: dailyBills[date].beforeDiscount,
      };
    });
    console.log(" 🚀 result", result);
    res.json(result);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "failed to get bills" });
  
  }


};
const monthlyReport = async (req: Request, res: Response) => {
  const { memberId } = req.params;
  try {
         // Find business ID by member ID from member table
    const businessId = await prisma.member.findUnique({
      where : { uniqueId: memberId },
      select:{ businessId: true },
    });
    const bills = await prisma.bill.findMany({
      where: {
        businessAcc : businessId?.businessId ?? 0,
        deleted: false,
      },
       select: {
        purchaseAt: true,
        total: true,
        discount: true,
        billLevelDiscount: true,
        beforeDiscount: true,
        product: true,
      },
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

    // Group by mounth and sum expenses
    const expenses = await prisma.expense.findMany({
      where: {
        memberId: memberId,
        save: true,
      },
      select: {
        date: true,
        amount: true,
      },
      take: 100, // Limit to 100 records
    });

    console.log(expenses);

    // Group by mounth of purchaseAt and sum amount and total
    const monthlyBills = bills.reduce((acc: any, bill) => {
      const date = bill.purchaseAt.toISOString().split("-").slice(0, 2).join("-");
      if (!acc[date]) {
        acc[date] = {
          date: date,
          amount: 0,
          total: 0,
          totalDiscount: 0,
          billLevelDiscount: 0,
          beforeDiscount: 0,
        };
      }
      // Sum amount from all product items (quantity)
      if (bill.product && Array.isArray(bill.product)) {
        acc[date].amount += bill.product.reduce((sum: number, item: any) => sum + Number(item.quantity), 0);
      }
      acc[date].total += bill.total;
      acc[date].totalDiscount += (bill.discount || 0);
      acc[date].billLevelDiscount += (bill.billLevelDiscount || 0);
      acc[date].beforeDiscount += (bill.beforeDiscount || 0);
      return acc;
    }, {});

    console.log("🔥bill",monthlyBills);

    // Group by month of date and sum adsCost
    const monthlyAdsCost = adsCost.reduce((acc: any, adsCostItem) => {
      const date = adsCostItem.date.toISOString().split("-").slice(0, 2).join("-");
      if (!acc[date]) {
        acc[date] = {
          date: date,
          adsCost: 0,
        };
      }
      // Convert adsCost to number before adding
      acc[date].adsCost += Number(adsCostItem.adsCost);
      return acc;
    }, {});
    console.log("🔥ads", monthlyAdsCost);

    // Group by month of date and sum expenses
    const monthlyExpenses = expenses.reduce((acc: any, expense) => {
      const date = expense.date.toISOString().split("-").slice(0, 2).
        join("-");
      if (!acc[date]) {
        acc[date] = {
          date: date,
          amount: 0,
        };
      }
      // Convert amount to number before adding
      acc[date].amount += Number(expense.amount);
      return acc;
    }, {});
    console.log("🔥expenses", monthlyExpenses)
    
    ;

    // Merge monthlyBills , monthlyAdsCost and monthlyExpenses
    const result = Object.keys(monthlyBills).map((date) => {
      // Ensure adsCost is a number
      const adsCost = monthlyAdsCost[date]?.adsCost ? Number(monthlyAdsCost[date].adsCost) : 0;
      const expenses = monthlyExpenses[date]?.amount ? Number(monthlyExpenses[date].amount) : 0;
      const price = monthlyBills[date].total;
      const profit = price - expenses;
      const percentageAds = adsCost ? parseFloat(((adsCost / price) * 100).toFixed(2)) : 0.00;
      const ROI = adsCost ? parseFloat(((profit / adsCost) ).toFixed(1)) : 0.00;
      return {
        month: date,
        amount: monthlyBills[date].amount,
        sale: price,
        adsCost: adsCost,
        expenses: expenses,
        profit: profit,
        percentageAds: percentageAds,
        ROI: ROI,
        totalDiscount: monthlyBills[date].totalDiscount,
        billLevelDiscount: monthlyBills[date].billLevelDiscount,
        beforeDiscount: monthlyBills[date].beforeDiscount,
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
        id: true,
        date: true,
        amount: true,
        note: true,
        sName:true,
        desc: true,
        image: true,
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
            id: expense.id,
            date: expense.date,
            expenses: expense.amount,
            type: "expense",
            sName: expense.sName || "",
            note: expense.note || "",
            desc: expense.desc || "",
            image: expense.image || "",
          };
        })
      )
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    console.log("🚀 result", result);
    res.json(result);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "failed to get ads and expenses" });
  }
};

// daily report details show bill list by product , expense ,adsCost list by date
const ReportDetailsEachDate = async (req: Request, res: Response) => {
  const { memberId, date } = req.params;
  try {
    const bills = await prisma.bill.findMany({
      where: {
        memberId: memberId,
        DocumentType:"Receipt",
        purchaseAt: {
          gte: new Date(`${date}T00:00:00.000Z`),
          lt: new Date(`${date}T23:59:59.999Z`),
        },
      },
      select: {       
        billId: true,
        purchaseAt: true,
        total: true,
        discount: true,
        billLevelDiscount: true,
        beforeDiscount: true,
        product: {
          select: {
            product: true,
            quantity: true,
            unitPrice: true,
            unitDiscount: true,
            unit: true,
          },
        },
      },
      take: 100, // Limit to 100 records
    });

    const expenses = await prisma.expense.findMany({
      where: {
        memberId: memberId,
        date: {
          gte: new Date(`${date}T00:00:00.000Z`),
          lt: new Date(`${date}T23:59:59.999Z`),
        },
        save: true,
      },
      select: {
        id: true,
        date: true,
        amount: true,
        note: true,
        sName:true,
        desc: true,
              },
      take: 100, // Limit to 100 records
    });

    const ads = await prisma.adsCost.findMany({
      where: {
        memberId: memberId,
        date: {
          gte: new Date(`${date}T00:00:00.000Z`),
          lt: new Date(`${date}T23:59:59.999Z`),
        },
      },
      select: {
        id: true,
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

    console.log("🚀 bills", bills);
    console.log("🚀 expenses", expenses);
    console.log("🚀 ads", ads);

    res.json({ bills, expenses, ads });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "failed to get report details" });
  }
}

// monthly report detail
const ReportDetailsEachMonth = async (req: Request, res: Response) => {
  const { memberId, month } = req.params;
  try {
    const bills = await prisma.bill.findMany({
      where: {
        memberId: memberId,
        DocumentType:"Receipt",
        purchaseAt: {
          gte: new Date(`${month}-01T00:00:00.000Z`),
          lt: new Date(`${month}-31T23:59:59.999Z`),
        },
      },
      select: {       
        billId: true,
        purchaseAt: true,
        total: true,
        discount: true,
        billLevelDiscount: true,
        beforeDiscount: true,
        product: {
          select: {
            product: true,
            quantity: true,
            unitPrice: true,
            unitDiscount: true,
            unit: true,
          },
        },
      },
      take: 100, // Limit to 100 records
    });

   const expenses = await prisma.expense.findMany({
      where: {
        memberId: memberId,
        date: {
          gte: new Date(`${month}-01T00:00:00.000Z`),
          lt: new Date(`${month}-31T23:59:59.999Z`),
        },
        save: true,
      },
      select: {
        id: true,
        date: true,
        amount: true,
        note: true,
        sName:true,
        desc: true,        
      },
      take: 100, // Limit to 100 records
    });

   const ads = await prisma.adsCost.findMany({
      where: {
        memberId: memberId,
        date: {
          gte: new Date(`${month}-01T00:00:00.000Z`),
          lt: new Date(`${month}-31T23:59:59.999Z`),
        },
      },
      select: {
        id: true,
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

    console.log("🚀 Mbills", bills);
    console.log("🚀 Mexpenses", expenses);
    console.log("🚀 Mads", ads);
    
    res.json({ bills, expenses, ads });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "failed to get monthly report details" });
  }
}
  

export { dailyReport, monthlyReport, getListofAdsandExpenses, ReportDetailsEachDate, ReportDetailsEachMonth };