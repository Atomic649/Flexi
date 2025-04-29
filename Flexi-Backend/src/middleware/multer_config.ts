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

const storageImageS3 = multerS3({
  s3,
  bucket: process.env.BUCKET_NAME!,
  contentType: multerS3.AUTO_CONTENT_TYPE,
  acl: 'private', // ถ้าอยาก public เปลี่ยนเป็น 'public-read'
  key: (_req, file, cb) => {  
    const filename = `${file.fieldname}-${Date.now()}-${uuidv4()}`
    const ext = file.mimetype.split("/")[1]
    cb(null, `uploads/${filename}.${ext}`)
  },
})

export const multerConfigImage = {
  config: {
    storage: storageImageS3,
    limits: { fileSize: 1024 * 1024 * 10 }, 
    fileFilter: imageFileFilter,
  },
  keyUpload: "image",
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
    callback(null, folderPDF)
  },
  filename: (
    req: Request,
    file: Express.Multer.File,
    callback: (error: Error | null, filename: string) => void
  ) => {
    const ext = file.mimetype.split("/")[1]
    callback(null, `${file.fieldname}-${Date.now()}.${ext}`)
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




export default { multerConfigImage, pdfMulterConfig }
