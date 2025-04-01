import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import Joi from "joi";

//Create  instance of PrismaClient
const prisma = new PrismaClient();

// Interface for request body from client
interface CreditInput {
  id?: number;
  createdAt?: Date;
  ownerId: number;
  creditorId: number;
}

// validate the request body
const schema = Joi.object({
  ownerId: Joi.number().required(),
  creditorId: Joi.number().required(),
});

// Credit
export const createCredit = async (req: Request, res: Response) => {
  const creditInput: CreditInput = req.body;
  const { error } = schema.validate(creditInput);

  console.log(creditInput);

  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  // convert ownerId and creditorId to integer
  creditInput.ownerId = parseInt(creditInput.ownerId.toString());
  creditInput.creditorId = parseInt(creditInput.creditorId.toString());

  // check if creditInput both of creditorId and creditingId already exists
  const existingCredit = await prisma.credit.findFirst({
    where: {
      ownerId: creditInput.ownerId,
      creditorId: creditInput.creditorId,
    },
  });
  if (existingCredit) {
    return res.status(400).json({ status: "credited",
      message: `already credited ${creditInput.ownerId}`,
      
     });
  }
  // not allowed to credit yourself
  if (creditInput.ownerId === creditInput.creditorId) {
    return res.status(400).json({ error: "You can't credit yourself" });
  }

  try {
    const credit = await prisma.credit.create({
      data: {
        creditorId: creditInput.creditorId,
        ownerId: creditInput.ownerId,
      },
    });

    res.json({
      status: "ok",
      message: `${creditInput.creditorId} credited ${creditInput.ownerId}`,
      credit,
    });
    
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// UnCredit
export const deleteCredit = async (req: Request, res: Response) => {
  const creditInput: CreditInput = req.body;

  const { error } = schema.validate(creditInput);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  // Check which id  creditorId and creditingId to delete
  const existingCreditId = await prisma.credit.findFirst({
    where: {
      ownerId: req.body.ownerId,
      creditorId: req.body.creditorId,
    },
    select: { id: true },
  });
// Check if ownerId = creditorId 
  if (creditInput.ownerId === creditInput.creditorId) {
    return res.json({
      status: "ok",
      message: `You can't uncredit yourself`,
      
    });
  }
  //console.log(existingCreditId);
  // Delete by id in existingCreditId
  try {
    const credit = await prisma.credit.delete({
      where: {
        id: existingCreditId?.id,
      },
    });

    return res.json({
      status: "ok",
      message: `${creditInput.creditorId} UnCredited ${creditInput.ownerId}`,
      credit,
    });
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

// Get URL image of creditors by ownerId
export const getCreditors = async (req: Request, res: Response) => {
  const { ownerId } = req.params;
  const creditors = await prisma.credit.findMany({
    where: {
      ownerId: parseInt(ownerId),
    },
    select: {
      ownerId: true,
      creditor: {
        select: {
          id : true,
          firstName: true,
          lastName: true,
          avatar: true,
        },
      },
    },
  });
  console.log(creditors);

  res.json(
    creditors.map((creditor) => ({
      id: creditor.creditor.id,
      firstName: creditor.creditor.firstName,
      lastName: creditor.creditor.lastName,
      avatar: creditor.creditor.avatar,
    })),
  );
  // error handling
  try {
    if (!creditors) {
      return res.status(404).json({ error: "Creditors not found" });
    }
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error" });
  }
} 

// Count of creditor by ownerId
export const sumCreditors = async (req: Request, res: Response) => {
  const { ownerId } = req.params;
  const creditSum = await prisma.credit.aggregate({
    where: {
      ownerId: parseInt(ownerId),
    },
    _count: {
      ownerId: true,
    },
  });
  //console.log(creditSum);

  res.json(creditSum._count?.ownerId || 0);
  // error handling
  try {
    if (!creditSum) {
      return res.status(404).json({ error: "Creditors not found" });
    }
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
// Count of crediting by creditorId
export const sumCrediting = async (req: Request, res: Response) => {
  const { creditorId } = req.params;
  const creditSum = await prisma.credit.aggregate({
    where: {
      creditorId: parseInt(creditorId),
    },
    _count: {
      creditorId: true,
    },
  });
  //console.log(creditSum);
  res.json(creditSum._count?.creditorId || 0);
  // error handling
  try {
    if (!creditSum) {
      return res.status(404).json({ error: "Crediting not found" });
    }
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error" });
  }}

  // Check if ownerId and creditorId already exists
  export const checkCredit = async (req: Request, res: Response) => {
    const { ownerId, creditorId } = req.params;
    const existingCredit = await prisma.credit.findFirst({
      where: {
        ownerId: parseInt(ownerId),
        creditorId: parseInt(creditorId),
      },
    });

    

    if (existingCredit) {
      return res.status(200).json({ status: "credited" });      

    }
    // not allowed to credit yourself
    if (parseInt(ownerId) === parseInt(creditorId)) {
      return res.status(200).json({ status: "credited" });
    }
    return res.status(200).json({ status: "not credited" });
  }
  
