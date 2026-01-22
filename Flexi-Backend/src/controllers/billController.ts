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



const upload = multer(multerConfig.multerConfigImage.config).single(
  multerConfig.multerConfigImage.keyUpload
);

// Create  instance of PrismaClient
const prisma = flexiDBPrismaClient

const generateDocumentId = async (
  tx: any,
  businessId: number,
  documentType: DocumentType
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
  repeatMonths?: number | null
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
          ? ((bill as any).product as { product: string | null }[])
          : [];

        for (const item of products) {
          if (!item?.product) {
            continue;
          }

          await tx.product.updateMany({
            where: {
              businessAcc: businessAccId,
              name: item.product,
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
      })
    )
  );
};

// Interface for request body from client
interface ProductItemInput {
  product: string;
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
  cGender: Joi.string().valid("Female", "Male", "NotSpecified").required(),
  cAddress: Joi.string().required(),
  cProvince: Joi.string().required(),
  cPostId: Joi.string().required(),
  cTaxId: Joi.string().allow("").optional(),
  payment: Joi.string()
    .valid("COD", "Transfer", "CreditCard", "Cash", "NotSpecified")
    .required(),
  cashStatus: Joi.boolean().optional(),
  memberId: Joi.string().required(),
  businessAcc: Joi.number().required(),
  image: Joi.string().allow(""),
  platformId: Joi.number().optional(),
  platform: Joi.string().required(),
  total: Joi.number(),
  totalQuotation: Joi.number().optional(), // Optional field for quotation total
  repeat: Joi.boolean().optional(),
  repeatMonths: Joi.number().min(1).max(12).optional(),
  productItems: Joi.array()
    .items(
      Joi.object({
        product: Joi.string().required(),
        quantity: Joi.number().min(1).required(),
        unitPrice: Joi.number().min(0).required(),
        unitDiscount: Joi.number().min(0).optional(),
        unit: Joi.string().optional(), // Optional field for unit
      })
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
      String(billInput.cashStatus).toLowerCase()
    );
    billInput.purchaseAt = new Date(billInput.purchaseAt);
    if (billInput.validContactUntil) {
      billInput.validContactUntil = new Date(billInput.validContactUntil);
    }
    if (billInput.priceValid) {
      billInput.priceValid = new Date(billInput.priceValid);
    }
    const repeatFlag = ["true", "1", "yes"].includes(
      String(billInput.repeat).toLowerCase()
    );
    billInput.repeat = repeatFlag;
    const repeatMonths = Number(billInput.repeatMonths ?? 0);
    billInput.repeatMonths = Number.isFinite(repeatMonths) ? repeatMonths : 0;
    // normalize withholding inputs (may come as strings from form-data)
    billInput.withholdingTax = ["true", "1", "yes"].includes(
      String(billInput.withholdingTax).toLowerCase()
    );
    billInput.withholdingPercent = Number(billInput.withholdingPercent ?? 0);
    billInput.WHTAmount = Number(billInput.WHTAmount ?? 0);
    // normalize withholding inputs (may come as strings from form-data)
    billInput.withholdingTax = ["true", "1", "yes"].includes(
      String(billInput.withholdingTax).toLowerCase()
    );
    billInput.withholdingPercent = Number(billInput.withholdingPercent ?? 0);
    billInput.WHTAmount = Number(billInput.WHTAmount ?? 0);
    // find platform from platform id
    try {
      const result = await prisma.$transaction(async (tx) => {
        // const platform = await tx.platform.findUnique({
        //   where: {
        //     id: billInput.platformId,
        //   },
        // });
        // if (!platform) {
        //   throw new Error("platform not found");
        // }

        // Calculate beforeDiscount (total before any discounts)
        const beforeDiscount = billInput.productItems.reduce(
          (sum, item) => sum + item.quantity * item.unitPrice,
          0
        );

        // Calculate discount from all product items (unit discounts only)
        const discount = billInput.productItems.reduce(
          (sum, item) => sum + (item.unitDiscount || 0) * item.quantity,
          0
        );

        // Get bill-level discount from input
        const billLevelDiscount = billInput.discount || 0;

        // Calculate total from all product items (subtract unit discounts and bill-level discount)
        const total =
          billInput.productItems.reduce(
            (sum, item) =>
              sum +
              (item.quantity * item.unitPrice -
                (item.unitDiscount || 0) * item.quantity),
            0
          ) - billLevelDiscount;

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
            billInput.repeatMonths
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
                docType
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
                billLevelDiscount: billLevelDiscount, // Bill-level discount
                priceValid: billInput.priceValid, // Include priceValid if provided
                total: finalTotal,
                totalQuotation: total, // Include totalQuotation field
                beforeDiscount,
                DocumentType: docType,
                note: billInput.note || "", // Optional note field
                paymentTermCondition: billInput.paymentTermCondition || "", // Optional payment term condition
                remark: billInput.remark || "", // Optional remark
                withHoldingTax: billInput.withholdingTax ?? false,
                WHTpercent: billInput.withholdingPercent ?? 0,
                WHTAmount:
                  billInput.WHTAmount && Number(billInput.WHTAmount) > 0
                    ? Number(billInput.WHTAmount)
                    : billInput.withholdingTax
                    ? Math.round(
                        total * (Number(billInput.withholdingPercent ?? 0) / 100)
                      )
                    : 0,
                repeat: billInput.repeat,
                repeatMonths: billInput.repeatMonths ?? 0,
                taxType: billInput.taxType || "Individual",
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
            docType
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
            billLevelDiscount: billLevelDiscount, // Bill-level discount
            priceValid: billInput.priceValid, // Include priceValid if provided
            total: finalTotal,
            totalQuotation: total, // Include totalQuotation field
            beforeDiscount,
            DocumentType: docType,
            note: billInput.note || "", // Optional note field
            paymentTermCondition: billInput.paymentTermCondition || "", // Optional payment term condition
            remark: billInput.remark || "", // Optional remark
            withHoldingTax: billInput.withholdingTax ?? false,
            WHTpercent: billInput.withholdingPercent ?? 0,
            WHTAmount:
              billInput.WHTAmount && Number(billInput.WHTAmount) > 0
                ? Number(billInput.WHTAmount)
                : billInput.withholdingTax
                ? Math.round(
                    total * (Number(billInput.withholdingPercent ?? 0) / 100)
                  )
                : 0,
            repeat: billInput.repeat,
            repeatMonths: billInput.repeat ? billInput.repeatMonths ?? 0 : 0,
            taxType: billInput.taxType || "Individual",
          };

          const singleValidUntil = calculateValidContactUntil(
            billInput.purchaseAt,
            billInput.repeat,
            billInput.repeatMonths
          );
          if (singleValidUntil) {
            singleBillData.validContactUntil = singleValidUntil;
            singleBillData.rentalStockReleased = false;
          }

          const bill = await tx.bill.create({
            data: singleBillData,
          });

          if (docType === "Receipt") {
            //find product id by businessAcc and product name
            const product = await tx.product.findFirst({
              where: {
                businessAcc: billInput.businessAcc,
                name: billInput.productItems[0].product,
              },
              select: {
                id: true,
              },
            });

            console.log("🚀 Product to reduce stock:", product);

            // Reduce stock - update product stock using prisma.update only if product was found
            if (product && product.id) {
              const reductStock = await tx.product.update({
                where: {
                  id: product.id,
                },
                data: {
                  stock: { decrement: billInput.productItems[0].quantity },
                },
              });
              console.log("🚀 Stock reduced:", reductStock);
            } else {
              console.warn(
                "🚨 Product not found for stock reduction:",
                billInput.productItems[0].product,
                "businessAcc:",
                billInput.businessAcc
              );
            }
          } else {
            console.log(
              "ℹ️ Skipping stock reduction for non-receipt document type:",
              docType
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
        platformId: true,
        discount: true, // Include discount
        priceValid: true, // Include priceValid
        total: true,
        totalQuotation: true, // Include totalQuotation
        platform: true,
        product: {
          select: {
            product: true,
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
      String(billInput.cashStatus).toLowerCase()
    );
    billInput.purchaseAt = new Date(billInput.purchaseAt);
    if (billInput.validContactUntil) {
      billInput.validContactUntil = new Date(billInput.validContactUntil);
    }
    if (billInput.priceValid) {
      billInput.priceValid = new Date(billInput.priceValid);
    }
    const repeatFlag = ["true", "1", "yes"].includes(
      String(billInput.repeat).toLowerCase()
    );
    billInput.repeat = repeatFlag;
    const repeatMonths = Number(billInput.repeatMonths ?? 0);
    billInput.repeatMonths = Number.isFinite(repeatMonths) ? repeatMonths : 0;

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
      15
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
      0
    );

    // Calculate discount from all product items (unit discounts only)
    const discount = billInput.productItems.reduce(
      (sum, item) => sum + (item.unitDiscount || 0) * item.quantity,
      0
    );

    // Get bill-level discount from input
    const billLevelDiscount = billInput.discount || 0;

    // Calculate total from all product items (subtract unit discounts and bill-level discount)
    const total =
      billInput.productItems.reduce(
        (sum, item) =>
          sum +
          (item.quantity * item.unitPrice -
            (item.unitDiscount || 0) * item.quantity),
        0
      ) - billLevelDiscount;
    try {
      const result = await prisma.$transaction(async (tx) => {
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
          billInput.repeatMonths
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
          purchaseAt: billInput.purchaseAt,
          businessAcc: billInput.businessAcc,
          image: req.file?.filename ?? "",
          total: finalTotal,
          totalQuotation: total, // Include totalQuotation field
          note: billInput.note || "", // Optional note field
          discount: discount, // Unit discounts only
          billLevelDiscount: billLevelDiscount, // Bill-level discount
          beforeDiscount: beforeDiscount,
          priceValid: billInput.priceValid, // Include priceValid if provided
          DocumentType: docType, // Take first element from array
          paymentTermCondition: billInput.paymentTermCondition || "", // Optional payment term condition
          remark: billInput.remark || "", // Optional remark
          repeat: billInput.repeat,
          repeatMonths: billInput.repeat ? billInput.repeatMonths ?? 0 : 0,        
          taxType: billInput.taxType || "Individual",
        };

        // Generate ID if missing for the new DocumentType
        if (docType === "Receipt") {
          if (!existingBill.billId) {
            updateData.billId = await generateDocumentId(
              tx,
              billInput.businessAcc,
              "Receipt"
            );
          }
          // If skipping from Quotation to Receipt, also generate Invoice ID if missing
          if (
            existingBill.DocumentType === "Quotation" &&
            !existingBill.invoiceId
          ) {
            updateData.invoiceId = await generateDocumentId(
              tx,
              billInput.businessAcc,
              "Invoice"
            );
          }
        } else if (docType === "Invoice" && !existingBill.invoiceId) {
          updateData.invoiceId = await generateDocumentId(
            tx,
            billInput.businessAcc,
            "Invoice"
          );
        } else if (docType === "Quotation" && !existingBill.quotationId) {
          updateData.quotationId = await generateDocumentId(
            tx,
            billInput.businessAcc,
            "Quotation"
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
            items: { product: string; quantity: number }[]
          ) => {
            return items.reduce<Record<string, number>>((acc, item) => {
              const quantity = Number(item.quantity) || 0;
              acc[item.product] = (acc[item.product] || 0) + quantity;
              return acc;
            }, {});
          };

          const previousQuantities = aggregateQuantities(existingProductItems);
          const newQuantities = aggregateQuantities(billInput.productItems);
          const affectedProducts = new Set([
            ...Object.keys(previousQuantities),
            ...Object.keys(newQuantities),
          ]);

          for (const productName of affectedProducts) {
            const previousQty = previousQuantities[productName] || 0;
            const newQty = newQuantities[productName] || 0;
            const delta = newQty - previousQty;

            if (delta === 0) {
              continue; // No adjustment needed
            }

            const productRecord = await tx.product.findFirst({
              where: {
                businessAcc: billInput.businessAcc,
                name: productName,
              },
              select: {
                id: true,
              },
            });

            if (!productRecord?.id) {
              console.warn(" Product not found for stock adjustment:", {
                businessAcc: billInput.businessAcc,
                productName,
              });
              continue;
            }

            const stockUpdate =
              delta > 0 ? { decrement: delta } : { increment: Math.abs(delta) };

            const updatedProduct = await tx.product.update({
              where: {
                id: productRecord.id,
              },
              data: {
                stock: stockUpdate,
              },
            });

            console.log(" Stock adjusted for product:", {
              productName,
              previousQty,
              newQty,
              delta,
              updatedStock: updatedProduct.stock,
            });
          }
        } else {
          console.log(
            "ℹ️ Skipping stock adjustment for non-receipt document type:",
            docType
          );
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
      15
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
        15
      );
      const currentDate = new Date();

      if (currentDate > nextMonth) {
        const error: any = new Error(
          `Cannot update bill after ${nextMonth.toDateString()}. Bills can only be updated until the 15th of the month following the original purchase date.`
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
      };

      // Generate ID if missing for the new DocumentType
      if (DocumentType === "Receipt") {
        if (!currentBill.billId) {
          updateData.billId = await generateDocumentId(
            tx,
            currentBill.businessAcc,
            "Receipt"
          );
        }
        // If skipping from Quotation to Receipt, also generate Invoice ID if missing
        if (
          currentBill.DocumentType === "Quotation" &&
          !currentBill.invoiceId
        ) {
          updateData.invoiceId = await generateDocumentId(
            tx,
            currentBill.businessAcc,
            "Invoice"
          );
        }
      } else if (DocumentType === "Invoice" && !currentBill.invoiceId) {
        updateData.invoiceId = await generateDocumentId(
          tx,
          currentBill.businessAcc,
          "Invoice"
        );
      } else if (DocumentType === "Quotation" && !currentBill.quotationId) {
        updateData.quotationId = await generateDocumentId(
          tx,
          currentBill.businessAcc,
          "Quotation"
        );
      }

      // Set cashStatus and total based on DocumentType
      if (DocumentType === "Receipt") {
        updateData.cashStatus = true;

        // If changing to Receipt, use totalQuotation or calculate from products
        if (
          currentBill.totalQuotation !== null &&
          currentBill.totalQuotation !== undefined
        ) {
          updateData.total = currentBill.totalQuotation;
        } else {
          // Calculate total from product items if totalQuotation is not available
          const calculatedTotal =
            currentBill.product.reduce(
              (sum, item) =>
                sum +
                (item.quantity * item.unitPrice -
                  (item.unitDiscount || 0) * item.quantity),
              0
            ) - (currentBill.billLevelDiscount || 0);
          updateData.total = calculatedTotal;
        }
      } else {
        updateData.cashStatus = false;
        // If changing from Receipt to Invoice/Quotation, set total to 0 but keep totalQuotation unchanged
        updateData.total = 0;
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

          const productRecord = await tx.product.findFirst({
            where: {
              businessAcc: currentBill.businessAcc,
              name: item.product,
            },
            select: { id: true },
          });

          if (productRecord) {
            await tx.product.update({
              where: { id: productRecord.id },
              data: { stock: { decrement: item.quantity } },
            });
            console.log(
              `Stock decreased for product ${item.product} by ${item.quantity}`
            );
          }
        }
      } else if (
        DocumentType !== "Receipt" &&
        currentBill.DocumentType === "Receipt"
      ) {
        // Changing FROM Receipt: Increase stock (Replatform)
        for (const item of currentBill.product) {
          if (!item.product) continue;

          const productRecord = await tx.product.findFirst({
            where: {
              businessAcc: currentBill.businessAcc,
              name: item.product,
            },
            select: { id: true },
          });

          if (productRecord) {
            await tx.product.update({
              where: { id: productRecord.id },
              data: { stock: { increment: item.quantity } },
            });
            console.log(
              `Stock restored for product ${item.product} by ${item.quantity}`
            );
          }
        }
      }


      // Update stock based on DocumentType change
      if (
        DocumentType === "Receipt" &&
        currentBill.DocumentType !== "Receipt"
      ) {
        // Changing TO Receipt: Decrease stock
        for (const item of currentBill.product) {
          if (!item.product) continue;

          const productRecord = await tx.product.findFirst({
            where: {
              businessAcc: currentBill.businessAcc,
              name: item.product,
            },
            select: { id: true },
          });

          if (productRecord) {
            await tx.product.update({
              where: { id: productRecord.id },
              data: { stock: { decrement: item.quantity } },
            });
            console.log(
              `Stock decreased for product ${item.product} by ${item.quantity}`
            );
          }
        }
      } else if (
        DocumentType !== "Receipt" &&
        currentBill.DocumentType === "Receipt"
      ) {
        // Changing FROM Receipt: Increase stock (Restore)
        for (const item of currentBill.product) {
          if (!item.product) continue;

          const productRecord = await tx.product.findFirst({
            where: {
              businessAcc: currentBill.businessAcc,
              name: item.product,
            },
            select: { id: true },
          });

          if (productRecord) {
            await tx.product.update({
              where: { id: productRecord.id },
              data: { stock: { increment: item.quantity } },
            });
            console.log(
              `Stock restored for product ${item.product} by ${item.quantity}`
            );
          }
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
          billId: true,
          invoiceId: true,
          quotationId: true,
        },
      });

      if (!bill) {
        throw new Error("Bill not found");
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
          const productRecord = await tx.product.findFirst({
            where: {
              businessAcc: bill.businessAcc,
              name: item.product,
            },
            select: {
              id: true,
            },
          });

          if (!productRecord?.id) {
            console.warn("🚀 Product not found for stock restoration:", {
              businessAcc: bill.businessAcc,
              productName: item.product,
            });
            continue;
          }

          await tx.product.update({
            where: {
              id: productRecord.id,
            },
            data: {
              stock: { increment: item.quantity },
            },
          });

          console.log("🚀 Stock restored for product:", {
            productName: item.product,
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
  updateDocumentTypeById,
  getthisYearSales,
};
