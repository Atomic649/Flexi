import { Request, Response } from "express";
import { flexiAdsDBPrismaClient } from "../../lib/PrismaClient2";

// Create  instance of PrismaClient
const prisma = flexiAdsDBPrismaClient;
// get all office
const getAllOffices = async (_: Request, res: Response) => {
  try {
    const offices = await prisma.product.findMany({
      where: {
        deleted: false,
        categoryId: 3,
        campaigns: {
          some: {},
        },
      },
      select: {
        id: true,
        title: true,
        description: true,
        image: true,
        callToAction: true,
        campaigns: {
          select: {
            id: true,
          },
        },
      },
    });
    console.log("Offices fetched:", offices);
    res.json(offices);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "failed to get offices" });
  }
};

// get all coach
const getAllCoaches = async (_: Request, res: Response) => {
  try {
    const coaches = await prisma.product.findMany({
      where: {
        deleted: false,
        categoryId: 2,
        campaigns: {
          some: {},
        },
      },
      select: {
        id: true,
        title: true,
        description: true,
        image: true,
        callToAction: true,
        campaigns: {
          select: {
            id: true,
          },
        },
      },
    });
    res.json(coaches);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "failed to get coaches" });
  }
};

// get all Bank
const getAllBanks = async (_: Request, res: Response) => {
  try {
    const banks = await prisma.product.findMany({
      where: {
        deleted: false,
        categoryId: 1,
        campaigns: {
          some: {},
        },
      },
      select: {
        id: true,
        title: true,
        description: true,
        image: true,
        callToAction: true,
        campaigns: {
          select: {
            id: true,
          },
        },
      },
    });
    console.log("Banks fetched:", banks);
    res.json(banks);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "failed to get banks" });
  }
};

// get all Agency
const getAllAgencies = async (_: Request, res: Response) => {
  try {
    const agencies = await prisma.product.findMany({
      where: {
        deleted: false,
        categoryId: 4,
        campaigns: {
          some: {},
        },
      },
      select: {
        id: true,
        title: true,
        description: true,
        image: true,
        callToAction: true,
        campaigns: {
          select: {
            id: true,
          },
        },
      },
    });
    res.json(agencies);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "failed to get agencies" });
  }
};

// get all Account
const getAllAccounts = async (req: Request, res: Response) => {
  try {
    const accounts = await prisma.product.findMany({
      where: {
        deleted: false,
        categoryId: 5,
        campaigns: {
          some: {},
        },
      },
      select: {
        id: true,
        title: true,
        description: true,
        image: true,
        callToAction: true,
        campaigns: {
          select: {
            id: true,
          },
        },
      },
    });
    res.json(accounts);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "failed to get accounts" });
  }
};

// get all Orms
const getAllOrms = async (_: Request, res: Response) => {
  try {
    const orms = await prisma.product.findMany({
      where: {
        deleted: false,
        categoryId: 6,
        campaigns: {
          some: {},
        },
      },
      select: {
        id: true,
        title: true,
        description: true,
        image: true,
        callToAction: true,
        campaigns: {
          select: {
            id: true,
          },
        },
      },
    });
    res.json(orms);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "failed to get orms" });
  }
};

// get product details by id
const getProductDetailsById = async (req: Request, res: Response) => {
  console.log("Fetching product details for ID:", req.params.id);
  try {
    const { id } = req.params;
    const product = await prisma.product.findUnique({
      where: { id: Number(id) },
      select: {
        id: true,
        title: true,
        image: true,
        callToAction: true,
        details: true,
        campaigns: {
          select: {
            id: true,
          },
        },
      },
    });
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(product);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "failed to get product details" });
  }
};

export {
  getAllOffices,
  getAllCoaches,
  getAllBanks,
  getAllAgencies,
  getAllAccounts,
  getAllOrms,
  getProductDetailsById,
};
