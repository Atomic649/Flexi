import { Request, Response } from "express";
import { Gender, Payment, PrismaClient as PrismaClient1, SocialMedia } from "../generated/client1";
import Joi from "joi";
import multer from "multer";
import multerConfig from "../middleware/multer_config";


const upload = multer(multerConfig.multerConfigImage.config).single(multerConfig.multerConfigImage.keyUpload);

// Create  instance of PrismaClient
const prisma = new PrismaClient1();

//Interface for request body from client
interface billInput {
  id?: number;
  billId : string;
  createdAt: Date;
  updatedAt?: Date;
  cName: string;
  cLastName: string;
  cPhone: string;
  cGender: Gender;
  cAddress: string;
  cPostId: string;
  cProvince: string;
  product: string;
  payment: Payment;
  amount: number;
  platform: SocialMedia;
  cashStatus: boolean;
  price: number;
  memberId: string;
  purchaseAt: Date;
  businessAcc: number;
  image: string;
  storeId: number;
}

// Validate the request body
const schema = Joi.object({
  id: Joi.number(),
  billId: Joi.string(),
  createdAt: Joi.date(),
  updatedAt: Joi.date(),
  purchaseAt: Joi.date(),
  cName: Joi.string().required(),
  cLastName: Joi.string().required(),
  cPhone: Joi.string().min(10).max(10).required(),
  cGender: Joi.string().valid("Female", "Male").required(),
  cAddress: Joi.string().required(),
  cProvince: Joi.string().required(),
  cPostId: Joi.string().required(),
  product: Joi.string().required(),
  payment: Joi.string().valid("COD", "Transfer", "CreditCard", "Cash").required(),
  amount: Joi.number().required(),
  // platform: Joi.string().valid(
  //   "Facebook",
  //   "Tiktok",
  //   "Shopee",
  //   "Instagram",
  //   "Youtube",
  //   "Lazada",
  //   "Line",
  //   "X",
  //   "Google"
  // ),
  cashStatus: Joi.boolean().required(),
  price: Joi.number().required(),
  memberId: Joi.string().required(),
  businessAcc: Joi.number().required(),
  image: Joi.string().allow(""),
  storeId: Joi.number().required(),
});

//Create a New Bill - Post
const createBill = async (req: Request, res: Response) => {
  //
  upload(req, res, async (err) => {
    //Multer
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ message: err.message });
    } else if (err) {
      return res.status(500).json({ message: err.message });
    }
    const billInput: billInput = req.body;
    // Validate the request body
    const { error } = schema.validate(billInput);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }
    // convert string to number in amount and price and businessAcc

    billInput.amount = Number(billInput.amount);
    billInput.price = Number(billInput.price);
    billInput.businessAcc = Number(billInput.businessAcc);
    billInput.storeId = Number(billInput.storeId);

    //  convert string to boolean in cashStatus
    billInput.cashStatus = ["true", "1", "yes"].includes(
      String(billInput.cashStatus).toLowerCase()
    );

    // convert string to date in purchaseAt
    billInput.purchaseAt = new Date(billInput.purchaseAt);

    // find platform from Store id
    const store = await prisma.store.findUnique({
      where: {
        id: billInput.storeId,
      },
    });
    if (!store) {
      return res.status(404).json({ message: "Store not found" });
    }
    // Map or cast store.platform to a valid SocialMedia type
        billInput.platform = store.platform as SocialMedia;

    // Generate BillId as INV + YEAR + / + RUNNING NUMBER
    const currentYear = new Date().getFullYear();
    // Find the latest bill for this year
    const latestBill = await prisma.bill.findFirst({
      where: {
        billId: {
          startsWith: `INV${currentYear}/`,
        },
      },
      orderBy: {
        id: 'desc',
      },
    });
    let runningNumber = 1;
    if (latestBill && latestBill.billId) {
      const match = latestBill.billId.match(/INV\d{4}\/(\d+)/);
      if (match && match[1]) {
        runningNumber = parseInt(match[1], 10) + 1;
      }
    }
    billInput.billId = `INV${currentYear}/${runningNumber}`;

    // Create a new bill into the database
    try {
      const bill = await prisma.bill.create({
        data: {
          // createdAt: new Date(),
          // updatedAt: new Date(),
          billId: billInput.billId,
          cName: billInput.cName,
          cLastName: billInput.cLastName,
          cPhone: billInput.cPhone,
          cGender: billInput.cGender,
          cAddress: billInput.cAddress,
          cPostId: billInput.cPostId,
          cProvince: billInput.cProvince,
          product: billInput.product,
          payment: billInput.payment,
          amount: billInput.amount,
          platform: billInput.platform,
          cashStatus: billInput.cashStatus,
          price: billInput.price,
          memberId: billInput.memberId,
          purchaseAt: billInput.purchaseAt,
          businessAcc: billInput.businessAcc,
          storeId: billInput.storeId,
          image: req.file?.filename ?? "",
        },
      });
      //console.log(bill);
      res.json({
        status: "ok",
        message: "Created bill successfully",
        bill: bill,
      });
    } catch (e) {
      console.error(e);
      res.status(500).json({ message: "failed to create bill" });
    }
  });
};
// Get All Bills by memberId - Get
const getBills = async (req: Request, res: Response) => {
  const { memberId } = req.params;
  try {
    const bills = await prisma.bill.findMany({
      where: {
        memberId: memberId,
        deleted: false,
      },
      take: 100, // Limit to 100 records
    });
    
    // Find product units
    const productUnits = await prisma.product.findMany({
      where: {
        memberId: memberId,
      },
      select: {
        name: true,
        unit: true,
      },
    });
    
    // Map units to bills based on product name
    const billsWithUnits = bills.map(bill => {
      const matchingProduct = productUnits.find(product => product.name === bill.product);
      return {
        ...bill,
        unit: matchingProduct?.unit || ""
      };
    });
    
    res.json(billsWithUnits);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "failed to get bills" });
  }
};

// Get a Bill by ID - Get
const getBillById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const bill = await prisma.bill.findUnique({
      where: {
        id: Number(id),
      },
    });
    res.json(bill);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "failed to get bill" });
  }
};

// Update a Bill - Put
const updateBill = async (req: Request, res: Response) => {
  const { id } = req.params;
  // Multer show image and update

  upload(req, res, async (err) => {
    //Multer
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ message: err.message });
    } else if (err) {
      return res.status(500).json({ message: err.message });
    }
    const billInput: billInput = req.body;

    // Validate the request body
    const { error } = schema.validate(billInput);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }
    // convert string to number in amount and price and businessAcc
    billInput.amount = Number(billInput.amount);
    billInput.price = Number(billInput.price);
    billInput.businessAcc = Number(billInput.businessAcc);
    billInput.storeId = Number(billInput.storeId);

    //  convert string to boolean in cashStatus
    billInput.cashStatus = ["true", "1", "yes"].includes(
      String(billInput.cashStatus).toLowerCase()
    );

    // convert string to date in purchaseAt
    billInput.purchaseAt = new Date(billInput.purchaseAt);

    // find platform from Store id
    const platform = await prisma.store.findUnique({
      where: {
        id: billInput.storeId,
      },
    });
    if (!platform) {
      return res.status(404).json({ message: "Store not found" });
    }
    // Map or cast store.platform to a valid SocialMedia type
    billInput.platform = platform.platform as SocialMedia;

    // Create a new bill into the database
    try {
      const bill = await prisma.bill.update({
        where: {
          id: Number(id),
        },
        data: {
          updatedAt: new Date(),
          cName: billInput.cName,
          cLastName: billInput.cLastName,
          cPhone: billInput.cPhone,
          cGender: billInput.cGender,
          cAddress: billInput.cAddress,
          cPostId: billInput.cPostId,
          cProvince: billInput.cProvince,
          product: billInput.product,
          payment: billInput.payment,
          amount: billInput.amount,
          platform: billInput.platform,
          storeId: billInput.storeId,
          cashStatus: billInput.cashStatus,
          price: billInput.price,
          memberId: billInput.memberId,
          purchaseAt: billInput.purchaseAt,
          businessAcc: billInput.businessAcc,
          image: req.file?.filename ?? "",
        },
      });
      //console.log(bill);
      res.json({
        status: "ok",
        message: "Updated bill successfully",
        bill: bill,
      });
    } catch (e) {
      console.error(e);
      res.status(500).json({ message: "failed to update bill" });
    }
  });
};

// Update a cash status by id - Put
const updateCashStatusById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const billInput: billInput = req.body;

  // validate the request body
  const schema = Joi.object({
    cashStatus: Joi.boolean(),
  });

  // If the request body is invalid, return error 400 Bad request
  const { error } = schema.validate(billInput);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  try {
    const bill = await prisma.bill.update({
      where: {
        id: Number(id),
      },
      data: {
        cashStatus: billInput.cashStatus,
      },
    });
    res.json({
      id: bill.id,
      cashStatus: bill.cashStatus,
      message: `Updated cash status successfully`,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "failed to update bill" });
  }
};

// Delete a Bill - Delete
const deleteBill = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const bill = await prisma.bill.delete({
      where: {
        id: Number(id),
      },
    });
    res.json({
      status: "ok",
      message: `Deleted successfully`,
      bill: {
        id: bill.id,
        cName: bill.cName,
        cLastName: bill.cLastName,
      },
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "failed to delete bill" });
  }
};
// Search Bill by keyword - Get
const searchBill = async (req: Request, res: Response) => {
  const { keyword } = req.params;
  try {
    const bill = await prisma.bill.findMany({
      where: {
        OR: [
          {
            cName: {
              contains: keyword,
            },
          },
          {
            cLastName: {
              contains: keyword,
            },
          },
          {
            cPhone: {
              contains: keyword,
            },
          },

          {
            cProvince: {
              contains: keyword,
            },
          },
          {
            product: {
              contains: keyword,
            },
          },
        ],
      },
      take: 100, // Limit to 100 records
    });
    res.json(bill);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "failed to search bill" });
  }
};

// Get whole year sales form bills by memberId - Get
const getthisYearSales = async (req: Request, res: Response) => {
  const { memberId } = req.query;
  try {
    if (!memberId) {
      return res.status(400).json({ message: "Member ID is required" });
    }
    const sales = await prisma.bill.aggregate({
      _sum: {
        price: true,
      },
      where: {
        memberId: memberId as string,
        purchaseAt: {
          gte: new Date(new Date().getFullYear(), 0, 1),
          lte: new Date(new Date().getFullYear(), 11, 31),
        },
      },
    });
    if (!sales || !sales._sum.price) {
      return res.status(404).json({ message: "No sales found for this year" });
    }
    sales._sum.price = Number(sales._sum.price);
    // Convert to millions or thousands
    let anualSalesM: string;
    if (sales._sum.price >= 1000000) {
      anualSalesM = (sales._sum.price / 1000000).toFixed(1) + "M";
    } else if (sales._sum.price >= 1000) {
      anualSalesM = (sales._sum.price / 1000).toFixed(0) + "K";
    } else {
      anualSalesM = sales._sum.price.toString();
    }
    // Do not assign string to a number property; instead, return formatted value separately
    console.log("🚀 Get This Year Sales API:", anualSalesM);
    res.json({
      anualSalesM
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "failed to get this year sales" });
  }
};




export {
  createBill,
  getBills,
  getBillById,
  deleteBill,
  updateBill,
  searchBill,
  updateCashStatusById,
  getthisYearSales
  
};
