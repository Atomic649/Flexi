import express from "express";
import request from "supertest";
import { jest, describe, test, expect, beforeEach } from "@jest/globals";

// Minimal Prisma mock with methods used by controller
const prismaMock: any = {
  businessAcc: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findMany: jest.fn(),
  },
  member: {
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    create: jest.fn(),
  },
  product: { create: jest.fn() },
  platform: { create: jest.fn() },
  $transaction: (cb: any) => cb(prismaMock),
};

jest.mock("../src/generated/client1/client", () => {
  return { PrismaClient: jest.fn().mockImplementation(() => prismaMock) };
});

// Mock multer config to avoid S3 bucket requirements during tests
jest.mock("../src/middleware/multer_config", () => ({
  __esModule: true,
  default: {
    multerConfigAvatar: {
      config: {},
      keyUpload: "avatar",
    },
    multerConfigImage: {
      config: {},
      keyUpload: "image",
    },
  },
}));

// Mock image service used by updateBusinessAvatar
jest.mock("../src/services/imageService", () => ({
  __esModule: true,
  deleteFromS3: jest.fn(() => Promise.resolve()) as any,
  extractS3Key: jest.fn(() => "mock-key") as any,
}));

import {
  createBusinessAcc,
  AddMoreBusinessAcc,
  updateBusinessAcc,
  getBusinessDetail,
} from "../src/controllers/businessAccController";

const app = express();
app.use(express.json());
app.post("/businessacc/register", (req, res) => createBusinessAcc(req, res));
app.post("/businessacc/AddMoreAcc", (req, res) => AddMoreBusinessAcc(req, res));
app.put("/businessacc/:memberId", (req, res) => updateBusinessAcc(req, res));
app.get("/businessacc/detail/:memberId", (req, res) =>
  getBusinessDetail(req, res)
);

const baseCreatePayload = (overrides: any = {}) => ({
  businessName: "Acme Co",
  businessUserName: "@acme",
  taxId: "1234567890123",
  businessType: "Restaurant",
  taxType: "Juristic",
  userId: 1,
  memberId: "MEM001",
  businessAddress: "123 Main St",
  businessPhone: "0123456789",
  vat: false,
  DocumentType: ["Receipt"],
  ...overrides,
});

describe("businessAccController", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    prismaMock.businessAcc.findUnique.mockResolvedValue(null);
    prismaMock.businessAcc.create.mockImplementation(({ data }: any) => ({
      id: 101,
      ...data,
    }));
    prismaMock.member.update.mockResolvedValue({});
    prismaMock.platform.create.mockResolvedValue({ id: 201 });
    prismaMock.product.create.mockResolvedValue({ id: 301 });
  });

  describe("createBusinessAcc", () => {
    test("creates business with valid payload including WithholdingTax", async () => {
      const res = await request(app)
        .post("/businessacc/register")
        .send(
          baseCreatePayload({
            DocumentType: ["Receipt", "WithholdingTax"],
            businessAvatar: "avatar.png",
          })
        );
      expect(res.status).toBe(200);
      expect(res.body.status).toBe("ok");
      expect(prismaMock.businessAcc.create).toHaveBeenCalled();
      const createArgs = prismaMock.businessAcc.create.mock.calls[0][0];
      expect(createArgs.data.DocumentType).toEqual([
        "Receipt",
        "WithholdingTax",
      ]);
    });

    test("rejects invalid businessUserName format (missing @)", async () => {
      const res = await request(app)
        .post("/businessacc/register")
        .send(baseCreatePayload({ businessUserName: "plain" }));
      expect(res.status).toBe(400);
      
      // Handle structured validation error
      if (res.body.message === "Validation failed" && res.body.reason === "VALIDATION_ERROR") {
        expect(res.body.details.message).toMatch(/must start with @/i);
      } else {
        expect(res.body.message).toMatch(/must start with @/i);
      }
    });

    test("rejects invalid DocumentType value", async () => {
      const res = await request(app)
        .post("/businessacc/register")
        .send(
          baseCreatePayload({
            DocumentType: ["Foo"],
            businessAvatar: "avatar.png",
          })
        );
      expect(res.status).toBe(400);
      
      // Check for structured validation error first
      if (res.body.message === "Validation failed" && res.body.reason === "VALIDATION_ERROR") {
        expect(res.body.details.message).toMatch(/must be one of/i);
      } else {
        // Fallback for direct error messages
        expect(res.body.message).toMatch(/Invalid DocumentType|must be one of/i);
      }
    });
  });

  describe("updateBusinessAcc", () => {
    beforeEach(() => {
      prismaMock.member.findFirst.mockResolvedValue({
        businessId: 101,
        permission: "admin",
      });
      prismaMock.businessAcc.update.mockImplementation(({ data }: any) => ({
        id: 101,
        ...data,
      }));
    });

    test("rejects update if not admin", async () => {
      prismaMock.member.findFirst.mockResolvedValue({
        businessId: 101,
        permission: "member",
      });
      const res = await request(app)
        .put("/businessacc/MEM001")
        .send({
          businessName: "New",
          taxId: "1234567890123",
          businessType: "Restaurant",
          taxType: "Juristic",
        });
      expect(res.status).toBe(403);
    });

    test("rejects invalid businessUserName format on update", async () => {
      const res = await request(app)
        .put("/businessacc/MEM001")
        .send({ businessUserName: "plain" });
      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/must start with @/i);
    });

    test("updates successfully with valid payload and preserves provided DocumentType", async () => {
      const res = await request(app)
        .put("/businessacc/MEM001")
        .send({
          businessName: "New Name",
          businessUserName: "@newname",
          taxId: "1234567890123",
          businessType: "Restaurant",
          taxType: "Juristic",
          businessPhone: "0123456789",
          businessAddress: "456 St",
          DocumentType: ["Invoice", "WithholdingTax"],
        });
      expect(res.status).toBe(200);
      expect(res.body.status).toBe("ok");
      expect(res.body.businessAcc.DocumentType).toEqual([
        "Invoice",
        "WithholdingTax",
      ]);
    });
  });

  describe("getBusinessDetail", () => {
    test("returns business detail by memberId", async () => {
      prismaMock.member.findUnique.mockResolvedValue({
        role: "owner",
        businessId: 101,
      });
      prismaMock.businessAcc.findMany.mockResolvedValue([
        {
          id: 101,
          businessName: "Acme Co",
          businessUserName: "@acme",
          taxId: "1234567890123",
          taxType: "Juristic",
          businessAddress: "123 Main",
          businessType: "Restaurant",
          businessAvatar: "",
          vat: false,
          businessPhone: "0123456789",
          DocumentType: ["Receipt"],
        },
      ]);

      const res = await request(app).get("/businessacc/detail/MEM001");
      expect(res.status).toBe(200);
      expect(res.body.businessName).toBe("Acme Co");
      expect(res.body.role).toBe("owner");
    });
  });

  describe("AddMoreBusinessAcc", () => {
    beforeEach(() => {
      prismaMock.member.create.mockResolvedValue({ uniqueId: "MEMNEW" });
      prismaMock.businessAcc.create.mockImplementation(({ data }: any) => ({
        id: 202,
        ...data,
      }));
      prismaMock.member.update.mockResolvedValue({});
      prismaMock.platform.create.mockResolvedValue({ id: 303 });
    });

    test("rejects invalid DocumentType for AddMore", async () => {
      const res = await request(app)
        .post("/businessacc/AddMoreAcc")
        .send(baseCreatePayload({ DocumentType: ["Foo"] }));
      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/must be one of/i);
    });

    test("creates additional business when payload is valid", async () => {
      const res = await request(app)
        .post("/businessacc/AddMoreAcc")
        .send(
          baseCreatePayload({
            DocumentType: ["Receipt"],
            businessAvatar: "avatar.png",
          })
        );
      expect([200, 201]).toContain(res.status);
      expect(res.body.status).toBe("ok");
      expect(res.body.businessAcc.memberId).toBeDefined();
    });
  });
});
