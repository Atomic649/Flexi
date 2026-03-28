import { Request, Response } from "express";
import {
  Gender,
  Payment,
  DocumentType,
  Unit,
} from "../generated/client1/client";
import Joi from "joi";
import multer from "multer";
import multerConfig from "../middleware/multer_config";
import { flexiDBPrismaClient } from "../../lib/PrismaClient1";
import { randomBytes } from "node:crypto";

const upload = multer(multerConfig.multerConfigImage.config).single(
  multerConfig.multerConfigImage.keyUpload,
);

// Create  instance of PrismaClient
const prisma = flexiDBPrismaClient;

function generateFlexiId(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let result = "FX";
  
  // Create an array of 12 random bytes
  const bytes = randomBytes(12);

  for (let i = 0; i < 12; i++) {
    // Use modulo to map the random byte to your alphabet
    result += chars[bytes[i] % chars.length];
  }
  
  return result;
}

const generateDocumentId = async (
  tx: any,
  businessId: number,
  documentType: DocumentType,
) => {
  const year = new Date().getFullYear();

  // Upsert the counter for this business and document type
  const counter = await tx.documentCounter.upsert({
    where: {
      businessId_documentType: {
        businessId,
        documentType,
      },
    },
    update: {
      count: { increment: 1 },
    },
    create: {
      businessId,
      documentType,
      count: 1,
    },
  });

  const prefixMap: Record<string, string> = {
    Invoice: "INV",
    Receipt: "REC",
    Quotation: "QT",
    DebitNote: "DN",
    CreditNote: "CN",
    WithholdingTax: "WHT",
  };

  const prefix = prefixMap[documentType] || "DOC";
  // Format: PREFIX + YEAR + / + RUNNING_NUMBER (e.g., INV2025/001)
  return `${prefix}${year}/${counter.count.toString().padStart(3, "0")}`;
};

const calculateValidContactUntil = (
  purchaseAt: Date,
  repeatFlag?: boolean,
  repeatMonths?: number | null,
): Date | null => {
  if (!repeatFlag) {
    return null;
  }

  const months = repeatMonths ?? 0;
  if (months <= 0) {
    return null;
  }

  const baseDate = new Date(purchaseAt);
  if (Number.isNaN(baseDate.getTime())) {
    return null;
  }

  const validUntil = new Date(baseDate);
  validUntil.setMonth(validUntil.getMonth() + months);
  return validUntil;
};

const restoreRentalStockForBusiness = async (businessAccId: number) => {
  if (!businessAccId) {
    return;
  }

  const now = new Date();
  const expiredBills = await prisma.bill.findMany({
    where: {
      businessAcc: businessAccId,
      repeat: true,
      rentalStockReleased: false,
      validContactUntil: {
        lte: now,
      },
      DocumentType: "Receipt",
      deleted: false,
    } as any,
    include: {
      product: {
        select: {
          product: true,
        },
      },
    },
  });

  if (expiredBills.length === 0) {
    return;
  }

  await Promise.all(
    expiredBills.map((bill) =>
      prisma.$transaction(async (tx) => {
        const products = Array.isArray((bill as any).product)
          ? ((bill as any).product as { product: number | null }[])
          : [];

        for (const item of products) {
          if (!item?.product) {
            continue;
          }

          await tx.product.updateMany({
            where: {
              id: item.product,
              stock: {
                lte: 0,
              },
            },
            data: {
              stock: 1,
            },
          });
        }

        await tx.bill.update({
          where: {
            id: bill.id,
          },
          data: {
            rentalStockReleased: true,
          } as any,
        });
      }),
    ),
  );
};

// Interface for request body from client
interface ProductItemInput {
  product: number;
  quantity: number;
  unitPrice: number;
  unitDiscount?: number;
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
  quotationAt?: Date;
  invoiceAt?: Date;
  businessAcc: number;
  cTaxId: string;
  image: string;
  platformId?: number;
  platform: string;
  total?: number;
  totalQuotation?: number; // Optional field for quotation total
  productItems: ProductItemInput[];
  repeat?: boolean;
  repeatMonths?: number;
  DocumentType: ("Invoice" | "Receipt" | "Quotation")[];
  note?: string; // Optional note
  discount?: number; // Optional discount field
  priceValid?: Date; // Optional price valid
  validContactUntil?: Date; // Optional valid contact date
  beforeDiscount?: number; // Optional field for total before discount
  paymentTermCondition?: string; // Optional payment term condition
  remark?: string; // Optional remark
  taxType?: "Juristic" | "Individual"; // Optional tax type
  withholdingTax?: boolean;
  withholdingPercent?: number;
  WHTAmount?: number;
  updateCustomer?: boolean; // Flag to update customer details
  projectId?: number; // Optional project link
}

// Validate the request body
const schema = Joi.object({
  id: Joi.number(),
  billId: Joi.string(),
  createdAt: Joi.date(),
  updatedAt: Joi.date(),
  purchaseAt: Joi.date(),
  quotationAt: Joi.date().optional(),
  invoiceAt: Joi.date().optional(),
  cName: Joi.string().required(),
  cLastName: Joi.string().allow(""),
  cPhone: Joi.string().min(10).max(10).required(),
  cGender: Joi.string().valid("Female", "Male", "NotSpecified").required(),
  cAddress: Joi.string().required(),
  cProvince: Joi.string().required(),
  cPostId: Joi.string().required(),
  updateCustomer: Joi.boolean().optional(),
  cTaxId: Joi.string().allow("").optional(),
  payment: Joi.string()
    .valid("COD", "Transfer", "CreditCard", "Cash", "NotSpecified")
    .required(),
  cashStatus: Joi.boolean().optional(),
  memberId: Joi.string().required(),
  businessAcc: Joi.number().required(),
  image: Joi.string().allow("", null).optional(),
  platformId: Joi.number().optional(),
  platform: Joi.string().required(),
  total: Joi.number(),
  totalQuotation: Joi.number().optional(), // Optional field for quotation total
  repeat: Joi.boolean().optional(),
  repeatMonths: Joi.number().min(1).max(12).optional(),
  productItems: Joi.array()
    .items(
      Joi.object({
        product: Joi.number().required(),
        quantity: Joi.number().min(1).required(),
        unitPrice: Joi.number().min(0).required(),
        unitDiscount: Joi.number().min(0).optional(),
        unit: Joi.string().optional(), // Optional field for unit
      }),
    )
    .min(1)
    .required(),
  DocumentType: Joi.array()
    .items(Joi.string().valid("Invoice", "Receipt", "Quotation"))
    .min(1)
    .required(),
  note: Joi.string().allow("").optional(), // Optional note field
  discount: Joi.number().min(0).optional(), // Optional discount field
  priceValid: Joi.date().optional(), // Optional price valid date
  validContactUntil: Joi.date().optional(),
  withholdingTax: Joi.boolean().optional(),
  withholdingPercent: Joi.number().min(0).max(100).optional(),
  WHTAmount: Joi.number().min(0).optional(),
  beforeDiscount: Joi.number().optional(), // Optional field for total before discount
  paymentTermCondition: Joi.string().allow("").optional(), // Optional payment term condition
  remark: Joi.string().allow("").optional(), // Optional remark
  taxType: Joi.string().valid("Juristic", "Individual").optional(), // Optional tax type
  projectId: Joi.number().optional(), // Optional project link
});

//Create a New Bill - Post
const createBill = async (req: Request, res: Response) => {
  console.log("🚀 Incoming createBill request body:", req.body);
  upload(req, res, async (err) => {
    //Multer
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ message: err.message });
    } else if (err) {
      return res.status(500).json({ message: err.message });
    }
    const billInput: billInput = req.body;
    if (!billInput.payment) {
      billInput.payment = "NotSpecified" as Payment;
    }
    if (typeof billInput.updateCustomer === "undefined") {
      billInput.updateCustomer = true;
    }
    // Validate the request body
    const { error } = schema.validate(billInput);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    billInput.cTaxId = String(billInput.cTaxId);
    billInput.businessAcc = Number(billInput.businessAcc);
    billInput.platformId = Number(billInput.platformId);
    billInput.platform = String(billInput.platform);
    billInput.cashStatus = ["true", "1", "yes"].includes(
      String(billInput.cashStatus).toLowerCase(),
    );
    billInput.purchaseAt = new Date(billInput.purchaseAt);
    if (billInput.validContactUntil) {
      billInput.validContactUntil = new Date(billInput.validContactUntil);
    }
    if (billInput.priceValid) {
      billInput.priceValid = new Date(billInput.priceValid);
    }
    const repeatFlag = ["true", "1", "yes"].includes(
      String(billInput.repeat).toLowerCase(),
    );
    billInput.repeat = repeatFlag;
    const repeatMonths = Number(billInput.repeatMonths ?? 0);
    billInput.repeatMonths = Number.isFinite(repeatMonths) ? repeatMonths : 0;
    // normalize withholding inputs (may come as strings from form-data)
    billInput.withholdingTax = ["true", "1", "yes"].includes(
      String(billInput.withholdingTax).toLowerCase(),
    );
    billInput.withholdingPercent = Number(billInput.withholdingPercent ?? 0);
    billInput.WHTAmount = Number(billInput.WHTAmount ?? 0);
    // normalize withholding inputs (may come as strings from form-data)
    // find platform from platform id
    try {
      const result = await prisma.$transaction(async (tx) => {
        // Handle Customer Logic
        let customerIdFromDb: number | null = null;
        if (billInput.cPhone && billInput.cPhone.trim() !== "") {
          const phone = billInput.cPhone.trim();
          const customerData = {
            businessAcc: billInput.businessAcc,
            phone: phone,
            firstName: billInput.cName,
            lastName: billInput.cLastName,
            gender: billInput.cGender,
            address: billInput.cAddress,
            province: billInput.cProvince,
            postId: billInput.cPostId,
            taxId: billInput.cTaxId,
          };

          if (billInput.updateCustomer) {
            // Upsert (Create or Update)
            const customer = await tx.customer.upsert({
              where: {
                businessAcc_phone: {
                  businessAcc: billInput.businessAcc,
                  phone: phone,
                },
              },
              create: customerData,
              update: {
                firstName: billInput.cName,
                lastName: billInput.cLastName,
                gender: billInput.cGender,
                address: billInput.cAddress,
                province: billInput.cProvince,
                postId: billInput.cPostId,
                taxId: billInput.cTaxId,
              },
            });
            customerIdFromDb = customer.id;
          } else {
            // Create if new, otherwise do nothing to existing
            const customer = await tx.customer.upsert({
              where: {
                businessAcc_phone: {
                  businessAcc: billInput.businessAcc,
                  phone: phone,
                },
              },
              create: customerData,
              update: {}, // Keep old data
            });
            customerIdFromDb = customer.id;
          }
        }

        // Calculate beforeDiscount (total before any discounts)
        const beforeDiscount = billInput.productItems.reduce(
          (sum, item) => sum + item.quantity * item.unitPrice,
          0,
        );

        // Calculate discount from all product items (unit discounts only)
        const discount = billInput.productItems.reduce(
          (sum, item) => sum + (item.unitDiscount || 0) * item.quantity,
          0,
        );
        console.log("🚀 Calculated discount:", discount);

        // Get bill-level discount from input
        //const billLevelDiscount = billInput.discount || 0;
        //console.log("🚀 Calculated billLevelDiscount:", billLevelDiscount);

        // Calculate total from all product items (subtract unit discounts and bill-level discount)
        const normaltotal = billInput.productItems.reduce(
          (sum, item) => sum + item.quantity * item.unitPrice,
          0,
        );
        //  - billLevelDiscount;
        console.log("🚀 Calculated normaltotal:", normaltotal);
        // check businessAcc is vat registered
        const vatRegistered = prisma.businessAcc.findUnique({
          where: { id: billInput.businessAcc },
          select: { vat: true },
        });

        const totalBeforeTax =
          vatRegistered && (await vatRegistered).vat
            ? (normaltotal / 1.07 - discount).toFixed(2)
            : (normaltotal - discount).toFixed(2);
        const vatAmount =
          vatRegistered && (await vatRegistered).vat
            ? (Number(totalBeforeTax) * 0.07).toFixed(2)
            : 0;
        console.log("🚀 Calculated totalBeforeTax:", totalBeforeTax);
        console.log("🚀 Calculated vatAmount:", vatAmount);
        const WHTAmount = billInput.WHTAmount ?? 0;
        console.log("🚀 Calculated WHTAmount:", WHTAmount);
        const totalVat =
          vatRegistered && (await vatRegistered).vat
            ? (Number(totalBeforeTax) + Number(vatAmount)).toFixed(2)
            : totalBeforeTax;
        console.log("🚀 Calculated final total:", totalVat);
        const total = Number(totalVat) - WHTAmount;
        const totalAfterTax = Number(totalBeforeTax) + Number(vatAmount);

        const docType = billInput.DocumentType[0] as DocumentType;

        // Handle repeat bills
        if (
          billInput.repeat &&
          billInput.repeatMonths &&
          billInput.repeatMonths > 1
        ) {
          const createdBills = [];
          const currentDate = new Date();
          const originalDate = new Date(billInput.purchaseAt);
          const contractValidUntil = calculateValidContactUntil(
            originalDate,
            billInput.repeat,
            billInput.repeatMonths,
          );

          // Create repeat bills for each month
          for (let i = 0; i < billInput.repeatMonths; i++) {
            // Calculate the date for each month (same day of month)
            const billDate = new Date(originalDate);
            billDate.setMonth(originalDate.getMonth() + i);

            // Only create bills for future dates (don't create past bills)
            if (billDate >= currentDate || i === 0) {
              // Generate unique ID for each month using the counter
              const newId = await generateDocumentId(
                tx,
                billInput.businessAcc,
                docType,
              );

              // Determine which ID field to populate
              let idFields: any = {};
              if (docType === "Receipt") idFields = { billId: newId };
              else if (docType === "Quotation")
                idFields = { quotationId: newId };
              else if (docType === "Invoice") idFields = { invoiceId: newId };

              // Determine which total to use based on DocumentType
              const finalTotal =
                docType === "Invoice" || docType === "Quotation" ? 0 : total;

              // Set cashStatus based on DocumentType
              const finalCashStatus =
                docType === "Invoice" || docType === "Quotation" ? false : true; // Receipt should always be true

              const billData: any = {
                ...idFields,
                customerId: customerIdFromDb,
                flexiId: generateFlexiId(),
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
                    unitDiscount: item.unitDiscount || 0,
                    unit: item.unit,
                  })),
                },
                payment: billInput.payment || "NotSpecified",
                cashStatus: finalCashStatus,
                memberId: billInput.memberId,
                purchaseAt: billDate,
                businessAcc: billInput.businessAcc,
                platformId: billInput.platformId,
                platform: billInput.platform,
                image: req.file?.filename ?? "",
                discount: discount, // Unit discounts only
                //billLevelDiscount: billLevelDiscount, // Bill-level discount
                priceValid: billInput.priceValid, // Include priceValid if provided
                total: finalTotal,
                totalQuotation: total, // Include totalQuotation field
                totalInvoice: docType === "Invoice" ? total : 0,
                totalBeforeTax: Number(totalBeforeTax),
                totalAfterTax: Number(totalAfterTax),
                vatPercent: vatRegistered && (await vatRegistered).vat ? 7 : 0,
                totalTax: Number(vatAmount),
                beforeDiscount,
                DocumentType: docType,
                note: billInput.note || "", // Optional note field
                paymentTermCondition: billInput.paymentTermCondition || "", // Optional payment term condition
                remark: billInput.remark || "", // Optional remark
                withHoldingTax: billInput.withholdingTax ?? false,
                WHTpercent: billInput.withholdingPercent ?? 0,
                WHTAmount: billInput.WHTAmount ?? 0,
                repeat: billInput.repeat,
                repeatMonths: billInput.repeatMonths ?? 0,
                taxType: billInput.taxType || "Individual",
                ...(billInput.projectId != null && { projectId: billInput.projectId }),
              };

              if (contractValidUntil) {
                billData.validContactUntil = contractValidUntil;
                billData.rentalStockReleased = false;
              }

              const bill = await tx.bill.create({
                data: billData,
              });

              createdBills.push(bill);
            }
          }
          return { type: "multiple", bills: createdBills };
        } else {
          // Create single bill
          const newId = await generateDocumentId(
            tx,
            billInput.businessAcc,
            docType,
          );

          // Determine which ID field to populate
          let idFields: any = {};
          if (docType === "Receipt") idFields = { billId: newId };
          else if (docType === "Quotation") idFields = { quotationId: newId };
          else if (docType === "Invoice") idFields = { invoiceId: newId };

          // Determine which total to use based on DocumentType
          const finalTotal =
            docType === "Invoice" || docType === "Quotation" ? 0 : total;

          // Set cashStatus based on DocumentType
          const finalCashStatus =
            docType === "Invoice" || docType === "Quotation" ? false : true; // Receipt should always be true

          const singleBillData: any = {
            ...idFields,
            customerId: customerIdFromDb,
            flexiId: generateFlexiId(),
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
                unitDiscount: item.unitDiscount || 0,
                unit: item.unit,
              })),
            },
            payment: billInput.payment || "NotSpecified",
            platform: billInput.platform,
            cashStatus: finalCashStatus,
            memberId: billInput.memberId,
            purchaseAt: billInput.purchaseAt,
            businessAcc: billInput.businessAcc,
            platformId: billInput.platformId,
            image: req.file?.filename ?? "",
            discount: discount, // Unit discounts only
            //billLevelDiscount: billLevelDiscount, // Bill-level discount
            priceValid: billInput.priceValid, // Include priceValid if provided
            total: finalTotal,
            totalQuotation: total, // Include totalQuotation field
            totalInvoice: docType === "Invoice" ? total : 0,
            totalBeforeTax: totalBeforeTax,
            totalAfterTax: totalAfterTax,
            totalTax: vatAmount,
            vatPercent: vatRegistered && (await vatRegistered).vat ? 7 : 0,
            beforeDiscount,
            DocumentType: docType,
            note: billInput.note || "", // Optional note field
            paymentTermCondition: billInput.paymentTermCondition || "", // Optional payment term condition
            remark: billInput.remark || "", // Optional remark
            withHoldingTax: billInput.withholdingTax ?? false,
            WHTpercent: billInput.withholdingPercent ?? 0,
            WHTAmount: billInput.WHTAmount ?? 0,
            repeat: billInput.repeat,
            repeatMonths: billInput.repeat ? (billInput.repeatMonths ?? 0) : 0,
            taxType: billInput.taxType || "Individual",
            ...(billInput.projectId != null && { projectId: billInput.projectId }),
          };

          const singleValidUntil = calculateValidContactUntil(
            billInput.purchaseAt,
            billInput.repeat,
            billInput.repeatMonths,
          );
          if (singleValidUntil) {
            singleBillData.validContactUntil = singleValidUntil;
            singleBillData.rentalStockReleased = false;
          }

          const bill = await tx.bill.create({
            data: singleBillData,
          });

          if (docType === "Receipt") {
            // Reduce stock for all product items using product ID directly
            for (const item of billInput.productItems) {
              const reductStock = await tx.product.update({
                where: { id: Number(item.product) },
                data: { stock: { decrement: item.quantity } },
              });
              console.log("🚀 Stock reduced:", reductStock);
            }
          } else {
            console.log(
              "ℹ️ Skipping stock reduction for non-receipt document type:",
              docType,
            );
          }
          return { type: "single", bill: bill };
        }
      });

      if (result.type === "multiple") {
        res.json({
          status: "ok",
          message: `Created ${result.bills.length} bills successfully for ${billInput.repeatMonths} months`,
          bills: result.bills,
          totalBills: result.bills.length,
        });
      } else {
        res.json({
          status: "ok",
          message: "Created bill successfully",
          bill: result.bill,
        });
      }
    } catch (e: any) {
      console.error(e);
      if (e.message === "platform not found") {
        return res.status(404).json({ message: "platform not found" });
      }
      res.status(500).json({ message: "failed to create bill" });
    }
  });
};
// Get All Bills by memberId - Get
const getBills = async (req: Request, res: Response) => {
  const { memberId } = req.params;
  try {
    // Find business ID by member ID from member table
    const businessId = await prisma.member.findUnique({
      where: { uniqueId: memberId },
      select: { businessId: true },
    });
    const businessAccId = businessId?.businessId ?? 0;
    await restoreRentalStockForBusiness(businessAccId);

    const bills = await prisma.bill.findMany({
      where: {
        businessAcc: businessAccId,
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
        quotationAt: true,
        invoiceAt: true,
        platformId: true,
        discount: true, // Include discount
        priceValid: true, // Include priceValid
        total: true,
        totalQuotation: true, // Include totalQuotation
        totalBeforeTax: true,
        totalTax: true,
        totalAfterTax: true,
        WHTAmount: true,
        WHTpercent: true,
        platform: true,
        product: {
          select: {
            product: true,
            productList: {
              select: {
                name: true,
              },
            },
            quantity: true,
            unitPrice: true,
            unitDiscount: true,
            unit: true,
          },
        }, // Include product items
        repeat: true,
        repeatMonths: true,
        validContactUntil: true,
        rentalStockReleased: true,
        DocumentType: true,
        taxType: true,
        isSplitChild: true,
        splitGroupId: true,
        splitPercent: true,
        splitPercentMax: true,
        flexiId: true,
        invoiceId: true,
        totalInvoice: true,
      } as any,
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
        product: {
          include: {
            productList: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    }) as any;

    if (!bill) return res.status(404).json({ message: "Bill not found" });

    // If this is a split parent, attach children sorted by creation order
    if (bill.flexiId && bill.splitGroupId === bill.flexiId && !bill.isSplitChild) {
      bill.splitChildren = await prisma.bill.findMany({
        where: { splitGroupId: bill.flexiId, isSplitChild: true } as any,
        orderBy: { id: "asc" },
        select: { id: true, splitPercent: true, totalInvoice: true, DocumentType: true } as any,
      });
    }

    // If this is a split child with missing fields, fill from parent as fallback
    if (bill.isSplitChild && bill.splitGroupId) {
      const needsFallback =
        !bill.withHoldingTax &&
        (!bill.note || bill.note === "") &&
        (!bill.totalBeforeTax || bill.totalBeforeTax === 0);

      if (needsFallback) {
        const parent = await prisma.bill.findFirst({
          where: { flexiId: bill.splitGroupId, isSplitChild: false } as any,
          select: {
            withHoldingTax: true,
            WHTpercent: true,
            WHTAmount: true,
            note: true,
            paymentTermCondition: true,
            remark: true,
            payment: true,
            priceValid: true,
            repeat: true,
            repeatMonths: true,
            totalBeforeTax: true,
            totalAfterTax: true,
            totalTax: true,
            vatPercent: true,
            beforeDiscount: true,
            discount: true,
            totalQuotation: true,
            image: true,
          } as any,
        }) as any;

        if (parent) {
          bill.withHoldingTax = parent.withHoldingTax ?? bill.withHoldingTax;
          bill.WHTpercent = parent.WHTpercent ?? bill.WHTpercent;
          bill.WHTAmount = parent.WHTAmount ?? bill.WHTAmount;
          bill.note = parent.note ?? bill.note;
          bill.paymentTermCondition = parent.paymentTermCondition ?? bill.paymentTermCondition;
          bill.remark = parent.remark ?? bill.remark;
          bill.payment = parent.payment ?? bill.payment;
          bill.priceValid = parent.priceValid ?? bill.priceValid;
          bill.repeat = parent.repeat ?? bill.repeat;
          bill.repeatMonths = parent.repeatMonths ?? bill.repeatMonths;
          bill.totalBeforeTax = parent.totalBeforeTax ?? bill.totalBeforeTax;
          bill.totalAfterTax = parent.totalAfterTax ?? bill.totalAfterTax;
          bill.totalTax = parent.totalTax ?? bill.totalTax;
          bill.vatPercent = parent.vatPercent ?? bill.vatPercent;
          bill.beforeDiscount = parent.beforeDiscount ?? bill.beforeDiscount;
          bill.discount = parent.discount ?? bill.discount;
          bill.totalQuotation = parent.totalQuotation ?? bill.totalQuotation;
          bill.image = (!bill.image || bill.image === "") ? (parent.image ?? "") : bill.image;
        }
      }
    }

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
    if (!billInput.payment) {
      billInput.payment = "NotSpecified" as Payment;
    }
    // Validate the request body
    const { error } = schema.validate(billInput);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }
    billInput.cTaxId = String(billInput.cTaxId);
    billInput.businessAcc = Number(billInput.businessAcc);
    billInput.platformId = Number(billInput.platformId);
    billInput.cashStatus = ["true", "1", "yes"].includes(
      String(billInput.cashStatus).toLowerCase(),
    );
    billInput.purchaseAt = new Date(billInput.purchaseAt);
    if (billInput.quotationAt) {
      billInput.quotationAt = new Date(billInput.quotationAt);
    }
    if (billInput.invoiceAt) {
      billInput.invoiceAt = new Date(billInput.invoiceAt);
    }
    if (billInput.validContactUntil) {
      billInput.validContactUntil = new Date(billInput.validContactUntil);
    }
    if (billInput.priceValid) {
      billInput.priceValid = new Date(billInput.priceValid);
    }
    const repeatFlag = ["true", "1", "yes"].includes(
      String(billInput.repeat).toLowerCase(),
    );
    billInput.repeat = repeatFlag;
    const repeatMonths = Number(billInput.repeatMonths ?? 0);
    billInput.repeatMonths = Number.isFinite(repeatMonths) ? repeatMonths : 0;
    // normalize withholding inputs (may come as strings from form-data)
    billInput.withholdingTax = ["true", "1", "yes"].includes(
      String(billInput.withholdingTax).toLowerCase(),
    );
    billInput.withholdingPercent = Number(billInput.withholdingPercent ?? 0);
    billInput.WHTAmount = Number(billInput.WHTAmount ?? 0);

    // First, get the existing bill to check its current purchaseAt date
    const existingBill = (await prisma.bill.findUnique({
      where: {
        id: Number(id),
      },
    })) as any;

    if (!existingBill) {
      return res.status(404).json({ message: "Bill not found" });
    }

    // Check if bill can be updated based on purchaseAt date
    // Bills cannot be updated after the 15th of the next month from the ORIGINAL purchaseAt
    // Use the existing bill's purchaseAt date for cutoff calculation, not the new one
    const originalPurchaseDate = new Date(existingBill.purchaseAt);
    const nextMonth = new Date(
      originalPurchaseDate.getFullYear(),
      originalPurchaseDate.getMonth() + 1,
      15,
    );
    const currentDate = new Date();

    if (currentDate > nextMonth) {
      return res.status(403).json({
        message: `Cannot update bill after ${nextMonth.toDateString()}. Bills can only be updated until the 15th of the month following the original purchase date.`,
        cutoffDate: nextMonth.toISOString(),
        originalPurchaseDate: originalPurchaseDate.toISOString(),
        currentDate: currentDate.toISOString(),
      });
    }

    // Calculate beforeDiscount (total before any discounts)
    const beforeDiscount = billInput.productItems.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0,
    );

    // Calculate discount from all product items (unit discounts only)
    const discount = billInput.productItems.reduce(
      (sum, item) => sum + (item.unitDiscount || 0) * item.quantity,
      0,
    );
    console.log("🚀 Calculated discount:", discount);

    // Get bill-level discount from input
    //const billLevelDiscount = billInput.discount || 0;
    //console.log("🚀 Calculated billLevelDiscount:", billLevelDiscount);

    // Calculate total from all product items (subtract unit discounts and bill-level discount)
    const normaltotal = billInput.productItems.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0,
    );
    //  - billLevelDiscount;
    console.log("🚀 Calculated normaltotal:", normaltotal);
    // check businessAcc is vat registered
    const vatRegistered = prisma.businessAcc.findUnique({
      where: { id: billInput.businessAcc },
      select: { vat: true },
    });

    const totalBeforeTax =
      vatRegistered && (await vatRegistered).vat
        ? (normaltotal / 1.07 - discount).toFixed(2)
        : (normaltotal - discount).toFixed(2);
    const vatAmount =
      vatRegistered && (await vatRegistered).vat
        ? (Number(totalBeforeTax) * 0.07).toFixed(2)
        : 0;
    console.log("🚀 Calculated totalBeforeTax:", totalBeforeTax);
    console.log("🚀 Calculated vatAmount:", vatAmount);
    const WHTAmount = billInput.WHTAmount ?? 0;
    console.log("🚀 Calculated WHTAmount:", WHTAmount);
    const totalVat =
      vatRegistered && (await vatRegistered).vat
        ? (Number(totalBeforeTax) + Number(vatAmount)).toFixed(2)
        : totalBeforeTax;
    console.log("🚀 Calculated final total:", totalVat);
    const total = Number(totalVat) - WHTAmount;
    const totalAfterTax = Number(totalBeforeTax) + Number(vatAmount);

    try {
      const result = await prisma.$transaction(async (tx) => {
        // Handle Customer Logic (Upsert based on phone within business)
        let customerIdFromDb: number | null = null;
        if (billInput.cPhone && billInput.cPhone.trim() !== "") {
          const phone = billInput.cPhone.trim();
          const customerData = {
            businessAcc: billInput.businessAcc,
            phone: phone,
            firstName: billInput.cName,
            lastName: billInput.cLastName,
            gender: billInput.cGender,
            address: billInput.cAddress,
            province: billInput.cProvince,
            postId: billInput.cPostId,
            taxId: billInput.cTaxId,
          };

          if (billInput.updateCustomer) {
            const customer = await tx.customer.upsert({
              where: {
                businessAcc_phone: {
                  businessAcc: billInput.businessAcc,
                  phone: phone,
                },
              },
              create: customerData,
              update: {
                firstName: billInput.cName,
                lastName: billInput.cLastName,
                gender: billInput.cGender,
                address: billInput.cAddress,
                province: billInput.cProvince,
                postId: billInput.cPostId,
                taxId: billInput.cTaxId,
              },
            });
            customerIdFromDb = customer.id;
          } else {
            const customer = await tx.customer.upsert({
              where: {
                businessAcc_phone: {
                  businessAcc: billInput.businessAcc,
                  phone: phone,
                },
              },
              create: customerData,
              update: {},
            });
            customerIdFromDb = customer.id;
          }
        }

        // Capture current product quantities for inventory adjustments
        const existingProductItems = await tx.productItem.findMany({
          where: { billId: Number(id) },
          select: {
            product: true,
            quantity: true,
          },
        });

        // Delete existing product items for this bill (to fully replace)
        await tx.productItem.deleteMany({
          where: { billId: Number(id) },
        });

        // Determine which total to use based on DocumentType
        const docType = billInput.DocumentType[0] as DocumentType;
        const finalTotal =
          docType === "Invoice" || docType === "Quotation" ? 0 : total;

        // Set cashStatus based on DocumentType
        const finalCashStatus =
          docType === "Invoice" || docType === "Quotation" ? false : true; // Receipt should always be true

        const validContactUntil = calculateValidContactUntil(
          billInput.purchaseAt,
          billInput.repeat,
          billInput.repeatMonths,
        );

        const updateData: any = {
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
              unitDiscount: item.unitDiscount || 0,
              unit: item.unit,
            })),
          },
          payment: billInput.payment,
          platform: billInput.platform,
          platformId: billInput.platformId,
          cashStatus: finalCashStatus,
          memberId: billInput.memberId,
          purchaseAt: docType === "Receipt" ? billInput.purchaseAt : existingBill.purchaseAt,
          quotationAt: docType === "Quotation" ? (billInput.quotationAt ?? billInput.purchaseAt) : existingBill.quotationAt,
          invoiceAt: docType === "Invoice" ? (billInput.invoiceAt ?? billInput.purchaseAt) : existingBill.invoiceAt,
          businessAcc: billInput.businessAcc,
          image: req.file?.filename ?? "",
          total: finalTotal,
          totalQuotation: total, // Include totalQuotation field'
          totalInvoice: docType === "Invoice" ? total : 0,
          totalBeforeTax: Number(totalBeforeTax),
          totalAfterTax: Number(totalAfterTax),
          vatPercent: vatRegistered && (await vatRegistered).vat ? 7 : 0,
          totalTax: Number(vatAmount),
          note: billInput.note || "", // Optional note field
          discount: discount, // Unit discounts only
          //billLevelDiscount: billLevelDiscount, // Bill-level discount
          beforeDiscount: beforeDiscount,
          priceValid: billInput.priceValid, // Include priceValid if provided
          DocumentType: docType, // Take first element from array
          paymentTermCondition: billInput.paymentTermCondition || "", // Optional payment term condition
          remark: billInput.remark || "", // Optional remark
          repeat: billInput.repeat,
          repeatMonths: billInput.repeat ? (billInput.repeatMonths ?? 0) : 0,
          taxType: billInput.taxType || "Individual",
          withHoldingTax: billInput.withholdingTax ?? false,
          WHTpercent: billInput.withholdingPercent ?? 0,
          WHTAmount: billInput.WHTAmount ?? 0,
          validContactUntil: validContactUntil,
          ...(billInput.projectId != null && { projectId: billInput.projectId }),
        };

        if (customerIdFromDb !== null) {
          updateData.customerId = customerIdFromDb;
        }

        // If this is a split child, fix totals to be splitPercent% of full total
        if ((existingBill as any).isSplitChild && (existingBill as any).splitPercent != null) {
          const splitPct = Number((existingBill as any).splitPercent) || 0;
          const splitAmount = total * (splitPct / 100);
          // totalInvoice = split portion for Invoice only; 0 for Receipt and Quotation
          updateData.totalInvoice = docType === "Invoice" ? splitAmount : 0;
          // total (actual received) = split portion for Receipt
          if (docType === "Receipt") {
            updateData.total = splitAmount;
          }
          updateData.totalQuotation = total;
        }

        const customerIdToUpdate =
          customerIdFromDb ?? (existingBill?.customerId ?? null);

        if (customerIdToUpdate !== null) {
          await tx.customer.update({
            where: { id: customerIdToUpdate },
            data: {
              firstName: billInput.cName,
              lastName: billInput.cLastName,
              gender: billInput.cGender,
              address: billInput.cAddress,
              province: billInput.cProvince,
              postId: billInput.cPostId,
              taxId: billInput.cTaxId,
              phone: billInput.cPhone,
            },
          });
        }

        // Generate ID if missing for the new DocumentType
        // Parent bills (those with split children) should never receive an invoiceId
        const isParentBill = existingBill.flexiId
          ? (await tx.bill.count({ where: { splitGroupId: existingBill.flexiId, isSplitChild: true } })) > 0
          : false;

        if (docType === "Receipt") {
          if (!existingBill.billId) {
            updateData.billId = await generateDocumentId(
              tx,
              billInput.businessAcc,
              "Receipt",
            );
          }
          // If skipping from Quotation to Receipt, also generate Invoice ID if missing
          if (
            existingBill.DocumentType === "Quotation" &&
            !existingBill.invoiceId &&
            !isParentBill
          ) {
            updateData.invoiceId = await generateDocumentId(
              tx,
              billInput.businessAcc,
              "Invoice",
            );
          }
        } else if (docType === "Invoice" && !existingBill.invoiceId && !isParentBill) {
          updateData.invoiceId = await generateDocumentId(
            tx,
            billInput.businessAcc,
            "Invoice",
          );
        } else if (docType === "Quotation" && !existingBill.quotationId) {
          updateData.quotationId = await generateDocumentId(
            tx,
            billInput.businessAcc,
            "Quotation",
          );
        }

        if (validContactUntil && validContactUntil > new Date()) {
          updateData.rentalStockReleased = false;
        } else if (!billInput.repeat) {
          updateData.rentalStockReleased = true;
        } else {
          updateData.rentalStockReleased = existingBill.rentalStockReleased;
        }

        const bill = await tx.bill.update({
          where: {
            id: Number(id),
          },
          data: updateData,
        });

        if (docType === "Receipt") {
          const aggregateQuantities = (
            items: { product: number; quantity: number }[],
          ) => {
            return items.reduce<Record<number, number>>((acc, item) => {
              const id = Number(item.product);
              const quantity = Number(item.quantity) || 0;
              acc[id] = (acc[id] || 0) + quantity;
              return acc;
            }, {});
          };

          const previousQuantities = aggregateQuantities(existingProductItems);
          const newQuantities = aggregateQuantities(
            billInput.productItems.map((i) => ({
              product: Number(i.product),
              quantity: i.quantity,
            })),
          );
          const affectedProductIds = new Set([
            ...Object.keys(previousQuantities).map(Number),
            ...Object.keys(newQuantities).map(Number),
          ]);

          for (const productId of affectedProductIds) {
            const previousQty = previousQuantities[productId] || 0;
            const newQty = newQuantities[productId] || 0;
            const delta = newQty - previousQty;

            if (delta === 0) {
              continue; // No adjustment needed
            }

            const stockUpdate =
              delta > 0 ? { decrement: delta } : { increment: Math.abs(delta) };

            const updatedProduct = await tx.product.update({
              where: { id: productId },
              data: { stock: stockUpdate },
            });

            console.log(" Stock adjusted for product:", {
              productId,
              previousQty,
              newQty,
              delta,
              updatedStock: updatedProduct.stock,
            });
          }
        } else {
          console.log(
            "ℹ️ Skipping stock adjustment for non-receipt document type:",
            docType,
          );
        }

        // Cascade updates to parent and all siblings if this is a split child
        if ((existingBill as any).isSplitChild && (existingBill as any).splitGroupId) {
          const splitGroupId = (existingBill as any).splitGroupId;

          // Find the parent bill
          const parent = await tx.bill.findFirst({
            where: { flexiId: splitGroupId, isSplitChild: false } as any,
            select: { id: true, splitPercent: true, totalInvoice: true } as any,
          }) as any;

          // Find all sibling split children (exclude current)
          const siblings = await tx.bill.findMany({
            where: { splitGroupId, isSplitChild: true, id: { not: Number(id) } } as any,
            select: { id: true, splitPercent: true, DocumentType: true } as any,
          });

          const sharedData = {
            cName: billInput.cName,
            cLastName: billInput.cLastName,
            cPhone: billInput.cPhone,
            cGender: billInput.cGender,
            cAddress: billInput.cAddress,
            cPostId: billInput.cPostId,
            cProvince: billInput.cProvince,
            cTaxId: billInput.cTaxId,
            customerId: customerIdFromDb ?? (existingBill?.customerId ?? undefined),
            platform: billInput.platform,
            platformId: billInput.platformId,
            payment: billInput.payment,
            taxType: billInput.taxType || "Individual",
            memberId: billInput.memberId,
            note: billInput.note || "",
            paymentTermCondition: billInput.paymentTermCondition || "",
            remark: billInput.remark || "",
            image: req.file?.filename ?? existingBill?.image ?? "",
            discount: discount,
            beforeDiscount: beforeDiscount,
            priceValid: billInput.priceValid,
            withHoldingTax: billInput.withholdingTax ?? false,
            WHTpercent: billInput.withholdingPercent ?? 0,
            WHTAmount: billInput.WHTAmount ?? 0,
            repeat: billInput.repeat,
            repeatMonths: billInput.repeat ? (billInput.repeatMonths ?? 0) : 0,
            totalBeforeTax: Number(totalBeforeTax),
            totalAfterTax: Number(totalAfterTax),
            vatPercent: vatRegistered && (await vatRegistered).vat ? 7 : 0,
            totalTax: Number(vatAmount),
            totalQuotation: total,
          };

          // Sync parent (keep parent's own total/DocumentType/split fields)
          if (parent) {
            await tx.productItem.deleteMany({ where: { billId: parent.id } as any });
            for (const item of billInput.productItems) {
              await tx.productItem.create({
                data: {
                  product: item.product,
                  quantity: item.quantity,
                  unitPrice: item.unitPrice,
                  unitDiscount: item.unitDiscount || 0,
                  unit: item.unit,
                  billId: parent.id,
                } as any,
              });
            }
            await tx.bill.update({
              where: { id: parent.id },
              data: sharedData as any,
            });
          }

          // Sync all siblings
          for (const sibling of siblings as any[]) {
            const siblingTotalInvoice = sibling.DocumentType === "Invoice" ? total * ((sibling.splitPercent ?? 0) / 100) : 0;
            await tx.productItem.deleteMany({ where: { billId: sibling.id } });
            for (const item of billInput.productItems) {
              await tx.productItem.create({
                data: {
                  product: item.product,
                  quantity: item.quantity,
                  unitPrice: item.unitPrice,
                  unitDiscount: item.unitDiscount || 0,
                  unit: item.unit,
                  billId: sibling.id,
                } as any,
              });
            }
            await tx.bill.update({
              where: { id: sibling.id },
              data: {
                ...sharedData,
                totalInvoice: siblingTotalInvoice,
              } as any,
            });
          }
        }

        // Cascade updates to split children if this is a split parent
        if (
          (existingBill as any).flexiId &&
          (existingBill as any).splitGroupId === (existingBill as any).flexiId &&
          !(existingBill as any).isSplitChild
        ) {
          const splitChildren = await tx.bill.findMany({
            where: {
              splitGroupId: (existingBill as any).flexiId,
              isSplitChild: true,
            } as any,
            select: { id: true, splitPercent: true, DocumentType: true } as any,
          });

          for (const child of splitChildren as any[]) {
            // Recalculate child's totalInvoice based on its splitPercent — only for Invoice
            const childTotalInvoice = child.DocumentType === "Invoice" ? total * ((child.splitPercent ?? 0) / 100) : 0;

            // Replace child's product items with parent's updated products
            await tx.productItem.deleteMany({ where: { billId: child.id } });
            for (const item of billInput.productItems) {
              await tx.productItem.create({
                data: {
                  product: item.product,
                  quantity: item.quantity,
                  unitPrice: item.unitPrice,
                  unitDiscount: item.unitDiscount || 0,
                  unit: item.unit,
                  billId: child.id,
                } as any,
              });
            }

            // Sync customer + meta fields (but NOT DocumentType, cashStatus, total, or split fields)
            await tx.bill.update({
              where: { id: child.id },
              data: {
                cName: billInput.cName,
                cLastName: billInput.cLastName,
                cPhone: billInput.cPhone,
                cGender: billInput.cGender,
                cAddress: billInput.cAddress,
                cPostId: billInput.cPostId,
                cProvince: billInput.cProvince,
                cTaxId: billInput.cTaxId,
                customerId: customerIdFromDb ?? (existingBill?.customerId ?? undefined),
                platform: billInput.platform,
                platformId: billInput.platformId,
                taxType: billInput.taxType || "Individual",
                memberId: billInput.memberId,
                note: billInput.note || "",
                paymentTermCondition: billInput.paymentTermCondition || "",
                remark: billInput.remark || "",
                totalInvoice: childTotalInvoice,
                totalQuotation: total,
              } as any,
            });
          }
        }

        return bill;
      });

      res.json({
        status: "ok",
        id: result.id,
        billId: result.billId,
        message: `Updated bill successfully`,
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
    // First, get the existing bill to check its purchaseAt date for update restrictions
    const existingBill = await prisma.bill.findUnique({
      where: {
        id: Number(id),
      },
      select: {
        id: true,
        purchaseAt: true,
      },
    });

    if (!existingBill) {
      return res.status(404).json({ message: "Bill not found" });
    }

    // Check if bill can be updated based on purchaseAt date
    // Bills cannot be updated after the 15th of the next month from the original purchaseAt
    const originalPurchaseDate = new Date(existingBill.purchaseAt);
    const nextMonth = new Date(
      originalPurchaseDate.getFullYear(),
      originalPurchaseDate.getMonth() + 1,
      15,
    );
    const currentDate = new Date();

    if (currentDate > nextMonth) {
      return res.status(403).json({
        message: `Cannot update bill after ${nextMonth.toDateString()}. Bills can only be updated until the 15th of the month following the original purchase date.`,
        cutoffDate: nextMonth.toISOString(),
        originalPurchaseDate: originalPurchaseDate.toISOString(),
        currentDate: currentDate.toISOString(),
      });
    }

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

const updateDocumentTypeById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { DocumentType } = req.body;

  // validate the request body
  const schema = Joi.object({
    DocumentType: Joi.string()
      .valid("Invoice", "Receipt", "Quotation")
      .required(),
  });

  // If the request body is invalid, return error 400 Bad request
  const { error } = schema.validate({ DocumentType });
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      // Get the current bill with product items to access totalQuotation and calculate total if needed
      const currentBill = await tx.bill.findUnique({
        where: {
          id: Number(id),
        },
        include: {
          product: true, // Include product items for calculation
        },
      });

      if (!currentBill) {
        throw new Error("Bill not found");
      }

      // Check if bill can be updated based on purchaseAt date
      // Bills cannot be updated after the 15th of the next month from the original purchaseAt
      const originalPurchaseDate = new Date(currentBill.purchaseAt);
      const nextMonth = new Date(
        originalPurchaseDate.getFullYear(),
        originalPurchaseDate.getMonth() + 1,
        15,
      );
      const currentDate = new Date();

      if (currentDate > nextMonth) {
        const error: any = new Error(
          `Cannot update bill after ${nextMonth.toDateString()}. Bills can only be updated until the 15th of the month following the original purchase date.`,
        );
        error.statusCode = 403;
        error.details = {
          cutoffDate: nextMonth.toISOString(),
          originalPurchaseDate: originalPurchaseDate.toISOString(),
          currentDate: currentDate.toISOString(),
        };
        throw error;
      }

      // Prepare update data
      const updateData: any = {
        DocumentType: DocumentType as DocumentType,
        // Always preserve the original totalQuotation value - never change it
        totalQuotation: currentBill.totalQuotation,
        // Preserve existing totalInvoice by default
        totalInvoice: currentBill.totalInvoice,
      };

      // Generate ID if missing for the new DocumentType
      // Parent bills (those with split children) should never receive an invoiceId
      const isParentBill = (currentBill as any).flexiId
        ? (await tx.bill.count({ where: { splitGroupId: (currentBill as any).flexiId, isSplitChild: true } })) > 0
        : false;

      if (DocumentType === "Receipt") {
        if (!currentBill.billId) {
          updateData.billId = await generateDocumentId(
            tx,
            currentBill.businessAcc,
            "Receipt",
          );
        }
        // If skipping from Quotation to Receipt, also generate Invoice ID if missing
        if (
          currentBill.DocumentType === "Quotation" &&
          !currentBill.invoiceId &&
          !isParentBill
        ) {
          updateData.invoiceId = await generateDocumentId(
            tx,
            currentBill.businessAcc,
            "Invoice",
          );
        }
      } else if (DocumentType === "Invoice" && !currentBill.invoiceId && !isParentBill) {
        updateData.invoiceId = await generateDocumentId(
          tx,
          currentBill.businessAcc,
          "Invoice",
        );
      } else if (DocumentType === "Quotation" && !currentBill.quotationId && !(currentBill as any).isSplitChild) {
        updateData.quotationId = await generateDocumentId(
          tx,
          currentBill.businessAcc,
          "Quotation",
        );
      }

      // Determine full base total from totalQuotation or calculate from products
      const baseTotal =
        (currentBill.totalQuotation !== null && currentBill.totalQuotation !== undefined && (currentBill as any).totalQuotation > 0)
          ? Number(currentBill.totalQuotation)
          : currentBill.product.reduce(
              (sum, item) =>
                sum + (item.quantity * item.unitPrice - (item.unitDiscount || 0) * item.quantity),
              0,
            ) - (currentBill.billLevelDiscount || 0);

      // For split children, amounts are scaled by splitPercent
      const isSplitChild = (currentBill as any).isSplitChild;
      const splitPct = isSplitChild ? (Number((currentBill as any).splitPercent) || 0) : 100;
      const splitAmount = baseTotal * (splitPct / 100);

      // Set cashStatus and total based on DocumentType
      if (DocumentType === "Receipt") {
        updateData.cashStatus = true;
        updateData.total = splitAmount;
        updateData.totalInvoice = 0;
      } else {
        updateData.cashStatus = false;
        updateData.total = 0;

        // If changing TO Invoice, populate totalInvoice as split portion (or full for regular bills)
        if (DocumentType === "Invoice") {
          updateData.totalInvoice = splitAmount;
        } else {
          // Quotation — clear totalInvoice
          updateData.totalInvoice = 0;
        }
      }

      const bill = await tx.bill.update({
        where: {
          id: Number(id),
        },
        data: updateData,
      });

      // Update stock based on DocumentType change
      if (
        DocumentType === "Receipt" &&
        currentBill.DocumentType !== "Receipt"
      ) {
        // Changing TO Receipt: Decrease stock
        for (const item of currentBill.product) {
          if (!item.product) continue;
          await tx.product.update({
            where: { id: item.product },
            data: { stock: { decrement: item.quantity } },
          });
          console.log(
            `Stock decreased for product ${item.product} by ${item.quantity}`,
          );
        }
      } else if (
        DocumentType !== "Receipt" &&
        currentBill.DocumentType === "Receipt"
      ) {
        // Changing FROM Receipt: Increase stock (Restore)
        for (const item of currentBill.product) {
          if (!item.product) continue;
          await tx.product.update({
            where: { id: item.product },
            data: { stock: { increment: item.quantity } },
          });
          console.log(
            `Stock restored for product ${item.product} by ${item.quantity}`,
          );
        }
      }

      return bill;
    });

    res.json({
      id: result.id,
      DocumentType: result.DocumentType,
      cashStatus: result.cashStatus,
      billId: result.billId,
      invoiceId: result.invoiceId,
      quotationId: result.quotationId,
      message: `Updated document type successfully`,
    });
  } catch (e: any) {
    console.error(e);
    if (e.message === "Bill not found") {
      return res.status(404).json({ message: "Bill not found" });
    }
    if (e.statusCode === 403) {
      return res.status(403).json({
        message: e.message,
        ...e.details,
      });
    }
    res.status(500).json({ message: "failed to update document type" });
  }
};

const deleteBill = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await prisma.$transaction(async (tx) => {
      // Fetch the deleted bill including DocumentType and businessAcc
      const bill = await tx.bill.findUnique({
        where: {
          id: Number(id),
        },
        select: {
          DocumentType: true,
          businessAcc: true,
          id: true,
          flexiId: true,
          billId: true,
          invoiceId: true,
          quotationId: true,
          isSplitChild: true,
          splitGroupId: true,
        },
      });

      if (!bill) {
        throw new Error("Bill not found");
      }

      // Prevent deletion of split child bills
      if ((bill as any).isSplitChild) {
        throw new Error("Cannot delete a split installment bill");
      }

      // If this is a split parent, cascade delete all child bills first
      if (bill.splitGroupId && bill.splitGroupId === bill.flexiId) {
        const children = await tx.bill.findMany({
          where: { splitGroupId: bill.flexiId, isSplitChild: true },
          select: { id: true },
        });
        for (const child of children) {
          await tx.productItem.deleteMany({ where: { billId: child.id } });
          await tx.bill.delete({ where: { id: child.id } });
        }
        if (children.length > 0) {
          await tx.documentCounter.updateMany({
            where: { businessId: bill.businessAcc, documentType: "Invoice" },
            data: { count: { decrement: children.length } },
          });
        }
      }

      // update stock product back if DocumentType is Receipt
      if (bill.DocumentType === "Receipt") {
        const productItems = await tx.productItem.findMany({
          where: {
            billId: bill.id,
          },
          select: {
            product: true,
            quantity: true,
          },
        });

        for (const item of productItems) {
          await tx.product.update({
            where: { id: item.product },
            data: { stock: { increment: item.quantity } },
          });

          console.log("🚀 Stock restored for product:", {
            productId: item.product,
            restoredQuantity: item.quantity,
          });
        }
      }

      // Identify Document ID and Sequence Number
      let docId: string | null = null;
      if (bill.DocumentType === "Invoice") docId = bill.invoiceId;
      else if (bill.DocumentType === "Receipt") docId = bill.billId;
      else if (bill.DocumentType === "Quotation") docId = bill.quotationId;

      let deletedSeqNum = 0;
      if (docId) {
        const parts = docId.split("/");
        if (parts.length === 2) {
          deletedSeqNum = parseInt(parts[1], 10);
        }
      }

      // delete associated product items first
      await tx.productItem.deleteMany({
        where: { billId: Number(id) },
      });

      // delete the bill
      await tx.bill.delete({
        where: {
          id: Number(id),
        },
      });

      // Shift subsequent bills if we have a valid sequence number and DocumentType
      if (deletedSeqNum > 0 && bill.DocumentType) {
        // Find all bills of same type and business created after (or with higher ID)
        const subsequentBills = await tx.bill.findMany({
          where: {
            businessAcc: bill.businessAcc,
            DocumentType: bill.DocumentType,
            id: { gt: bill.id },
          },
          orderBy: { id: "asc" },
        });

        for (const subBill of subsequentBills) {
          let subDocId: string | null = null;
          if (bill.DocumentType === "Invoice") subDocId = subBill.invoiceId;
          else if (bill.DocumentType === "Receipt") subDocId = subBill.billId;
          else if (bill.DocumentType === "Quotation")
            subDocId = subBill.quotationId;

          if (subDocId) {
            const parts = subDocId.split("/");
            if (parts.length === 2) {
              const currentSeq = parseInt(parts[1], 10);
              if (currentSeq > deletedSeqNum) {
                const newSeq = currentSeq - 1;
                const newDocId = `${parts[0]}/${newSeq
                  .toString()
                  .padStart(3, "0")}`;

                const updateData: any = {};
                if (bill.DocumentType === "Invoice")
                  updateData.invoiceId = newDocId;
                else if (bill.DocumentType === "Receipt")
                  updateData.billId = newDocId;
                else if (bill.DocumentType === "Quotation")
                  updateData.quotationId = newDocId;

                await tx.bill.update({
                  where: { id: subBill.id },
                  data: updateData,
                });
              }
            }
          }
        }

        // Decrement the DocumentCounter
        await tx.documentCounter.updateMany({
          where: {
            businessId: bill.businessAcc,
            documentType: bill.DocumentType,
          },
          data: {
            count: { decrement: 1 },
          },
        });
      }
    });

    res.json({
      status: "ok",
      message: `Deleted successfully`,
      bill: {
        id: Number(id),
      },
    });
  } catch (e: any) {
    console.error(e);
    if (e.message === "Bill not found") {
      return res.status(404).json({ message: "Bill not found" });
    }
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
    // Find business ID by member ID from member table
    const businessId = await prisma.member.findUnique({
      where: { uniqueId: String(memberId) },
      select: { businessId: true },
    });

    const sales = await prisma.bill.aggregate({
      _sum: {
        total: true,
      },
      where: {
        businessAcc: businessId?.businessId ?? 0,
        purchaseAt: {
          gte: new Date(new Date().getFullYear(), 0, 1),
          lte: new Date(new Date().getFullYear(), 11, 31),
        },
      },
    });
    if (!sales || !sales._sum.total) {
      return res.status(404).json({ message: "No sales found for this year" });
    }
    sales._sum.total = sales._sum.total;
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

// Lookup a Bill by flexiId (public — no auth) for B2B expense auto-fill
const lookupBillByFlexiId = async (req: Request, res: Response) => {
  const { flexiId } = req.params;
  if (!flexiId) {
    return res.status(400).json({ message: "flexiId is required" });
  }
  try {
    const bill = await prisma.bill.findUnique({
      where: { flexiId },
      select: {
        flexiId: true,
        billId: true,
        invoiceId: true,
        quotationId: true,
        DocumentType: true,
        total: true,
        totalAfterTax: true,
        totalTax: true,
        vatPercent: true,
        withHoldingTax: true,
        WHTpercent: true,
        WHTAmount: true,
        taxType: true,
        purchaseAt: true,
        deleted: true,
        businessId: {
          select: {
            businessName: true,
            taxId: true,
            taxType: true,
            vat: true,
            businessAddress: true,
            businessPhone: true,
          },
        },
        product: {
          select: {
            quantity: true,
            unitPrice: true,
            unit: true,
            productList: { select: { name: true } },
          },
        },
      },
    });

    if (!bill || bill.deleted) {
      return res.status(404).json({ message: "Bill not found" });
    }

    //flexiId is existing in expense table, return 404 to prevent auto-fill since it means the bill has already been used for an expense report
    const existingExpense = await prisma.expense.findUnique({
      where: { flexiId },
    });
    if (existingExpense) {
      return res.status(404).json({ message: "expense.documentAlreadyUsed" });
    }

    return res.json({
      flexiId: bill.flexiId,
      documentType: bill.DocumentType,
      taxInvoiceNo: bill.invoiceId || bill.billId || bill.quotationId || null,
      total: bill.total,
      totalAfterTax: bill.totalAfterTax,
      vatAmount: bill.totalTax,
      vatPercent: bill.vatPercent,
      withHoldingTax: bill.withHoldingTax,
      WHTpercent: bill.WHTpercent,
      WHTAmount: bill.WHTAmount,
      taxType: bill.taxType,
      purchaseAt: bill.purchaseAt,
      supplier: {
        name: bill.businessId.businessName,
        taxId: bill.businessId.taxId,
        taxType: bill.businessId.taxType,
        vat: bill.businessId.vat,
        address: bill.businessId.businessAddress,
        phone: bill.businessId.businessPhone,
      },
      products: bill.product.map((p) => ({
        name: p.productList.name,
        quantity: p.quantity,
        unitPrice: p.unitPrice,
        unit: p.unit,
      })),
    });
  } catch (e) {
    console.error("lookupBillByFlexiId error:", e);
    return res.status(500).json({ message: "Failed to lookup bill" });
  }
};

// Get full bill data by flexiId — used to render Invoice/Receipt PDF from an expense
const getBillByFlexiId = async (req: Request, res: Response) => {
  const { flexiId } = req.params;
  if (!flexiId) {
    return res.status(400).json({ message: "flexiId is required" });
  }
  try {
    const bill = await prisma.bill.findUnique({
      where: { flexiId },
      include: {
        product: {
          include: {
            productList: { select: { name: true } },
          },
        },
      },
    });
    if (!bill || bill.deleted) {
      return res.status(404).json({ message: "Bill not found" });
    }
    return res.json(bill);
  } catch (e) {
    console.error("getBillByFlexiId error:", e);
    return res.status(500).json({ message: "Failed to get bill" });
  }
};

// Create split child bills from a parent Invoice bill
const createSplitChildren = async (req: Request, res: Response) => {
  const { parentId } = req.params;
  const { children } = req.body;

  const schema = Joi.object({
    children: Joi.array()
      .items(
        Joi.object({
          splitPercent: Joi.number().min(1).max(100).required(),
          splitPercentMax: Joi.number().min(1).max(100).required(),
        }),
      )
      .min(1)
      .required(),
  });

  const { error } = schema.validate({ children });
  if (error) return res.status(400).json({ message: error.details[0].message });

  const totalPercent = (children as any[]).reduce(
    (sum: number, c: any) => sum + c.splitPercent,
    0,
  );
  if (totalPercent > 100) {
    return res
      .status(400)
      .json({ message: "Total split percentage cannot exceed 100%" });
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const parent = await tx.bill.findUnique({
        where: { id: Number(parentId) },
        include: { product: true },
      });

      if (!parent) throw new Error("Bill not found");
      if ((parent as any).isSplitChild)
        throw new Error("Cannot split a child bill");

      // Use totalInvoice if available, otherwise fall back to totalQuotation or total
      const parentTotal =
        Number(parent.totalInvoice) > 0
          ? Number(parent.totalInvoice)
          : Number((parent as any).totalQuotation) > 0
          ? Number((parent as any).totalQuotation)
          : Number(parent.total);

      const createdChildren = [];

      for (const child of children as any[]) {
        const newId = await generateDocumentId(
          tx,
          parent.businessAcc,
          "Invoice",
        );
        const childTotalInvoice = parentTotal * (child.splitPercent / 100);

        const childBill = await tx.bill.create({
          data: {
            flexiId: generateFlexiId(),
            invoiceId: newId,
            quotationId: (parent as any).quotationId ?? null,
            isSplitChild: true,
            splitGroupId: parent.flexiId,
            splitPercent: child.splitPercent,
            splitPercentMax: child.splitPercentMax,
            DocumentType: "Invoice",
            cashStatus: false,
            total: 0,
            totalInvoice: childTotalInvoice,
            totalQuotation: (parent as any).totalQuotation ?? 0,
            totalBeforeTax: (parent as any).totalBeforeTax ?? 0,
            totalAfterTax: (parent as any).totalAfterTax ?? 0,
            totalTax: (parent as any).totalTax ?? 0,
            vatPercent: (parent as any).vatPercent ?? 0,
            beforeDiscount: (parent as any).beforeDiscount ?? 0,
            discount: (parent as any).discount ?? 0,
            billLevelDiscount: 0,
            cName: parent.cName,
            cLastName: parent.cLastName,
            cPhone: parent.cPhone,
            cGender: parent.cGender,
            cAddress: parent.cAddress,
            cProvince: parent.cProvince,
            cPostId: parent.cPostId,
            cTaxId: parent.cTaxId,
            memberId: parent.memberId,
            businessAcc: parent.businessAcc,
            platform: parent.platform,
            platformId: parent.platformId,
            payment: parent.payment,
            taxType: parent.taxType,
            purchaseAt: parent.purchaseAt,
            customerId: parent.customerId,
            note: (parent as any).note ?? "",
            paymentTermCondition: (parent as any).paymentTermCondition ?? "",
            remark: (parent as any).remark ?? "",
            withHoldingTax: (parent as any).withHoldingTax ?? false,
            WHTpercent: (parent as any).WHTpercent ?? 0,
            WHTAmount: (parent as any).WHTAmount ?? 0,
            priceValid: (parent as any).priceValid ?? null,
            repeat: (parent as any).repeat ?? false,
            repeatMonths: (parent as any).repeatMonths ?? 0,
            image: (parent as any).image ?? "",
          } as any,
        });

        // Copy product items from parent to child
        for (const item of parent.product) {
          await tx.productItem.create({
            data: {
              product: item.product,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              unitDiscount: item.unitDiscount ?? 0,
              unit: item.unit,
              billId: childBill.id,
            } as any,
          });
        }

        createdChildren.push(childBill);
      }

      // Mark parent as a split parent and set DocumentType to Invoice
      await tx.bill.update({
        where: { id: parent.id },
        data: {
          splitGroupId: parent.flexiId,
          DocumentType: "Invoice",
          cashStatus: false,
          total: 0,
          totalInvoice: parentTotal,
        } as any,
      });

      return createdChildren;
    });

    res.json({
      status: "ok",
      message: `Created ${result.length} split children`,
      children: result,
    });
  } catch (e: any) {
    console.error(e);
    if (e.message === "Bill not found")
      return res.status(404).json({ message: "Bill not found" });
    if (e.message === "Cannot split a child bill")
      return res.status(400).json({ message: e.message });
    res.status(500).json({ message: "failed to create split children" });
  }
};

// Reset a split parent back to Quotation (deletes all child bills)
const resetParentSplit = async (req: Request, res: Response) => {
  const { parentId } = req.params;

  try {
    await prisma.$transaction(async (tx) => {
      const parent = await tx.bill.findUnique({
        where: { id: Number(parentId) },
      });

      if (!parent) throw new Error("Bill not found");
      if ((parent as any).isSplitChild)
        throw new Error("Cannot reset a child bill");

      const children = await tx.bill.findMany({
        where: {
          splitGroupId: (parent as any).flexiId,
          isSplitChild: true,
        },
        select: { id: true },
      });

      for (const child of children) {
        await tx.productItem.deleteMany({ where: { billId: child.id } });
        await tx.bill.delete({ where: { id: child.id } });
      }

      if (children.length > 0) {
        await tx.documentCounter.updateMany({
          where: {
            businessId: parent.businessAcc,
            documentType: "Invoice",
          },
          data: { count: { decrement: children.length } },
        });
      }

      await tx.bill.update({
        where: { id: parent.id },
        data: {
          DocumentType: "Quotation",
          splitGroupId: null,
          cashStatus: false,
          total: 0,
        } as any,
      });
    });

    res.json({ status: "ok", message: "Reset parent bill to Quotation" });
  } catch (e: any) {
    console.error(e);
    if (e.message === "Bill not found")
      return res.status(404).json({ message: "Bill not found" });
    res.status(500).json({ message: "failed to reset parent split" });
  }
};

export {
  createBill,
  getBills,
  getBillById,
  getBillByFlexiId,
  deleteBill,
  updateBill,
  searchBill,
  updateCashStatusById,
  updateDocumentTypeById,
  getthisYearSales,
  lookupBillByFlexiId,
  createSplitChildren,
  resetParentSplit,
};
