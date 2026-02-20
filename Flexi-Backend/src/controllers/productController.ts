import { Request, Response } from "express";
import {
  PrismaClient as PrismaClient1,
  ProductType,
  Unit,
} from "../generated/client1/client";
import Joi from "joi";
import multer from "multer";
import multerConfig from "../middleware/multer_config";
import { deleteFromS3, extractS3Key } from "../services/imageService";
import { flexiDBPrismaClient } from "../../lib/PrismaClient1";

const upload = multer(multerConfig.multerConfigImage.config).single(
  multerConfig.multerConfigImage.keyUpload
);

const prisma = flexiDBPrismaClient;

// Interface for request body from client
interface Product {
  name: string;
  description?: string;
  barcode?: string | null;
  image: string;
  stock: number;
  price: number;
  categoryId: number;
  statusId: number;
  memberId: string;
  unit?: Unit; // Optional field for unit
  productType: ProductType;
}

// Validation schema for request body
const productSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().allow("").optional(),
  barcode: Joi.string().allow("").optional(), // Allow empty string for barcode
  image: Joi.string().allow("").optional(), // Allow empty string for image
  stock: Joi.number().allow(null).required(), // Allow null for stock
  price: Joi.number().required(),
  categoryId: Joi.number(),
  statusId: Joi.number(),
  memberId: Joi.string().required(),
  unit: Joi.string().valid(...Object.values(Unit)).optional(), // Validate against Unit enum
  productType: Joi.string().valid(...Object.values(ProductType)).optional(), // Validate against ProductType enum
});

// Create product
const createProduct = async (req: Request, res: Response) => {
  upload(req, res, async (err: any) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }

    // Debugging: Log the uploaded file details
    console.log("Uploaded file:", req.file);

    // Merge the uploaded file S3 key into the product object
    const product: Product = {
      ...req.body,
      image: (req.file as any)?.location ?? "", // Use type assertion for custom property
    };

    // Validate combined product fields
    const { error } = productSchema.validate(product);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    if (typeof product.barcode === "string") {
      const trimmedBarcode = product.barcode.trim();
      product.barcode = trimmedBarcode.length > 0 ? trimmedBarcode : null;
    }

// Find business ID by member ID from member table
    const businessAcc = await prisma.member.findUnique({
      where : { uniqueId: product.memberId },
      select:{ businessId: true },
    });

    // Convert stock and price to integers
    product.stock = parseInt(product.stock.toString());
    product.price = parseInt(product.price.toString());

    try {
      const newProduct = await prisma.product.create({
        data: {
          name: product.name,
          description: product.description,
          barcode: product.barcode,
          image: product.image || null, // Store null if no image is provided
          stock: product.stock,
          price: product.price,
          categoryId: product.categoryId,
          memberId: product.memberId,
          businessAcc: businessAcc?.businessId ?? 0,
          unit: product.unit || Unit.Piece, // Default to PIECE if not provided
          productType: product.productType || ProductType.Product, // Default to Product if not provided
        },
      });      
      res.status(201).json(newProduct);
    } catch (e) {
      console.error(e);
      res.status(500).json({ message: "failed to create product" });
    }
  });
};

// get all Product Name list by memberid
const getProductByMemberId = async (req: Request, res: Response) => {
  const { memberId } = req.params;


  try {
      // Find business ID by member ID from member table
    const businessId = await prisma.member.findUnique({
      where : { uniqueId: memberId },
      select:{ businessId: true },
    });

    const products = await prisma.product.findMany({
      where: {
        businessAcc : businessId?.businessId ?? 0,
        deleted: false,
      },
    });
    res.json(products);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "failed to get products" });
  }
};
// Get product by ID
const getProductById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const product = await prisma.product.findUnique({
      where: {
        id: Number(id),
      },
    });
    res.json(product);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "failed to get product" });
  }
};

// Update product
const updateProduct = async (req: Request, res: Response) => {
  upload(req, res, async (err: any) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }

    // Debugging: Log the uploaded file details
    console.log("Uploaded file:", req.file);

    // Fetch the existing product to get the current image URL
    const existingProduct = await prisma.product.findUnique({
      where: { id: Number(req.params.id) },
    });

    if (!existingProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Delete the old image from S3 if a new image is uploaded
    if (req.file && existingProduct.image) {
      const oldImageKey = extractS3Key(existingProduct.image);
      try {
        await deleteFromS3(oldImageKey);
        console.log("Old image deleted from S3");
      } catch (e) {
        console.error("Failed to delete old image from S3:", e);
      }
    }

    // Update the product with the new image URL if a new file is uploaded
    // or keep the existing image if no new file
    const updateData = {
      ...req.body,
      image: req.file ? (req.file as any)?.location : existingProduct.image,
    } as Record<string, any>;

    // Convert stock and price to integers
    updateData.stock = parseInt(updateData.stock?.toString() || existingProduct.stock.toString());
    updateData.price = parseInt(updateData.price?.toString() || existingProduct.price.toString());

    const hasBarcodeField = Object.prototype.hasOwnProperty.call(updateData, "barcode");
    let resolvedBarcode = existingProduct.barcode;

    if (hasBarcodeField) {
      const incomingBarcode = updateData.barcode;

      if (typeof incomingBarcode === "string") {
        const trimmedBarcode = incomingBarcode.trim();
        resolvedBarcode = trimmedBarcode.length > 0 ? trimmedBarcode : null;
      } else if (incomingBarcode === null || incomingBarcode === undefined) {
        resolvedBarcode = null;
      } else {
        resolvedBarcode = incomingBarcode;
      }
    }

    try {
      const updatedProduct = await prisma.product.update({
        where: {
          id: Number(req.params.id),
        },
        data: {
          name: updateData.name || existingProduct.name,
          description: updateData.description || existingProduct.description,
          barcode: resolvedBarcode,
          image: updateData.image,
          stock: updateData.stock,
          price: updateData.price,
          unit: updateData.unit || existingProduct.unit,
          productType: updateData.productType || existingProduct.productType,
        },
      });
      
      console.log("Updated product:", updatedProduct);
      res.json(updatedProduct);
    } catch (e) {
      console.error("Error updating product:", e);
      res.status(500).json({ message: "Failed to update product" });
    }
  });
};

// Delete product by ID and delete image from S3
const deleteProduct = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    // Fetch the existing product to get the current image URL
    const existingProduct = await prisma.product.findUnique({
      where: { id: Number(id) },
      select: {
        image: true,
      },
    });

    if (!existingProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Delete the image from S3 if it exists
    if (existingProduct.image) {
      const imageKey = extractS3Key(existingProduct.image);
      try {
        await deleteFromS3(imageKey);
        console.log("Product image deleted from S3");
      } catch (e) {
        console.error("Failed to delete image from S3:", e);
      }
    }

    // Mark the product as deleted
    const deletedProduct = await prisma.product.update({
      where: {
        id: Number(id),
      },
      data: {
        deleted: true,
      },
    });

    res.json({ message: "success", product: deletedProduct.deleted });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "failed to delete product" });
  }
};

// Get Product Name by Member ID
const getProductChoice = async (req: Request, res: Response) => {
  const { memberId } = req.params;
  try {
    const products = await prisma.product.findMany({
      where: {
        memberId: memberId,
        deleted: false,
      },
      select: {
        name: true,
      },
    });
    res.json(products);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "failed to get products" });
  }
};

// Get Product Name by Member ID
const getProductChoiceWithId = async (req: Request, res: Response) => {
  const { memberId } = req.params;
  try {
    const products = await prisma.product.findMany({
      where: {
        memberId: memberId,
        deleted: false,
      },
      select: {
        name: true,
        id: true,
      },
    });
    res.json(products);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "failed to get products" });
  }
};

// Get ProductChoice with price
const getProductChoiceWithPrice = async (req: Request, res: Response) => {
  const { memberId } = req.params;
  try {
    const products = await prisma.product.findMany({
      where: {
        memberId: memberId,
        deleted: false,
      },
      select: {
        id: true,
        name: true,
        price: true,
        unit: true,
      },
    });
    res.json(products);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "failed to get products" });
  }
};

export {
  createProduct,
  getProductById,
  updateProduct,
  deleteProduct,
  getProductByMemberId,
  getProductChoice,
  getProductChoiceWithPrice,
  getProductChoiceWithId,
};
