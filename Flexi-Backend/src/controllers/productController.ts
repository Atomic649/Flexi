import { Request, Response } from "express";
import { PrismaClient as PrismaClient1 } from "../generated/client1";
import Joi from "joi";
import multer from "multer";
import multerConfig from "../middleware/multer_config";
import { deleteFromS3, extractS3Key } from "../services/imageService";

const upload = multer(multerConfig.multerConfigImage.config).single(multerConfig.multerConfigImage.keyUpload);

// Create  instance of PrismaClient
const prisma = new PrismaClient1()


// Interface for request body from client
interface Product {
    name: string
    description: string
    barcode: string
    image: string
    stock: number
    price: number
    categoryId: number   
    statusId: number
    memberId: string
   
}

// Validation schema for request body
const productSchema = Joi.object({
    name: Joi.string().required(),
    description: Joi.string().required(),
    barcode: Joi.string().required(),
    image: Joi.string().allow("").optional(), // Allow empty string for image
    stock: Joi.number().required(),
    price: Joi.number().required(),
    categoryId: Joi.number(),
    statusId: Joi.number(),
    memberId: Joi.string().required(),
    
})

// Create product
const createProduct = async (req: Request, res: Response) => {
    upload(req, res, async (err: any) => {
      if (err) {
        return res.status(400).json({ message: err.message });
      }
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
  
      // Find businessId by memberId
      const businessAcc = await prisma.businessAcc.findFirst({
        where: {
          memberId: product.memberId,
        },
        select: {
          id: true,
        },
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
            statusId: product.statusId,
            memberId: product.memberId,
            businessAcc: businessAcc?.id ?? 0,
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
    const { memberId } = req.params
    try {
        const products = await prisma.product.findMany({
            where: {
                memberId: memberId,
                deleted: false
            },
        })
        res.json(products)
    } catch (e) {
        console.error(e)
        res.status(500).json({ message: "failed to get products" })
    }
}
// Get product by ID
const getProductById = async (req: Request, res: Response) => {
    const { id } = req.params
    try {
        const product = await prisma.product.findUnique({
            where: {
                id: Number(id)
            }
        })
        res.json(product)
    } catch (e) {
        console.error(e)
        res.status(500).json({ message: "failed to get product" })
    }
}

// Update product
const updateProduct = async (req: Request, res: Response) => {
  upload(req, res, async (err: any) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }

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

    // Merge the uploaded file name (if any) into the product object
    const product: Product = {
      ...req.body,
      image: (req.file as any)?.location ?? existingProduct.image, // Use new image or keep the old one
    };

    // validate the request body
    const schema = Joi.object({
      name: Joi.string(),
      description: Joi.string(),
      barcode: Joi.string(),
      image: Joi.string().optional(),
      stock: Joi.number(),
      price: Joi.number(),
      categoryId: Joi.number(),
      statusId: Joi.number(),
      memberId: Joi.string(),
    });

    const { error } = schema.validate(product);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }
    // convert stock to integer
    product.stock = parseInt(product.stock.toString());
    product.price = parseInt(product.price.toString());

    try {
      const updatedProduct = await prisma.product.update({
        where: {
          id: Number(req.params.id),
        },
        data: {
          name: product.name,
          description: product.description,
          barcode: product.barcode,
          image: product.image,
          stock: product.stock,
          price: product.price,
          categoryId: product.categoryId,
          statusId: product.statusId,
          memberId: product.memberId,
        },
      });
      res.json(updatedProduct);
    } catch (e) {
      console.error(e);
      res.status(500).json({ message: "failed to update product" });
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
      select:{
        image: true,
      }
    });

    if (!existingProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

// // Delete the image from S3
//     if (existingProduct.image) {
//       const imageKey = extractS3Key(existingProduct.image);
//       try {
//         await deleteFromS3(imageKey);
//       } catch (e) {
//         console.error("Failed to delete image from S3:", e);
//       }
//     }

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
}

// Get Product Name by Member ID
const getProductChoice = async (req: Request, res: Response) => {
    const { memberId } = req.params
    try {
        const products = await prisma.product.findMany({
            where: {
                memberId: memberId,
                deleted: false
            },
            select:{               
                name: true
            }
        })
        res.json(products)
    } catch (e) {
        console.error(e)
        res.status(500).json({ message: "failed to get products" })
    }
}

export { createProduct,  getProductById, updateProduct, deleteProduct, getProductByMemberId,getProductChoice  }