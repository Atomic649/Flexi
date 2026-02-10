import { DeleteObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { s3 } from "../libs/s3" // AWS S3 Client ที่ตั้งไว้
import { v4 as uuidv4 } from "uuid";

// Helper สำหรับลบไฟล์ S3
const deleteFromS3 = async (key: string) => {
  const command = new DeleteObjectCommand({
    Bucket: process.env.BUCKET_NAME!,
    Key: key,
  });
  return s3.send(command);
  };

// Helper ดึง key จาก full URL
const extractS3Key = (url: string): string => {
  if (!url || typeof url !== "string") return "";
  try {
    const parsed = new URL(url);
    return parsed.pathname.replace(/^\/+/, ""); // ตัด '/' ด้านหน้า
  } catch {
    // If it's already a key/path (not a full URL), just normalize leading slashes
    return url.replace(/^\/+/, "");
  }
};

// Helper สำหรับอัพโหลดไฟล์ไป S3
const uploadToS3 = async (buffer: Buffer, mimetype: string, fieldname: string = "image"): Promise<string> => {
  const filename = `${fieldname}-${Date.now()}-${uuidv4()}`;
  const ext = mimetype.split("/")[1];
  const key = `uploads/${filename}.${ext}`;
  
  const command = new PutObjectCommand({
    Bucket: process.env.BUCKET_NAME!,
    Key: key,
    Body: buffer,
    ContentType: mimetype,
    ACL: 'private',
  });
  
  await s3.send(command);
  return `https://${process.env.BUCKET_NAME}.s3.${process.env.AWS_REGION || 'ap-southeast-2'}.amazonaws.com/${key}`;
};

export { deleteFromS3, extractS3Key, uploadToS3 };
