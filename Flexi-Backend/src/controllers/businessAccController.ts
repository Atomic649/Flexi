import { Request, Response } from "express";
import {
  BusinessType,
  taxType,
  SocialMedia,
} from "../generated/client1/client";
import Joi from "joi";
import multer from "multer";
import multerConfig from "../middleware/multer_config";
import { deleteFromS3, extractS3Key } from "../services/imageService";
import { flexiDBPrismaClient } from "../../lib/PrismaClient1";

const upload = multer(multerConfig.multerConfigAvatar.config).single(
  multerConfig.multerConfigAvatar.keyUpload
);

// Create instance of PrismaClient
const prisma = flexiDBPrismaClient;

// Interface for request body from client
interface businessAccInput {
  businessName: string;
  businessUserName?: string;
  taxId: string;
  businessType: BusinessType;
  taxType: taxType;
  userId: number;
  memberId: string;
  businessAddress: string;
  businessAvatar: string;
  membebId: string;
  businessWebsite?: string;
  businessPhone?: string;
  vat?: boolean;
  logo?: string;
  businessColor?: string;
  DocumentType?: ("Invoice" | "Receipt" | "Quotation" | "WithholdingTax")[];
}

// Username must start with '@' and include only English letters and numbers (no spaces or special characters)
const businessUsernameSchema = Joi.string()
  .trim()
  .pattern(/^@[A-Za-z0-9]+$/)
  .messages({
    "string.pattern.base":
      "Username must start with @ and contain only English letters and numbers (no spaces or special characters).",
  });

// validate the request body
const schema = Joi.object({
  businessName: Joi.string().required(),
  businessUserName: businessUsernameSchema.optional().allow("").min(4).max(30),
  taxId: Joi.string().min(13).max(13).required(),
  businessType: Joi.string().required(),
  taxType: Joi.string().valid("Juristic", "Individual").required(),
  userId: Joi.number().required(),
  memberId: Joi.string(),
  businessAddress: Joi.string(),
  businessAvatar: Joi.string(),
  businessPhone: Joi.string().pattern(/^\d{10}$/),
  buisnessWebsite: Joi.string(),
  vat: Joi.boolean().optional().default(false),
  DocumentType: Joi.array()
    .items(
      Joi.string().valid("Invoice", "Receipt", "Quotation", "WithholdingTax")
    )
    .optional()
    .default(["Receipt"]),
});

function mapBusinessAccCreateError(err: unknown): {
  httpStatus: number;
  body: {
    message: string;
    reason: string;
    details?: Record<string, unknown>;
  };
} {
  const e = err as any;
  const code = typeof e?.code === "string" ? e.code : undefined;

  // Prisma KnownRequestError codes (common ones we care about)
  // P2002: Unique constraint failed
  if (code === "P2002") {
    return {
      httpStatus: 409,
      body: {
        message: "Business account already exists",
        reason: "UNIQUE_CONSTRAINT",
        details: {
          target: e?.meta?.target,
        },
      },
    };
  }

  // P2003: Foreign key constraint failed
  if (code === "P2003") {
    return {
      httpStatus: 400,
      body: {
        message: "Invalid reference. Please check related IDs.",
        reason: "FOREIGN_KEY_CONSTRAINT",
        details: {
          field: e?.meta?.field_name,
        },
      },
    };
  }

  // Fallback
  const body: { message: string; reason: string; details?: Record<string, unknown> } = {
    message: "Failed to create business account",
    reason: "INTERNAL_ERROR",
  };

  if (process.env.NODE_ENV !== "production") {
    body.details = {
      name: e?.name,
      code,
      message: e?.message,
    };
  }

  return { httpStatus: 500, body };
}

// Create a Business Account - Post
const createBusinessAcc = async (req: Request, res: Response) => {
  const businessAccInput: businessAccInput = req.body;

  const normalizedBusinessPhone =
    typeof businessAccInput.businessPhone === "string"
      ? businessAccInput.businessPhone.trim()
      : "";

  if (!/^\d{10}$/.test(normalizedBusinessPhone)) {
    return res.status(400).json({
      message: "Validation failed",
      reason: "VALIDATION_ERROR",
      details: {
        field: "businessPhone",
        path: "businessPhone",
        type: "string.pattern.base",
        message: "Business phone must be exactly 10 digits",
      },
    });
  }

  // Validate the request body
  const { error } = schema.validate(businessAccInput);
  if (error) {
    const detail = error.details[0];
    return res.status(400).json({
      message: "Validation failed",
      reason: "VALIDATION_ERROR",
      details: {
        field: detail?.context?.key,
        path: Array.isArray(detail?.path) ? detail.path[0] : undefined,
        type: detail?.type,
        message: detail?.message,
      },
    });
  }
  try {
    // check if business account already exists
    const existingBusinessAcc = await prisma.businessAcc.findUnique({
      where: {
        businessName: businessAccInput.businessName,
        taxId: businessAccInput.taxId,
      },
    });
    if (existingBusinessAcc) {
      return res.status(400).json({
        status: "error",
        message: "business account already exists",
        reason: "BUSINESS_EXISTS",
      });
    }

    //List of DocumentType
    const validDocumentTypes = [
      "Invoice",
      "Receipt",
      "Quotation",
      "WithholdingTax",
    ];
    if (
      businessAccInput.DocumentType &&
      businessAccInput.DocumentType.length > 0
    ) {
      const invalidTypes = businessAccInput.DocumentType.filter(
        (type) => !validDocumentTypes.includes(type)
      );
      if (invalidTypes.length > 0) {
        return res.status(400).json({
          status: "error",
          message: `Invalid DocumentType(s): ${invalidTypes.join(", ")}. Valid options are: ${validDocumentTypes.join(", ")}`,
          reason: "INVALID_DOCUMENT_TYPE",
          details: {
            invalidTypes,
            validDocumentTypes,
          },
        });
      }
    }

    const businessAcc = await prisma.businessAcc.create({
      data: {
        businessName: businessAccInput.businessName,
        businessUserName: businessAccInput.businessUserName,
        taxId: businessAccInput.taxId,
        businessType: businessAccInput.businessType,
        taxType: businessAccInput.taxType,
        userId: businessAccInput.userId,
        // BusinessAcc.memberId is now a String[] (list of member uniqueIds)
        memberId: [businessAccInput.memberId],
        businessWebsite: businessAccInput.businessWebsite,
        businessPhone: normalizedBusinessPhone,
        vat: businessAccInput.vat ?? false,
        DocumentType: businessAccInput.DocumentType || ["Receipt"],
      },
    });

    // Set the owner's Member.businessId pointer to this new business
    try {
      await prisma.member.update({
        where: { uniqueId: businessAccInput.memberId },
        data: { businessId: businessAcc.id },
      });
    } catch (err) {
      console.warn(
        "Failed to set owner's Member.businessId after business creation",
        err
      );
    }

    // Create platform as Offline for default
    const platform = await prisma.platform.create({
      data: {
        platform: "Offline" as SocialMedia,
        accName: "Offline",
        memberId: businessAccInput.memberId,
        businessAcc: businessAcc.id,
      },
    });
    console.log("platform created", platform);

    res.json({
      status: "ok",
      message: "business account created successfully",
      businessAcc: {
        businessName: businessAcc.businessName,
        taxId: businessAcc.taxId,
        businessType: businessAcc.businessType,
        taxType: businessAcc.taxType,
        userId: businessAcc.userId,
        memberId: businessAcc.memberId,
        id: businessAcc.id,
      },
    });

    // If businessType is "Influencer", create default products
    if (businessAccInput.businessType === "Influencer") {
      const defaultProducts = [
        "Tiktok Affiliate",
        "Shopee Affiliate",
        "Clip",
        "Live",
        "Post",
      ];

      for (const name of defaultProducts) {
        const product = await prisma.product.create({
          data: {
            name,
            productType: "Service",
            price: 0,
            memberId: businessAccInput.memberId,
            stock: 0,
            businessAcc: businessAcc.id,
          },
        });
        console.log("product created", product);
      }
    }

    // create platform if businessType is "Influencer"
    if (businessAccInput.businessType === "Influencer") {
      const defaultProducts = [
        "Tiktok",
        "Shopee",
        "Facebook",
        "Instagram",
        "X",
        "Youtube",
        "Line",
      ];

      for (const name of defaultProducts) {
        const platform = await prisma.platform.create({
          data: {
            platform: name as SocialMedia,
            accName: name,
            memberId: businessAccInput.memberId,
            businessAcc: businessAcc.id,
          },
        });
        console.log("platform created", platform);
      }
    }
  } catch (e) {
      console.error("Failed to create business account:", e);
      const mapped = mapBusinessAccCreateError(e);
      return res.status(mapped.httpStatus).json(mapped.body);
  }
};

// add more business account by creating a memberId first
const AddMoreBusinessAcc = async (req: Request, res: Response) => {
  const businessAccInput: businessAccInput = req.body;

  // Validate the request body
  const { error } = schema.validate(businessAccInput);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  try {
    // check if business account already exists
    const existingBusinessAcc = await prisma.businessAcc.findUnique({
      where: {
        businessName: businessAccInput.businessName,
        taxId: businessAccInput.taxId,
      },
    });
    if (existingBusinessAcc) {
      return res.status(400).json({
        status: "error",
        message: "business account already exists",
      });
    }

    // Check if taxId is already used by another business account
    const existingtaxId = await prisma.businessAcc.findUnique({
      where: {
        taxId: businessAccInput.taxId,
      },
    });
    if (existingtaxId) {
      return res.status(400).json({
        status: "error",
        message: "This Tax Id already used by another business account",
      });
    }

    //List of DocumentType validation for AddMoreBusinessAcc
    const validDocumentTypes = ["Invoice", "Receipt", "Quotation", "WithholdingTax"];
    if (
      businessAccInput.DocumentType &&
      businessAccInput.DocumentType.length > 0
    ) {
      const invalidTypes = businessAccInput.DocumentType.filter(
        (type) => !validDocumentTypes.includes(type)
      );
      if (invalidTypes.length > 0) {
        return res.status(400).json({
          status: "error",
          message: `Invalid DocumentType(s): ${invalidTypes.join(", ")}. Valid options are: ${validDocumentTypes.join(", ")}`,
        });
      }
    }

    // Use transaction to ensure atomicity - either everything succeeds or everything fails
    const result = await prisma.$transaction(async (prisma) => {
      // create memberId
      const memberId = await prisma.member.create({
        data: {
          permission: "admin",
          role: "owner",
          userId: businessAccInput.userId,
        },
      });

    //  console.log("memberId", memberId.uniqueId);

      const businessAcc = await prisma.businessAcc.create({
        data: {
          businessName: businessAccInput.businessName,
          businessUserName: businessAccInput.businessUserName,
          taxId: businessAccInput.taxId,
          businessType: businessAccInput.businessType,
          taxType: businessAccInput.taxType,
          userId: businessAccInput.userId,
          vat: businessAccInput.vat,
          memberId: [memberId.uniqueId],
          businessAddress: businessAccInput.businessAddress,
          businessAvatar: businessAccInput.businessAvatar,
          DocumentType: businessAccInput.DocumentType || ["Receipt"],
        },
      });

      // Set the new owner's Member.businessId pointer to this new business
      try {
        await prisma.member.update({
          where: { uniqueId: memberId.uniqueId },
          data: { businessId: businessAcc.id },
        });
      } catch (err) {
        console.warn(
          "Failed to set new owner's Member.businessId after business creation",
          err
        );
      }

      // Create platform as Offline for default
      const platform = await prisma.platform.create({
        data: {
          platform: "Offline" as SocialMedia,
          accName: `Offline-${businessAcc.id}`,
          memberId: memberId.uniqueId,
          businessAcc: businessAcc.id,
        },
      });
      console.log("platform created", platform);

      // If businessType is "Influencer", create default products
      if (businessAccInput.businessType === "Influencer") {
        const defaultProducts = [
          "Tiktok Affiliate",
          "Shopee Affiliate",
          "Clip",
          "Live",
          "Post",
        ];

        for (const name of defaultProducts) {
          const product = await prisma.product.create({
            data: {
              name,
              productType: "Service",
              price: 0,
              memberId: memberId.uniqueId,
              stock: 0,
              businessAcc: businessAcc.id,
            },
          });
          console.log("product created", product);
        }

        // create additional stores if businessType is "Influencer"
        const defaultStores = [
          "Tiktok",
          "Shopee",
          "Facebook",
          "Instagram",
          "X",
          "Youtube",
          "Line",
        ];

        for (const name of defaultStores) {
          const InfluencerPlatform = await prisma.platform.create({
            data: {
              accName: `${name}-${businessAcc.id}`,
              platform: name as SocialMedia,
              memberId: memberId.uniqueId,
              businessAcc: businessAcc.id,
            },
          });
          console.log("influencer platform created", InfluencerPlatform);
        }
      }

      return businessAcc;
    });

    res.json({
      status: "ok",
      message: "business account created successfully",
      businessAcc: {
        businessName: result.businessName,
        taxId: result.taxId,
        businessType: result.businessType,
        taxType: result.taxType,
        userId: result.userId,
        memberId: result.memberId,
        id: result.id,
        businessAvatar: result.businessAvatar,
      },
    });
  } catch (e) {
    console.error("Failed to create business account:", e);
    const mapped = mapBusinessAccCreateError(e);
    return res.status(mapped.httpStatus).json(mapped.body);
  }
};

// Get All Business Accounts - Get
const getBusinessAcc = async (_: Request, res: Response) => {
  console.log("get business accounts");

  try {
    const businessAcc = await prisma.businessAcc.findMany();
    res.json(businessAcc);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "failed to get business accounts" });
  }
};
// Get Business Accounts for a user (owner + memberships)
// Response shape: [{ businessName, memberId, id }, ...]
const getBusinessAccByUserId = async (req: Request, res: Response) => {
  const { userId } = req.params;
  if (!userId) {
    return res.status(400).json({ message: "userId is required" });
  }
  try {
    // Fetch minimal member records for the user
    const memberRecords = await prisma.member.findMany({
      where: { userId: Number(userId), deleted: false },
      select: { uniqueId: true, businessId: true },
    });

    const memberIdSet = new Set(memberRecords.map((m) => m.uniqueId));

    // 1) From explicit pointer Member.businessId -> BusinessAcc
    const businessIds = Array.from(
      new Set(
        memberRecords
          .map((m) => m.businessId)
          .filter((id): id is number => typeof id === "number")
      )
    );

    const accById: Record<number, { id: number; businessName: string }> = {};
    if (businessIds.length > 0) {
      const accs = await prisma.businessAcc.findMany({
        where: { id: { in: businessIds } },
        select: { id: true, businessName: true },
      });
      for (const a of accs) accById[a.id] = a;
    }

    const fromBusinessId = memberRecords
      .filter((m) => typeof m.businessId === "number" && accById[m.businessId!])
      .map((m) => ({
        businessName: accById[m.businessId!].businessName,
        memberId: m.uniqueId,
        id: m.businessId!,
      }));

    // 2) From BusinessAcc.memberId (String[] contains member uniqueId)
    const memberUniqueIds = memberRecords.map((m) => m.uniqueId);
    let fromArrayMembership: {
      businessName: string;
      memberId: string;
      id: number;
    }[] = [];
    if (memberUniqueIds.length > 0) {
      const accs = await prisma.businessAcc.findMany({
        where: { memberId: { hasSome: memberUniqueIds } },
        select: { id: true, businessName: true, memberId: true },
      });

      for (const a of accs) {
        // For each business, emit one entry per matching memberId belonging to this user
        for (const mid of a.memberId) {
          if (memberIdSet.has(mid)) {
            fromArrayMembership.push({
              businessName: a.businessName,
              memberId: mid,
              id: a.id,
            });
          }
        }
      }
    }

    // Combine and deduplicate by memberId:id
    const combined = [...fromBusinessId, ...fromArrayMembership];
    const seen = new Set<string>();
    const result = combined.filter((entry) => {
      const key = `${entry.memberId}:${entry.id}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    return res.json(result);
  } catch (e) {
    console.error(e);
    return res
      .status(500)
      .json({ message: "failed to get business accounts for user" });
  }
};

// Get a Business Account Detail by MemberId- Get
const getBusinessDetail = async (req: Request, res: Response) => {
  const { memberId } = req.params;

  // find role by memberId
  const business = await prisma.member.findUnique({
    where: {
      uniqueId: memberId,
    },
    select: {
      role: true,
      businessId: true,
    },
  });
  if (!business || !business.businessId) {
    return res.status(404).json({ message: "Business account not found" });
  }
  try {
    const businessAcc = await prisma.businessAcc.findMany({
      where: {
        id: business.businessId,
      },
      select: {
        id: true,
        businessName: true,
        businessUserName: true,
        taxId: true,
        taxType: true,
        businessAddress: true,
        businessType: true,
        businessAvatar: true,
        vat: true,
        businessPhone: true,
        DocumentType: true,
        logo: true,
        businessColor: true,
      },
    });
    res.json({
      ...businessAcc[0],

      role: business?.role,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "failed to get business account" });
  }
};

// Update Business Details by MemberId - Put
const updateBusinessAcc = async (req: Request, res: Response) => {
  const { memberId } = req.params;
  const {
    businessName,
    businessUserName,
    taxId,
    businessType,
    taxType,
    businessPhone,
    businessWebsite,
    vat,
    businessAddress,
    DocumentType,
    businessColor,
  } = req.body;

  console.log("Update Business Details", {
    memberId,
    businessName,
    businessUserName,
    taxId,
    businessType,
    taxType,
    businessPhone,
    businessWebsite,
    vat,
    businessAddress,
    DocumentType,
    businessColor,
  });

  try {
    // Validate businessUserName if provided
    if (typeof businessUserName !== "undefined") {
      const { error } = businessUsernameSchema
        .allow("")
        .validate(businessUserName);
      if (error) {
        return res.status(400).json({ message: error.details[0].message });
      }
    }
    // Locate the business account by memberId first
    const existing = await prisma.member.findFirst({
      where: { uniqueId: memberId },
      select: { businessId: true, permission: true },
    });

    if (!existing) {
      return res.status(404).json({ message: "Business account not found" });
    }

    // if permission is not admin, return error
    if (existing.permission !== "admin") {
      return res
        .status(403)
        .json({
          message: "You do not have permission to update business details",
        });
    }

    const updated = await prisma.businessAcc.update({
      where: { id: existing.businessId! },
      data: {
        businessName,
        businessUserName,
        taxId,
        businessType,
        taxType,
        businessPhone,
        businessWebsite,
        businessAddress,
        vat,
        DocumentType: DocumentType || ["Receipt"],
        businessColor,
      },
    });

    return res.json({
      status: "ok",
      message: "Business details updated successfully",
      businessAcc: {
        id: updated.id,
        businessName: updated.businessName,
        businessUserName: updated.businessUserName,
        taxId: updated.taxId,
        businessType: updated.businessType,
        taxType: updated.taxType,
        businessPhone: updated.businessPhone,
        businessWebsite: updated.businessWebsite,
        vat: updated.vat,
        businessAddress: updated.businessAddress,
        DocumentType: updated.DocumentType,
        businessColor: updated.businessColor,
      },
    });
  } catch (e) {
    console.error("Failed to update business details:", e);
    return res
      .status(500)
      .json({ message: "Failed to update business details" });
  }
};

// Delete a Business Account by ID - Delete
const deleteBusinessAcc = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const businessAcc = await prisma.businessAcc.delete({
      where: {
        id: Number(id),
      },
    });
    res.json(businessAcc);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "failed to delete business account" });
  }
};
// Search for a Business Account by keyword - Get
const searchBusinessAcc = async (req: Request, res: Response) => {
  const { keyword } = req.params;
  try {
    const businessAcc = await prisma.businessAcc.findMany({
      where: {
        OR: [
          {
            memberId: {
              has: keyword,
            },
          },
          {
            businessName: {
              contains: keyword,
            },
          },
          {
            taxId: {
              contains: keyword,
            },
          },
        ],
      },
    });
    res.json(businessAcc);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "failed to search business account" });
  }
};

//Update Business Avatar by id - Put
const updateBusinessAvatar = async (req: Request, res: Response) => {
  upload(req, res, async (err: any) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }
    const { id } = req.params;

    try {
      // Fetch the existing business account to get the current avatar URL
      const existingBusinessAcc = await prisma.businessAcc.findUnique({
        where: {
          id: Number(id),
        },
        select: {
          businessAvatar: true,
        },
      });

      if (!existingBusinessAcc) {
        return res.status(404).json({ message: "Business account not found" });
      }

      // Delete the old avatar from S3 if a new avatar is uploaded
      if (req.file && existingBusinessAcc.businessAvatar) {
        const oldAvatarKey = extractS3Key(existingBusinessAcc.businessAvatar);
        try {
          await deleteFromS3(oldAvatarKey);
          console.log("Old avatar deleted from S3");
        } catch (e) {
          console.error("Failed to delete old avatar from S3:", e);
        }
      }

      // Update the business account with the new avatar URL if a new file is uploaded
      const updatedData = req.file
        ? { businessAvatar: (req.file as any)?.location ?? "" }
        : {};

      const businessAcc = await prisma.businessAcc.update({
        where: {
          id: Number(id),
        },
        data: updatedData,
      });

      console.log("Updated business avatar:", businessAcc);

      res.json(businessAcc);
    } catch (e) {
      console.error(e);
      res.status(500).json({ message: "Failed to update business avatar" });
    }
  });
};

// get business Avatar by memberId - Get
const getBusinessAvatar = async (req: Request, res: Response) => {
  const { memberId } = req.params;
  try {
    // find businessId by memberId
    const business = await prisma.member.findUnique({
      where: {
        uniqueId: memberId,
      },
      select: {
        businessId: true,
      },
    });
    if (!business || !business.businessId) {
      return res.status(404).json({ message: "Business account not found" });
    }
    const businessAcc = await prisma.businessAcc.findMany({
      where: {
        id: business.businessId,
      },
      select: {
        businessAvatar: true,
        businessName: true,
        businessType: true,
        DocumentType: true,
        vat: true,
        logo: true,
        businessColor: true,
        paymentTerm: true,
        remark: true,
      },
    });
    res.json({
      ...businessAcc[0],
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "failed to get business account" });
  }
};
// Upload Business Logo by memberId - Put
const uploadLogoForBusiness = multer(multerConfig.multerConfigImage.config).single(
  multerConfig.multerConfigImage.keyUpload
);

const updateBusinessLogo = async (req: Request, res: Response) => {
  uploadLogoForBusiness(req, res, async (err: any) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }
    const { memberId } = req.params;
    try {
      const member = await prisma.member.findUnique({
        where: { uniqueId: memberId },
        select: { businessId: true },
      });
      if (!member?.businessId) {
        return res.status(404).json({ message: "Business account not found" });
      }

      const existing = await prisma.businessAcc.findUnique({
        where: { id: member.businessId },
        select: { logo: true },
      });

      if (req.file && existing?.logo) {
        const oldKey = extractS3Key(existing.logo);
        try {
          await deleteFromS3(oldKey);
        } catch (e) {
          console.error("Failed to delete old logo from S3:", e);
        }
      }

      const logoUrl = req.file ? ((req.file as any)?.location ?? "") : existing?.logo ?? "";

      const updated = await prisma.businessAcc.update({
        where: { id: member.businessId },
        data: { logo: logoUrl },
      });

      return res.json({ status: "ok", logo: updated.logo });
    } catch (e) {
      console.error("Failed to update business logo:", e);
      return res.status(500).json({ message: "Failed to update business logo" });
    }
  });
};

// Add Partner Member to Business Account
const addPartnerMember = async (req: Request, res: Response) => {
  const { businessId } = req.params;
  const { memberId, role } = req.body;

  if (!businessId || !memberId) {
    return res.status(400).json({
      status: "error",
      message: "Business ID/Username and Member ID are required",
    });
  }

  const allowedRoles = ["owner", "marketing", "accountant", "sales", "partner"] as const;
  type MemberRole = typeof allowedRoles[number];
  const validRole: MemberRole = allowedRoles.includes(role) ? role : "partner";

  try {
    let business = null;

    // 1. Try to find business by exact businessUserName (e.g., @flexi or flexi)
    business = await prisma.businessAcc.findFirst({
      where: { businessUserName: businessId },
      select: { id: true, memberId: true },
    });

    // 2. If not found by username, try case-insensitive search on businessUserName
    if (!business) {
      business = await prisma.businessAcc.findFirst({
        where: {
          businessUserName: {
            equals: businessId,
            mode: "insensitive",
          },
        },
        select: { id: true, memberId: true },
      });
    }

    // 3. If still not found, try as numeric ID
    if (!business && !isNaN(Number(businessId))) {
      business = await prisma.businessAcc.findUnique({
        where: { id: Number(businessId) },
        select: { id: true, memberId: true },
      });
    }

    // 4. If still not found, try searching by businessName (case-insensitive)
    if (!business) {
      business = await prisma.businessAcc.findFirst({
        where: {
          businessName: {
            equals: businessId,
            mode: "insensitive",
          },
        },
        select: { id: true, memberId: true },
      });
    }

    if (!business) {
      return res.status(404).json({
        status: "error",
        message: "Business account not found. Please check the business username, name, or ID.",
      });
    }

    // Check if member already exists in the business
    if (business.memberId.includes(memberId)) {
      return res.status(400).json({
        status: "error",
        message: "Member is already connected to this business",
      });
    }

    // Check if member exists
    const member = await prisma.member.findUnique({
      where: { uniqueId: memberId },
      select: { uniqueId: true, businessId: true },
    });

    if (!member) {
      return res.status(404).json({
        status: "error",
        message: "Member not found",
      });
    }

    // Use transaction to ensure atomicity
    const result = await prisma.$transaction(async (prisma) => {
      // Add member to business memberId array
      const updatedBusiness = await prisma.businessAcc.update({
        where: { id: business!.id },
        data: {
          memberId: {
            push: memberId,
          },
        },
      });

      // Update member's businessId and role
      const updatedMember = await prisma.member.update({
        where: { uniqueId: memberId },
        data: { businessId: business!.id, role: validRole },
      });

      return { updatedBusiness, updatedMember };
    });

    return res.json({
      status: "ok",
      message: "Partner member added successfully",
      businessId: result.updatedBusiness.id,
      memberId: memberId,
    });
  } catch (e) {
    console.error("Failed to add partner member:", e);
    return res.status(500).json({
      status: "error",
      message: "Failed to add partner member",
    });
  }
};

// Update default paymentTerm and remark for document generation - Put
const updateBusinessDefaults = async (req: Request, res: Response) => {
  const { memberId } = req.params;
  const { paymentTerm, remark } = req.body;

  try {
    const existing = await prisma.member.findFirst({
      where: { uniqueId: memberId },
      select: { businessId: true, permission: true },
    });

    if (!existing || !existing.businessId) {
      return res.status(404).json({ message: "Business account not found" });
    }

    if (existing.permission !== "admin") {
      return res.status(403).json({ message: "You do not have permission to update business defaults" });
    }

    const updated = await prisma.businessAcc.update({
      where: { id: existing.businessId! },
      data: {
        ...(paymentTerm !== undefined && { paymentTerm }),
        ...(remark !== undefined && { remark }),
      },
    });

    return res.json({
      status: "ok",
      message: "Business defaults updated successfully",
      paymentTerm: updated.paymentTerm,
      remark: updated.remark,
    });
  } catch (e) {
    console.error("Failed to update business defaults:", e);
    return res.status(500).json({ message: "Failed to update business defaults" });
  }
};

// Export the functions
export {
  createBusinessAcc,
  AddMoreBusinessAcc,
  getBusinessAcc,
  getBusinessAccByUserId,
  getBusinessDetail,
  updateBusinessAcc,
  deleteBusinessAcc,
  searchBusinessAcc,
  updateBusinessAvatar,
  getBusinessAvatar,
  updateBusinessLogo,
  addPartnerMember,
  updateBusinessDefaults,
};
