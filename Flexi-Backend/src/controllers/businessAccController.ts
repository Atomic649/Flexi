import { Request, Response } from "express";
import { BusinessType, PrismaClient, taxType } from "@prisma/client";
import Joi from "joi";

// Create instance of PrismaClient
const prisma = new PrismaClient();

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
    })
    if (existingBusinessAcc) {
      return res.status(400).json({
        status: "error",
        message: "business account already exists",
      });
    }   
    const businessAcc = await prisma.businessAcc.create({
      data: {
        businessName: businessAccInput.businessName,
        vatId: businessAccInput.vatId,
        businessType: businessAccInput.businessType,
        taxType: businessAccInput.taxType,
        userId: businessAccInput.userId,
        memberId: businessAccInput.memberId,
      },
    });
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
  }});
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
    })
    if (existingBusinessAcc) {
      return res.status(400).json({
        status: "error",
        message: "business account already exists",
      });
    }   

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
      },
    });
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
        businessAvatar: businessAcc.businessAvatar,
  }});
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "failed to create business account" });
  }
}

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
  const { userId} = req.params;
  try {
    const businessAcc = await prisma.businessAcc.findMany({
      where: {
        userId : Number(userId),
      },
      select: {
        businessName: true,
        memberId: true,
      }
    });
    res.json(businessAcc);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "failed to get business account" });
  }
};

// Get a Business Account Detail by MemberId- Get
const getBusinessDetail = async (req: Request, res: Response) => {
  const { memberId} = req.params;

  // find role by memberId
  const role = await prisma.member.findUnique({
    where: {
      uniqueId: memberId,
    },
    select: {
      role: true,
    },
  });  try {
    const businessAcc = await prisma.businessAcc.findMany({
      where: {
        memberId : memberId,
      },
      select: { 
        id: true,       
        businessName: true,
        vatId: true,
        taxType: true,                
        businessAddress: true,
        businessType: true,
        businessAvatar: true,


      },
    });
    res.json({
      ...businessAcc[0],
    
      role: role?.role
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "failed to get business account" });
  }
};


// Update a Business Account by ID - Put
const updateBusinessAcc = async (req: Request, res: Response) => {
  const { id } = req.params;
  const businessAccInput: businessAccInput = req.body;
  try {
    const businessAcc = await prisma.businessAcc.update({
      where: {
        id: Number(id),
      },
      data: businessAccInput,
    });
    res.json(businessAcc);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "failed to update business account" });
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
  const { id } = req.params;
  const { businessAvatar } = req.body;
  try {
    const businessAcc = await prisma.businessAcc.update({
      where: {
        id: Number(id),
      },
      data: {
        businessAvatar,
      },
    });
    res.json(businessAcc);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "failed to update business avatar" });
  }
}

// get business Avatar by memberId - Get
const getBusinessAvatar = async (req: Request, res: Response) => {
  const { memberId} = req.params;

    try {
    const businessAcc = await prisma.businessAcc.findMany({
      where: {
        memberId : memberId,
      },
      select: {         
        businessAvatar: true,
        businessName: true,


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
  getBusinessAvatar
  
 ,

  
 
};
