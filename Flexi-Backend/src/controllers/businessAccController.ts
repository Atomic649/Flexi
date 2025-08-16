import { Request, Response } from "express";
import {
  BusinessType,
  PrismaClient as PrismaClient1,
  taxType,
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
  vatId: string;
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
  DocumentType?: ("Invoice" | "Receipt" | "Quotation")[];
}

// validate the request body
const schema = Joi.object({
  businessName: Joi.string().required(),
  vatId: Joi.string().min(13).max(13).required(),
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
    .items(Joi.string().valid("Invoice", "Receipt", "Quotation"))
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
        vatId: businessAccInput.vatId,
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
        vatId: businessAccInput.vatId,
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
        platform: "Offline" as any as import("../generated/client1").IncomeChannel,
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
        vatId: businessAcc.vatId,
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
         platform: name as any as import("../generated/client1").IncomeChannel,
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
        vatId: businessAccInput.vatId,
      },
    });
    if (existingBusinessAcc) {
      return res.status(400).json({
        status: "error",
        message: "business account already exists",
      });
    }

    // Check if vatId is already used by another business account
    const existingVatId = await prisma.businessAcc.findUnique({
      where: {
        vatId: businessAccInput.vatId,
      },
    });
    if (existingVatId) {
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
          vatId: businessAccInput.vatId,
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
          platform: "Offline" as any as import("../generated/client1").IncomeChannel,
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
           platform: name as any as import("../generated/client1").IncomeChannel,
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
        vatId: result.vatId,
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
// Get a Business Account by ID - Get
const getBusinessAccByUserId = async (req: Request, res: Response) => {
  const { userId } = req.params;
  try {
    const businessAcc = await prisma.businessAcc.findMany({
      where: {
        userId: Number(userId),
      },
      select: {
        businessName: true,
        memberId: true,
      },
    });
    res.json(businessAcc);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "failed to get business account" });
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
        vatId: true,
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
    vatId,
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
    vatId,
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
        vatId,
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
            vatId: {
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
