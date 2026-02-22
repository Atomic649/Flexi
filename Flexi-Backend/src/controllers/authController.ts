import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { Request, Response } from "express";
import { flexiDBPrismaClient } from "../../lib/PrismaClient1";
import Joi from "joi";
import crypto from "crypto";
import nodemailer from "nodemailer";
import { promises as dnsPromises } from "dns";

// Ensure this file is also converted to TypeScript
// Define types for the user inputs
interface UserInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  avatar: string;
  phone: string;
  bio?: string;
  username?: string;
  website?: string;
}

const Prisma = flexiDBPrismaClient;

// JWT token expiration configuration
const tokenConfig = { expiresIn: "30day" };
const resetTokenConfig = { expiresIn: "1h" };

// Password policy: min 8 chars (recommend 12+), must include upper, lower, digit, and at least one non-alphanumeric (special) char.
// Accepts any printable non-space character; rejects whitespace.
// Example valid: Ato.mic649  StrongPass9@  XyZ12345!  Good#Pass2024
const passwordSchema = Joi.string()
  .min(8)
  .max(128)
  .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])(?!.*\s).+$/)
  .messages({
    "string.min": "auth.register.backendErrors.validation.passwordMin",
    "string.max": "auth.register.backendErrors.validation.passwordMax",
    "string.pattern.base":
      "auth.register.backendErrors.validation.passwordPattern",
  });

// Username must start with '@' and include only English letters and numbers (no spaces or special characters)
const usernameSchema = Joi.string()
  .trim()
  .pattern(/^@[A-Za-z0-9]+$/)
  .messages({
    "string.pattern.base":
      "auth.register.backendErrors.validation.usernamePattern",
  });

// Centralized bcrypt cost factor (env override; default 12 for stronger security)
const BCRYPT_ROUNDS = Number(process.env.BCRYPT_ROUNDS || 12);

// Email configuration for password reset - Updated with better security options
let transporter: nodemailer.Transporter;

// Initialize the email transporter based on environment
async function initializeTransporter() {
  // Check if we're in a production environment
  const forceRealEmail = process.env.FORCE_REAL_EMAIL === "true";
  const hasGmailCreds = Boolean(
    process.env.EMAIL_USER && process.env.EMAIL_APP_PASSWORD,
  );

  if (
    process.env.NODE_ENV === "production" ||
    (forceRealEmail && hasGmailCreds)
  ) {
    // For production (or explicit dev override), use the actual email service
    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        // Use OAuth2 or App Password
        user: process.env.EMAIL_USER,
        // For App Password setup: https://support.google.com/accounts/answer/185833
        pass: process.env.EMAIL_APP_PASSWORD,
      },
    });
  } else if (process.env.NODE_ENV === "test") {
    // Jest/test environment: avoid network calls (Ethereal) and keep handles clean
    transporter = nodemailer.createTransport({
      streamTransport: true,
      newline: "unix",
      buffer: true,
    });
  } else {
    // For development/testing, create a test account with Ethereal
    console.log("Development mode: Creating Ethereal test account");

    try {
      // Create a testing account with Ethereal
      const testAccount = await nodemailer.createTestAccount();

      // Create a transporter with the test account
      transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });

      console.log("Ethereal test account created successfully");
      console.log("Ethereal credentials - User:", testAccount.user);
    } catch (error) {
      console.error("Failed to create Ethereal test account:", error);

      // Fallback to a nodemailer development transport that just logs messages
      transporter = nodemailer.createTransport({
        streamTransport: true,
        newline: "unix",
        buffer: true,
      });
    }
  }
}

// Initialize the transporter
(async () => {
  await initializeTransporter();
})();

async function ensureTransporterReady() {
  if (!transporter) {
    await initializeTransporter();
  }
}

function buildAppBaseUrl(req: Request) {
  const configured = process.env.BACKEND_URL;
  if (configured) return configured.replace(/\/$/, "");
  return `${req.protocol}://${req.get("host")}`;
}

async function sendVerificationEmail(params: {
  req: Request;
  to: string;
  token: string;
}) {
  const { req, to, token } = params;
  await ensureTransporterReady();

  const backendBase = buildAppBaseUrl(req);
  const verifyUrl = `${backendBase}/auth/verify-email?token=${encodeURIComponent(token)}`;

  const mailOptions = {
    from:
      process.env.NODE_ENV === "production"
        ? process.env.EMAIL_USER
        : "dev@example.com",
    to,
    subject: "ยืนยันอีเมลของคุณ (Verify your email)",
    html: `
      <div style="font-family: Arial, Helvetica, sans-serif; line-height: 1.6; color: #111;">
        <h1 style="margin: 0 0 12px;">ยืนยันอีเมลของคุณ(Verify your email)</h1>
        <p style="margin: 0 0 12px;">ขอบคุณที่สมัครใช้งาน Flexi </p>
        <p style="margin: 0 0 12px;">กรุณายืนยันอีเมลของคุณโดยคลิกปุ่มหรือลิงก์ด้านล่าง</p>
        <p style="margin: 0 0 12px;">ลิงก์นี้หมดอายุใน 24 ชั่วโมง </p>
        <p style="margin: 0;">หากคุณไม่ได้สร้างบัญชี คุณสามารถละเว้นอีเมลนี้ได้</p>
       
        <p style="margin: 0 0 16px;">
          <a
            href="${verifyUrl}"
            style="display: inline-block; padding: 10px 16px; background: #24d6af; color: #fff; text-decoration: none; border-radius: 6px;"
          >ยืนยันอีเมล (Verify Email)</a>
        </p>
        
        <p style="margin: 0 0 12px;">Thanks for signing up for Flexi.</p>
        <p style="margin: 0 0 12px;">Please verify your email by clicking the button or link above.</p>
        <p style="margin: 0 0 12px;">This link expires in 24 hours.</p>
        <p style="margin: 0;">If you did not create an account, you can ignore this email.</p>
      
      </div>
    `,
  };

  const info = await transporter.sendMail(mailOptions);

  if (process.env.NODE_ENV !== "production") {
    console.log("Verification email sent in development mode");
    if (nodemailer.getTestMessageUrl(info)) {
      console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    }
    if ((info as any).message) {
      console.log("Email content:", (info as any).message.toString());
    }
    console.log("Verify URL (for development testing):", verifyUrl);
  }
}

function mapRegisterError(err: unknown): {
  httpStatus: number;
  body: {
    message: string;
    reason: string;
    details?: Record<string, unknown>;
  };
} {
  const e = err as any;
  const code = typeof e?.code === "string" ? e.code : undefined;

  // Prisma KnownRequestError codes
  // P2002: Unique constraint failed
  if (code === "P2002") {
    return {
      httpStatus: 409,
      body: {
        message: "User already exists",
        reason: "UNIQUE_CONSTRAINT",
        details: {
          target: e?.meta?.target,
        },
      },
    };
  }

  // P2003: Foreign key constraint failed
  if (code === "P2003") {
    return {
      httpStatus: 400,
      body: {
        message: "Invalid reference. Please check related IDs.",
        reason: "FOREIGN_KEY_CONSTRAINT",
        details: {
          field: e?.meta?.field_name,
        },
      },
    };
  }

  const body: {
    message: string;
    reason: string;
    details?: Record<string, unknown>;
  } = {
    message: "Failed to register",
    reason: "INTERNAL_ERROR",
  };

  if (process.env.NODE_ENV !== "production") {
    body.details = {
      name: e?.name,
      code,
      message: e?.message,
    };
  }

  return { httpStatus: 500, body };
}

const register = async (req: Request, res: Response) => {
  const userInput: UserInput = req.body;

  // Honeypot trap: bots often fill hidden fields when posting directly to API.
  // Return fake success and do not create account.
  const honeypotWebsite =
    typeof req.body?.website === "string" ? req.body.website.trim() : "";
  if (honeypotWebsite.length > 0) {
    return res.status(200).json({
      status: "ok",
      message: "Registered successfully",
      emailVerificationRequired: true,
    });
  }

  const schema = Joi.object({
    email: Joi.string().email().required().messages({
      "string.email": "auth.register.backendErrors.validation.email",
      "any.required": "auth.register.backendErrors.validation.email",
    }),
    username: usernameSchema.required().min(4).max(30).messages({
      "string.min": "auth.register.backendErrors.validation.usernameMin",
      "string.max": "auth.register.backendErrors.validation.usernameMax",
      "any.required": "auth.register.backendErrors.validation.username",
    }),
    password: passwordSchema.required().messages({
        "any.required": "auth.register.backendErrors.validation.password",
    }),
    firstName: Joi.string().required().max(100).messages({
      "any.required": "auth.register.backendErrors.validation.firstName",
      "string.max": "auth.register.backendErrors.validation.firstName",
    }),
    lastName: Joi.string().required().max(100).messages({
      "any.required": "auth.register.backendErrors.validation.lastName",
      "string.max": "auth.register.backendErrors.validation.lastName",
    }),
    phone: Joi.string().required().length(10).messages({
      "string.length": "auth.register.backendErrors.validation.phone",
      "any.required": "auth.register.backendErrors.validation.phone",
    }),
    website: Joi.string().allow("").optional(),
  });
  const { error } = schema.validate(userInput);
  if (error) {
    const detail = error.details[0];
    return res.status(400).json({
      message: detail.message,
      reason: "VALIDATION_ERROR",
      details: {
        field: detail?.context?.key,
        path: Array.isArray(detail?.path) ? detail.path[0] : undefined,
        type: detail?.type,
        message: detail?.message,
      },
    });
  }
  try {
    // check if user already exists
    const existingUser = await Prisma.user.findUnique({
      where: {
        email: userInput.email.toLowerCase(),
      },
    });
    if (existingUser) {
      return res.status(400).json({
        status: "error",
        message: "auth.register.backendErrors.validation.userExists",
        reason: "USER_EXISTS",
      });
    }

    // Verify email domain exists (MX records)
    try {
      const domain = userInput.email.split("@")[1];
      if (!domain) throw new Error("Invalid email format");

      const mxRecords = await dnsPromises.resolveMx(domain);
      if (!mxRecords || mxRecords.length === 0) {
        return res.status(400).json({
          status: "error",
          message:
            "auth.register.backendErrors.validation.invalidEmailDomain",
          reason: "INVALID_EMAIL_DOMAIN",
          details: {
            field: "email",
             message: "Domain has no valid mail servers",
          },
        });
      }
    } catch (dnsError) {
      console.error("DNS MX lookup failed:", dnsError);
      return res.status(400).json({
        status: "error",
        message:
          "auth.register.backendErrors.validation.invalidEmailDomain",
        reason: "INVALID_EMAIL_DOMAIN",
        details: {
          field: "email",
          message: "Domain lookup failed",
        },
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(BCRYPT_ROUNDS);
    const hashedPassword = await bcrypt.hash(userInput.password, salt);

    // Email verification token (24 hours)
    const emailVerifyToken = crypto.randomBytes(32).toString("hex");
    const emailVerifyTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const user = await Prisma.user.create({
      data: {
        email: userInput.email.toLowerCase(),
        password: hashedPassword,
        firstName: userInput.firstName,
        lastName: userInput.lastName,
        phone: userInput.phone,
        username: userInput.username,
        // These fields exist in prisma/db1/schema1.prisma; keep cast to avoid breakage if client isn't regenerated yet
        ...({
          emailVerifiedAt: null,
          emailVerifyToken,
          emailVerifyTokenExpiry,
        } as any),
      },
    });

    // Send verification email (best-effort)
    try {
      await sendVerificationEmail({
        req,
        to: user.email,
        token: emailVerifyToken,
      });
    } catch (mailError) {
      console.error("Failed to send verification email:", mailError);
      
      // If email fails to send, delete the created user to prevent "ghost" accounts
      try {
        await Prisma.user.delete({
           where: { id: user.id }
        });
        console.log(`Deleted user ${user.email} due to email delivery failure.`);
      } catch (deleteError) {
        console.error("Failed to delete user after email error:", deleteError);
      }

      return res.status(400).json({
         status: "error",
         message: "This email address could not be reached. Please try another email.",
         reason: "EMAIL_SEND_FAILED",
          details: {
             field: "email",
             message: "Delivery failed",
          }
      });
    }
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
        emailVerifiedAt: (user as any).emailVerifiedAt ?? null,
      },
      token: token,
      emailVerificationRequired: true,
    });
  } catch (e) {
    console.error("Failed to register:", e);
    const mapped = mapRegisterError(e);
    return res.status(mapped.httpStatus).json(mapped.body);
  }
};

// Login function by prisma


const login = async (req: Request, res: Response) => {
  const userInput: UserInput = req.body;

  // Trim email from req.body (avoid login failures due to leading/trailing spaces)
  const normalizedEmail =
    typeof userInput?.email === "string" ? userInput.email.trim() : userInput?.email;

  const schema = Joi.object({
    email: Joi.string().trim().email().required().messages({
      "string.email": "auth.login.validation.email",
      "any.required": "auth.login.validation.email",
    }),
    password: Joi.string().required().messages({
      "any.required": "auth.login.validation.password",
    }),
  });

  const { error } = schema.validate({ ...userInput, email: normalizedEmail });
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  try {
    const user = await Prisma.user.findUnique({
      where: {
        email: normalizedEmail.toLowerCase(),
      },
    });
    if (!user) {
      return res.status(401).json({ message: "auth.login.backendErrors.invalidCredentials" });
    }
    const valid = await bcrypt.compare(userInput.password, user.password);
    if (!valid) {
      return res
        .status(401)
        .json({ message: "auth.login.backendErrors.invalidCredentials" });
    }
    // Generate JWT token
    const token = jwt.sign({ id: user.id }, "secret", tokenConfig);
    // find businessAcc by userId
    const businessAcc = await Prisma.businessAcc.findFirst({
      where: {
        userId: user.id,
      },
    });
    if (!businessAcc) {
      // Check if this user is a partner member of another business
      let partnerMember = await Prisma.member.findFirst({
        where: { userId: user.id },
        select: { uniqueId: true, businessId: true },
      });

      // If the member is already linked to a business, do a normal login
      if (partnerMember?.businessId) {
        const partnerBusiness = await Prisma.businessAcc.findUnique({
          where: { id: partnerMember.businessId },
        });
        if (partnerBusiness) {
          return res.json({
            status: "ok",
            message: "login successful",
            token,
            user: {
              id: user.id,
              email: user.email,
              firstName: user.firstName,
              lastName: user.lastName,
              avatar: user.avatar,
              phone: user.phone,
              bio: user.bio,
              username: user.username,
              memberId: partnerMember.uniqueId,
              businessId: partnerBusiness.id,
              emailVerifiedAt: (user as any).emailVerifiedAt ?? null,
            },
            emailVerificationRequired: !(user as any).emailVerifiedAt,
          });
        }
      }

      // No business linked — create a pending Member so the partner onboarding flow works
      if (!partnerMember) {
        partnerMember = await Prisma.member.create({
          data: {
            userId: user.id,
            permission: "member",
            role: "partner",
          },
          select: { uniqueId: true, businessId: true },
        });
      }
      return res.status(404).json({
        message: "Business account not found",
        token,
        user: { id: user.id, memberId: partnerMember.uniqueId },
      });
    }

    // Find the specific Member record for this user in their business
    const ownerMember = await Prisma.member.findFirst({
      where: { userId: user.id, businessId: businessAcc.id },
      select: { uniqueId: true },
    });

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
        memberId: ownerMember?.uniqueId ?? businessAcc.memberId[0],
        businessId: businessAcc.id,
        emailVerifiedAt: (user as any).emailVerifiedAt ?? null,
      },
      emailVerificationRequired: !(user as any).emailVerifiedAt,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "failed to login" });
  }
};

// Verify Email - token comes from email link
const verifyEmail = async (req: Request, res: Response) => {
  const token = (req.query.token as string) || (req.body?.token as string);

  const schema = Joi.object({
    token: Joi.string().required(),
  });
  const { error } = schema.validate({ token });
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  try {
    const user = await Prisma.user.findFirst({
      where: {
        ...({
          emailVerifyToken: token,
          emailVerifyTokenExpiry: { gt: new Date() },
          emailVerifiedAt: null,
        } as any),
      },
    });

    if (!user) {
      // Return HTML if request seems like a browser navigation
      if (
        req.method === "GET" &&
        (req.get("accept") || "").includes("text/html")
      ) {
        return res
          .status(400)
          .send(
            "<h1>Invalid or expired link</h1><p>Please request a new verification email.</p>",
          );
      }

      return res
        .status(400)
        .json({ message: "Invalid or expired verification token" });
    }

    await Prisma.user.update({
      where: { id: user.id },
      data: {
        ...({
          emailVerifiedAt: new Date(),
          emailVerifyToken: null,
          emailVerifyTokenExpiry: null,
        } as any),
      },
    });

    if (
      req.method === "GET" &&
      (req.get("accept") || "").includes("text/html")
    ) {
      return res
        .status(200)
        .send(
          "<h1>Email verified</h1><p>Your email is verified. You can return to the app.</p>",
        );
    }

    return res.status(200).json({ status: "ok", message: "Email verified" });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Failed to verify email" });
  }
};

// Resend verification email (privacy-preserving)
const resendVerificationEmail = async (req: Request, res: Response) => {
  const { email } = req.body;
  const schema = Joi.object({
    email: Joi.string().email().required(),
  });
  const { error } = schema.validate({ email });
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  try {
    const user = await Prisma.user.findUnique({
      where: { email },
    });

    // Always return OK to avoid account enumeration
    if (!user || (user as any).emailVerifiedAt) {
      return res.status(200).json({
        status: "ok",
        message:
          "If your email is registered, you will receive a verification link",
      });
    }

    const emailVerifyToken = crypto.randomBytes(32).toString("hex");
    const emailVerifyTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await Prisma.user.update({
      where: { id: user.id },
      data: {
        ...({
          emailVerifyToken,
          emailVerifyTokenExpiry,
        } as any),
      },
    });

    try {
      await sendVerificationEmail({
        req,
        to: user.email,
        token: emailVerifyToken,
      });
    } catch (mailError) {
      console.error("Failed to resend verification email:", mailError);
    }

    return res.status(200).json({
      status: "ok",
      message:
        "If your email is registered, you will receive a verification link",
    });
  } catch (e) {
    console.error(e);
    return res
      .status(500)
      .json({ message: "Failed to resend verification email" });
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
  if (typeof password !== "string" || !password.trim()) {
    return res.status(400).json({ message: "Password is required" });
  }

  try {
    // Find member and linked user (for password verification)
    const member = await Prisma.member.findUnique({
      where: {
        uniqueId: memberId,
      },
      select: {
        uniqueId: true,
        businessId: true,
        user: {
          select: {
            password: true,
          },
        },
      },
    });

    if (!member || !member.businessId) {
      return res.status(404).json({ message: "Business account not found" });
    }

    // Verify password from the authenticated member's user record
    const validPassword = await bcrypt.compare(password, member.user.password);
    if (!validPassword) {
      return res.status(401).json({ message: "Invalid password" });
    }

    const businessId = member.businessId;

    // Get all members in this business for dependent cleanups
    const businessMembers = await Prisma.member.findMany({
      where: { businessId },
      select: { uniqueId: true },
    });
    const memberIds = businessMembers.map((record) => record.uniqueId);

    await Prisma.$transaction(async (tx) => {
      // Chat and token cleanup for all members
      if (memberIds.length > 0) {
        await tx.chatMessage.deleteMany({
          where: {
            session: {
              userId: { in: memberIds },
            },
          },
        });

        await tx.chatSession.deleteMany({
          where: {
            userId: { in: memberIds },
          },
        });

        await tx.platformToken.deleteMany({
          where: {
            memberId: { in: memberIds },
          },
        });
      }

      // ProductItems must be deleted before Bills/Products
      await tx.productItem.deleteMany({
        where: {
          OR: [
            {
              bill: {
                businessAcc: businessId,
              },
            },
            {
              productList: {
                businessAcc: businessId,
              },
            },
          ],
        },
      });

      await tx.bill.deleteMany({
        where: {
          businessAcc: businessId,
        },
      });

      await tx.expense.deleteMany({
        where: {
          businessAcc: businessId,
        },
      });

      await tx.adsCost.deleteMany({
        where: {
          businessAcc: businessId,
        },
      });

      await tx.platform.deleteMany({
        where: {
          businessAcc: businessId,
        },
      });

      await tx.product.deleteMany({
        where: {
          businessAcc: businessId,
        },
      });

      await tx.documentCounter.deleteMany({
        where: {
          businessId,
        },
      });

      await tx.customer.deleteMany({
        where: {
          businessAcc: businessId,
        },
      });

      // Remove all members under this business before deleting the business account
      await tx.member.deleteMany({
        where: {
          businessId,
        },
      });

      await tx.businessAcc.delete({
        where: {
          id: businessId,
        },
      });
    });

    return res.status(200).json({
      message: "Business account and all related data deleted successfully",
    });
  } catch (e) {
    console.error(e);
    return res
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
    bio: Joi.string().optional().allow(""),
    username: usernameSchema.required(),
    password: Joi.string().required(),
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    avatar: Joi.string().optional().allow(""),
    phone: Joi.string().optional().min(10).max(10).allow(""),
  });
  const { error } = schema.validate(userInput);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  try {
    const salt = await bcrypt.genSalt(BCRYPT_ROUNDS);
    const hashedPassword = await bcrypt.hash(userInput.password, salt);
    const user = await Prisma.user.update({
      where: {
        id: Number(id),
      },
      data: {
        email: userInput.email,
        bio: userInput.bio,
        username: userInput.username,
        password: hashedPassword,
        firstName: userInput.firstName,
        lastName: userInput.lastName,
        avatar: userInput.avatar,
        phone: userInput.phone,
      },
    });
    // Generate JWT token
    const token = jwt.sign({ id: user.id }, "secret", tokenConfig);
    // Respond once with combined payload
    res.json({
      status: "ok",
      message: "User updated successfully",
      user: {
        id: user.id,
        email: user.email,
        bio: user.bio,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        avatar: user.avatar,
        phone: user.phone,
      },
      token,
    });
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

  if (!token || token === "null" || token === "undefined") {
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
  } catch (e: any) {
    // JWT errors are client/auth issues, not server errors
    if (
      e?.name === "JsonWebTokenError" ||
      e?.name === "TokenExpiredError" ||
      e?.name === "NotBeforeError"
    ) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    console.error(e);
    return res.status(500).json({ message: "failed to get session" });
  }
};

// Change User Password
const changePassword = async (req: Request, res: Response) => {
  const { id, currentPassword, newPassword } = req.body;

  const schema = Joi.object({
    id: Joi.number().required(),
    currentPassword: Joi.string().required(),
    newPassword: passwordSchema.required(),
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

    const salt = await bcrypt.genSalt(BCRYPT_ROUNDS);
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
        message:
          "If your email is registered, you will receive a password reset link",
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
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
      resetTokenConfig,
    );

    // Email content
    // Frontend uses Expo Router route: app/(auth)/reset_password.tsx
    const resetUrl = `${process.env.FRONTEND_URL || "http://localhost:3000"}/reset_password?token=${encodeURIComponent(jwtResetToken)}`;
    const mailOptions = {
      from:
        process.env.NODE_ENV === "production"
          ? process.env.EMAIL_USER
          : "dev@example.com",
      to: user.email,
      subject: "รีเซ็ตรหัสผ่าน (Password Reset Request)",
      html: `
      <div style="font-family: Arial, Helvetica, sans-serif; line-height: 1.6; color: #111;">
        <h1 style="margin: 0 0 12px;">รีเซ็ตรหัสผ่าน (Password Reset)</h1>
        
        <p style="margin: 0 0 12px;">คุณได้ทำการขอรีเซ็ตรหัสผ่าน กรุณาคลิกปุ่มด้านล่างเพื่อตั้งรหัสผ่านใหม่:</p>
        <p style="margin: 0 0 12px;">ลิงก์นี้มีอายุการใช้งาน 1 ชั่วโมง</p>
        <p style="margin: 0 0 16px;">หากคุณไม่ได้ดำเนินการนี้ โปรดเพิกเฉยต่ออีเมลฉบับนี้</p>

        <p style="margin: 0 0 16px;">
          <a
            href="${resetUrl}"
            style="display: inline-block; padding: 10px 16px; background: #24d6af; color: #fff; text-decoration: none; border-radius: 6px;"
          >รีเซ็ตรหัสผ่าน (Reset Password)</a>
        </p>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />

        <p style="margin: 0 0 12px;">You requested a password reset. Please click the button above to reset your password.</p>
        <p style="margin: 0 0 12px;">This link is valid for 1 hour.</p>
        <p style="margin: 0;">If you did not request a password reset, please ignore this email.</p>
      </div>
      `,
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);

    // In development mode, log the test email URL
    if (process.env.NODE_ENV !== "production") {
      console.log("Password reset email sent in development mode");

      // Check if we have a preview URL from Ethereal
      if (nodemailer.getTestMessageUrl(info)) {
        console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
      }

      // If using stream transport, show the message content
      if (info.message) {
        console.log("Email content:", info.message.toString());
      }

      console.log("Reset URL (for development testing):", resetUrl);
    }

    res.status(200).json({
      status: "ok",
      message:
        "If your email is registered, you will receive a password reset link",
    });
  } catch (e) {
    console.error(e);
    res
      .status(500)
      .json({ message: "Failed to process password reset request" });
  }
};

// Reset Password - Validates token and updates password
const resetPassword = async (req: Request, res: Response) => {
  const tokenInput = req.body?.token;
  const newPassword = req.body?.newPassword;
  // Some email clients wrap long URLs and introduce whitespace/newlines.
  const token =
    typeof tokenInput === "string"
      ? tokenInput.replace(/\s+/g, "")
      : tokenInput;
  // console.log("Reset Password called with token:", token);
  // console.log("New Password:", newPassword);

  // Validate input
  const schema = Joi.object({
    token: Joi.string().required(),
    newPassword: passwordSchema.required(),
  });

  const { error } = schema.validate({ token, newPassword });
  if (error) {
    return res
      .status(400)
      .json({ message: error.details[0].message, reason: "VALIDATION_ERROR" });
  }

  try {
    // Verify JWT token
    const decoded = jwt.verify(token, "reset-secret") as {
      id: number;
      token: string;
    };

    // Load the user first so we can provide clearer client-facing messages.
    const userById = await Prisma.user.findUnique({
      where: { id: decoded.id },
    });

    if (!userById) {
      return res
        .status(400)
        .json({
          message: "Invalid or expired reset token",
          reason: "USER_NOT_FOUND",
        });
    }

    // If the token was cleared, it was either already used or never requested.
    if (!userById.resetToken || !userById.resetTokenExpiry) {
      return res
        .status(400)
        .json({
          message:
            "Reset link is no longer valid. Please request a new reset link.",
          reason: "RESET_TOKEN_CLEARED",
        });
    }

    // If the stored reset token doesn't match, the user requested a newer link.
    if (userById.resetToken !== decoded.token) {
      return res
        .status(400)
        .json({
          message:
            "This reset link has been replaced by a newer one. Please request a new reset link.",
          reason: "RESET_TOKEN_MISMATCH",
        });
    }

    // Expiry check
    if (userById.resetTokenExpiry.getTime() <= Date.now()) {
      return res
        .status(400)
        .json({
          message: "Reset link has expired. Please request a new reset link.",
          reason: "RESET_TOKEN_EXPIRED",
        });
    }

    // At this point, token is valid and matches DB.
    const user = userById;

    // Hash new password
    const salt = await bcrypt.genSalt(BCRYPT_ROUNDS);
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
  } catch (e: any) {
    // JWT errors should be treated as client errors
    if (
      e?.name === "JsonWebTokenError" ||
      e?.name === "TokenExpiredError" ||
      e?.name === "NotBeforeError"
    ) {
      return res
        .status(400)
        .json({
          message: "Invalid or expired reset token",
          reason: e?.name || "JWT_ERROR",
        });
    }

    console.error(e);
    return res.status(500).json({ message: "Failed to reset password" });
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
  resetPassword,
  verifyEmail,
  resendVerificationEmail,
};
