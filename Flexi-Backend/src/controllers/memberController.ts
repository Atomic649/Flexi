import { Request, Response } from "express";
import { PrismaClient, UserRole } from "@prisma/client";
import Joi from "joi";

// Create  instance of PrismaClient
const prisma = new PrismaClient();

//Interface for request body from client
interface memberInput {
  uniqueId: string;
  permission: string;
  role: UserRole;
  userId: number;
}

// Validate the request body
const schema = Joi.object({
  permission: Joi.string().required(),
  role: Joi.string().valid("owner", "admin", "member").required(),
  userId: Joi.number().required(),
});

// Create a Member - Post
const createMember = async (req: Request, res: Response) => {
  const memberInput: memberInput = req.body;
  // Validate the request body
  const { error } = schema.validate(memberInput);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  // convert string to number in userId
  memberInput.userId = Number(memberInput.userId);
  
  try {
    const member = await prisma.member.create({
      data: {
        permission: memberInput.permission,
        role: memberInput.role,
        userId: memberInput.userId,
      },
    });
 
    res.json(member);

  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "failed to create member" });
  }
};
// Get All Members - Get
const getMembers = async (_: Request, res: Response) => {
  console.log("get members");

  try {
    const members = await prisma.member.findMany();
    res.json(members);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "failed to get members" });
  }
};
// Get uniqueId by search userId - post
const getMemberIDByUserID = async (req: Request, res: Response) => {
  const { userId } = req.params;
  try {
    const member = await prisma.member.findMany({
      where: {
        userId: Number(userId),
      },
    });
    res.json({
      status :"ok",
      massage :" already sign in with member uniqueId ",
      member : {
        uniqueId : member[0].uniqueId,
        role : member[0].role,
        permission : member[0].permission
      }

    }
      );
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "failed to get member" });
  }
};

// Delete a Member - Delete
const deleteMember = async (req: Request, res: Response) => {
  const { uniqueId } = req.params;
  try {
    const member = await prisma.member.delete({
      where: {
        uniqueId: uniqueId,
      },
    });
    res.json(member);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "failed to delete member" });
  }
};
// Update a Member - Put
const updateMember = async (req: Request, res: Response) => {
  const { uniqueId } = req.params;
  const memberInput: memberInput = req.body;
  // Validate the request body
  const { error } = schema.validate(memberInput);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  try {
    const member = await prisma.member.update({
      where: {
        uniqueId: uniqueId,
      },
      data: {
        permission: memberInput.permission,
        role: memberInput.role,
        
      },
    });
    res.json(member);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "failed to update member" });
  }
};

// Search for a Member
const searchMember = async (req: Request, res: Response) => {
  const { keyword } = req.params;

  try {
    const member = await prisma.member.findMany({
      where: {
        OR: [
          {
            uniqueId: {
              contains: keyword,
            },
          },
          {
            permission: {
              contains: keyword,
            },
          },
          {
            role: {
              in: ["owner", "marketing", "accountant", "sales"],
            },
          },
        ],
      },
    });
    res.json(member);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "failed to search member" });
  }
};

// Export the createMember function
export {  
  createMember,
  getMembers,
  getMemberIDByUserID,
  deleteMember,
  updateMember,
  searchMember,
};
