import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import Joi from "joi";
import multer from "multer";
import multerConfig from "./multer_config";

const upload = multer(multerConfig.multerConfigImage.config).single(multerConfig.multerConfigImage.keyUpload);

// Create  instance of PrismaClient
const prisma = new PrismaClient()


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
    image: Joi.string().optional(),
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
      console.log("image", req.file?.filename);
  
      // Merge the uploaded file name into the product object
      const product: Product = {
        ...req.body,
        image: req.file?.filename ?? "",
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
      });

      // convert stock to integer
        product.stock = parseInt(product.stock.toString());
        product.price = parseInt(product.price.toString());
        
  
      try {
        const newProduct = await prisma.product.create({
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
    
    // Merge the uploaded file name (if any) into the product object
    const product: Product = {
      ...req.body,
      image: req.file?.filename ?? req.body.image ?? "",
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


// Delete product by ID set Delete status to true
const deleteProduct = async (req: Request, res: Response) => {
    const { id } = req.params
    try {
        const deletedProduct = await prisma.product.update({
            where: {
                id: Number(id)
            },
            data: {
               deleted: true
            }
        })
        res.json({ message: "success", product: deletedProduct.deleted })
    } catch (e) {
        console.error(e)
        res.status(500).json({ message: "failed to delete product" })
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