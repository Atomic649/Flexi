import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import Joi from "joi";

// Create  instance of PrismaClient
const prisma = new PrismaClient();

// get number of registered users - Get
export const getNumberOfUsers = async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.count();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// get User by ID - Get
export const getUserByID = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: parseInt(id),
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        avatar: true,
        bio : true,
        username : true,        
      },
    });

    // find role of user
    const role = await prisma.member.findMany({
      where: {
        userId: parseInt(id),
      },
      select: {
        role: true,
      },
    });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    // find businessName
    const businessName = await prisma.businessAcc.findMany({
      where: {
        userId: parseInt(id),
      },
      select: {
        businessName: true,
        businessAddress: true,
        vatId: true,
      },
    });
    if (!businessName) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      avatar: user.avatar,
      role: role[0].role,
      businessName: businessName[0].businessName,
      bio : user.bio,
      username : user.username,
      businessAddress: businessName[0].businessAddress,
      vatId: businessName[0].vatId,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
}


// upload user avatar - Post
