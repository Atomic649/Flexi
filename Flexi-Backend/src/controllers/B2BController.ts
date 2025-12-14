import { Request, Response } from "express";
import { flexiAdsDBPrismaClient } from "../../lib/PrismaClient2";

// Create  instance of PrismaClient
const prisma = flexiAdsDBPrismaClient;

const MAX_LIMIT = 50;
const DEFAULT_LIMIT = 3;

type CategoryId = 1 | 2 | 3 | 4 | 5 | 6;

const buildPaginationParams = (req: Request) => {
  const take = Math.min(Number(req.query.limit) || DEFAULT_LIMIT, MAX_LIMIT);
  const cursorId = req.query.cursor ? Number(req.query.cursor) : undefined;
  return { take, cursorId: cursorId && !Number.isNaN(cursorId) ? cursorId : undefined };
};

const pagedProducts = async (categoryId: CategoryId, req: Request, res: Response) => {
  try {
    const { take, cursorId } = buildPaginationParams(req);
    console.log(`Fetching products for category ${categoryId} with take=${take} and cursorId=${cursorId}`);

    const products = await prisma.product.findMany({
      where: {
        deleted: false,
        categoryId,
        // campaigns: {
        //   some: {},
        // },
      },    
       take: take + 1, // fetch one extra to compute hasMore
      ...(cursorId ? { cursor: { id: cursorId }, skip: 1 } : {}),
      orderBy: { id: "desc" },
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

    const hasMore = products.length > take;
    const items = hasMore ? products.slice(0, take) : products;
    const nextCursor = hasMore ? String(items[items.length - 1].id) : null;

    res.json({ items, nextCursor, hasMore });
    console.log(`Returned ${items.length} products for category ${categoryId} with nextCursor=${nextCursor} and hasMore=${hasMore}`);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "failed to get products" });
  }
};

// get all office
const getAllOffices = async (req: Request, res: Response) => pagedProducts(3, req, res);

// get all coach
const getAllCoaches = async (req: Request, res: Response) => pagedProducts(2, req, res);

// get all Bank
const getAllBanks = async (req: Request, res: Response) => pagedProducts(1, req, res);

// get all Agency
const getAllAgencies = async (req: Request, res: Response) => pagedProducts(4, req, res);

// get all Account
const getAllAccounts = async (req: Request, res: Response) => pagedProducts(5, req, res);

// get all Orms
const getAllOrms = async (req: Request, res: Response) => pagedProducts(6, req, res);

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
