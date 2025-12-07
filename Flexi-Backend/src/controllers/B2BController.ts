import { Request, Response } from "express";

import { flexiAdsDBPrismaClient } from "../../lib/PrismaClient2";

// Create  instance of PrismaClient
const prisma = flexiAdsDBPrismaClient;
// get all office
const getAllOffices = async (req: Request, res: Response) => {
  try {
    const offices = await prisma.product.findMany({
      where: {
        deleted: false,
        categoryId: 3,
      },
      select: {
        id: true,
        title: true,
        description: true,
        image: true,
        callToAction: true,
      },
      //take: 12
    });
    res.json(offices);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "failed to get offices" });
  }
};

// get all coach
const getAllCoaches = async (req: Request, res: Response) => {
  try {
    const coaches = await prisma.product.findMany({
      where: {
        deleted: false,
        categoryId: 2,
      },
      select: {
        id: true,
        title: true,
        description: true,
        image: true,
        callToAction: true,
      },
      take: 12,
    });
    res.json(coaches);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "failed to get coaches" });
  }
};

// get all Bank
const getAllBanks = async (req: Request, res: Response) => {
  try {
    const banks = await prisma.product.findMany({
      where:{
        deleted:false,
        categoryId: 1,
      },     
      select: {
        id: true,
        title: true,
        description: true,
        image: true,
        callToAction: true,
      },
      take: 12,
    });
    res.json(banks);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "failed to get banks" });
  }
};

// get all Agency
const getAllAgencies = async (req: Request, res: Response) => {
  try {
    const agencies = await prisma.product.findMany({
      where:{
        deleted:false,
        categoryId: 4,
      },     
      select: {
        id: true,
        title: true,
        description: true,
        image: true,
        callToAction: true,
      },
      take: 12,
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
      where:{
        deleted:false,
        categoryId: 5,
      },     
      select: {
        id: true,
        title: true,
        description: true,
        image: true,
        callToAction: true,
      },
      take: 12,
    });
    res.json(accounts);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "failed to get accounts" });
  }
};

// get all Orms
const getAllOrms = async (req: Request, res: Response) => {
  try {
    const orms = await prisma.product.findMany({
      where:{
        deleted:false,
        categoryId: 6,
      },     
      select: {
        id: true,
        title: true,
        description: true,
        image: true,
        callToAction: true,
      },
      take: 12,
    });
    res.json(orms);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "failed to get orms" });
  }
};

export {
  getAllOffices,
  getAllCoaches,
  getAllBanks,
  getAllAgencies,
  getAllAccounts,
  getAllOrms,
};
