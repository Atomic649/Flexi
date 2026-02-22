import { PrismaClient as PrismaClient1 } from "../generated/client1/client";
import { Request, Response } from "express";
import { flexiDBPrismaClient } from "../../lib/PrismaClient1";

const prisma = flexiDBPrismaClient;

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
        emailVerifiedAt : true,

      },
    });

    // email is verified
    const isEmailVerified = user?.emailVerifiedAt ? true : false;


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
    // find businessName - owner has BusinessAcc by userId; partner looks up via Member table
    let businessData = await prisma.businessAcc.findMany({
      where: {
        userId: parseInt(id),
      },
      select: {
        businessName: true,
        businessAddress: true,
        taxId: true,
      },
    });

    if (businessData.length === 0) {
      // Partner: find business via Member.businessId
      const member = await prisma.member.findFirst({
        where: { userId: parseInt(id) },
        select: { businessId: true },
      });
      if (member?.businessId) {
        const business = await prisma.businessAcc.findUnique({
          where: { id: member.businessId },
          select: { businessName: true, businessAddress: true, taxId: true },
        });
        if (business) businessData = [business];
      }
    }

    if (businessData.length === 0) {
      return res.status(404).json({ message: "Business not found" });
    }

    res.status(200).json({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      avatar: user.avatar,
      role: role[0]?.role ?? "partner",
      businessName: businessData[0].businessName,
      bio : user.bio,
      username : user.username,
      businessAddress: businessData[0].businessAddress,
      taxId: businessData[0].taxId,
      isEmailVerified: isEmailVerified,

    });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
}


// upload user avatar - Post
