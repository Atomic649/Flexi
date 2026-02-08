import { fillWHTTemplateWithThaiFont } from "../utils/pdfWHTTemplateThai";
import { extractTextFromImage } from "../utils/ocrUtils";
import { autoDetectTaxType } from "../utils/ocrKeywords";
import path from "path";
import { Request, Response } from "express";
import {
  Bank,
  ExpenseGroup,
  ExpenseStatus,
  taxType,
} from "../generated/client1/client";
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

import { flexiDBPrismaClient } from "../../lib/PrismaClient1";


const attachmentUploadConfig =
  multerConfig.multerConfigExpenseAttachmentMemory;

const upload = multer(attachmentUploadConfig.config).fields([
  { name: attachmentUploadConfig.imageKeyUpload, maxCount: 1 },
  { name: attachmentUploadConfig.pdfKeyUpload, maxCount: 1 },
]);

type MulterFiles =
  | Record<string, Express.Multer.File[]>
  | Express.Multer.File[]
  | undefined;

type MulterReadyRequest = Request & {
  file?: Express.Multer.File;
  files?: MulterFiles;
};

const getUploadedFile = (
  req: MulterReadyRequest,
  fieldName: string
): Express.Multer.File | undefined => {
  const files = req.files;
  if (!files) return undefined;

  if (Array.isArray(files)) {
    return files.find((file) => file.fieldname === fieldName);
  }

  const fieldFiles = files[fieldName];
  if (Array.isArray(fieldFiles) && fieldFiles.length > 0) {
    return fieldFiles[0];
  }

  return undefined;
};

//Create  instance of PrismaClient
const prisma = flexiDBPrismaClient ;

// Helper: parse flexible date inputs including Thai long-form and numeric dd/mm/yyyy
function parseFlexibleDate(raw: any): Date | null {
  if (!raw) return null;
  if (raw instanceof Date && !isNaN(raw.getTime())) return raw;
  const str = String(raw).trim();

  // 1) Try numeric dd/mm/yyyy or dd-mm-yyyy
  const numericMatch = str.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
  if (numericMatch) {
    let day = parseInt(numericMatch[1], 10);
    let month = parseInt(numericMatch[2], 10);
    let year = parseInt(numericMatch[3], 10);
    // If year looks like Buddhist year (>2500), convert to AD
    if (year > 2400) year = year - 543;
    const d = new Date(year, month - 1, day);
    if (!isNaN(d.getTime())) return d;
  }

  // 2) Try Thai long-form: วันที่ 22 กันยายน 2568 or 27 ส.ค. 2568
  const thaiMatch = str.match(/(?:วันที่\s*)?(\d{1,2})\s*([ก-๙\.]{2,15})\s*(\d{4})/i);
  if (thaiMatch) {
    const day = parseInt(thaiMatch[1], 10);
    let rawMonth = thaiMatch[2].replace(/\./g, "").trim();
    let year = parseInt(thaiMatch[3], 10);
    // convert Buddhist year to AD if necessary
    if (year > 2400) year = year - 543;
    // Map Thai month names/abbreviations to month index
    const thaiMonths: { [k: string]: number } = {
      "มกราคม": 0,
      "กุมภาพันธ์": 1,
      "มีนาคม": 2,
      "เมษายน": 3,
      "พฤษภาคม": 4,
      "มิถุนายน": 5,
      "กรกฎาคม": 6,
      "สิงหาคม": 7,
      "กันยายน": 8,
      "ตุลาคม": 9,
      "พฤศจิกายน": 10,
      "ธันวาคม": 11,
      "ม.ค": 0,
      "ก.พ": 1,
      "มี.ค": 2,
      "เม.ย": 3,
      "พ.ค": 4,
      "มิ.ย": 5,
      "ก.ค": 6,
      "ส.ค": 7,
      "ก.ย": 8,
      "ต.ค": 9,
      "พ.ย": 10,
      "ธ.ค": 11,
      "ม.ค.": 0,
      "ก.พ.": 1,
      "มี.ค.": 2,
      "เม.ย.": 3,
      "พ.ค.": 4,
      "มิ.ย.": 5,
      "ก.ค.": 6,
      "ส.ค.": 7,
      "ก.ย.": 8,
      "ต.ค.": 9,
      "พ.ย.": 10,
      "ธ.ค.": 11,
    };
    // Try exact key, then try lowercased keys without diacritics as fallback
    let monthIndex = thaiMonths[rawMonth] ?? thaiMonths[rawMonth.replace(/\u0E47|\u0E48|\u0E49/g, "")] ;
    if (monthIndex === undefined) {
      // try approximate matching by prefix
      const found = Object.keys(thaiMonths).find((k) => rawMonth.indexOf(k) !== -1 || k.indexOf(rawMonth) !== -1);
      if (found) monthIndex = thaiMonths[found];
    }
    if (monthIndex !== undefined) {
      const d = new Date(year, monthIndex, day);
      if (!isNaN(d.getTime())) return d;
    }
  }

  return null;
}

// Interface for request body from client
interface Expense {
  WHTpercent?: number;
  date: Date;
  amount: number;
  group: ExpenseGroup;
  image: string;
  pdf?: string;
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
  status?: ExpenseStatus;
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
      "Maintenance",
      "Operation",
      "Others"
    )
    .required(),
  desc: Joi.string().allow(""),
  image: Joi.string().allow(""),
  pdf: Joi.string().allow(""),
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
  ocrDataApplied: Joi.string().optional().allow(""), // Flag to indicate OCR data resubmission
  expenseId: Joi.number().optional(), // ID of existing expense to update
  status: Joi.string().valid("Pass", "Fail", "Warning").optional(),
});
//  create a new expense - Post
const createExpense = async (req: Request, res: Response) => {
  // Handle image upload with multer
  upload(req, res, async (err: any) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }
    const multerReq = req as MulterReadyRequest;
    const imageFile = getUploadedFile(
      multerReq,
      attachmentUploadConfig.imageKeyUpload
    );
    const pdfFile = getUploadedFile(
      multerReq,
      attachmentUploadConfig.pdfKeyUpload
    );
    multerReq.file = imageFile;

    console.log(
      "Uploaded image:",
      imageFile ? `${imageFile.originalname} (${imageFile.mimetype})` : "none"
    );
    console.log(
      "Uploaded pdf:",
      pdfFile ? `${pdfFile.originalname} (${pdfFile.mimetype})` : "none"
    );

    let imageUrl = req.body.image ?? "";
    if (imageFile?.buffer) {
      try {
        imageUrl = await uploadToS3(
          imageFile.buffer,
          imageFile.mimetype,
          imageFile.fieldname
        );
      } catch (uploadError) {
        console.error("Failed to upload image", uploadError);
        return res.status(500).json({ message: "Failed to upload image" });
      }
    }

    let pdfUrl = req.body.pdf ?? "";
    if (pdfFile?.buffer) {
      try {
        pdfUrl = await uploadToS3(
          pdfFile.buffer,
          pdfFile.mimetype,
          pdfFile.fieldname
        );
      } catch (uploadError) {
        console.error("Failed to upload PDF", uploadError);
        return res.status(500).json({ message: "Failed to upload PDF" });
      }
    }

    // Merge the uploaded file S3 URL key into the expense object
    // Convert string 'true'/'false' to boolean for vat and withHoldingTax
    // Normalize date: if incoming date parses to a valid Date, use Date object; otherwise keep raw string
    const rawDate = req.body.date;
    let normalizedDate: any = rawDate;
    if (rawDate) {
      const parsed = new Date(rawDate);
      if (!isNaN(parsed.getTime())) {
        normalizedDate = parsed;
      } else {
        // keep as string (e.g., Thai long-form 'วันที่ 22 กันยายน 2568') so Joi can accept string
        normalizedDate = rawDate;
      }
    }

    const parsedDate = parseFlexibleDate(normalizedDate) ?? new Date();
    //  convert date time to format Expected ISO-8601 DateTime


    // Ensure date is an ISO-8601 string before validation/storage
    const isoDateString = parsedDate instanceof Date ? format(parsedDate, "yyyy-MM-dd'T'HH:mm:ssXXX") : String(parsedDate);

    const expenseInput: Expense = {
      ...req.body,
      vat: req.body.vat === "true" ? true : false,
      withHoldingTax: req.body.withHoldingTax === "true" ? true : false,
      image: imageUrl,
      pdf: pdfUrl,
      desc: req.body.desc ?? "",
      group: req.body.group || "Others", // Default to "Others" if group is empty
      date: isoDateString as unknown as Date,
      taxType:
        req.body.taxType === "Juristic" ? taxType.Juristic : taxType.Individual,
    };

    console.log("Input", expenseInput);

    // Validate the request body
    const { error } = schema.validate(expenseInput);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const memberId = req.body.memberId;
    // Find businessAcc by memberId (array column)
    const businessAcc = await prisma.businessAcc.findFirst({
      where: {
        memberId: { has: memberId },
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
          pdf: expenseInput.pdf,
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
      res.json(expense);
    } catch (e) {
      console.error(e);
      res.status(500).json({ message: "Failed to create expense" });
    }
  });
};

//  create a new expense - Post
const createExpenseWithOCR = async (req: Request, res: Response) => {
  // Handle image upload with multer
  upload(req, res, async (err: any) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }
    const multerReq = req as MulterReadyRequest;
    const imageFile = getUploadedFile(
      multerReq,
      attachmentUploadConfig.imageKeyUpload
    );
    const pdfFile = getUploadedFile(
      multerReq,
      attachmentUploadConfig.pdfKeyUpload
    );
    multerReq.file = imageFile;

    // Debugging: Log the uploaded file details
    // console.log("Uploaded file:", imageFile ? "File received" : "No file");
    let imageUrl = req.body.image ?? "";
    let pdfUrl = req.body.pdf ?? "";

      // Initialize expenseInput with form data, handling empty values properly
    // Normalize date input to avoid Invalid Date objects for non-ISO/Thai long-form strings
    const rawDateOCR = req.body.date;
    let normalizedDateOCR: any = rawDateOCR ? rawDateOCR : new Date();
    if (rawDateOCR) {
      const parsed = new Date(rawDateOCR);
      normalizedDateOCR = !isNaN(parsed.getTime()) ? parsed : rawDateOCR;
    }

    const parsedDateOCR = parseFlexibleDate(normalizedDateOCR) ?? new Date();

    let expenseInput: Expense = {
      ...req.body,
      vat: req.body.vat === "true" ? true : false,
      withHoldingTax: req.body.withHoldingTax === "true" ? true : false,
      image: imageUrl,
      pdf: pdfUrl,
      desc: req.body.desc ?? "",
      // Handle potentially empty required fields when image is present
      date: parsedDateOCR,
      amount: req.body.amount ? Number(req.body.amount) : 0,
      note: req.body.note || "",
      group: req.body.group || "Others", // Default group to "Others" if empty
      taxType:
        req.body.taxType === "Juristic" ? taxType.Juristic : taxType.Individual,
    };

    // Initialize OCR alert variable
    let ocrAlert = null;
    // Track whether business name was detected and the effective names count used for requirement checks
    let businessNameDetected = false;
    let namesCountForRequirement = 0;

    // Check if this is a resubmission with OCR data applied
    const ocrDataApplied = req.body.ocrDataApplied === "true";

    // Process OCR if an image was uploaded and it's not a resubmission with OCR data
  if (imageFile && imageFile.buffer && !ocrDataApplied) {
      console.log("Processing OCR for uploaded image...");
      try {
        // Get user's business account information to filter out from OCR results
        const memberId = req.body.memberId;
        const businessAcc = await prisma.businessAcc.findFirst({
          where: {
            memberId: { has: memberId },
          },
          select: {
            id: true,
            businessName: true,
            taxId: true,
          },
        });

        // Detect data presence in the uploaded image
  const detectionResult = await extractTextFromImage(imageFile.buffer);

        //  if detect thai date 22 กรกฎาคม 2568 or 22 ก.ค. 2568 convert to be dd/mm/yyyy
        const parsedDatesFromOCR = detectionResult.datesDetected
          .map((dateStr) => parseFlexibleDate(dateStr))
          .filter((d): d is Date => d !== null);

        // Convert Thai dates to dd/mm/yyyy format
        const convertedDates = parsedDatesFromOCR.map((date) => {
          const day = date.getDate().toString().padStart(2, "0");
          const month = (date.getMonth() + 1).toString().padStart(2, "0");
          const year = date.getFullYear();
          return `${day}/${month}/${year}`;
        });

        if (convertedDates.length > 0) {
          console.log("   ✅ Detected and converted dates from OCR:", convertedDates);
          detectionResult.datesDetected = convertedDates;
        }

        // Filter out user's business information from OCR results
        if (businessAcc) {
          // Filter out business name from names but count it toward requirement
          const originalNames = detectionResult.namesFound.slice();
          const originalNamesCount = originalNames.length;
          const filteredNames = originalNames.filter((name) => {
            const nameToCheck = name.toLowerCase().trim();
            const businessNameToCheck = businessAcc.businessName
              .toLowerCase()
              .trim();

            // Extract company name from text that might have prefixes like "ก 2 ชื่อบริษัท:"
            // Look for the actual business name anywhere in the detected text
            const cleanBusinessName = businessNameToCheck
              .replace(/บริษัท\s+/g, "") // Remove "บริษัท" prefix
              .replace(/จำกัด|จํากัด/g, "") // Remove "จำกัด" suffix
              .trim();

            const cleanDetectedName = nameToCheck
              .replace(/^.*ชื่อบริษัท:\s*/i, "") // Remove "ชื่อบริษัท:" prefix
              .replace(/^.*บริษัท\s+/i, "") // Remove "บริษัท" prefix
              .replace(/จำกัด|จํากัด.*$/gi, "") // Remove "จำกัด" and anything after
              .trim();

            // Check various forms of matching
            const isBusinessName =
              // Exact match
              nameToCheck === businessNameToCheck ||
              name.trim() === businessAcc.businessName.trim() ||
              // Contains full business name
              nameToCheck.includes(businessNameToCheck) ||
              businessNameToCheck.includes(nameToCheck) ||
              // Clean name comparison (without company prefixes/suffixes)
              cleanDetectedName.includes(cleanBusinessName) ||
              cleanBusinessName.includes(cleanDetectedName) ||
              // Check if the core business name appears anywhere in the detected text
              nameToCheck.includes(cleanBusinessName) ||
              cleanBusinessName.includes(cleanDetectedName);

            if (isBusinessName) {
              return false;
            }
            return true;
          });
          // Keep filtered names for frontend selectable options, but record if business name existed
          detectionResult.namesFound = filteredNames;
          businessNameDetected = originalNamesCount > filteredNames.length;
          namesCountForRequirement =
            filteredNames.length + (businessNameDetected ? 1 : 0);

          // Filter out business tax ID from tax IDs
          const filteredTaxIds = detectionResult.taxIdsFound.filter((taxId) => {
            const isBusinessTaxId = taxId.trim() === businessAcc.taxId.trim();
            if (isBusinessTaxId) {
              // console.log(`   🚫 Filtered out business tax ID: "${taxId}"`);
              return false;
            }
            return true;
          });
          detectionResult.taxIdsFound = filteredTaxIds;

          // Filter out business addresses from detected addresses
          const filteredAddresses = detectionResult.addressesDetected.filter(
            (address) => {
              const addressToCheck = address.toLowerCase().trim();

              // Known business address patterns to filter out
              const businessAddressPatterns = [
                /555\/39.*หมู่บ้าน.*พลีโน่/i, // Specific address pattern
                /พลีโน่.*รามอินทรา.*จตุโชติ/i, // Location identifiers
                /สามวาตะวันตก.*คลองสามวา/i, // District identifiers
              ];

              // Check if this address matches user's business patterns
              const isBusinessAddress =
                businessAddressPatterns.some((pattern) =>
                  pattern.test(address)
                ) ||
                // Also check if the address contains the business name
                addressToCheck.includes(businessAcc.businessName.toLowerCase());

              if (isBusinessAddress) {
                // console.log(`   🚫 Filtered out business address: "${address}"`);
                return false;
              }
              return true;
            }
          );
          detectionResult.addressesDetected = filteredAddresses;
          // Update summary counts after filtering
          // Count business name (if detected) toward the "2 names" requirement
          detectionResult.summary.hasAtLeast2Names =
            namesCountForRequirement >= 2;
          detectionResult.summary.hasAtLeast1TaxId = filteredTaxIds.length >= 1;
        }

        // Report OCR detection results
        console.log("📊 OCR DETECTION REPORT:");

        if (detectionResult.summary.hasAtLeast2Names) {
          console.log(
            "✅ NAMES: PASS - Counted",
            namesCountForRequirement,
            `(filtered list shows ${detectionResult.namesFound.length} entries)`
          );
        } else {
          console.log(
            "❌ NAMES: FAIL - Counted",
            namesCountForRequirement,
            `(filtered list shows ${detectionResult.namesFound.length} entries) need ≥2`
          );
        }

        if (detectionResult.summary.hasAtLeast1TaxId) {
          console.log(
            "✅ TAX IDs: PASS - Found",
            detectionResult.taxIdsFound.length,
            "tax IDs"
          );
          // detectionResult.taxIdsFound.forEach((taxId, index) => {
          //   console.log(`   ${index + 1}. ${taxId}`);
          // });
        } else {
          console.log("❌ TAX IDs: FAIL - No tax IDs found");
        }

        if (detectionResult.summary.hasTaxInvoiceId) {
          console.log(
            "✅ TAX INVOICE IDs: PASS - Found",
            detectionResult.taxInvoiceIdsFound.length,
            "tax invoice IDs"
          );
          // detectionResult.taxInvoiceIdsFound.forEach((taxInvoiceId, index) => {
          //   console.log(`   ${index + 1}. ${taxInvoiceId}`);
          // });
        } else {
          console.log("❌ TAX INVOICE IDs: FAIL - No tax invoice IDs found");
        }

        if (detectionResult.summary.hasVatAmount) {
          console.log(
            "✅ VAT AMOUNTS: PASS - Found",
            detectionResult.vatAmountsFound.length,
            "VAT amounts"
          );
          // detectionResult.vatAmountsFound.forEach((vatAmount, index) => {
          //   console.log(`   ${index + 1}. ${vatAmount}`);
          // });
        } else {
          console.log("❌ VAT AMOUNTS: FAIL - No VAT amounts found");
        }

        // Calculate overall detection status
        const allRequirementsMet =
          detectionResult.summary.hasAtLeast2Names &&
          detectionResult.summary.hasAtLeast1TaxId &&
          detectionResult.summary.hasTaxInvoiceId &&
          detectionResult.summary.hasAmount &&
          detectionResult.summary.hasDate &&
          detectionResult.summary.hasAddress &&
          detectionResult.summary.hasReceiptTitle;

        // Check if only taxId is missing (all other requirements met)
        const onlyTaxIdMissing =
          detectionResult.summary.hasAtLeast2Names &&
          !detectionResult.summary.hasAtLeast1TaxId &&
          detectionResult.summary.hasTaxInvoiceId &&
          detectionResult.summary.hasAmount &&
          detectionResult.summary.hasDate &&
          detectionResult.summary.hasAddress &&
          detectionResult.summary.hasReceiptTitle;

        // Prepare OCR alert for frontend
        const failedRequirements = [];

        if (!detectionResult.summary.hasReceiptTitle) {
          failedRequirements.push({
            key: "ocr.failed.receiptTitle",
            values: {
              examples: ["ใบเสร็จ", "ใบกำกับภาษี", "ใบเสร็จรับเงิน"],
            },
          });
        }
        if (!detectionResult.summary.hasAtLeast1TaxId) {
          failedRequirements.push({
            key: "ocr.failed.taxId",
            values: {
              found: detectionResult.taxIdsFound.length,
              required: 1,
            },
          });
        }
        if (!detectionResult.summary.hasTaxInvoiceId) {
          failedRequirements.push({
            key: "ocr.failed.taxInvoiceId",
            values: {
              found: detectionResult.taxInvoiceIdsFound.length,
              required: 1,
            },
          });
        }
        if (!detectionResult.summary.hasAmount) {
          failedRequirements.push({ key: "ocr.failed.amount" });
        }
        if (!detectionResult.summary.hasDate) {
          failedRequirements.push({ key: "ocr.failed.date" });
        }
        if (!detectionResult.summary.hasAddress) {
          failedRequirements.push({ key: "ocr.failed.address" });
        }

        // Decide alert type: success / warning (only taxId missing) / fail
        if (allRequirementsMet) {
          ocrAlert = {
            type: "success",
            title: "OCR Detection Success",
            message:
              "All required data elements detected in the uploaded image",
            details: {
              status: "success",
              detectedData: {
                names: detectionResult.namesFound,
                taxIds: detectionResult.taxIdsFound,
                taxInvoiceIds: detectionResult.taxInvoiceIdsFound,
                vatAmounts: detectionResult.vatAmountsFound,
                hasAmount: detectionResult.summary.hasAmount,
                hasDate: detectionResult.summary.hasDate,
                hasAddress: detectionResult.summary.hasAddress,
                hasReceiptTitle: detectionResult.summary.hasReceiptTitle,
              },
              selectableOptions: {
                names: detectionResult.namesFound || [],
                taxIds: detectionResult.taxIdsFound || [],
                taxInvoiceIds: detectionResult.taxInvoiceIdsFound || [],
                vatAmounts: detectionResult.vatAmountsFound || [],
                amounts: detectionResult.amountsDetected || [],
                dates: detectionResult.datesDetected || [],
                addresses: detectionResult.addressesDetected || [],
                provinces: detectionResult.provincesDetected || [],
              },
            },
          };
        } else if (onlyTaxIdMissing) {
          ocrAlert = {
            type: "warning",
            title: "OCR Detection Warning",
            message:
              "Tax ID is missing but allowed. Other required data detected.",
            details: {
              status: "partial",
              allowedMissing: "taxId",
              failedRequirements: [
                {
                  key: "ocr.failed.taxId",
                  values: {
                    found: detectionResult.taxIdsFound.length,
                    required: 1,
                  },
                },
              ],
              detectedData: {
                names: detectionResult.namesFound,
                taxIds: detectionResult.taxIdsFound,
                taxInvoiceIds: detectionResult.taxInvoiceIdsFound,
                vatAmounts: detectionResult.vatAmountsFound,
                hasAmount: detectionResult.summary.hasAmount,
                hasDate: detectionResult.summary.hasDate,
                hasAddress: detectionResult.summary.hasAddress,
                hasReceiptTitle: detectionResult.summary.hasReceiptTitle,
              },
              selectableOptions: {
                names: detectionResult.namesFound || [],
                taxIds: detectionResult.taxIdsFound || [],
                taxInvoiceIds: detectionResult.taxInvoiceIdsFound || [],
                vatAmounts: detectionResult.vatAmountsFound || [],
                amounts: detectionResult.amountsDetected || [],
                dates: detectionResult.datesDetected || [],
                addresses: detectionResult.addressesDetected || [],
                provinces: detectionResult.provincesDetected || [],
              },
            },
          };
        } else {
          ocrAlert = {
            type: "fail",
            title: "OCR Detection Alert",
            message:
              "Some required data elements are missing from the uploaded image",
            details: {
              status: "partial",
              failedRequirements,
              detectedData: {
                names: detectionResult.namesFound,
                taxIds: detectionResult.taxIdsFound,
                taxInvoiceIds: detectionResult.taxInvoiceIdsFound,
                vatAmounts: detectionResult.vatAmountsFound,
                hasAmount: detectionResult.summary.hasAmount,
                hasDate: detectionResult.summary.hasDate,
                hasAddress: detectionResult.summary.hasAddress,
                hasReceiptTitle: detectionResult.summary.hasReceiptTitle,
              },
              selectableOptions: {
                names: detectionResult.namesFound || [],
                taxIds: detectionResult.taxIdsFound || [],
                taxInvoiceIds: detectionResult.taxInvoiceIdsFound || [],
                vatAmounts: detectionResult.vatAmountsFound || [],
                amounts: detectionResult.amountsDetected || [],
                dates: detectionResult.datesDetected || [],
                addresses: detectionResult.addressesDetected || [],
                provinces: detectionResult.provincesDetected || [],
              },
            },
          };
        }
        if (allRequirementsMet) {
          console.log("🎉 OCR DETECTION SUCCESS - All requirements met!");
        } else {
          console.log("⚠️  OCR DETECTION PARTIAL - Some requirements missing");
          // console.log("🚨 OCR Alert created:", ocrAlert?.type);
        }

    // Now upload the image to S3
    // console.log("Uploading image to S3...");
    imageUrl = await uploadToS3(imageFile.buffer, imageFile.mimetype);
        expenseInput.image = imageUrl;
        // console.log("Image uploaded to S3:", imageUrl);
      } catch (ocrError) {
        console.warn("OCR processing failed:", ocrError);

        // Set OCR failure alert
        ocrAlert = {
          type: "error",
          title: "OCR Processing Failed",
          message: "Unable to process the uploaded image for data detection",
          details: {
            status: "error",
            error:
              "OCR processing encountered an error. The image was uploaded but data detection could not be performed.",
          },
        };

        // Still upload the image to S3 even if OCR fails
        try {
          // console.log("Uploading image to S3 (OCR failed)...");
          imageUrl = await uploadToS3(imageFile.buffer, imageFile.mimetype);
          expenseInput.image = imageUrl;
          // console.log("Image uploaded to S3:", imageUrl);
        } catch (uploadError) {
          console.error("S3 upload also failed:", uploadError);
          return res.status(500).json({ message: "Failed to upload image" });
        }
      }
    } else if (imageFile && imageFile.buffer && ocrDataApplied) {
      // If this is a resubmission with OCR data, just upload the image without processing OCR
      console.log(
        "Skipping OCR processing - using selected OCR data from frontend"
      );
      try {
        // console.log("Uploading image to S3 (OCR data already selected)...");
        imageUrl = await uploadToS3(imageFile.buffer, imageFile.mimetype);
        expenseInput.image = imageUrl;
        // console.log("Image uploaded to S3:", imageUrl);
      } catch (uploadError) {
        console.error("S3 upload failed:", uploadError);
        return res.status(500).json({ message: "Failed to upload image" });
      }
    }

    // console.log("Final Input", expenseInput);

    // Create flexible validation schema based on whether image is present
    if (pdfFile && pdfFile.buffer) {
      try {
        pdfUrl = await uploadToS3(
          pdfFile.buffer,
          pdfFile.mimetype,
          pdfFile.fieldname
        );
        expenseInput.pdf = pdfUrl;
      } catch (uploadError) {
        console.error("Failed to upload PDF", uploadError);
        return res.status(500).json({ message: "Failed to upload PDF" });
      }
    }

    const hasImage = imageFile && imageFile.buffer;
    const flexibleSchema = hasImage
      ? // When image is present, make required fields optional (OCR can fill them)
        Joi.object({
          WHTpercent: Joi.number().optional(),
          date: Joi.alternatives()
            .try(Joi.date(), Joi.string().allow(""))
            .optional(),
          amount: Joi.alternatives()
            .try(Joi.number(), Joi.string().allow(""))
            .optional(),
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
              "Maintenance",
              "Others"
            )
            .optional()
            .allow(""),
          desc: Joi.string().allow(""),
          image: Joi.string().allow(""),
          pdf: Joi.string().allow(""),
          memberId: Joi.string().required(),
          businessAcc: Joi.number().optional(),
          note: Joi.string().optional().allow(""),
          channel: Joi.string().optional(),
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
          ocrDataApplied: Joi.string().optional().allow(""),
          expenseId: Joi.number().optional(),
          status: Joi.string().valid("Pass", "Fail", "Warning").optional(),
        })
      : // When no image, use original strict validation
        schema;

    // Validate the request body
    const { error } = flexibleSchema.validate(expenseInput);
    if (error) {
      console.log("❌ Validation error:", error.details[0].message);
      console.log("❌ Failed input:", expenseInput);
      return res.status(400).json({ message: error.details[0].message });
    }

    const memberId = req.body.memberId;
    // Find businessAcc by memberId (array column)
    const businessAcc = await prisma.businessAcc.findFirst({
      where: {
        memberId: { has: memberId },
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
    // console.log("Formatted Date", formattedDate);

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

    // Auto-detect juristic person based on supplier name (sName)
    if (expenseInput.sName) {
      console.log(
        `🔍 Auto-detecting tax type for sName: "${expenseInput.sName}"`
      );
      console.log(
        `🔍 Current taxType before detection: "${expenseInput.taxType}"`
      );

      const detectedTaxType = autoDetectTaxType(expenseInput.sName);
      console.log(`🔍 Detected tax type: "${detectedTaxType}"`);

      if (detectedTaxType === taxType.Juristic) {
        console.log(
          `🏢 Auto-detected Juristic person from sName: "${expenseInput.sName}"`
        );
        console.log(
          `🏢 Changing taxType from "${expenseInput.taxType}" to "${taxType.Juristic}"`
        );
        expenseInput.taxType = taxType.Juristic;
      } else {
        console.log(
          `👤 Keeping taxType as Individual for sName: "${expenseInput.sName}"`
        );
      }

      console.log(
        `🔍 Final taxType after detection: "${expenseInput.taxType}"`
      );
    } else {
      console.log(
        `⚠️ No sName provided, keeping taxType as: "${expenseInput.taxType}"`
      );
    }

    try {
      let expense;

      // If this is a resubmission with OCR data and we have an expense ID, update the existing expense
      if (ocrDataApplied && req.body.expenseId) {
        console.log(
          "🔄 Updating existing expense with ID:",
          req.body.expenseId
        );
        expense = await prisma.expense.update({
          where: {
            id: parseInt(req.body.expenseId),
          },
          data: {
            date: formattedDate,
            amount: expenseInput.amount,
            desc: expenseInput.desc,
            group: expenseInput.group,
            image: expenseInput.image,
            pdf: expenseInput.pdf,
            note: expenseInput.note,
            channel: expenseInput.channel,
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
            status: ocrAlert?.type === "success" ? "Pass" : "Warning",
          },
        });
        console.log("✅ Successfully updated expense with OCR data");
      } else {
        // Create new expense (original flow)
        expense = await prisma.expense.create({
          data: {
            date: formattedDate,
            amount: expenseInput.amount,
            desc: expenseInput.desc,
            group: expenseInput.group,
            image: expenseInput.image,
            pdf: expenseInput.pdf,
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
            status: ocrAlert?.type === "success" ? "Pass" : "Warning",
          },
        });
      }

      // Include OCR alert in response if present
      const response = ocrAlert ? { ...expense, ocrAlert } : expense;

      // Debug logging for OCR alert
      console.log("🔍 Final OCR Alert being sent to frontend:", ocrAlert);
      console.log(
        "📤 Full response object:",
        ocrAlert ? "Contains ocrAlert" : "No ocrAlert"
      );

      res.json(response);
    } catch (e) {
      console.error(e);
      res.status(500).json({ message: "Failed to create expense" });
    }
  });
};

/**
 * POST /expense/duplicate/:id
 * Duplicates an existing expense record but does NOT copy/upload the image
 * and sets `save` to true on the duplicated record.
 */
const duplicateExpense = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id || req.body.id);
    if (!id) return res.status(400).json({ message: "Expense id is required" });

    const original = await prisma.expense.findUnique({ where: { id } });
    if (!original) return res.status(404).json({ message: "Original expense not found" });

    // Try to find businessAcc for the original memberId
    const businessAcc = await prisma.businessAcc.findFirst({ where: { memberId: { has: original.memberId } }, select: { id: true } });
    const businessAccId = businessAcc ? businessAcc.id : null;

    // Generate a new expNo similar to createExpense
    const datePart = format(new Date(), "yyyyMMdd");
    const randomPart = Math.floor(1000 + Math.random() * 9000);
    const newExpNo = `EXP${datePart}${randomPart}`;

    // Use current date/time for duplicated record
    const nowFormatted = format(new Date(), "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");

    const created = await prisma.expense.create({
      data: {
        date: nowFormatted,
        amount: original.amount,
        desc: original.desc,
        group: original.group,
        // do NOT copy image (user requested without upload image)
        image: "",
        // copy pdf if present (optional)
        pdf: original.pdf ?? "",
        memberId: original.memberId,
        businessAcc: businessAccId ?? original.businessAcc,
        note: original.note,
        channel: original.channel,
        // mark duplicated record as saved
        save: true,
        vat: original.vat,
        vatAmount: original.vatAmount ?? 0,
        withHoldingTax: original.withHoldingTax ?? false,
        WHTAmount: original.WHTAmount ?? 0,
        WHTpercent: original.WHTpercent ?? 0,
        sName: original.sName ?? "",
        taxInvoiceNo: original.taxInvoiceNo ?? "",
        sTaxId: original.sTaxId ?? "",
        sAddress: original.sAddress ?? "",
        branch: original.branch ?? "",
        taxType: original.taxType ?? undefined,
        expNo: newExpNo,
      },
    });

    return res.status(201).json(created);
  } catch (err: any) {
    console.error("Failed to duplicate expense", err?.message || err);
    return res.status(500).json({ message: "Failed to duplicate expense" });
  }
};

// 
// Get All Expenses - Get
// use in DetectExpense
const getExpenses = async (req: Request, res: Response) => {
  const { memberId } = req.params;
  try {
          // Find business ID by member ID from member table
    const businessId = await prisma.member.findUnique({
      where : { uniqueId: memberId },
      select:{ businessId: true },
    });
const expenses = await prisma.expense.findMany({
      where: {
        businessAcc : businessId?.businessId ?? 0,
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
    pdf: true,
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

    const multerReq = req as MulterReadyRequest;
    const imageFile = getUploadedFile(
      multerReq,
      attachmentUploadConfig.imageKeyUpload
    );
    const pdfFile = getUploadedFile(
      multerReq,
      attachmentUploadConfig.pdfKeyUpload
    );
    multerReq.file = imageFile;

    // Fetch the existing product to get the current image URL
    const existingExpense = await prisma.expense.findUnique({
      where: { id: Number(req.params.id) },
    });

    if (!existingExpense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    const deleteExistingFile = async (
      fileUrl: string | null | undefined,
      type: "image" | "pdf"
    ) => {
      if (!fileUrl) return;
      const fileKey = extractS3Key(fileUrl);
      try {
        await deleteFromS3(fileKey);
        console.log(`✅ Old ${type} deleted from S3:`, fileKey);
      } catch (e: any) {
        if (e.name === "AccessDenied") {
          console.warn(
            `⚠️ S3 Delete permission denied - continuing without deletion:`,
            fileKey
          );
        } else {
          console.error(
            `❌ Failed to delete old ${type} from S3:`,
            fileKey,
            e.message || e
          );
        }
      }
    };

    if (imageFile && pdfFile) {
      return res.status(400).json({
        message: "Please upload either an image or a PDF, not both.",
      });
    }

    if (imageFile) {
      await deleteExistingFile(existingExpense.image, "image");
      await deleteExistingFile(existingExpense.pdf, "pdf");
    } else if (pdfFile) {
      await deleteExistingFile(existingExpense.pdf, "pdf");
      await deleteExistingFile(existingExpense.image, "image");
    }

    let imageUrl = req.body.image ?? existingExpense.image ?? "";
    let pdfUrl = req.body.pdf ?? existingExpense.pdf ?? "";

    if (imageFile?.buffer) {
      try {
        imageUrl = await uploadToS3(
          imageFile.buffer,
          imageFile.mimetype,
          imageFile.fieldname
        );
        pdfUrl = "";
      } catch (uploadError) {
        console.error("Failed to upload image", uploadError);
        return res.status(500).json({ message: "Failed to upload image" });
      }
    }

    if (pdfFile?.buffer) {
      try {
        pdfUrl = await uploadToS3(
          pdfFile.buffer,
          pdfFile.mimetype,
          pdfFile.fieldname
        );
        imageUrl = "";
      } catch (uploadError) {
        console.error("Failed to upload PDF", uploadError);
        return res.status(500).json({ message: "Failed to upload PDF" });
      }
    }

    if (pdfUrl) {
      imageUrl = "";
    } else if (imageUrl) {
      pdfUrl = "";
    }

    const normalizeGroupValue = (value?: string | null) => {
      if (typeof value !== "string") return "";
      const trimmed = value.trim();
      if (!trimmed || trimmed.toLowerCase() === "null") {
        return "";
      }
      return trimmed;
    };

    const normalizedGroup =
      normalizeGroupValue(req.body.group) ||
      normalizeGroupValue(existingExpense.group) ||
      "Others";

    const memberId = req.body.memberId || existingExpense.memberId;

    // Merge the uploaded file S3 URL key into the expense object
    // Convert string 'true'/'false' to boolean for vat and withHoldingTax
    // Preserve existing image URL when no new file is uploaded
    const expenseInput: Expense = {
      ...req.body,
      vat: req.body.vat === "true" ? true : false,
      withHoldingTax: req.body.withHoldingTax === "true" ? true : false,
      image: imageUrl,
      pdf: pdfUrl,
      group: normalizedGroup,
      memberId,
      taxType:
        req.body.taxType === "Juristic" ? taxType.Juristic : taxType.Individual,
    };
    const { id } = req.params;

    // Recalculate vatAmount if vat is true and amount is present
    if (expenseInput.vat && expenseInput.amount) {
      expenseInput.vatAmount = expenseInput.amount * 0.07;
    }

    // Recalculate WHTAmount if withHoldingTax is true and WHTpercent is present
    if (expenseInput.withHoldingTax && expenseInput.WHTpercent) {
      expenseInput.WHTAmount =
        (expenseInput.amount * expenseInput.WHTpercent) / 100;
    }
    // convert date time to format Expected ISO-8601 DateTime
    if (expenseInput.date) {
      expenseInput.date = new Date(expenseInput.date);
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
          pdf: expenseInput.pdf,
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
        pdf: true,
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
        console.log("✅ Image deleted from S3:", imageKey);
      } catch (e: any) {
        if (e.name === "AccessDenied") {
          console.warn(
            "⚠️ S3 Delete permission denied - continuing without deletion:",
            imageKey
          );
        } else {
          console.error(
            "❌ Failed to delete image from S3:",
            imageKey,
            e.message || e
          );
        }
        // Continue execution - S3 deletion failure shouldn't block the delete operation
      }
    }

    if (existingExpense.pdf) {
      const pdfKey = extractS3Key(existingExpense.pdf);
      try {
        await deleteFromS3(pdfKey);
        console.log("✅ PDF deleted from S3:", pdfKey);
      } catch (e: any) {
        if (e.name === "AccessDenied") {
          console.warn(
            "⚠️ S3 Delete permission denied - continuing without deletion:",
            pdfKey
          );
        } else {
          console.error(
            "❌ Failed to delete PDF from S3:",
            pdfKey,
            e.message || e
          );
        }
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
    // Find business ID by member ID from member table
    const businessId = await prisma.member.findUnique({
      where : { uniqueId: String(memberId) },
      select:{ businessId: true },
    });
    const expense = await prisma.expense.aggregate({
      _sum: {
        amount: true,
      },
      where: {
        businessAcc : businessId?.businessId ?? 0,

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
        memberId: { has: memberId },
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

    let dateObj: Date | null = null;
    if (date) {
      const parsedFlexible = parseFlexibleDate(date);
      if (parsedFlexible && !isNaN(parsedFlexible.getTime())) {
        dateObj = parsedFlexible;
      } else {
        const parsedDate = new Date(date);
        if (!isNaN(parsedDate.getTime())) {
          dateObj = parsedDate;
        }
      }
    }

    if (!dateObj) {
      return res.status(400).json({ message: "Invalid date provided for WHT document" });
    }

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
      return res
        .status(400)
        .json({ message: "Expense ID and selected data are required" });
    }

    const { sName, sTaxId, taxInvoiceId, vatAmount, amount, date, address } =
      selectedData;

    // Determine if VAT should be set to true based on vatAmount
    const vatAmountNumber = vatAmount ? Number(vatAmount) : 0;
    const shouldSetVat = vatAmountNumber > 0;

    console.log(
      `🔍 VAT Amount processing: ${vatAmount} -> ${vatAmountNumber}, setting vat to: ${shouldSetVat}`
    );

    // Auto-detect juristic person based on supplier name (sName) if provided
    let detectedTaxType;
    if (sName) {
      console.log(`🔍 Auto-detecting tax type for sName: "${sName}"`);
      detectedTaxType = autoDetectTaxType(sName);
      console.log(`🔍 Detected tax type: "${detectedTaxType}"`);
    }

    // Update the expense with selected OCR data
    const updatedExpense = await prisma.expense.update({
      where: { id: Number(expenseId) },
      data: {
        ...(sName && { sName }),
        ...(sTaxId && { sTaxId }),
        ...(taxInvoiceId && { taxInvoiceNo: taxInvoiceId }),
        // Always update VAT fields when vatAmount is provided
        ...(vatAmount !== undefined && {
          vatAmount: vatAmountNumber,
          vat: shouldSetVat, // Set vat to true if vatAmount > 0
        }),
        ...(amount && { amount: Number(amount) }),
        ...(date && { date }),
        ...(address && { sAddress: address }),
        // Auto-detect and set taxType if juristic person detected
        ...(detectedTaxType && { taxType: detectedTaxType }),
      },
    });

    console.log("✅ Expense updated with OCR data:", updatedExpense.id);
    console.log("📝 Updated fields:", {
      ...(sName && { sName }),
      ...(sTaxId && { sTaxId }),
      ...(taxInvoiceId && { taxInvoiceNo: taxInvoiceId }),
      // Always log VAT fields when vatAmount is provided
      ...(vatAmount !== undefined && {
        vatAmount: vatAmountNumber,
        vat: shouldSetVat,
      }),
      ...(amount && { amount: Number(amount) }),
      ...(date && { date }),
      ...(address && { sAddress: address }),
      // Log taxType if auto-detected
      ...(detectedTaxType && { taxType: detectedTaxType }),
    });

    // Return updated expense with properly formatted response
    const response = {
      success: true,
      expense: updatedExpense,
      // Include the updated fields for frontend sync
      taxType: updatedExpense.taxType,
      vat: updatedExpense.vat,
      vatAmount: updatedExpense.vatAmount,
    };

    res.json(response);
  } catch (error) {
    console.error("❌ Error updating expense with OCR data:", error);
    res.status(500).json({ message: "Failed to update expense with OCR data" });
  }
};

export {
  createExpense,
  createExpenseWithOCR,
  duplicateExpense,
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
