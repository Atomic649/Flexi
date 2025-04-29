import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { s3 } from "../libs/s3" // AWS S3 Client ที่ตั้งไว้

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
  const parsed = new URL(url);
  return parsed.pathname.substring(1); // ตัด '/' ด้านหน้า
};

export { deleteFromS3, extractS3Key };
