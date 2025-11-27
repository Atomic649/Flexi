import { Request, Response } from "express";
import {
  Gender,
  Payment,
  PrismaClient as PrismaClient1,
  SocialMedia,
  Unit,
  DocumentType,
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
  storeId: number;
  total?: number;
  totalQuotation?: number; // Optional field for quotation total
  productItems: ProductItemInput[];
  repeat?: boolean;
  repeatMonths?: number;
  DocumentType: ("Invoice" | "Receipt" | "Quotation")[];
  note?: string; // Optional note
  discount?: number; // Optional discount field
  priceValid?: Date; // Optional price valid
  beforeDiscount?: number; // Optional field for total before discount
  paymentTermCondition?: string; // Optional payment term condition
  remark?: string; // Optional remark
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
  storeId: Joi.number(),
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
  beforeDiscount: Joi.number().optional(), // Optional field for total before discount
  paymentTermCondition: Joi.string().allow("").optional(), // Optional payment term condition
  remark: Joi.string().allow("").optional(), // Optional remark
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

    // Handle repeat bills
    try {
      const createdBills = [];
      const currentDate = new Date();
      const originalDate = new Date(billInput.purchaseAt);

      if (
        billInput.repeat &&
        billInput.repeatMonths &&
        billInput.repeatMonths > 1
      ) {
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

            // Determine which total to use based on DocumentType
            const finalTotal =
              billInput.DocumentType[0] === "Invoice" ||
              billInput.DocumentType[0] === "Quotation"
                ? 0
                : total;

            // Set cashStatus based on DocumentType
            const finalCashStatus =
              billInput.DocumentType[0] === "Invoice" ||
              billInput.DocumentType[0] === "Quotation"
                ? false
                : true; // Receipt should always be true

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
                    unitDiscount: item.unitDiscount || 0,
                    unit: item.unit,
                  })),
                },
                payment: billInput.payment,
                platform: store.platform,
                cashStatus: finalCashStatus,
                memberId: billInput.memberId,
                purchaseAt: billDate,
                businessAcc: billInput.businessAcc,
                storeId: billInput.storeId,
                image: req.file?.filename ?? "",
                discount: discount, // Unit discounts only
                billLevelDiscount: billLevelDiscount, // Bill-level discount
                priceValid: billInput.priceValid, // Include priceValid if provided
                total: finalTotal,
                totalQuotation: total, // Include totalQuotation field
                beforeDiscount,
                DocumentType: billInput.DocumentType[0], // Take first element from array
                note: billInput.note || "", // Optional note field
                paymentTermCondition: billInput.paymentTermCondition || "", // Optional payment term condition
                remark: billInput.remark || "", // Optional remark
              },
            });

            createdBills.push(bill);
          }
        }

        res.json({
          status: "ok",
          message: `Created ${createdBills.length} bills successfully for ${billInput.repeatMonths} months`,
          bills: createdBills,
          totalBills: createdBills.length,
        });
      } else {
        // Create single bill
        // Determine which total to use based on DocumentType
        const finalTotal =
          billInput.DocumentType[0] === "Invoice" ||
          billInput.DocumentType[0] === "Quotation"
            ? 0
            : total;

        // Set cashStatus based on DocumentType
        const finalCashStatus =
          billInput.DocumentType[0] === "Invoice" ||
          billInput.DocumentType[0] === "Quotation"
            ? false
            : true; // Receipt should always be true

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
                unitDiscount: item.unitDiscount || 0,
                unit: item.unit,
              })),
            },
            payment: billInput.payment,
            platform: store.platform,
            cashStatus: finalCashStatus,
            memberId: billInput.memberId,
            purchaseAt: billInput.purchaseAt,
            businessAcc: billInput.businessAcc,
            storeId: billInput.storeId,
            image: req.file?.filename ?? "",
            discount: discount, // Unit discounts only
            billLevelDiscount: billLevelDiscount, // Bill-level discount
            priceValid: billInput.priceValid, // Include priceValid if provided
            total: finalTotal,
            totalQuotation: total, // Include totalQuotation field
            beforeDiscount,
            DocumentType: billInput.DocumentType[0], // Take first element from array
            note: billInput.note || "", // Optional note field
            paymentTermCondition: billInput.paymentTermCondition || "", // Optional payment term condition
            remark: billInput.remark || "", // Optional remark
          },
        });
        if (billInput.DocumentType[0] === "Receipt") {
          //find product id by businessAcc and product name
          const product = await prisma.product.findFirst({
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
            const reductStock = await prisma.product.update({
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
            billInput.DocumentType[0]
          );
        }

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
    // Find business ID by member ID from member table
    const businessId = await prisma.member.findUnique({
      where: { uniqueId: memberId },
      select: { businessId: true },
    });
    const bills = await prisma.bill.findMany({
      where: {
        businessAcc: businessId?.businessId ?? 0,
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
        DocumentType: true,
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

    // First, get the existing bill to check its current purchaseAt date
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

    const store = await prisma.store.findUnique({
      where: {
        id: billInput.storeId,
      },
    });
    if (!store) {
      return res.status(404).json({ message: "Store not found" });
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
      // Capture current product quantities for inventory adjustments
      const existingProductItems = await prisma.productItem.findMany({
        where: { billId: Number(id) },
        select: {
          product: true,
          quantity: true,
        },
      });

      // Delete existing product items for this bill (to fully replace)
      await prisma.productItem.deleteMany({
        where: { billId: Number(id) },
      });

      // Determine which total to use based on DocumentType
      const finalTotal =
        billInput.DocumentType[0] === "Invoice" ||
        billInput.DocumentType[0] === "Quotation"
          ? 0
          : total;

      // Set cashStatus based on DocumentType
      const finalCashStatus =
        billInput.DocumentType[0] === "Invoice" ||
        billInput.DocumentType[0] === "Quotation"
          ? false
          : true; // Receipt should always be true

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
              unitDiscount: item.unitDiscount || 0,
              unit: item.unit,
            })),
          },
          payment: billInput.payment,
          platform: store.platform, // IncomeChannel
          storeId: billInput.storeId,
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
          DocumentType: billInput.DocumentType[0], // Take first element from array
          paymentTermCondition: billInput.paymentTermCondition || "", // Optional payment term condition
          remark: billInput.remark || "", // Optional remark
        },
      });
      if (billInput.DocumentType[0] === "Receipt") {
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

          const productRecord = await prisma.product.findFirst({
            where: {
              businessAcc: billInput.businessAcc,
              name: productName,
            },
            select: {
              id: true,
            },
          });

          if (!productRecord?.id) {
            console.warn("� Product not found for stock adjustment:", {
              businessAcc: billInput.businessAcc,
              productName,
            });
            continue;
          }

          const stockUpdate =
            delta > 0 ? { decrement: delta } : { increment: Math.abs(delta) };

          const updatedProduct = await prisma.product.update({
            where: {
              id: productRecord.id,
            },
            data: {
              stock: stockUpdate,
            },
          });

          console.log("� Stock adjusted for product:", {
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
          billInput.DocumentType[0]
        );
      }

      res.json({
        id: bill.id,
        billId: bill.billId,
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
    // Get the current bill with product items to access totalQuotation and calculate total if needed
    const currentBill = await prisma.bill.findUnique({
      where: {
        id: Number(id),
      },
      include: {
        product: true, // Include product items for calculation
      },
    });

    if (!currentBill) {
      return res.status(404).json({ message: "Bill not found" });
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
      return res.status(403).json({
        message: `Cannot update bill after ${nextMonth.toDateString()}. Bills can only be updated until the 15th of the month following the original purchase date.`,
        cutoffDate: nextMonth.toISOString(),
        originalPurchaseDate: originalPurchaseDate.toISOString(),
        currentDate: currentDate.toISOString(),
      });
    }

    // Prepare update data
    const updateData: any = {
      DocumentType: DocumentType as DocumentType,
      // Always preserve the original totalQuotation value - never change it
      totalQuotation: currentBill.totalQuotation,
    };

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

    const bill = await prisma.bill.update({
      where: {
        id: Number(id),
      },
      data: updateData,
    });
    res.json({
      id: bill.id,
      DocumentType: bill.DocumentType,
      cashStatus: bill.cashStatus,
      message: `Updated document type successfully`,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "failed to update document type" });
  }
};

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
