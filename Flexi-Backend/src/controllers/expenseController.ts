import { Request, Response } from "express";
import { Bank, PrismaClient as PrismaClient1 } from "../generated/client1";
import Joi from "joi";
import { format } from "date-fns-tz";
import multer from "multer";
import multerConfig from "../middleware/multer_config";
import { deleteFromS3, extractS3Key } from "../services/imageService";

const upload = multer(multerConfig.multerConfigImage.config).single(
  multerConfig.multerConfigImage.keyUpload[0]
);

//Create  instance of PrismaClient
const prisma = new PrismaClient1();

// Interface for request body from client
interface Expense {
  date: Date;
  amount: number;
  group: string;
  image: string;
  memberId: string;
  businessAcc: number;
  note: string;
  desc: string;
  channel: Bank;
}

// Validate the request body
const schema = Joi.object({
  date: Joi.date().required(),
  amount: Joi.number().required(),
  group: Joi.string(),
  desc: Joi.string(),
  image: Joi.string(),
  memberId: Joi.string().required(),
  businessAcc: Joi.number(),
  note: Joi.string(),
  channel: Joi.string(),
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

    if (!req.file) {
      return res
        .status(400)
        .json({ message: "File upload failed. No file received." });
    }
    // Merge the uploaded file S3 URL key into the expense object
    const expenseInput: Expense = {
      ...req.body,
      image: (req.file as any)?.location ?? "", // Use type assertion for custom property
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
    const expenseInput: Expense = {
      ...req.body,
      image: (req.file as any)?.location ?? "", // Use type assertion for custom property
    };
    const { id } = req.params;
    const { memberId } = req.body;

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

export {
  createExpense,
  getExpenses,
  getExpenseById,
  updateExpenseById,
  searchExpenseByDate,
  autoDeleteExpense,
  deleteExpenseById,
};
