import { Request, Response } from "express";
import {
  BusinessType,
  PrismaClient as PrismaClient1,
  taxType,
  IncomeChannel,
} from "../generated/client1";
import Joi from "joi";
import multer from "multer";
import multerConfig from "../middleware/multer_config";
import { deleteFromS3, extractS3Key } from "../services/imageService";

const upload = multer(multerConfig.multerConfigAvatar.config).single(
  multerConfig.multerConfigAvatar.keyUpload
);

// Create instance of PrismaClient
const prisma = new PrismaClient1();

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
  DocumentType?: ("Invoice" | "Receipt" | "Quotation"|"WithholdingTax")[];
}

// validate the request body
const schema = Joi.object({
  businessName: Joi.string().required(),
  businessUserName: Joi.string().optional().allow(""),
  taxId: Joi.string().min(13).max(13).required(),
  businessType: Joi.string().required(),
  taxType: Joi.string().valid("Juristic", "Individual").required(),
  userId: Joi.number().required(),
  memberId: Joi.string(),
  businessAddress: Joi.string(),
  businessAvatar: Joi.string(),
  businessPhone: Joi.string(),
  buisnessWebsite: Joi.string(),
  vat: Joi.boolean().optional().default(false),
  DocumentType: Joi.array()
    .items(Joi.string().valid("Invoice", "Receipt", "Quotation", "WithholdingTax"))
    .optional()
    .default(["Receipt"]),
});

// Create a Business Account - Post
const createBusinessAcc = async (req: Request, res: Response) => {
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

    //List of DocumentType
    const validDocumentTypes = ["Invoice", "Receipt", "Quotation"];
    if (businessAccInput.DocumentType && businessAccInput.DocumentType.length > 0) {
      const invalidTypes = businessAccInput.DocumentType.filter(
        type => !validDocumentTypes.includes(type)
      );
      if (invalidTypes.length > 0) {
        return res.status(400).json({
          status: "error",
          message: `Invalid DocumentType(s): ${invalidTypes.join(", ")}. Valid options are: ${validDocumentTypes.join(", ")}`,
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
        businessPhone: businessAccInput.businessPhone,
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
      console.warn("Failed to set owner's Member.businessId after business creation", err);
    }

    // Create store as Offine for default
    const store = await prisma.store.create({
      data: {
        accName: "Offline",
        platform: "Offline" as IncomeChannel,
        memberId: businessAccInput.memberId,
        businessAcc: businessAcc.id,
      },
    });
    console.log("store created", store);

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
      "Post"
      ];

      for (const name of defaultProducts) {
      const product = await prisma.product.create({
        data: {
        name,
        productType: "Service",
        price: 0,
        memberId: businessAccInput.memberId,
        stock: 0,
        businessAcc: businessAcc.id        
        },
      });
      console.log("product created", product);
      }
   }

   // create store if businessType is "Influencer"
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
     const store = await prisma.store.create({
       data: {
         accName: name,
         platform: name as IncomeChannel,
         memberId: businessAccInput.memberId,
         businessAcc: businessAcc.id,
        },
      });
      console.log("store created", store);
    }
  }

  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "failed to create business account" });
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
    const validDocumentTypes = ["Invoice", "Receipt", "Quotation"];
    if (businessAccInput.DocumentType && businessAccInput.DocumentType.length > 0) {
      const invalidTypes = businessAccInput.DocumentType.filter(
        type => !validDocumentTypes.includes(type)
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

      console.log("memberId", memberId.uniqueId);

      const businessAcc = await prisma.businessAcc.create({
        data: {
          businessName: businessAccInput.businessName,
          businessUserName: businessAccInput.businessUserName,
          taxId: businessAccInput.taxId,
          businessType: businessAccInput.businessType,
          taxType: businessAccInput.taxType,
          userId: businessAccInput.userId,
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
          console.warn("Failed to set new owner's Member.businessId after business creation", err);
        }

      // Create store as Offline for default
      const store = await prisma.store.create({
        data: {
          accName: "Offline",
          platform: "Offline" as IncomeChannel,
          memberId: memberId.uniqueId,
          businessAcc: businessAcc.id,
        },
      });
      console.log("store created", store);

      // If businessType is "Influencer", create default products
      if (businessAccInput.businessType === "Influencer") {
        const defaultProducts = [
        "Tiktok Affiliate",
        "Shopee Affiliate",
        "Clip",
        "Live",
        "Post"
        ];

        for (const name of defaultProducts) {
        const product = await prisma.product.create({
          data: {
          name,
          productType: "Service",
          price: 0,
          memberId: memberId.uniqueId,
          stock: 0,
          businessAcc: businessAcc.id        
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
       const influencerStore = await prisma.store.create({
         data: {
           accName: name,
           platform: name as IncomeChannel,
           memberId: memberId.uniqueId,
           businessAcc: businessAcc.id,
          },
        });
        console.log("influencer store created", influencerStore);
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
    console.error(e);
    res.status(500).json({ message: "failed to create business account" });
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
      where: { userId: Number(userId) },
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
    let fromArrayMembership: { businessName: string; memberId: string; id: number }[] = [];
    if (memberUniqueIds.length > 0) {
      const accs = await prisma.businessAcc.findMany({
        where: { memberId: { hasSome: memberUniqueIds } },
        select: { id: true, businessName: true, memberId: true },
      });

      for (const a of accs) {
        // For each business, emit one entry per matching memberId belonging to this user
        for (const mid of a.memberId) {
          if (memberIdSet.has(mid)) {
            fromArrayMembership.push({ businessName: a.businessName, memberId: mid, id: a.id });
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
    return res.status(500).json({ message: "failed to get business accounts for user" });
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
      businessId:true
    },
  });
  try {

    const businessAcc = await prisma.businessAcc.findMany({
      where: {
        id:business?.businessId,
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
  });

  try {
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
      return res.status(403).json({ message: "You do not have permission to update business details" });
    }

    const updated = await prisma.businessAcc.update({
      where: { id: existing.businessId },
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
      },
    });
  } catch (e) {
    console.error("Failed to update business details:", e);
    return res.status(500).json({ message: "Failed to update business details" });
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
    const businessAcc = await prisma.businessAcc.findMany({
      where: {
       id : business.businessId
      },
      select: {
        businessAvatar: true,
        businessName: true,
        businessType: true,
        DocumentType: true,
        vat:true
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
};
