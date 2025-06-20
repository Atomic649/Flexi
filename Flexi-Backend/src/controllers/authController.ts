import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { Request, Response } from "express";
import { PrismaClient as PrismaClient1 } from "../generated/client1";
import Joi from "joi";

// Ensure this file is also converted to TypeScript
// Define types for the user inputs
interface UserInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  avatar: string;
  phone: string;
}

const Prisma = new PrismaClient1();

// JWT token expiration configuration
const tokenConfig = { expiresIn: "30day" };

const register = async (req: Request, res: Response) => {
  const userInput: UserInput = req.body;
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    phone: Joi.string().required().min(10).max(10),
  });
  const { error } = schema.validate(userInput);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  try {
    // check if user already exists
    const existingUser = await Prisma.user.findUnique({
      where: {
        email: userInput.email,
      },
    });
    if (existingUser) {
      return res.status(400).json({
        status: "error",
        message: "User already exists",
      });
    }
    //Check if password matches
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userInput.password, salt);
    const user = await Prisma.user.create({
      data: {
        email: userInput.email,
        password: hashedPassword,
        firstName: userInput.firstName,
        lastName: userInput.lastName,
        phone: userInput.phone,
      },
    });
    // Generate JWT token
    const token = jwt.sign({ id: user.id }, "secret", tokenConfig);

    res.json({
      status: "ok",
      message: "Registered successfully",
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
      },
      token: token,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "failed to register" });
  }
};

// Login function by prisma

const login = async (req: Request, res: Response) => {
  const userInput: UserInput = req.body;
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  });
  const { error } = schema.validate(userInput);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  try {
    const user = await Prisma.user.findUnique({
      where: {
        email: userInput.email,
      },
    });
    if (!user) {
      return res.status(401).json({ message: "invalid credentials" });
    }
    const valid = await bcrypt.compare(userInput.password, user.password);
    if (!valid) {
      return res
        .status(401)
        .json({ message: "Email and password does not match" });
    }
    // Generate JWT token
    const token = jwt.sign({ id: user.id }, "secret", tokenConfig);

    // find memberId by userId
    const memberId = await Prisma.member.findFirst({
      where: {
        userId: user.id,
      },
    });
    // find businessAcc by userId
    const businessAcc = await Prisma.businessAcc.findFirst({
      where: {
        memberId: memberId?.uniqueId,
      },
    });
    if (!businessAcc) {
      return res.status(404).json({ message: "Business account not found" });
    }

    res.json({
      status: "ok",
      message: "login successful",
      token: token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        avatar: user.avatar,
        phone: user.phone,
        bio: user.bio,
        username: user.username,
        memberId: memberId?.uniqueId,
        businessId: businessAcc.id,
      },
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "failed to login" });
  }
};

// get all users
const getUsers = async (_: Request, res: Response) => {
  try {
    const users = await Prisma.user.findMany();
    res.json(users);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "failed to get users" });
  }
};

// Delete  a user by id
const deleteUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const user = await Prisma.user.delete({
      where: {
        id: Number(id),
      },
    });
    res.json(user);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "failed to delete user" });
  }
};

// Permanently delete  business account by memberId with password verification
const permanentlyDelete = async (req: Request, res: Response) => {
  const { memberId } = req.params;
  const { password } = req.body;

  // Validate input
  if (!password) {
    return res.status(400).json({ message: "Password is required" });
  }

  try {
    // Find business account by memberId
    const businessAcc = await Prisma.businessAcc.findFirst({
      where: {
        memberId: memberId,
      },
    });
    if (!businessAcc) {
      return res.status(404).json({ message: "Business account not found" });
    }

    // Delete all related data in BusinessAcc

    //Bill
    await Prisma.bill.deleteMany({
      where: {
        businessAcc: businessAcc.id,
      },
    });

    //Expense
    await Prisma.expense.deleteMany({
      where: {
        businessAcc: businessAcc.id,
      },
    });

    //adsCost
    await Prisma.adsCost.deleteMany({
      where: {
        businessAcc: businessAcc.id,
      },
    });

    //Platform
    await Prisma.platform.deleteMany({
      where: {
        businessAcc: businessAcc.id,
      },
    });

    //Store
    await Prisma.store.deleteMany({
      where: {
        businessAcc: businessAcc.id,
      },
    });

    //Product
    await Prisma.product.deleteMany({
      where: {
        businessAcc: businessAcc.id,
      },
    });

    //BusinessAcc
    await Prisma.businessAcc.delete({
      where: {
        id: businessAcc.id,
      },
    });

    // Member
    await Prisma.member.delete({
      where: {
        uniqueId: memberId,
      },
    });

    res
      .status(200)
      .json({
        message: "Business account and all related data deleted successfully",
      });
  } catch (e) {
    console.error(e);
    res
      .status(500)
      .json({ message: "failed to permanently delete business account" });
  }
};

// Update user by id by prisma validation by joi and bcrypt and jwt
const updateUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userInput: UserInput = req.body;
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    avatar: Joi.string().required(),
    phone: Joi.string().required().min(10).max(10),
  });
  const { error } = schema.validate(userInput);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userInput.password, salt);
    const user = await Prisma.user.update({
      where: {
        id: Number(id),
      },
      data: {
        email: userInput.email,
        password: hashedPassword,
        firstName: userInput.firstName,
        lastName: userInput.lastName,
        avatar: userInput.avatar,
        phone: userInput.phone,
      },
    });
    res.json(user);
    // Generate JWT token
    const token = jwt.sign({ id: user.id }, "secret", tokenConfig);
    res.json({ token });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "failed to update user" });
  }
};

// get avatar by name
const getAvatar = async (req: Request, res: Response) => {
  const { name } = req.params;
  try {
    res.sendFile(name, { root: "uploads/images" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "failed to get avatar" });
  }
};

// Logout by deleting the token
const logout = async (req: Request, res: Response) => {
  try {
    res.json({ message: "logout successful" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "failed to logout" });
  }
};

// Session endpoint
const session = async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, "secret") as { id: number };
    const user = await Prisma.user.findUnique({
      where: {
        id: decoded.id,
      },
    });
    res.json({ session: user, message: "session found" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "failed to get session" });
  }
};

// Change User Password
const changePassword = async (req: Request, res: Response) => {
  const { id, currentPassword, newPassword } = req.body;

  const schema = Joi.object({
    id: Joi.number().required(),
    currentPassword: Joi.string().required(),
    newPassword: Joi.string().required(),
  });
  const { error } = schema.validate({ id, currentPassword, newPassword });
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }


  try {
    const user = await Prisma.user.findUnique({
      where: {
        id: Number(id),
      },
    });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) {
      return res.status(401).json({ message: "Old password is incorrect" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedNewPassword = await bcrypt.hash(newPassword, salt);

    const updatedUser = await Prisma.user.update({
      where: {
        id: Number(id),
      },
      data: {
        password: hashedNewPassword,
      },
    });

    res.json({
      status: "ok",
      message: "Password changed successfully",
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        phone: updatedUser.phone,
      },
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "failed to change password" });
  }
};



export {
  register,
  login,
  getUsers,
  deleteUser,
  permanentlyDelete,
  updateUser,
  getAvatar,
  logout,
  session,
  changePassword
};
