import express from "express";
import request from "supertest";
import {
  jest,
  describe,
  test,
  expect,
  beforeEach,
  beforeAll,
  afterAll,
} from "@jest/globals";

// Mock multer to bypass actual file handling
jest.mock("../src/middleware/multer_config", () => ({
  __esModule: true,
  default: {
    multerConfigImage: {
      config: {},
      keyUpload: "image",
    },
  },
}));

jest.mock("multer", () => {
  const mockMulter = () => ({
    single: () => (req: any, _res: any, cb: (err?: any) => void) => {
      // simulate no file error; optionally set req.file
      req.file = undefined;
      cb();
    },
  });
  // Attach MulterError for instanceof checks
  (mockMulter as any).MulterError = class MulterError extends Error {};
  return mockMulter;
});

// Prisma mock with the methods used by billController
const prismaMock: any = {};

prismaMock.platform = { findUnique: jest.fn() };
prismaMock.bill = {
  findFirst: jest.fn(),
  create: jest.fn(),
  findMany: jest.fn(),
  findUnique: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  aggregate: jest.fn(),
};
prismaMock.member = { findUnique: jest.fn() };
prismaMock.productItem = { deleteMany: jest.fn(), findMany: jest.fn() };
prismaMock.product = {
  updateMany: jest.fn(),
  update: jest.fn(),
  findFirst: jest.fn(),
};
prismaMock.documentCounter = { upsert: jest.fn(), updateMany: jest.fn() };
prismaMock.$transaction = jest.fn(async (cb: any) =>
  cb({
    product: prismaMock.product,
    bill: prismaMock.bill,
    platform: prismaMock.platform,
    documentCounter: prismaMock.documentCounter,
    productItem: prismaMock.productItem,
  })
);

jest.mock("../src/generated/client1/client", () => {
  return { PrismaClient: jest.fn().mockImplementation(() => prismaMock) };
});

import {
  createBill,
  getBills,
  getBillById,
  updateBill,
  updateCashStatusById,
  updateDocumentTypeById,
  deleteBill,
  searchBill,
  getthisYearSales,
} from "../src/controllers/billController";

const app = express();
app.use(express.json());
app.post("/bill", (req, res) => createBill(req, res));
app.get("/bills/:memberId", (req, res) => getBills(req, res));
app.get("/bill/:id", (req, res) => getBillById(req, res));
app.put("/bill/:id", (req, res) => updateBill(req, res));
app.put("/bill/:id/cash", (req, res) => updateCashStatusById(req, res));
app.put("/bill/:id/document-type", (req, res) =>
  updateDocumentTypeById(req, res)
);
app.delete("/bill/:id", (req, res) => deleteBill(req, res));
app.get("/bill/search/:keyword", (req, res) => searchBill(req, res));
app.get("/sales/this-year", (req, res) => getthisYearSales(req, res));

const validBillPayload = () => ({
  cName: "John",
  cLastName: "Doe",
  cPhone: "0123456789",
  cGender: "Male",
  cAddress: "123",
  cProvince: "Bangkok",
  cPostId: "10000",
  cTaxId: "",
  payment: "Cash",
  cashStatus: true,
  memberId: "MID-1",
  purchaseAt: new Date().toISOString(),
  businessAcc: 1,
  image: "",
  platform: "Shopee",
  discount: 10,
  productItems: [
    {
      product: "A",
      quantity: 2,
      unitPrice: 100,
      unitDiscount: 5,
      unit: "Unit",
    },
    { product: "B", quantity: 1, unitPrice: 50, unit: "Unit" },
  ],
  DocumentType: ["Receipt"],
  note: "",
  paymentTermCondition: "",
  remark: "",
  priceValid: "",
  WHTAmount: 0,
  
});

describe("billController", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
    prismaMock.documentCounter.upsert.mockResolvedValue({ count: 1 });
    prismaMock.documentCounter.updateMany.mockResolvedValue({ count: 1 });
    prismaMock.platform.findUnique.mockResolvedValue({ id: 10, name: "Shop" });
  });

  describe("createBill", () => {
    test("creates a bill successfully (single)", async () => {
      prismaMock.platform.findUnique.mockResolvedValue({
        id: 10,
        name: "Shop",
      });
      prismaMock.documentCounter.upsert.mockResolvedValue({ count: 1 });
      prismaMock.bill.findFirst.mockResolvedValue(null);
      prismaMock.bill.create.mockResolvedValue({ id: 1, billId: "INV2025/1" });

      const res = await request(app).post("/bill").send(validBillPayload());
      expect(res.status).toBe(200);
      expect(res.body.status).toBe("ok");
      expect(prismaMock.bill.create).toHaveBeenCalled();
    });

    test("rejects invalid payload", async () => {
      const res = await request(app).post("/bill").send({});
      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/cName|required/i);
    });

    test("creates bill with platform string when platformId missing", async () => {
      prismaMock.bill.create.mockImplementation(async ({ data }: any) => ({
        id: 2,
        billId: "INV2025/2",
        ...data,
      }));

      const res = await request(app)
        .post("/bill")
        .send({ ...validBillPayload(), platform: "Lazada" });

      expect(res.status).toBe(200);
      const call = prismaMock.bill.create.mock.calls[0][0];
      expect(call.data.platform).toBe("Lazada");
      expect(Number.isNaN(call.data.platformId)).toBe(true);
    });
  });

  describe("getBills", () => {
    test("returns list of bills for member", async () => {
      prismaMock.member.findUnique.mockResolvedValue({ businessId: 2 });
      prismaMock.bill.findMany.mockResolvedValue([{ id: 1 }, { id: 2 }]);
      const res = await request(app).get("/bills/MID-1");
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(2);
    });

    test("restores rental stock when valid contact has expired", async () => {
      jest.useFakeTimers().setSystemTime(new Date("2025-11-20T12:00:00Z"));

      prismaMock.member.findUnique.mockResolvedValue({ businessId: 5 });

      const expiredBills = [
        {
          id: 42,
          product: [{ product: "Rental Item" }],
          validContactUntil: new Date("2025-11-01T00:00:00Z"),
        },
      ];

      prismaMock.bill.findMany
        .mockResolvedValueOnce(expiredBills)
        .mockResolvedValueOnce([{ id: 7 }]);

      prismaMock.product.updateMany.mockResolvedValue({ count: 1 });
      prismaMock.bill.update.mockResolvedValue({ id: 42 });

      const res = await request(app).get("/bills/MID-1");

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(prismaMock.product.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { stock: 1 },
        })
      );
      expect(prismaMock.bill.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 42 },
          data: expect.objectContaining({ rentalStockReleased: true }),
        })
      );
      expect(prismaMock.bill.findMany).toHaveBeenCalledTimes(2);
    });
  });

  describe("getBillById", () => {
    test("returns bill with products", async () => {
      prismaMock.bill.findUnique.mockResolvedValue({ id: 7, product: [] });
      const res = await request(app).get("/bill/7");
      expect(res.status).toBe(200);
      expect(res.body.id).toBe(7);
    });
  });

  describe("updateBill", () => {
    const baseUpdate = () => ({
      ...validBillPayload(),
      purchaseAt: new Date().toISOString(),
    });

    test("returns 403 when cutoff has passed", async () => {
      // Freeze time to a stable value
      jest.useFakeTimers().setSystemTime(new Date("2025-11-20T12:00:00Z"));
      // Original purchaseAt way before cutoff (Jan 1, 2025 -> cutoff Feb 15, 2025)
      prismaMock.bill.findUnique.mockResolvedValue({
        id: 5,
        purchaseAt: new Date("2025-01-01T00:00:00Z"),
      });
      // platform must exist before cutoff logic finishes
      prismaMock.platform.findUnique.mockResolvedValue({
        id: 10,
        name: "Shop",
      });
      prismaMock.productItem.findMany.mockResolvedValue([]);

      const res = await request(app).put("/bill/5").send(baseUpdate());
      expect(res.status).toBe(403);
      expect(res.body.message).toMatch(/Cannot update bill after/i);
      expect(res.body.cutoffDate).toBeDefined();
    });

    test("updates bill successfully within cutoff", async () => {
      // current date Nov 20, 2025; original purchaseAt is Nov 10, 2025 -> cutoff Dec 15, 2025
      jest.useFakeTimers().setSystemTime(new Date("2025-11-20T12:00:00Z"));
      prismaMock.bill.findUnique.mockResolvedValue({
        id: 6,
        purchaseAt: new Date("2025-11-10T00:00:00Z"),
      });
      prismaMock.platform.findUnique.mockResolvedValue({
        id: 10,
        name: "Shop",
      });
      prismaMock.productItem.findMany.mockResolvedValue([
        { product: "A", quantity: 1 },
      ]);
      prismaMock.productItem.deleteMany.mockResolvedValue({ count: 2 });
      prismaMock.bill.update.mockResolvedValue({
        id: 6,
        updatedAt: new Date().toISOString(),
      });

      const res = await request(app).put("/bill/6").send(baseUpdate());
      expect(res.status).toBe(200);
      expect(res.body.status).toBe("ok");
      expect(prismaMock.bill.update).toHaveBeenCalled();
    });
  });

  describe("updateCashStatusById", () => {
    test("rejects invalid payload", async () => {
      const res = await request(app).put("/bill/1/cash").send({ wrong: true });
      expect(res.status).toBe(400);
    });

    test("returns 403 when cutoff has passed", async () => {
      jest.useFakeTimers().setSystemTime(new Date("2025-11-20T12:00:00Z"));
      prismaMock.bill.findUnique.mockResolvedValue({
        id: 9,
        purchaseAt: new Date("2025-01-01T00:00:00Z"),
      });
      const res = await request(app)
        .put("/bill/9/cash")
        .send({ cashStatus: true });
      expect(res.status).toBe(403);
    });

    test("updates cash status within cutoff", async () => {
      jest.useFakeTimers().setSystemTime(new Date("2025-11-20T12:00:00Z"));
      prismaMock.bill.findUnique.mockResolvedValue({
        id: 10,
        purchaseAt: new Date("2025-11-01T00:00:00Z"),
      });
      prismaMock.bill.update.mockResolvedValue({ id: 10, cashStatus: true });
      const res = await request(app)
        .put("/bill/10/cash")
        .send({ cashStatus: true });
      expect(res.status).toBe(200);
      expect(res.body.cashStatus).toBe(true);
    });
  });

  describe("updateDocumentTypeById", () => {
    test("rejects invalid payload", async () => {
      const res = await request(app).put("/bill/1/document-type").send({});
      expect(res.status).toBe(400);
    });

    test("403 when cutoff passed", async () => {
      jest.useFakeTimers().setSystemTime(new Date("2025-11-20T12:00:00Z"));
      prismaMock.bill.findUnique.mockResolvedValue({
        id: 11,
        purchaseAt: new Date("2025-01-01T00:00:00Z"),
        product: [],
      });
      const res = await request(app)
        .put("/bill/11/document-type")
        .send({ DocumentType: "Invoice" });
      expect(res.status).toBe(403);
    });

    test("switch to Receipt uses totalQuotation if present", async () => {
      jest.useFakeTimers().setSystemTime(new Date("2025-11-20T12:00:00Z"));
      prismaMock.bill.findUnique.mockResolvedValue({
        id: 12,
        purchaseAt: new Date("2025-11-01T00:00:00Z"),
        totalQuotation: 123.45,
        billLevelDiscount: 0,
        product: [],
      });
      prismaMock.bill.update.mockResolvedValue({
        id: 12,
        DocumentType: "Receipt",
        cashStatus: true,
      });
      const res = await request(app)
        .put("/bill/12/document-type")
        .send({ DocumentType: "Receipt" });
      expect(res.status).toBe(200);
      expect(res.body.DocumentType).toBe("Receipt");
      expect(res.body.cashStatus).toBe(true);
    });

    test("switch to Receipt calculates total if totalQuotation missing", async () => {
      jest.useFakeTimers().setSystemTime(new Date("2025-11-20T12:00:00Z"));
      prismaMock.bill.findUnique.mockResolvedValue({
        id: 13,
        purchaseAt: new Date("2025-11-01T00:00:00Z"),
        totalQuotation: null,
        billLevelDiscount: 5,
        product: [
          { quantity: 2, unitPrice: 100, unitDiscount: 5 },
          { quantity: 1, unitPrice: 50, unitDiscount: 0 },
        ],
      });
      prismaMock.bill.update.mockResolvedValue({
        id: 13,
        DocumentType: "Receipt",
        cashStatus: true,
      });
      const res = await request(app)
        .put("/bill/13/document-type")
        .send({ DocumentType: "Receipt" });
      expect(res.status).toBe(200);
      expect(res.body.DocumentType).toBe("Receipt");
      expect(res.body.cashStatus).toBe(true);
      expect(prismaMock.bill.update).toHaveBeenCalled();
    });

    test("switch to Invoice sets total 0 and cashStatus false", async () => {
      jest.useFakeTimers().setSystemTime(new Date("2025-11-20T12:00:00Z"));
      prismaMock.bill.findUnique.mockResolvedValue({
        id: 14,
        purchaseAt: new Date("2025-11-01T00:00:00Z"),
        totalQuotation: 200,
        product: [],
      });
      prismaMock.bill.update.mockResolvedValue({
        id: 14,
        DocumentType: "Invoice",
        cashStatus: false,
      });
      const res = await request(app)
        .put("/bill/14/document-type")
        .send({ DocumentType: "Invoice" });
      expect(res.status).toBe(200);
      expect(res.body.cashStatus).toBe(false);
    });

    test("switch to Invoice sets zero total and preserves totalQuotation (assert update payload)", async () => {
      const current = {
        id: 5,
        purchaseAt: new Date().toISOString(),
        totalQuotation: 999,
        product: [],
      };
      prismaMock.bill.findUnique.mockResolvedValue(current);
      prismaMock.bill.update.mockImplementation(async ({ data }: any) => ({
        id: 5,
        ...data,
      }));
      const res = await request(app)
        .put("/bill/5/document-type")
        .send({ DocumentType: "Invoice" });
      expect(res.status).toBe(200);
      const call = prismaMock.bill.update.mock.calls[0][0];
      expect(call.data.cashStatus).toBe(false);
      expect(call.data.total).toBe(0);
      expect(call.data.totalQuotation).toBe(999);
    });
  });

  describe("deleteBill", () => {
    test("deletes bill", async () => {
      prismaMock.bill.delete.mockResolvedValue({
        id: 99,
        cName: "A",
        cLastName: "B",
      });
      const res = await request(app).delete("/bill/99");
      expect(res.status).toBe(200);
      expect(res.body.status).toBe("ok");
    });
  });

  describe("searchBill", () => {
    test("returns matched bills", async () => {
      prismaMock.bill.findMany.mockResolvedValue([{ id: 1 }]);
      const res = await request(app).get("/bill/search/john");
      expect(res.status).toBe(200);
      expect(res.body[0].id).toBe(1);
    });
  });

  describe("getthisYearSales", () => {
    test("requires memberId", async () => {
      const res = await request(app).get("/sales/this-year");
      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/Member ID is required/i);
    });

    test("404 when no sales", async () => {
      prismaMock.member.findUnique.mockResolvedValue({ businessId: 1 });
      prismaMock.bill.aggregate.mockResolvedValue({ _sum: { total: null } });
      const res = await request(app)
        .get("/sales/this-year")
        .query({ memberId: "MID-1" });
      expect(res.status).toBe(404);
    });

    test("returns annual sales", async () => {
      prismaMock.member.findUnique.mockResolvedValue({ businessId: 1 });
      prismaMock.bill.aggregate.mockResolvedValue({
        _sum: { total: 1234.567 },
      });
      const res = await request(app)
        .get("/sales/this-year")
        .query({ memberId: "MID-1" });
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("anualSalesM");
      expect(typeof res.body.anualSalesM).toBe("string");
    });
  });
});
 

test("returns 403 when cutoff has passed for document type change", async () => {
  const current = {
    id: 6,
    purchaseAt: new Date("2020-01-01").toISOString(),
    totalQuotation: 0,
    product: [],
  };
  prismaMock.bill.findUnique.mockResolvedValue(current);
  const res = await request(app)
    .put("/bill/6/document-type")
    .send({ DocumentType: "Invoice" });
  expect(res.status).toBe(403);
});

 
