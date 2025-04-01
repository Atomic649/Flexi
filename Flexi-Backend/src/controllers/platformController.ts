import { Request, Response } from "express";
import { Prisma, PrismaClient, SocialMedia } from "@prisma/client";
import Joi from "joi";

// Create  instance of PrismaClient
const prisma = new PrismaClient();

// Interface for request body from client
interface platformInput {

  platform: SocialMedia;
  accName: string;
  accId: string;
  adsCost?: number;
  memberId: string;
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
  accId: Joi.string().required(),
  memberId: Joi.string().required(),
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
      },
    });

    if (existingPlatform) {
      return res.status(400).json({ message: "Platform already exists" });
    }

    // Find business ID by member ID
    const businessAcc = await prisma.businessAcc.findFirst({
      where: {
        memberId: platformInput.memberId,
      },
    });

    const newPlatform = await prisma.platform.create({
      data: {
        platform: platformInput.platform,
        accName: platformInput.accName,
        accId: platformInput.accId,
        businessAcc: businessAcc?.id ?? 0,
        memberId: platformInput.memberId,
      },
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
    const platforms = await prisma.platform.findMany({
      where: {
        memberId: memberId,
        deleted: false,
      },
    });
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
    const platform = await prisma.platform.findUnique({
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
    const platform = await prisma.platform.update({
      where: {
        id: Number(id),
      },
      data: {
        platform: platformInput.platform,
        accName: platformInput.accName,
        accId: platformInput.accId,
      },
    });
    res.json({});
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
    const platform = await prisma.platform.findMany({
      where: {
        platform: SocialMedia as SocialMedia,
      },
    });
    res.json(platform);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Failed to get platform" });
  }
};
export {
  createPlatform,
  getPlatforms,
  getPlatformById,
  deletePlatform,
  updatePlatform,
  searchPlatform,
};
