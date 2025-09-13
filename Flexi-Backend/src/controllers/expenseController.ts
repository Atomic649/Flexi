import { fillWHTTemplateWithThaiFont } from "../utils/pdfWHTTemplateThai";
import { extractTextFromImage, detectDataPresence } from "../utils/ocrUtils";
import path from "path";
import { Request, Response } from "express";
import {
  Bank,
  ExpenseGroup,
  PrismaClient as PrismaClient1,
  taxType,
} from "../generated/client1";
import Joi from "joi";
import { format } from "date-fns-tz";
import { th } from "date-fns/locale";
import multer from "multer";
import multerConfig from "../middleware/multer_config";
import {
  deleteFromS3,
  extractS3Key,
  uploadToS3,
} from "../services/imageService";

const upload = multer(multerConfig.multerConfigImageMemory.config).single(
  multerConfig.multerConfigImageMemory.keyUpload
);

//Create  instance of PrismaClient
const prisma = new PrismaClient1();

// Interface for request body from client
interface Expense {
  WHTpercent?: number;
  date: Date;
  amount: number;
  group: ExpenseGroup;
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
  sName?: string;
  taxInvoiceNo?: string;
  sTaxId?: string;
  sAddress?: string;
  branch?: string;
  taxType?: taxType;
  expNo?: string;
}

// Validate the request body
const schema = Joi.object({
  WHTpercent: Joi.number().optional(),
  date: Joi.date().required(),
  amount: Joi.number().required(),
  group: Joi.string()
    .valid(
      "Employee",
      "Freelancer",
      "Office",
      "OfficeRental",
      "CarRental",
      "Commission",
      "Advertising",
      "Marketing",
      "Copyright",
      "Dividend",
      "Interest",
      "Influencer",
      "Accounting",
      "Legal",
      "Taxation",
      "Transport",
      "Product",
      "Packing",
      "Fuel",
      "Utilities",
      "Maintenance"
    )
    .required(),
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
  sName: Joi.string().optional().allow(""),
  taxInvoiceNo: Joi.string().optional().allow(""),
  sTaxId: Joi.string().optional().allow(""),
  sAddress: Joi.string().optional().allow(""),
  branch: Joi.string().optional().allow(""),
  taxType: Joi.string().valid("Individual", "Juristic").optional(),
  expNo: Joi.string().optional().allow(""),
});

//  create a new expense - Post
const createExpense = async (req: Request, res: Response) => {
  // Handle image upload with multer
  upload(req, res, async (err: any) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }
    // Debugging: Log the uploaded file details
    console.log("Uploaded file:", req.file ? "File received" : "No file");

    let imageUrl = req.body.image ?? "";

    // Initialize expenseInput with form data
    let expenseInput: Expense = {
      ...req.body,
      vat: req.body.vat === "true" ? true : false,
      withHoldingTax: req.body.withHoldingTax === "true" ? true : false,
      image: imageUrl,
      desc: req.body.desc ?? "",
      taxType:
        req.body.taxType === "Juristic" ? taxType.Juristic : taxType.Individual,
    };

    // Initialize OCR alert variable
    let ocrAlert = null;

    // Process OCR if an image was uploaded
    if (req.file && req.file.buffer) {
      console.log("Processing OCR for uploaded image...");
      try {
        console.log("Image buffer size:", req.file.buffer.length);

        // Detect data presence in the uploaded image
        const detectionResult = await extractTextFromImage(req.file.buffer);
        console.log("Detection result:", detectionResult);

        // Report OCR detection results
        console.log("📊 OCR DETECTION REPORT:");

        if (detectionResult.summary.hasAtLeast2Names) {
          console.log(
            "✅ NAMES: PASS - Found",
            detectionResult.namesFound.length,
            "names"
          );
          detectionResult.namesFound.forEach((name, index) => {
            console.log(`   ${index + 1}. ${name}`);
          });
        } else {
          console.log(
            "❌ NAMES: FAIL - Found",
            detectionResult.namesFound.length,
            "names (need ≥2)"
          );
        }

        if (detectionResult.summary.hasAtLeast1TaxId) {
          console.log(
            "✅ TAX IDs: PASS - Found",
            detectionResult.taxIdsFound.length,
            "tax IDs"
          );
          detectionResult.taxIdsFound.forEach((taxId, index) => {
            console.log(`   ${index + 1}. ${taxId}`);
          });
        } else {
          console.log("❌ TAX IDs: FAIL - No tax IDs found");
        }

        console.log(
          `${detectionResult.summary.hasAmount ? "✅" : "❌"} AMOUNT: ${
            detectionResult.summary.hasAmount ? "PASS" : "FAIL"
          }`
        );
        console.log(
          `${detectionResult.summary.hasDate ? "✅" : "❌"} DATE: ${
            detectionResult.summary.hasDate ? "PASS" : "FAIL"
          }`
        );
        console.log(
          `${detectionResult.summary.hasAddress ? "✅" : "❌"} ADDRESS: ${
            detectionResult.summary.hasAddress ? "PASS" : "FAIL"
          }`
        );
        console.log(
          `${
            detectionResult.summary.hasReceiptTitle ? "✅" : "❌"
          } RECEIPT TITLE: ${
            detectionResult.summary.hasReceiptTitle ? "PASS" : "FAIL"
          }`
        );

        // Calculate overall detection status
        const allRequirementsMet =
          detectionResult.summary.hasAtLeast2Names &&
          detectionResult.summary.hasAtLeast1TaxId &&
          detectionResult.summary.hasAmount &&
          detectionResult.summary.hasDate &&
          detectionResult.summary.hasAddress &&
          detectionResult.summary.hasReceiptTitle;

        // Prepare OCR alert for frontend
        if (!allRequirementsMet) {
          const failedRequirements = [];
          
          if (!detectionResult.summary.hasAtLeast2Names) {
            failedRequirements.push(`Names (found ${detectionResult.namesFound.length}, need ≥2)`);
          }
          if (!detectionResult.summary.hasAtLeast1TaxId) {
            failedRequirements.push(`Tax IDs (found ${detectionResult.taxIdsFound.length}, need ≥1)`);
          }
          if (!detectionResult.summary.hasAmount) {
            failedRequirements.push("Amount (not detected)");
          }
          if (!detectionResult.summary.hasDate) {
            failedRequirements.push("Date (not detected)");
          }
          if (!detectionResult.summary.hasAddress) {
            failedRequirements.push("Address with Thai province (not detected)");
          }
          if (!detectionResult.summary.hasReceiptTitle) {
            failedRequirements.push("Receipt title (need: ใบเสร็จ, ใบกำกับภาษี, etc.)");
          }

          ocrAlert = {
            type: 'warning',
            title: 'OCR Detection Alert',
            message: 'Some required data elements are missing from the uploaded image',
            details: {
              status: 'partial',
              failedRequirements,
              detectedData: {
                names: detectionResult.namesFound,
                taxIds: detectionResult.taxIdsFound,
                hasAmount: detectionResult.summary.hasAmount,
                hasDate: detectionResult.summary.hasDate,
                hasAddress: detectionResult.summary.hasAddress,
                hasReceiptTitle: detectionResult.summary.hasReceiptTitle
              },
              // Add selectable options for frontend
              selectableOptions: {
                names: detectionResult.namesFound || [],
                taxIds: detectionResult.taxIdsFound || [],
                amounts: detectionResult.amountsDetected || [],
                dates: detectionResult.datesDetected || [],
                addresses: detectionResult.addressesDetected || [],
                provinces: detectionResult.provincesDetected || []
              }
            }
          };
        } else {
          ocrAlert = {
            type: 'success',
            title: 'OCR Detection Success',
            message: 'All required data elements detected in the uploaded image',
            details: {
              status: 'success',
              detectedData: {
                names: detectionResult.namesFound,
                taxIds: detectionResult.taxIdsFound,
                hasAmount: detectionResult.summary.hasAmount,
                hasDate: detectionResult.summary.hasDate,
                hasAddress: detectionResult.summary.hasAddress,
                hasReceiptTitle: detectionResult.summary.hasReceiptTitle
              },
              // Add selectable options for frontend (even for success)
              selectableOptions: {
                names: detectionResult.namesFound || [],
                taxIds: detectionResult.taxIdsFound || [],
                amounts: detectionResult.amountsDetected || [],
                dates: detectionResult.datesDetected || [],
                addresses: detectionResult.addressesDetected || [],
                provinces: detectionResult.provincesDetected || []
              }
            }
          };
        }

        if (allRequirementsMet) {
          console.log("🎉 OCR DETECTION SUCCESS - All requirements met!");
        } else {
          console.log("⚠️  OCR DETECTION PARTIAL - Some requirements missing");
          console.log("🚨 OCR Alert created:", ocrAlert?.type);
        }

        console.log(
          "Final expense input (form data only - OCR is detection-only):",
          {
            sName: expenseInput.sName,
            sAddress: expenseInput.sAddress,
            sTaxId: expenseInput.sTaxId,
            amount: expenseInput.amount,
            date: expenseInput.date,
            desc: expenseInput.desc,
          }
        );

        // Now upload the image to S3
        console.log("Uploading image to S3...");
        imageUrl = await uploadToS3(req.file.buffer, req.file.mimetype);
        expenseInput.image = imageUrl;
        console.log("Image uploaded to S3:", imageUrl);
      } catch (ocrError) {
        console.warn("OCR processing failed:", ocrError);
        
        // Set OCR failure alert
        ocrAlert = {
          type: 'error',
          title: 'OCR Processing Failed',
          message: 'Unable to process the uploaded image for data detection',
          details: {
            status: 'error',
            error: 'OCR processing encountered an error. The image was uploaded but data detection could not be performed.'
          }
        };

        // Still upload the image to S3 even if OCR fails
        try {
          console.log("Uploading image to S3 (OCR failed)...");
          imageUrl = await uploadToS3(req.file.buffer, req.file.mimetype);
          expenseInput.image = imageUrl;
          console.log("Image uploaded to S3:", imageUrl);
        } catch (uploadError) {
          console.error("S3 upload also failed:", uploadError);
          return res.status(500).json({ message: "Failed to upload image" });
        }
      }
    }

    console.log("Final Input", expenseInput);

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

    // generate expNo in format EXPYYYYMMDDXXXX
    const datePart = format(new Date(), "yyyyMMdd");
    const randomPart = Math.floor(1000 + Math.random() * 9000); // Random 4 digit number
    expenseInput.expNo = `EXP${datePart}${randomPart}`;

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
          sName: expenseInput.sName ?? "",
          taxInvoiceNo: expenseInput.taxInvoiceNo ?? "",
          sTaxId: expenseInput.sTaxId ?? "",
          sAddress: expenseInput.sAddress ?? "",
          branch: expenseInput.branch ?? "",
          taxType: expenseInput.taxType ?? taxType.Individual,
          expNo: expenseInput.expNo ?? "",
        },
      });
      
      // Include OCR alert in response if present
      const response = ocrAlert ? { ...expense, ocrAlert } : expense;
      
      // Debug logging for OCR alert
      console.log("🔍 Final OCR Alert being sent to frontend:", ocrAlert);
      console.log("📤 Full response object:", ocrAlert ? "Contains ocrAlert" : "No ocrAlert");
      
      res.json(response);
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
        sName: true,
        taxInvoiceNo: true,
        sTaxId: true,
        sAddress: true,
        branch: true,
        taxType: true,
        expNo: true,
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
      taxType:
        req.body.taxType === "Juristic" ? taxType.Juristic : taxType.Individual,
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
          sName: expenseInput.sName ?? "",
          taxInvoiceNo: expenseInput.taxInvoiceNo ?? "",
          sTaxId: expenseInput.sTaxId ?? "",
          sAddress: expenseInput.sAddress ?? "",
          branch: expenseInput.branch ?? "",
          taxType: expenseInput.taxType ?? taxType.Individual,
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
    const {
      sName,
      sTaxId,
      amount,
      date,
      taxInvoiceNo,
      sAddress,
      memberId,
      WHTAmount,
      group,
      taxType,
    } = req.body;

    // Debug: Log what we received
    // console.log("🔍 Received WHTAmount:", WHTAmount, "Type:", typeof WHTAmount);
    // console.log("🔍 Full request body:", req.body);
    // console.log("🔍 Received group:", group);

    // if business detail with memberId
    const businessDetail = await prisma.businessAcc.findFirst({
      where: {
        memberId: memberId,
      },
      select: {
        businessName: true,
        taxId: true,
        businessAddress: true,
      },
    });

    // If business details are found, use them
    const businessName = businessDetail?.businessName || "";
    const rawTaxId = businessDetail?.taxId || "";
    const businessAddress = businessDetail?.businessAddress || "";

    // Function to create individual digit positions for Thai Tax ID
    const createTaxIdDigitPositions = (taxId: string, yPosition: number) => {
      const xPositions = [
        378, 396, 408, 420, 432, 451, 462, 475, 486, 499, 518, 529, 548,
      ];
      const cleanTaxId = taxId.replace(/[\s-]/g, "").padEnd(13, " ");
      const positions: Record<
        string,
        { x: number; y: number; size: number; align: string }
      > = {};

      for (let i = 0; i < 13; i++) {
        const digit = cleanTaxId[i] || "";
        if (digit && digit !== " ") {
          positions[`digit${i + 1}`] = {
            x: xPositions[i],
            y: yPosition,
            size: 14,
            align: "center",
          };
        }
      }

      return { positions, digits: cleanTaxId.split("") };
    };

    // Coverse all req to String
    const sNameStr = String(sName || "");
    const rawSTaxId = String(sTaxId || "");
    const rawBusinessTaxId = rawTaxId;

    // Create digit positions for both tax IDs
    const sTaxIdMapping = createTaxIdDigitPositions(rawSTaxId, 748);
    const taxIdMapping = createTaxIdDigitPositions(rawBusinessTaxId, 679);

    // Format amount to 2 decimal places
    const amountNum = Number(amount) || 0;
    const amountStr = amountNum.toFixed(2);

    const dateObj = new Date(date);
    const buddhistYear = dateObj.getFullYear() + 543;
    const dateStr = `${format(dateObj, "dd/MM")}/${buddhistYear} `;
    const ThaiMonth = format(dateObj, "MMMM", { locale: th });
    const dateNumber = `${format(dateObj, "dd")}`;

    const taxInvoiceNoStr = String(taxInvoiceNo || "");
    const sAddressStr = String(sAddress || "");

    // Format WHTAmount to 2 decimal places
    const WHTAmountNum = Number(WHTAmount) || 0;
    const WHTAmountStr = WHTAmountNum.toFixed(2);

    const fullThaiTextLetterWHTAmount = convertNumberToThaiText(WHTAmountStr);

    const zero = "0.00";

    // Conditional positioning based on group
    const isEmployee = group === "Employee";
    const isFreelancerOrCommission =
      group === "Freelancer" || group === "Commission";
    const isRentalMarketingTransport =
      group === "CarRental" ||
      group === "OfficeRental" ||
      group === "Marketing" ||
      group === "Advertising" ||
      group === "Influencer" ||
      group === "Product" ||
      group === "Packing" ||
      group === "Office" ||
      group === "Transport";
    const isCopyright = group === "Copyright";
    const isInterest = group === "Interest";
    const isDividend = group === "Dividend";

    let amountY, WHTAmountY, dateY;

    if (isEmployee) {
      amountY = 537;
      WHTAmountY = 537;
      dateY = 537;
    } else if (isFreelancerOrCommission) {
      amountY = 522;
      WHTAmountY = 522;
      dateY = 522;
    } else if (isCopyright) {
      amountY = 508;
      WHTAmountY = 508;
      dateY = 508;
    } else if (isDividend) {
      amountY = 392;
      WHTAmountY = 392;
      dateY = 392;
    } else if (isInterest) {
      amountY = 493;
      WHTAmountY = 493;
      dateY = 493;
    } else if (isRentalMarketingTransport) {
      amountY = 218;
      WHTAmountY = 218;
      dateY = 218;
    } else {
      amountY = 202;
      WHTAmountY = 202;
      dateY = 202;
    }

    const positions = {
      sName: { x: 65, y: 658, size: 12, align: "left" },
      //   taxInvoiceNo: { x: 400, y: 610, size: 14 },
      sAddress: { x: 67, y: 632, size: 12, align: "left" },

      businessName: { x: 65, y: 732, size: 12, align: "left" },
      businessAddress: { x: 67, y: 708, size: 12, align: "left" },

      // Individual digit positions for sTaxId (y=748)
      ...Object.fromEntries(
        Object.entries(sTaxIdMapping.positions).map(([key, pos]) => [
          `sTaxId_${key}`,
          pos,
        ])
      ),

      // Individual digit positions for taxId (y=679)
      ...Object.fromEntries(
        Object.entries(taxIdMapping.positions).map(([key, pos]) => [
          `taxId_${key}`,
          pos,
        ])
      ),

      // Decimal point centered at specified coordinates - conditional based on group
      amount: { x: 474, y: amountY, size: 12, align: "decimal" },
      WHTAmount: { x: 545, y: WHTAmountY, size: 12, align: "decimal" },

      totalAmount: { x: 474, y: 183, size: 12, align: "decimal" },
      totalWHTAmount: { x: 545, y: 183, size: 12, align: "decimal" },

      date: { x: 340, y: dateY, size: 12, align: "left" },
      dateNumber: { x: 347, y: 77, size: 12, align: "center" },
      ThaiMonth: { x: 380, y: 77, size: 12, align: "center" },
      BuddhistYear: { x: 435, y: 77, size: 12, align: "center" },

      fullThaiTextLetterWHTAmount: { x: 205, y: 162, size: 12, align: "left" },

      checkmark: { x: 86, y: 122, size: 10, align: "center" },

      // Conditional checkmarks based on group and taxType
      checkmark_employee: { x: 212, y: 605, size: 10, align: "center" }, // Employee group
      checkmark_interest_dividend: {
        x: 398,
        y: 605,
        size: 10,
        align: "center",
      }, // Interest or Dividend
      checkmark_juristic: { x: 398, y: 586, size: 10, align: "center" }, // Other groups + Juristic
      checkmark_individual: { x: 475, y: 605, size: 10, align: "center" }, // Other groups + Individual

      zero1: { x: 248, y: 145, size: 12, align: "left" },
      zero2: { x: 373, y: 145, size: 12, align: "left" },
      zero3: { x: 512, y: 145, size: 12, align: "left" },
    };

    // Determine which checkmarks to show based on conditions
    const shouldShowEmployeeCheckmark = group === "Employee";
    const shouldShowInterestDividendCheckmark =
      group === "Interest" || group === "Dividend";
    const shouldShowJuristicCheckmark =
      !shouldShowEmployeeCheckmark &&
      !shouldShowInterestDividendCheckmark &&
      taxType === "Juristic";
    const shouldShowIndividualCheckmark =
      !shouldShowEmployeeCheckmark &&
      !shouldShowInterestDividendCheckmark &&
      taxType === "Individual";

    // Debug logging
    console.log("🔍 Debug checkmark conditions:");
    console.log("  group:", group);
    console.log("  taxType:", taxType);
    console.log("  shouldShowEmployeeCheckmark:", shouldShowEmployeeCheckmark);
    console.log(
      "  shouldShowInterestDividendCheckmark:",
      shouldShowInterestDividendCheckmark
    );
    console.log("  shouldShowJuristicCheckmark:", shouldShowJuristicCheckmark);
    console.log(
      "  shouldShowIndividualCheckmark:",
      shouldShowIndividualCheckmark
    );

    const fields = {
      sName: sNameStr,
      amount: amountStr,
      date: dateStr,
      fullThaiTextLetterWHTAmount: fullThaiTextLetterWHTAmount,
      //   taxInvoiceNo: taxInvoiceNoStr,
      sAddress: sAddressStr,
      businessName: businessName,
      businessAddress: businessAddress,
      WHTAmount: WHTAmountStr,
      totalAmount: amountStr,
      totalWHTAmount: WHTAmountStr,
      checkmark: "✓",

      // Conditional checkmarks based on group and taxType
      checkmark_employee: shouldShowEmployeeCheckmark ? "✓" : "",
      checkmark_interest_dividend: shouldShowInterestDividendCheckmark
        ? "✓"
        : "",
      checkmark_juristic: shouldShowJuristicCheckmark ? "✓" : "",
      checkmark_individual: shouldShowIndividualCheckmark ? "✓" : "",

      zero1: zero,
      zero2: zero,
      zero3: zero,
      dateNumber: dateNumber,
      ThaiMonth: ThaiMonth,
      BuddhistYear: String(buddhistYear),

      // Individual digits for sTaxId
      ...Object.fromEntries(
        sTaxIdMapping.digits.map((digit, index) => [
          `sTaxId_digit${index + 1}`,
          digit,
        ])
      ),

      // Individual digits for taxId
      ...Object.fromEntries(
        taxIdMapping.digits.map((digit, index) => [
          `taxId_digit${index + 1}`,
          digit,
        ])
      ),
    };

    // Debug logging for checkmark fields
    // console.log("🔍 Debug checkmark fields:");
    // console.log("  checkmark_employee:", fields.checkmark_employee);
    // console.log("  checkmark_interest_dividend:", fields.checkmark_interest_dividend);
    // console.log("  checkmark_juristic:", fields.checkmark_juristic);
    // console.log("  checkmark_individual:", fields.checkmark_individual);

    const templatePath = path.resolve(__dirname, "../../WHTTemplate.pdf");
    const thaiFontPath = path.resolve(
      __dirname,
      "../../fonts/THSarabunNew.ttf"
    );
    const checkmarkFontPath = path.resolve(
      __dirname,
      "../../fonts/NotoSansSC-Bold.ttf"
    );
    const pdfBuffer = await fillWHTTemplateWithThaiFont({
      templatePath,
      fields,
      positions,
      thaiFontPath,
      checkmarkFontPath,
    });
    console.log(fields);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=WHTDocument.pdf"
    );
    res.send(pdfBuffer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to generate WHT document" });
  }
};

  


// Update expense with selected OCR data
const updateExpenseWithOCRData = async (req: Request, res: Response) => {
  try {
    const { expenseId, selectedData } = req.body;
    
    // Validate required fields
    if (!expenseId || !selectedData) {
      return res.status(400).json({ message: "Expense ID and selected data are required" });
    }

    const { sName, sTaxId, amount, date, address } = selectedData;

    // Update the expense with selected OCR data
    const updatedExpense = await prisma.expense.update({
      where: { id: Number(expenseId) },
      data: {
        ...(sName && { sName }),
        ...(sTaxId && { sTaxId }),
        ...(amount && { amount: Number(amount) }),
        ...(date && { date }),
        ...(address && { sAddress: address }),
      }
    });

    console.log("✅ Expense updated with OCR data:", updatedExpense.id);
    res.json({ success: true, expense: updatedExpense });
  } catch (error) {
    console.error("❌ Error updating expense with OCR data:", error);
    res.status(500).json({ message: "Failed to update expense with OCR data" });
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
  updateExpenseWithOCRData,
};
function convertNumberToThaiText(input: string | number): string {
  // Converts a number or string to Thai text representation (words)
  const thaiNumbers = [
    "ศูนย์",
    "หนึ่ง",
    "สอง",
    "สาม",
    "สี่",
    "ห้า",
    "หก",
    "เจ็ด",
    "แปด",
    "เก้า",
  ];

  const thaiUnits = ["", "สิบ", "ร้อย", "พัน", "หมื่น", "แสน", "ล้าน"];

  let numberStr = String(input);

  // Check if it's a currency amount (has decimal point)
  if (numberStr.includes(".")) {
    const [bahtPart, satangPart] = numberStr.split(".");
    const baht = parseInt(bahtPart) || 0;
    const satang = parseInt(satangPart.padEnd(2, "0").slice(0, 2)) || 0;

    let result = "";

    if (baht > 0) {
      result += convertThaiYear(baht) + "บาท";
    }

    if (satang > 0) {
      if (result) result += "";
      result += convertThaiYear(satang) + "สตางค์";
    } else if (baht > 0) {
      result += "ถ้วน";
    }

    return result || "ศูนย์บาท";
  }

  // Extract only the year part (last 4 digits) if it's a date string
  const yearMatch = numberStr.match(/(\d{4})/);

  if (yearMatch) {
    const year = parseInt(yearMatch[1]);
    return convertThaiYear(year);
  }

  // If it's just a number, convert normally
  const num = parseInt(String(input).replace(/\D/g, ""));
  if (isNaN(num) || num === 0) return "ศูนย์";

  return convertThaiYear(num);

  function convertThaiYear(num: number): string {
    if (num === 0) return "ศูนย์";

    const digits = num.toString().split("").reverse();
    let result = "";

    for (let i = 0; i < digits.length; i++) {
      const digit = parseInt(digits[i]);

      if (digit === 0) continue;

      let digitText = "";

      // Special cases for Thai number reading
      if (i === 1 && digit === 1) {
        // For tens place, 1 becomes "สิบ" not "หนึ่งสิบ"
        digitText = thaiUnits[1];
      } else if (i === 1 && digit === 2) {
        // For 20-29, use "ยี่สิบ" instead of "สองสิบ"
        digitText = "ยี่" + thaiUnits[1];
      } else if (i === 0 && digit === 1 && digits.length > 1) {
        // For ones place, if there are other digits and it's 1, use "เอ็ด"
        digitText = "เอ็ด";
      } else {
        digitText = thaiNumbers[digit] + (i > 0 ? thaiUnits[i] : "");
      }

      result = digitText + result;
    }

    return result;
  }
}
