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
        memberId: businessAccInput.memberId,
        businessWebsite: businessAccInput.businessWebsite,
        businessPhone: businessAccInput.businessPhone,
        DocumentType: businessAccInput.DocumentType || ["Receipt"],
      
      },
    });

    // Create store as Offine for default
    const store = await prisma.store.create({
      data: {
        accName: "Offline",
        platform: "Offline" as IncomeChannel,
        memberId: businessAcc.memberId,
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
        memberId: businessAcc.memberId,
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
         memberId: businessAcc.memberId,
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
          memberId: memberId.uniqueId,
          businessAddress: businessAccInput.businessAddress,
          businessAvatar: businessAccInput.businessAvatar,
          DocumentType: businessAccInput.DocumentType || ["Receipt"],
        },
      });

      // Create store as Offline for default
      const store = await prisma.store.create({
        data: {
          accName: "Offline",
          platform: "Offline" as IncomeChannel,
          memberId: businessAcc.memberId,
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
    // Fetch all member records for the user, including any linked business accounts
    const memberRecords = await prisma.member.findMany({
      where: { userId: Number(userId) },
      include: {
        business: { select: { businessName: true, id: true } }, // business relation may be null for owner records
      },
    });

    // Membership-based businesses (user linked via member.businessId)
    const membershipEntries = memberRecords
      .filter((m) => m.business) // has joined business
      .map((m) => ({
        businessName: m.business!.businessName,
        memberId: m.uniqueId,
        id: m.business!.id,
      }));

    // Owner-based businesses (member.business is null, but they own businessAcc where businessAcc.memberId = member.uniqueId)
    const ownerMemberIds = memberRecords
      .filter((m) => !m.business) // potential owner records
      .map((m) => m.uniqueId);

    let ownerEntries: { businessName: string; memberId: string; id: number }[] = [];
    if (ownerMemberIds.length > 0) {
      const ownedBusinessAccs = await prisma.businessAcc.findMany({
        where: { memberId: { in: ownerMemberIds } },
        select: { businessName: true, memberId: true, id: true },
      });
      ownerEntries = ownedBusinessAccs.map((b) => ({
        businessName: b.businessName,
        memberId: b.memberId,
        id: b.id,
      }));
    }

    // Combine and deduplicate (in rare cases if both membership & owner overlap)
    const combined = [...membershipEntries, ...ownerEntries];
    const seen = new Set<string>();
    const result = combined.filter((entry) => {
      const key = `${entry.memberId}:${entry.businessName}:${entry.id}`;
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
  const role = await prisma.member.findUnique({
    where: {
      uniqueId: memberId,
    },
    select: {
      role: true,
    },
  });
  try {
    const businessAcc = await prisma.businessAcc.findMany({
      where: {
        memberId: memberId,
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

      role: role?.role,
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
    const businessAcc = await prisma.businessAcc.updateMany({
      where: {
        memberId: memberId,
      },
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

    if (businessAcc.count === 0) {
      return res.status(404).json({ message: "Business account not found" });
    }

    res.json({
      status: "ok",
      message: "Business details updated successfully",
    });
  } catch (e) {
    console.error("Failed to update business details:", e);
    res.status(500).json({ message: "Failed to update business details" });
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
              contains: keyword,
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
    const businessAcc = await prisma.businessAcc.findMany({
      where: {
        memberId: memberId,
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
