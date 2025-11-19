import { Request, Response } from "express";
import {  PrismaClient as PrismaClient1, UserRole } from "../generated/client1";
import Joi from "joi";

// Create  instance of PrismaClient
const prisma = new PrismaClient1();

//Interface for request body from client
interface memberInput {
  uniqueId: string;
  permission: string;
  role: UserRole;
  userId: number;
  businessId?: number;
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
        deleted: false
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

// Delete a Member - Delete (hard delete)
const deleteMember = async (req: Request, res: Response) => {
  const { uniqueId } = req.params;
  try {
    // Protect privileged members from deletion
    const target = await prisma.member.findUnique({
      where: { uniqueId },
      select: { role: true, permission: true },
    });

    if (!target) {
      return res.status(404).json({ message: "member not found" });
    }

    if (target.role === "owner" || target.permission === "admin") {
      return res
        .status(403)
        .json({ message: "protected member cannot be deleted" });
    }

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

// soft Delete a Member - Delete (mark as deleted)
const softDeleteMember = async (req: Request, res: Response) => {
  const { uniqueId } = req.params;
  try {
    // Protect privileged members from deletion
    const target = await prisma.member.findUnique({
      where: { uniqueId },
      select: { role: true, permission: true },
    });

    if (!target) {
      return res.status(404).json({ message: "member not found" });
    }

    if (target.role === "owner" || target.permission === "admin") {
      return res
        .status(403)
        .json({ message: "protected member cannot be deleted" });
    }

    const member = await prisma.member.update({
      where: {
        uniqueId: uniqueId,
      },
      data: {
        deleted: true,
      },
    });
    res.json(member);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "failed to delete member" });
  }
}


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

// Get members by businessAcc id with user details (firstName, lastName)
const getMembersByBusinessId = async (req: Request, res: Response) => {
  const { businessId } = req.params;
  console.log("Fetching members for businessId:", businessId);
  if (!businessId) {
    return res.status(400).json({ message: "businessId is required" });
  }
  try {
    const members = await prisma.member.findMany({
      where: {
        businessId: Number(businessId),
        deleted: false
      },
      select: {
        userId: true,
        uniqueId: true,
        role: true,
        permission: true,
        businessId: true,
        user: {
          select: {
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
      },
    });
    // Map status based on permission (heuristic: 'pending' => request, others => accepted)
    const data = members.map((m) => ({
      userId: m.userId,
      uniqueId: m.uniqueId,
      role: m.role,
      permission: m.permission,
      businessId: m.businessId,
      firstName: m.user?.firstName || "",
      lastName: m.user?.lastName || "",
      avatar: m.user?.avatar || "",
      status: m.permission === "pending" ? "request-sent" : "accepted",
    }));

    res.json({ status: "ok", members: data });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "failed to get members by businessId" });
  }
};

// Invite member by username to business
const inviteSchema = Joi.object({
  username: Joi.string().required(),
  role: Joi.string().valid("owner", "marketing", "accountant", "sales").required(),
  businessId: Joi.number().required(),
});

const inviteMemberByUsername = async (req: Request, res: Response) => {
  const { username, role, businessId } = req.body || {};
  const { error } = inviteSchema.validate({ username, role, businessId });
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  try {
    // Find user by username
    const user = await prisma.user.findUnique({
      where: { username },
      select: { id: true },
    });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check existing membership for this business
    const exists = await prisma.member.findFirst({
      where: {
        userId: user.id,
        businessId: Number(businessId),
        deleted: false
      },
    });
    if (exists) {
      return res.status(400).json({ message: "User is already a member of this business" });
    }

    const member = await prisma.member.create({
      data: {
        userId: user.id,
        role: role as UserRole,
        // Directly add member as active (no approval flow)
        permission: "user",
        businessId: Number(businessId),
      },
    });

    return res.json({ status: "ok", message: "Member added", member });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "failed to invite member" });
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
  getMembersByBusinessId,
  inviteMemberByUsername,
  softDeleteMember,
};

