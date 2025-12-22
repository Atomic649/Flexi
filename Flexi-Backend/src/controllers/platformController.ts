import { Request, Response } from "express";
import {  SocialMedia ,PrismaClient as PrismaClient1 } from "../generated/client1/client";
import Joi from "joi";
import { flexiDBPrismaClient } from "../../lib/PrismaClient1";

const prisma = flexiDBPrismaClient;
const platformModel: any = prisma.platform;

// Interface for request body from client
interface platformInput {
  platform: SocialMedia;
  accName: string;
  accId?: string;
  campaignId?: string;
  memberId: string;
  productId?: number | null;
}

// validate the request body
const schema = Joi.object({
  platform: Joi.string().valid(
    "Facebook",
    "Tiktok",
    "Shopee",
    "Instagram",
    "Youtube",
    "Lazada",
    "Line",
    "X",
    "Google"
  ),
  accName: Joi.string().required(),
  accId: Joi.string().optional(),
  campaignId: Joi.string().optional(),
  memberId: Joi.string().required(),
  productId: Joi.number().allow(null).optional(),
});

//  Create a New platform - Post
const createPlatform = async (req: Request, res: Response) => {
  const platformInput: platformInput = req.body;
  const { error } = schema.validate(platformInput);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  try {
    // Check if the platform already exists
    const existingPlatform = await prisma.platform.findFirst({
      where: {
        platform: platformInput.platform,
        accName: platformInput.accName,       
        memberId: platformInput.memberId, 
        campaignId: platformInput.campaignId ?? null,
      },
    });

    if (existingPlatform) {
      return res.status(400).json({ message: "Platform already exists" });
    }

     // Find business ID by member ID from member table
    const businessAcc = await prisma.member.findUnique({
      where : { uniqueId: platformInput.memberId },
      select:{ businessId: true }
    });
    const newPlatform = await platformModel.create({
      data: {
        platform: platformInput.platform,
        accName: platformInput.accName,
        accId: platformInput.accId,
        businessAcc: businessAcc?.businessId ?? 0,
        memberId: platformInput.memberId,
        productId: platformInput.productId ?? null,
        campaignId: platformInput.campaignId ?? null,
      },
      include: { product: true },
    });
    res.status(201).json(newPlatform);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Failed to create platform" });
  }
}
//  get all Platform list by memberID - Get
const getPlatforms = async (req: Request, res: Response) => {
  const { memberId } = req.params;
  try {
    const platforms = await platformModel.findMany({
      where: {
        memberId: memberId,
        deleted: false,
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
    console.log("🚀 Get Platforms:", platforms);
    res.json(platforms);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "failed to get platforms" });
  }
};

// 🚧  Get a platform by ID - Get
const getPlatformById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const platform = await platformModel.findUnique({
      where: {
        id: Number(id),
      },
    });
    res.json(platform);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "failed to get platform" });
  }
};

// Delete a platform - Delete by setting deleted status to true
const deletePlatform = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const platform = await prisma.platform.update({
      where: {
        id: Number(id),
      },
      data: {
        deleted: true,
      },
    });
    res.json({
      message: "deleted",
      platform: platform.deleted,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "failed to delete platform" });
  }
};


// 🚧 Update a platform - Put
const updatePlatform = async (req: Request, res: Response) => {
  const { id } = req.params;
  const platformInput: platformInput = req.body;
  try {
    const platform = await platformModel.update({
      where: {
        id: Number(id),
      },
      data: {
        platform: platformInput.platform,
        accName: platformInput.accName,
        accId: platformInput.accId,
        productId: platformInput.productId ?? null,
        campaignId: platformInput.campaignId ?? null,
      },
      include: { product: true },
    });
    res.json(platform);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "failed to update platform" });
  }
};

// 🚧 Search platforms - Get by enum
const searchPlatform = async (req: Request, res: Response) => {
  const { SocialMedia } = req.params;

  // Validate the SocialMedia parameter
  if (!Object.values(SocialMedia).includes(SocialMedia)) {
    return res.status(400).json({ message: "Invalid platform" });
  }

  try {
    const platform = await platformModel.findMany({
      where: {
        platform: SocialMedia as SocialMedia,
      },
      include: { product: true },
    });
    res.json(platform);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Failed to get platform" });
  }
}

// get platformlist enum by memberID - Get
const getPlatformListByMemberId = async (req: Request, res: Response) => {
  const { memberId } = req.params;
  try {
    const platformList = await platformModel.findMany({
      where: {
        memberId: memberId,
        deleted: false,
      },
      select: {
        platform: true,
      },
      distinct: ['platform'],
    });
    const platforms = platformList.map((item) => item.platform);
    console.log("🚀 Get Platform List:", platforms);
    res.json(platforms);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "failed to get platform list" });
  }
}
export {
  createPlatform,
  getPlatforms,
  getPlatformById,
  deletePlatform,
  updatePlatform,
  searchPlatform,
  getPlatformListByMemberId,
};
