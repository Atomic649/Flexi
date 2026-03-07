import { Request, Response } from "express";
//Create  instance of PrismaClient
import { flexiDBPrismaClient } from "../../lib/PrismaClient1";

const prisma = flexiDBPrismaClient;

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
        DocumentType: "Receipt",
      },
       select: {
        purchaseAt: true,
        total: true,
        discount: true,
        billLevelDiscount: true,
        beforeDiscount: true,
        product: {
          select: {
            product: true,
            quantity: true,
            productList: {
              select: { name: true },
            },
          },
        },
      },
     });

     console.log(bills);

    // Group by date and sum adsCost
    const adsCost = await prisma.adsCost.findMany({
      where: {
        memberId: memberId,
      },
      select: {
        date: true,
        adsCost: true,
      }, });

    console.log(adsCost);

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
        acc[date].total += Number(bill.total || 0);
        acc[date].totalDiscount += Number(bill.discount || 0);
        acc[date].billLevelDiscount += Number(bill.billLevelDiscount || 0);
        acc[date].beforeDiscount += Number(bill.beforeDiscount || 0);
      return acc;
    }, {});

    console.log(" 🚀 dailyBills", dailyBills);

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

    console.log(" 🚀 dailyAdsCost", dailyAdsCost);

    // Merge dailyBills and dailyAdsCost (include days that have only adsCost)
    const allDates = new Set([...Object.keys(dailyBills), ...Object.keys(dailyAdsCost)]);
    const result = Array.from(allDates).map((date) => {
      const bill = dailyBills[date];
      const adsCostVal = dailyAdsCost[date]?.adsCost ? Number(dailyAdsCost[date].adsCost) : 0;
      const price = bill?.total || 0;
      const amount = bill?.amount || 0;
      const totalDiscount = bill?.totalDiscount || 0;
      const billLevelDiscount = bill?.billLevelDiscount || 0;
      const beforeDiscount = bill?.beforeDiscount || 0;
      const profit = price - adsCostVal;
      const percentageAds = adsCostVal && price ? parseFloat(((adsCostVal / price) * 100).toFixed(2)) : 0.0;
      const ROI = adsCostVal ? parseFloat(((profit / adsCostVal)).toFixed(1)) : 0.0;
      return {
        date: date,
        amount,
        sale: price,
        adsCost: adsCostVal,
        profit,
        percentageAds,
        ROI,
        totalDiscount,
        billLevelDiscount,
        beforeDiscount,
      };
    }).sort((a, b) => (a.date < b.date ? -1 : 1));
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
        DocumentType: "Receipt",
      },
       select: {
        purchaseAt: true,
        total: true,
        discount: true,
        billLevelDiscount: true,
        beforeDiscount: true,
        product: {
          select: {
            product: true,
            quantity: true,
            productList: {
              select: { name: true },
            },
          },
        },
      },
      });

  //  console.log(bills);

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

  //  console.log(expenses);

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
        acc[date].total += Number(bill.total || 0);
        acc[date].totalDiscount += Number(bill.discount || 0);
        acc[date].billLevelDiscount += Number(bill.billLevelDiscount || 0);
        acc[date].beforeDiscount += Number(bill.beforeDiscount || 0);
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
   // console.log("🔥expenses", monthlyExpenses)
    
    ;

    // Merge monthlyBills , monthlyAdsCost and monthlyExpenses (include months with only ads/expenses)
    const allMonths = new Set([
      ...Object.keys(monthlyBills),
      ...Object.keys(monthlyAdsCost),
      ...Object.keys(monthlyExpenses),
    ]);

    const result = Array.from(allMonths).map((date) => {
      const bill = monthlyBills[date];
      const adsCost = monthlyAdsCost[date]?.adsCost ? Number(monthlyAdsCost[date].adsCost) : 0;
      const expenses = monthlyExpenses[date]?.amount ? Number(monthlyExpenses[date].amount) : 0;
      const price = bill?.total || 0;
      const amount = bill?.amount || 0;
      const totalDiscount = bill?.totalDiscount || 0;
      const billLevelDiscount = bill?.billLevelDiscount || 0;
      const beforeDiscount = bill?.beforeDiscount || 0;
      const profit = price - expenses;
      const percentageAds = adsCost && price ? parseFloat(((adsCost / price) * 100).toFixed(2)) : 0.0;
      const ROI = adsCost ? parseFloat(((profit / adsCost)).toFixed(1)) : 0.0;
      return {
        month: date,
        amount,
        sale: price,
        adsCost,
        expenses,
        profit,
        percentageAds,
        ROI,
        totalDiscount,
        billLevelDiscount,
        beforeDiscount,
      };
    }).sort((a, b) => (a.month < b.month ? -1 : 1));

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
    // Resolve businessId from the requesting member, then fetch all business member IDs
    const memberRecord = await prisma.member.findUnique({
      where: { uniqueId: memberId },
      select: { businessId: true },
    });
    const businessId = memberRecord?.businessId;

    let memberIds: string[] = [memberId];
    if (businessId) {
      const allMembers = await prisma.member.findMany({
        where: { businessId },
        select: { uniqueId: true },
      });
      memberIds = allMembers.map((m) => m.uniqueId);
    }

    const adsCost = await prisma.adsCost.findMany({
      where: {
        memberId: { in: memberIds },
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

    const expenses = await prisma.expense.findMany({
      where: {
        memberId: { in: memberIds },
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
        DocumentType: true,
        debtAmount: true,
        dueDate: true,
        flexiId: true,
      },
      take: 100, // Limit to 100 records
    });

    // Change both name adscost and amount to expenses and merge them
    const result = adsCost
      .map((adsCost) => {
        return {
          id: adsCost.id,  
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
            debtAmount: expense.debtAmount,
            DocumentType: expense.DocumentType,
            dueDate: expense.dueDate ?? null,
            flexiId: expense.flexiId || null,
            type: "expense",
            sName: expense.sName || "",
            note: expense.note || "",
            desc: expense.desc || "",
            image: expense.image || "",
          };
        })
      )
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
//    console.log("🚀 result", result);
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
    const businessId = await prisma.member.findUnique({
      where: { uniqueId: memberId },
      select: { businessId: true },
    });

    const bills = await prisma.bill.findMany({
      where: {
        businessAcc: businessId?.businessId ?? 0,
        deleted: false,
        DocumentType: "Receipt",
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
            productList: {
              select: { name: true },
            },
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
            accId: true,
            campaignId: true,
          },
        },
      },
      take: 100, // Limit to 100 records
    });

    // console.log("🚀 bills", bills);
    // console.log("🚀 expenses", expenses);
    // console.log("🚀 ads", ads);

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
    const businessId = await prisma.member.findUnique({
      where: { uniqueId: memberId },
      select: { businessId: true },
    });

    const bills = await prisma.bill.findMany({
      where: {
        businessAcc: businessId?.businessId ?? 0,
        deleted: false,
        DocumentType: "Receipt",
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
            productList: {
              select: { name: true },
            },
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
            accId: true,
            campaignId: true,
          },
        },
      },
      take: 100, // Limit to 100 records
    });

    // console.log("🚀 Mbills", bills);
    // console.log("🚀 Mexpenses", expenses);
    // console.log("🚀 Mads", ads);
    
    res.json({ bills, expenses, ads });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "failed to get monthly report details" });
  }
}
  

export { dailyReport, monthlyReport, getListofAdsandExpenses, ReportDetailsEachDate, ReportDetailsEachMonth };