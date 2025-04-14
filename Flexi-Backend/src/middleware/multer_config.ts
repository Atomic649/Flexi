import { Request } from "express"
import multer, { FileFilterCallback } from "multer";
import fs from "fs"

const storage = multer.diskStorage({
  destination: (
    req: Request,
    file: Express.Multer.File,
    callback: (error: Error | null, destination: string) => void
  ) => {
    const folder = "./uploads/images/"
    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder)
    }
    callback(null, folder)
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

const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  callback: FileFilterCallback
) => {
  if (file.mimetype.startsWith("image/")) {
    callback(null, true)
  } else {
    callback(new Error("Not an image! Please upload an image."))
  }
}

const multerConfigImage = {
  config: {
    storage,
    limits: { fileSize: 1024 * 1024 * 10 }, 
    fileFilter,
  },
  keyUpload: "image", // Ensure this matches the key used in the form data
};



// PDF-specific storage
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
