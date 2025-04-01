import { Request, Response } from "express";
import { IncomeChannel, PrismaClient } from "@prisma/client";
import Joi from "joi";

// Create an instance of PrismaClient
const prisma = new PrismaClient();

// Interface for request body from client
interface Store {
  id ?: number;
  platform: IncomeChannel;
  accName: string;
  accId: string;
  memberId: string;
}

// Validation schema for request body
const storeSchema = Joi.object({
    platform: Joi.string().valid(
        "Facebook", "Line", "Tiktok", "Shopee", "Lazada", "Instagram", "X", 
        "Youtube", "Google", "SCB", "KBANK", "KTB", "BBL", "TMB", "store"
    ).required(),
    accName: Joi.string().required(),
    accId: Joi.string().required(),
    memberId: Joi.string().required(),
});

// Create store
const createStore = async (req: Request, res: Response) => {
  const store: Store = req.body;
  const { error } = storeSchema.validate(store);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  try {
    // Check if the store already exists
    const existingStore = await prisma.store.findFirst({
      where: {
        platform: store.platform,
        accName: store.accName,      
        memberId: store.memberId,
      },
    });

    if (existingStore) {
      return res.status(400).json({ message: "Already have this connection" });
    }

    // Find business ID by member ID
    const businessAcc = await prisma.businessAcc.findFirst({
      where: {
        memberId: store.memberId,
      },
    });

    const newStore = await prisma.store.create({
      data: {
        platform: store.platform,
        accName: store.accName,
        accId: store.accId,        
        memberId: store.memberId,
        businessAcc: businessAcc?.id ?? 0,
        
      },
    });
    res.status(201).json(newStore);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Failed to create store" });
  }
};

// get all stores by memberId
const getStores = async (req: Request, res: Response) => {
  const memberId = req.params.memberId;
  try {
    const stores = await prisma.store.findMany({
      where: {
        memberId: memberId,
        deleted: false, // Exclude stores where deleted is true
      },
    });
    res.json(stores);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Failed to get stores" });
  }
};

// get a store by id
const getAStore = async (req: Request, res: Response) => {
  const storeId = parseInt(req.params.id);
  try {
    const store = await prisma.store.findUnique({
      where: {
        id: storeId,
      },
    });
    res.json(store);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Failed to get store" });
  }
};

// Update store by id
const updateStore = async (req: Request, res: Response) => {
  const storeId = parseInt(req.params.id);
  const store: Store = req.body;
  const { error } = storeSchema.validate(store);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  try {
    const updatedStore = await prisma.store.update({
      where: {
        id: storeId,
      },
      data: {
        platform: store.platform,
        accName: store.accName,
        accId: store.accId,
        
      },
    });
    res.json(updatedStore);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Failed to update store" });
  }
}

// Delete store by id , set true to isDeleted
const deleteStore = async (req: Request, res: Response) => {
  const storeId = parseInt(req.params.id);
  try {
    const deletedStore = await prisma.store.update({
      where: {
        id: storeId,
      },
      data: {
        deleted: true,
      },
    });
    res.json(deletedStore);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Failed to delete store" });
  }
};

export { createStore, getStores, getAStore, updateStore, deleteStore };
