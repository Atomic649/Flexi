import { Request, Response } from "express";
import { flexiDBPrismaClient } from "../../lib/PrismaClient1";
import { console } from "inspector";
import { exist } from "joi/lib";

const prisma = flexiDBPrismaClient;

export const checkCustomer = async (req: Request, res: Response) => {
  try {
    const { businessAcc, phone } = req.body;

    if (!businessAcc || !phone) {
      return res.status(400).json({ message: "Missing businessAcc or phone" });
    }

    const customer = await prisma.customer.findUnique({
      where: {
        businessAcc_phone: {
          businessAcc: Number(businessAcc),
          phone: phone.trim(),
        },
      },
    });

    console.log("Check Customer Result:", { exists: !!customer, customer });

    if (customer) {
      return res.status(200).json({ exists: true, customer });
    } else {
      return res.status(200).json({ exists: false });
    }
  } catch (error) {
    console.error("Error checking customer:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
