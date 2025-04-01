import { Request, Response } from "express";
import { Payment, PrismaClient, SocialMedia, Gender } from "@prisma/client";
import Joi from "joi";
import multer from "multer";
import multerConfig from "./multer_config";

const upload = multer(multerConfig.multerConfigImage.config).single(multerConfig.multerConfigImage.keyUpload);

// Create  instance of PrismaClient
const prisma = new PrismaClient();

//Interface for request body from client
interface billInput {
  id?: number;
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
  createdAt: Joi.date(),
  updatedAt: Joi.date(),
  purchaseAt: Joi.date(),
  cName: Joi.string().required(),
  cLastName: Joi.string().required(),
  cPhone: Joi.string().min(10).max(10).required(),
  cGender: Joi.string().valid("Female", "Male").required(),
  cAddress: Joi.string().required(),
  cPostId: Joi.string().required(),
  cProvince: Joi.string().required(),
  product: Joi.string().required(),
  payment: Joi.string().valid("COD", "Transfer", "CreditCard").required(),
  amount: Joi.number().required(),
  platform: Joi.string().valid(
    "Facebook",
    "Tiktok",
    "Shopee",
    "Instagram",
    "Youtube",
    "Lazada",
    "Line",
    "X",
    "Google"
  ),
  cashStatus: Joi.boolean().required(),
  price: Joi.number().required(),
  memberId: Joi.string().required(),
  businessAcc: Joi.number().required(),
  image: Joi.string(),
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

    // Create a new bill into the database
    try {
      const bill = await prisma.bill.create({
        data: {
          // createdAt: new Date(),
          // updatedAt: new Date(),
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

    //  convert string to boolean in cashStatus
    billInput.cashStatus = ["true", "1", "yes"].includes(
      String(billInput.cashStatus).toLowerCase()
    );

    // convert string to date in purchaseAt
    billInput.purchaseAt = new Date(billInput.purchaseAt);

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




export {
  createBill,
  getBills,
  getBillById,
  deleteBill,
  updateBill,
  searchBill,
  updateCashStatusById,
  
};
