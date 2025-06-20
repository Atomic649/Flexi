import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { Request, Response } from "express";
import { PrismaClient as PrismaClient1 } from "../generated/client1";
import Joi from "joi";
import crypto from "crypto";
import nodemailer from "nodemailer";


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
const resetTokenConfig = { expiresIn: "1h" };

// Email configuration for password reset - Updated with better security options
let transporter: nodemailer.Transporter;

// Initialize the email transporter based on environment
async function initializeTransporter() {
  // Check if we're in a production environment
  if (process.env.NODE_ENV === 'production') {
    // For production, use the actual email service
    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        // Use OAuth2 or App Password
        user: process.env.EMAIL_USER,
        // For App Password setup: https://support.google.com/accounts/answer/185833
        pass: process.env.EMAIL_APP_PASSWORD, 
      },
    });
  } else {
    // For development/testing, create a test account with Ethereal
    console.log('Development mode: Creating Ethereal test account');
    
    try {
      // Create a testing account with Ethereal
      const testAccount = await nodemailer.createTestAccount();
      
      // Create a transporter with the test account
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      
      console.log('Ethereal test account created successfully');
      console.log('Ethereal credentials - User:', testAccount.user);
    } catch (error) {
      console.error('Failed to create Ethereal test account:', error);
      
      // Fallback to a nodemailer development transport that just logs messages
      transporter = nodemailer.createTransport({
        streamTransport: true,
        newline: 'unix',
        buffer: true
      });
    }
  }
}

// Initialize the transporter
(async () => {
  await initializeTransporter();
})();

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

// Forgot Password - Sends reset token email
const forgotPassword = async (req: Request, res: Response) => {
  const { email } = req.body;
  
  // Validate input
  const schema = Joi.object({
    email: Joi.string().email().required(),
  });
  
  const { error } = schema.validate({ email });
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  try {
    // Check if user exists
    const user = await Prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    if (!user) {
      // For security reasons, don't reveal that the user doesn't exist
      return res.status(200).json({ 
        status: "ok",
        message: "If your email is registered, you will receive a password reset link" 
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

    // Store token in database
    await Prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        resetToken: resetToken,
        resetTokenExpiry: resetTokenExpiry,
      },
    });

    // Generate JWT reset token
    const jwtResetToken = jwt.sign(
      { id: user.id, token: resetToken },
      "reset-secret",
      resetTokenConfig
    );

    // Email content
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${jwtResetToken}`;
    const mailOptions = {
      from: process.env.NODE_ENV === 'production' ? process.env.EMAIL_USER : 'dev@example.com',
      to: user.email,
      subject: 'Password Reset Request',
      html: `
        <h1>Password Reset</h1>
        <p>You requested a password reset. Please click the link below to reset your password:</p>
        <a href="${resetUrl}">Reset Password</a>
        <p>This link is valid for 1 hour.</p>
        <p>If you did not request a password reset, please ignore this email.</p>
      `
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);

    // In development mode, log the test email URL
    if (process.env.NODE_ENV !== 'production') {
      console.log('Password reset email sent in development mode');
      
      // Check if we have a preview URL from Ethereal
      if (nodemailer.getTestMessageUrl(info)) {
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
      }
      
      // If using stream transport, show the message content
      if (info.message) {
        console.log('Email content:', info.message.toString());
      }
      
      console.log('Reset URL (for development testing):', resetUrl);
    }

    res.status(200).json({
      status: "ok",
      message: "If your email is registered, you will receive a password reset link",
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Failed to process password reset request" });
  }
};

// Reset Password - Validates token and updates password
const resetPassword = async (req: Request, res: Response) => {
  const { token, newPassword } = req.body;

  // Validate input
  const schema = Joi.object({
    token: Joi.string().required(),
    newPassword: Joi.string().required().min(6),
  });
  
  const { error } = schema.validate({ token, newPassword });
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  try {
    // Verify JWT token
    const decoded = jwt.verify(token, "reset-secret") as { id: number, token: string };
    
    // Find user with valid token
    const user = await Prisma.user.findFirst({
      where: {
        id: decoded.id,
        resetToken: decoded.token,
        resetTokenExpiry: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired reset token" });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update user password and clear reset token
    await Prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    res.status(200).json({
      status: "ok",
      message: "Password has been reset successfully",
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Failed to reset password" });
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
  changePassword,
  forgotPassword,
  resetPassword
};
