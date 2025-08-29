import { fillWHTTemplateWithThaiFont } from "../utils/pdfWHTTemplateThai";
import path from "path";
import { Request, Response } from "express";
import { Bank, PrismaClient as PrismaClient1 } from "../generated/client1";
import Joi from "joi";
import { format } from "date-fns-tz";
import multer from "multer";
import multerConfig from "../middleware/multer_config";
import { deleteFromS3, extractS3Key } from "../services/imageService";

const upload = multer(multerConfig.multerConfigImage.config).single(
  multerConfig.multerConfigImage.keyUpload
);

//Create  instance of PrismaClient
const prisma = new PrismaClient1();

// Interface for request body from client
interface Expense {
  WHTpercent?: number;
  date: Date;
  amount: number;
  group: string;
  image: string;
  memberId: string;
  businessAcc: number;
  note: string;
  desc: string;
  channel: Bank;
  vat: boolean;
  vatAmount: number;
  withHoldingTax?: boolean;
  WHTAmount?: number;
}

// Validate the request body
const schema = Joi.object({
  WHTpercent: Joi.number().optional(),
  date: Joi.date().required(),
  amount: Joi.number().required(),
  group: Joi.string(),
  desc: Joi.string().allow(""),
  image: Joi.string().allow(""),
  memberId: Joi.string().required(),
  businessAcc: Joi.number(),
  note: Joi.string(),
  channel: Joi.string(),
  vat: Joi.boolean().optional(),
  vatAmount: Joi.number().optional(),
  withHoldingTax: Joi.boolean().optional(),
  WHTAmount: Joi.number().optional(),
});

//  create a new expense - Post
const createExpense = async (req: Request, res: Response) => {
  // Handle image upload with multer
  upload(req, res, async (err: any) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }
    // Debugging: Log the uploaded file details
    console.log("Uploaded file:", req.file);

    // Merge the uploaded file S3 URL key into the expense object
    // Convert string 'true'/'false' to boolean for vat and withHoldingTax
    const expenseInput: Expense = {
      ...req.body,
      vat: req.body.vat === "true" ? true : false,
      withHoldingTax: req.body.withHoldingTax === "true" ? true : false,
      image: req.file
        ? (req.file as any)?.location ?? ""
        : req.body.image ?? "",
      desc: req.body.desc ?? "",
    };

    console.log("Input", expenseInput);

    // Validate the request body
    const { error } = schema.validate(expenseInput);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const memberId = req.body.memberId;
    // Find businessAcc by memberId
    const businessAcc = await prisma.businessAcc.findFirst({
      where: {
        memberId: memberId,
      },
      select: {
        id: true,
      },
    });

    if (!businessAcc) {
      return res.status(400).json({ message: "Business account not found" });
    }

    // Convert date time to format Expected ISO-8601 DateTime
    const formattedDate = format(
      new Date(expenseInput.date),
      "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'"
    );
    console.log("Formatted Date", formattedDate);

    // Calcalate vatAmount form 7% of amount
    if (expenseInput.vat) {
      expenseInput.vatAmount = expenseInput.amount * 0.07;
    }

    // Calculate WHTAmount form withHoldingTax and WHTpercent
    if (expenseInput.withHoldingTax) {
      expenseInput.WHTAmount =
        (expenseInput.amount * (expenseInput.WHTpercent ?? 0)) / 100;
    }

    try {
      const expense = await prisma.expense.create({
        data: {
          date: formattedDate,
          amount: expenseInput.amount,
          desc: expenseInput.desc,
          group: expenseInput.group,
          image: expenseInput.image,
          memberId: expenseInput.memberId,
          businessAcc: businessAcc.id,
          note: expenseInput.note,
          channel: expenseInput.channel,
          save: false,
          vat: expenseInput.vat,
          vatAmount: expenseInput.vatAmount,
          withHoldingTax: expenseInput.withHoldingTax ?? false,
          WHTAmount: expenseInput.WHTAmount ?? 0,
          WHTpercent: expenseInput.WHTpercent ?? 0,
        },
      });
      res.json(expense);
    } catch (e) {
      console.error(e);
      res.status(500).json({ message: "Failed to create expense" });
    }
  });
};

// Get All Expenses - Get
// use in DetectExpense
const getExpenses = async (req: Request, res: Response) => {
  const { memberId } = req.params;
  try {
    const expenses = await prisma.expense.findMany({
      where: {
        memberId: memberId,
        save: false,
      },
    });
    res.json(expenses);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "failed to get expenses" });
  }
};

// Get a Expense by ID - Get
const getExpenseById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const expense = await prisma.expense.findUnique({
      where: {
        id: Number(id),
      },
      select: {
        date: true,
        note: true,
        desc: true,
        amount: true,
        image: true,
        group: true,
        vat: true,
        vatAmount: true,
        withHoldingTax: true,
        WHTAmount: true,
        WHTpercent: true,
      },
    });
    res.json(expense);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "failed to get expense" });
  }
};

// Update a Expense by ID - Put
const updateExpenseById = async (req: Request, res: Response) => {
  upload(req, res, async (err: any) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }

    // Fetch the existing product to get the current image URL
    const existingExpense = await prisma.expense.findUnique({
      where: { id: Number(req.params.id) },
    });

    if (!existingExpense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    // Delete the old image from S3 if a new image is uploaded
    if (req.file && existingExpense.image) {
      const oldImageKey = extractS3Key(existingExpense.image);
      try {
        await deleteFromS3(oldImageKey);
        console.log("Old image deleted from S3");
      } catch (e) {
        console.error("Failed to delete old image from S3:", e);
      }
    }

    // Merge the uploaded file S3 URL key into the expense object
    // Convert string 'true'/'false' to boolean for vat and withHoldingTax
    const expenseInput: Expense = {
      ...req.body,
      vat: req.body.vat === "true" ? true : false,
      withHoldingTax: req.body.withHoldingTax === "true" ? true : false,
      image: (req.file as any)?.location ?? "", // Use type assertion for custom property
    };
    const { id } = req.params;
    const { memberId } = req.body;

    // Recalculate vatAmount if vat is true and amount is present
    if (expenseInput.vat && expenseInput.amount) {
      expenseInput.vatAmount = expenseInput.amount * 0.07;
    }

    // Recalculate WHTAmount if withHoldingTax is true and WHTpercent is present
    if (expenseInput.withHoldingTax && expenseInput.WHTpercent) {
      expenseInput.WHTAmount =
        (expenseInput.amount * expenseInput.WHTpercent) / 100;
    }

    try {
      const expense = await prisma.expense.update({
        where: {
          id: Number(id),
          memberId,
        },
        data: {
          date: expenseInput.date,
          amount: expenseInput.amount,
          desc: expenseInput.desc,
          group: expenseInput.group,
          note: expenseInput.note,
          image: expenseInput.image,
          memberId: expenseInput.memberId,
          vat: expenseInput.vat,
          vatAmount: expenseInput.vatAmount,
          withHoldingTax: expenseInput.withHoldingTax ?? false,
          WHTAmount: expenseInput.WHTAmount ?? 0,
          WHTpercent: expenseInput.WHTpercent ?? 0,
        },
      });
      res.json(expense);
    } catch (e) {
      console.error(e);
    }
  });
};

// Delete a Expense by ID - Delete
const deleteExpenseById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const memberId = req.body.memberId;

  try {
    // Fetch the existing expense to get the current image URL
    const existingExpense = await prisma.expense.findUnique({
      where: {
        id: Number(id),
      },
      select: {
        image: true,
      },
    });

    if (!existingExpense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    // Delete the image from S3 if it exists
    if (existingExpense.image) {
      const imageKey = extractS3Key(existingExpense.image);
      try {
        await deleteFromS3(imageKey);
        console.log("Image deleted from S3");
      } catch (e) {
        console.error("Failed to delete image from S3:", e);
      }
    }

    // Delete the expense from the database
    await prisma.expense.delete({
      where: {
        id: Number(id),
        memberId: memberId,
      },
    });

    res.json({ message: `Expense with ID ${id} deleted` });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Failed to delete expense" });
  }
};

// search Expense by date - Get
const searchExpenseByDate = async (req: Request, res: Response) => {
  const { date } = req.params;
  try {
    const expense = await prisma.expense.findMany({
      where: {
        date: date,
      },
    });
    res.json(expense);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "failed to search expense" });
  }
};

// auto delete if save is false
const autoDeleteExpense = async () => {
  try {
    const expense = await prisma.expense.deleteMany({
      where: {
        save: false,
      },
    });
    console.log(expense);
  } catch (e) {
    console.error(e);
  }
};

//get all expenses by memberId query
const getThisYearExpensesAPI = async (req: Request, res: Response) => {
  const { memberId } = req.query;
  try {
    if (!memberId) {
      return res.status(400).json({ message: "Member ID is required" });
    }
    const expense = await prisma.expense.aggregate({
      _sum: {
        amount: true,
      },
      where: {
        memberId: memberId as string,
        date: {
          gte: new Date(new Date().getFullYear(), 0, 1),
          lte: new Date(new Date().getFullYear(), 11, 31),
        },
      },
    });
    if (!expense || !expense._sum.amount) {
      return res
        .status(404)
        .json({ message: "No expenses found for this year" });
    }
    const amountNumber = Number(expense._sum.amount);
    const anualExpenseM = amountNumber.toFixed(2); // Format to 2 decimal places

    // Do not assign string to a number property; instead, return formatted value separately
    console.log("🚀 Get This Year Expense API:", anualExpenseM);
    res.json({
      anualExpenseM,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "failed to get this year expense" });
  }
};

// API endpoint to fill WHTTemplate.pdf with Thai font and return the filled PDF (stream, no save)
const generateWHTDocument = async (req: Request, res: Response) => {
  try {
    const { taxpayerName, taxpayerId, amount, date } = req.body;
    const positions = {
      taxpayerName: { x: 100, y: 700, size: 14 },
      taxpayerId: { x: 100, y: 680, size: 12 },
      amount: { x: 400, y: 650, size: 12 },
      date: { x: 400, y: 630, size: 12 },
    };
    const fields = { taxpayerName, taxpayerId, amount, date };
    const templatePath = path.resolve(__dirname, "../../WHTTemplate.pdf");
    const thaiFontPath = path.resolve(__dirname, "../../fonts/THSarabunNew.ttf");
    const pdfBuffer = await fillWHTTemplateWithThaiFont({
      templatePath,
      fields,
      positions,
      thaiFontPath,
    });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=WHTDocument.pdf");
    res.send(pdfBuffer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to generate WHT document" });
  }
};

export {
  createExpense,
  getExpenses,
  getExpenseById,
  updateExpenseById,
  searchExpenseByDate,
  autoDeleteExpense,
  deleteExpenseById,
  getThisYearExpensesAPI,
  generateWHTDocument,
};
