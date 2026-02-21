import { Request } from "express"
import multer, { FileFilterCallback } from "multer";
import fs from "fs"
import multerS3 from "multer-s3"
import { s3 } from "../libs/s3" // AWS S3 Client ที่ตั้งไว้
import { v4 as uuidv4 } from "uuid"

const imageFileFilter = (
  _req: Request,
  file: Express.Multer.File,
  callback: FileFilterCallback
) => {
  if (file.mimetype.startsWith("image/")) {
    callback(null, true)
  } else {
    callback(new Error("Not an image! Please upload an image."))
  }
}

// Prefer S3 storage when configuration is present; fallback to memory to avoid runtime crashes
const hasS3Config = Boolean(
  process.env.BUCKET_NAME &&
  process.env.BUCKET_REGION &&
  process.env.ACCESS_KEY &&
  process.env.SECRET_ACCESS_KEY
)

const storageImageS3 = hasS3Config
  ? multerS3({
      s3,
      bucket: process.env.BUCKET_NAME as string,
      contentType: multerS3.AUTO_CONTENT_TYPE,
      acl: 'private', // ถ้าอยาก public เปลี่ยนเป็น 'public-read'
      key: (_req, file, cb) => {
        const filename = `${file.fieldname}-${Date.now()}-${uuidv4()}`
        const ext = file.mimetype.split("/")[1]
        cb(null, `uploads/${filename}.${ext}`)
      },
    })
  : undefined

const storageImageMemory = multer.memoryStorage()

const attachmentFileFilter = (
  _req: Request,
  file: Express.Multer.File,
  callback: FileFilterCallback
) => {
  const isImage = (file.fieldname === "image" || file.fieldname === "invoiceImage") && file.mimetype.startsWith("image/")
  const isPdf = (file.fieldname === "pdf" || file.fieldname === "invoicePdf") && file.mimetype === "application/pdf"

  if (isImage || isPdf) {
    callback(null, true)
  } else {
    callback(
      new Error("Unsupported file type! Please upload an image or PDF document.")
    )
  }
}

export const multerConfigImage = {
  config: {
    storage: storageImageS3 ?? multer.memoryStorage(),
    limits: { fileSize: 1024 * 1024 * 10 }, 
    fileFilter: imageFileFilter,
  },
  keyUpload: "image",
}

export const multerConfigImageMemory = {
  config: {
    storage: storageImageMemory,
    limits: { fileSize: 1024 * 1024 * 10 }, 
    fileFilter: imageFileFilter,
  },
  keyUpload: "image",
}

export const multerConfigExpenseAttachmentMemory = {
  config: {
    storage: storageImageMemory,
    limits: { fileSize: 1024 * 1024 * 10 },
    fileFilter: attachmentFileFilter,
  },
  imageKeyUpload: "image",
  pdfKeyUpload: "pdf",
}

export const multerConfigAvatar = {
  config: {
    storage: storageImageS3 ?? multer.memoryStorage(),
    limits: { fileSize: 1024 * 1024 * 10 },
    fileFilter: imageFileFilter,
  },
  keyUpload: "businessAvatar",
}


// PDF-specific storage 
// Not Store in Long Memory 
// Not in AWS S3
const folderPDF = "./uploads/pdf/"
if (!fs.existsSync(folderPDF)) {
  fs.mkdirSync(folderPDF)
}

const storagePDF = multer.diskStorage({
  destination: (
    req: Request,
    file: Express.Multer.File,
    callback: (error: Error | null, destination: string) => void
  ) => {
    try {
      // Ensure folder exists (best-effort). Never pass an error to the callback.
      if (!fs.existsSync(folderPDF)) {
        fs.mkdirSync(folderPDF, { recursive: true })
      }
      callback(null, folderPDF)
    } catch (e) {
      // swallow errors and fallback to a safe temp folder
      const fallback = "/tmp/uploads/pdf/"
      try {
        if (!fs.existsSync(fallback)) {
          fs.mkdirSync(fallback, { recursive: true })
        }
      } catch {
        // intentionally ignore
      }
      callback(null, fallback)
    }
  },
  filename: (
    req: Request,
    file: Express.Multer.File,
    callback: (error: Error | null, filename: string) => void
  ) => {
    try {
      const ext = (file.mimetype && file.mimetype.split("/")[1]) || "pdf"
      const name = `${file.fieldname}-${Date.now()}-${uuidv4()}.${ext}`
      callback(null, name)
    } catch {
      // fallback name, never return an error
      callback(null, `file-${Date.now()}.pdf`)
    }
  },
})

const fileFilterPDF = (
  req: Request,
  file: Express.Multer.File,
  callback: FileFilterCallback
) => {
  if (file.mimetype === "application/pdf") {
    callback(null, true)
  } else {
    callback(new Error("Not a PDF! Please upload a PDF."))
  }
}

// Delete file PDF
export const deleteFilePDF = (filePath: string) => {
  fs.unlink(filePath, (err) => {
    if (err) {
      console.error(err)
      return
    }
    console.log("File deleted")
  })
}

// Export PDF config
export const pdfMulterConfig = {
  config: {
    storage: storagePDF,
    limits: { fileSize: 1024 * 1024 * 10 },
    fileFilter: fileFilterPDF,
  },
  keyUpload: "filePath",
}




export default { multerConfigImage, pdfMulterConfig, multerConfigAvatar, multerConfigImageMemory, multerConfigExpenseAttachmentMemory }
