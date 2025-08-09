import { Request, Response } from "express";
import {
  Gender,
  Payment,
  PrismaClient as PrismaClient1,
  SocialMedia,
  Unit,
} from "../generated/client1";
import Joi from "joi";
import multer from "multer";
import multerConfig from "../middleware/multer_config";

const upload = multer(multerConfig.multerConfigImage.config).single(
  multerConfig.multerConfigImage.keyUpload
);

// Create  instance of PrismaClient
const prisma = new PrismaClient1();

// Interface for request body from client
interface ProductItemInput {
  product: string;
  quantity: number;
  unitPrice: number;
  unit: Unit;
}

// Updated interface for request body from client
interface billInput {
  id?: number;
  billId?: string;
  createdAt?: Date;
  updatedAt?: Date;
  cName: string;
  cLastName: string;
  cPhone: string;
  cGender: Gender;
  cAddress: string;
  cPostId: string;
  cProvince: string;
  payment: Payment;
  cashStatus: boolean;
  memberId: string;
  purchaseAt: Date;
  businessAcc: number;
  cTaxId: string;
  image: string;
  storeId: number;
  total?: number;
  productItems: ProductItemInput[];
  repeat?: boolean;
  repeatMonths?: number;
}

// Validate the request body
const schema = Joi.object({
  id: Joi.number(),
  billId: Joi.string(),
  createdAt: Joi.date(),
  updatedAt: Joi.date(),
  purchaseAt: Joi.date(),
  cName: Joi.string().required(),
  cLastName: Joi.string().allow(""),
  cPhone: Joi.string().min(10).max(10).required(),
  cGender: Joi.string().valid("Female", "Male","NotSpecified").required(),
  cAddress: Joi.string().required(),
  cProvince: Joi.string().required(),
  cPostId: Joi.string().required(),
  cTaxId: Joi.string().allow("").optional(),
  payment: Joi.string()
    .valid("COD", "Transfer", "CreditCard", "Cash")
    .required(),
  cashStatus: Joi.boolean().required(),
  memberId: Joi.string().required(),
  businessAcc: Joi.number().required(),
  image: Joi.string().allow(""),
  storeId: Joi.number(),
  total: Joi.number(),
  repeat: Joi.boolean().optional(),
  repeatMonths: Joi.number().min(1).max(12).optional(),
  productItems: Joi.array()
    .items(
      Joi.object({
        product: Joi.string().required(),
        quantity: Joi.number().min(1).required(),
        unitPrice: Joi.number().min(0).required(),
        unit: Joi.string().optional(), // Optional field for unit
      })
    )
    .min(1)
    .required(),
});

//Create a New Bill - Post
const createBill = async (req: Request, res: Response) => {
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
    billInput.cTaxId = String(billInput.cTaxId);
    billInput.businessAcc = Number(billInput.businessAcc);
    billInput.storeId = Number(billInput.storeId);
    billInput.cashStatus = ["true", "1", "yes"].includes(
      String(billInput.cashStatus).toLowerCase()
    );
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
    // Generate BillId as INV + YEAR + / + RUNNING NUMBER
    const currentYear = new Date().getFullYear();
    const latestBill = await prisma.bill.findFirst({
      where: {
        billId: {
          startsWith: `INV${currentYear}/`,
        },
      },
      orderBy: {
        id: "desc",
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
    // Calculate total from all product items
    const total = billInput.productItems.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0
    );

    // Handle repeat bills
    try {
      const createdBills = [];
      const currentDate = new Date();
      const originalDate = new Date(billInput.purchaseAt);
      
      if (billInput.repeat && billInput.repeatMonths && billInput.repeatMonths > 1) {
        // Create repeat bills for each month
        for (let i = 0; i < billInput.repeatMonths; i++) {
          // Calculate the date for each month (same day of month)
          const billDate = new Date(originalDate);
          billDate.setMonth(originalDate.getMonth() + i);
          
          // Only create bills for future dates (don't create past bills)
          if (billDate >= currentDate || i === 0) {
            // Generate unique billId for each month
            const billYear = billDate.getFullYear();
            const latestBillForYear = await prisma.bill.findFirst({
              where: {
                billId: {
                  startsWith: `INV${billYear}/`,
                },
              },
              orderBy: {
                id: "desc",
              },
            });
            
            let monthRunningNumber = 1;
            if (latestBillForYear && latestBillForYear.billId) {
              const match = latestBillForYear.billId.match(/INV\d{4}\/(\d+)/);
              if (match && match[1]) {
                monthRunningNumber = parseInt(match[1], 10) + 1;
              }
            }
            
            const monthBillId = `INV${billYear}/${monthRunningNumber}`;
            
            const bill = await prisma.bill.create({
              data: {
                billId: monthBillId,
                cName: billInput.cName,
                cLastName: billInput.cLastName,
                cPhone: billInput.cPhone,
                cGender: billInput.cGender,
                cAddress: billInput.cAddress,
                cPostId: billInput.cPostId,
                cProvince: billInput.cProvince,
                cTaxId: billInput.cTaxId,
                product: {
                  create: billInput.productItems.map((item) => ({
                    product: item.product,
                    quantity: item.quantity,
                    unitPrice: item.unitPrice,
                    unit: item.unit,
                  })),
                },
                payment: billInput.payment,
                platform: store.platform,
                cashStatus: billInput.cashStatus,
                memberId: billInput.memberId,
                purchaseAt: billDate,
                businessAcc: billInput.businessAcc,
                storeId: billInput.storeId,
                image: req.file?.filename ?? "",
                total
              },
            });
            
            createdBills.push(bill);
          }
        }
        
        res.json({
          status: "ok",
          message: `Created ${createdBills.length} bills successfully for ${billInput.repeatMonths} months`,
          bills: createdBills,
          totalBills: createdBills.length
        });
      } else {
        // Create single bill
        const bill = await prisma.bill.create({
          data: {
            billId: billInput.billId,
            cName: billInput.cName,
            cLastName: billInput.cLastName,
            cPhone: billInput.cPhone,
            cGender: billInput.cGender,
            cAddress: billInput.cAddress,
            cPostId: billInput.cPostId,
            cProvince: billInput.cProvince,
            cTaxId: billInput.cTaxId,
            product: {
              create: billInput.productItems.map((item) => ({
                product: item.product,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                unit: item.unit,
              })),
            },
            payment: billInput.payment,
            platform: store.platform,
            cashStatus: billInput.cashStatus,
            memberId: billInput.memberId,
            purchaseAt: billInput.purchaseAt,
            businessAcc: billInput.businessAcc,
            storeId: billInput.storeId,
            image: req.file?.filename ?? "",
            total        
          },
        });
        
        res.json({
          status: "ok",
          message: "Created bill successfully",
          bill: bill,
        });
      }
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
      select: {
        id: true,
        billId: true,
        cName: true,
        cLastName: true,
       // cPhone: true,       
        payment: true,
       // cashStatus: true,       
        purchaseAt: true,             
        storeId: true,
        total: true,
        platform : true,
        product: {
          select: {
            product: true,
            quantity: true, 
            unitPrice: true,
            unit: true
          },
        }, // Include product items
        repeat :true
        
      
      },
      take: 100, // Limit to 100 records
    });

    



    console.log("🚀 Get Bills API:", bills);
    res.json(bills);
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
      include: {
        product: true, // Include product items
      },
    });
 console.log("🚀 Get Bill by ID:", bill);
    res.json(bill);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "failed to get bill" });
  }
};

// Update a Bill - Put
const updateBill = async (req: Request, res: Response) => {
  const { id } = req.params;
  upload(req, res, async (err) => {
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
    billInput.cTaxId = String(billInput.cTaxId);
    billInput.businessAcc = Number(billInput.businessAcc);
    billInput.storeId = Number(billInput.storeId);
    billInput.cashStatus = ["true", "1", "yes"].includes(
      String(billInput.cashStatus).toLowerCase()
    );
    billInput.purchaseAt = new Date(billInput.purchaseAt);
    const store = await prisma.store.findUnique({
      where: {
        id: billInput.storeId,
      },
    });
    if (!store) {
      return res.status(404).json({ message: "Store not found" });
    }
    // Calculate total from all product items
    const total = billInput.productItems.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0
    );
    try {
      // Delete existing product items for this bill (to fully replace)
      await prisma.productItem.deleteMany({
        where: { billId: Number(id) },
      });
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
          cTaxId: billInput.cTaxId,
          product: {
            create: billInput.productItems.map((item) => ({
              product: item.product,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              unit: item.unit
            })),
          },
          payment: billInput.payment,
          platform: store.platform, // IncomeChannel
          storeId: billInput.storeId,
          cashStatus: billInput.cashStatus,
          memberId: billInput.memberId,
          purchaseAt: billInput.purchaseAt,
          businessAcc: billInput.businessAcc,
          image: req.file?.filename ?? "",
          total
        
        },
      });
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
        total: true,
      },
      where: {
        memberId: memberId as string,
        purchaseAt: {
          gte: new Date(new Date().getFullYear(), 0, 1),
          lte: new Date(new Date().getFullYear(), 11, 31),
        },
      },
    });
    if (!sales || !sales._sum.total) {
      return res.status(404).json({ message: "No sales found for this year" });
    }
    sales._sum.total = Number(sales._sum.total);
    const anualSalesM = sales._sum.total.toFixed(2); // Format to 2 decimal places
    // Do not assign string to a number property; instead, return formatted value separately
    console.log("🚀 Get This Year Sales API:", anualSalesM);
    res.json({
      anualSalesM,
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
  getthisYearSales,
};
