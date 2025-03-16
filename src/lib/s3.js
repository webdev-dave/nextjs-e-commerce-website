import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Configure S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION ?? "us-east-1",
  credentials:
    process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY
      ? {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        }
      : undefined,
  // For local development, you can use a local S3-compatible service like MinIO
  ...(process.env.S3_ENDPOINT ? { endpoint: process.env.S3_ENDPOINT } : {}),
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME ?? "my-bucket-name-placeholder";

// Upload file to S3
export async function uploadFileToS3(file, key) {
  const buffer = Buffer.from(await file.arrayBuffer());

  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: buffer,
    ContentType: file.type,
  });

  await s3Client.send(command);
  return `s3://${BUCKET_NAME}/${key}`;
}

// Delete file from S3
export async function deleteFileFromS3(key) {
  if (!key.startsWith("s3://")) return;

  const s3Key = key.replace(`s3://${BUCKET_NAME}/`, "");
  const command = new DeleteObjectCommand({
    Bucket: BUCKET_NAME,
    Key: s3Key,
  });

  await s3Client.send(command);
}

// Get file from S3 (for server-side operations)
export async function getFileFromS3(key) {
  if (!key.startsWith("s3://")) return null;

  const s3Key = key.replace(`s3://${BUCKET_NAME}/`, "");
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: s3Key,
  });

  const response = await s3Client.send(command);
  if (!response.Body) return null;

  return Buffer.from(await response.Body.transformToByteArray());
}

// Generate a presigned URL (for client-side access)
export async function getSignedDownloadUrl(key, expiresIn = 3600) {
  if (!key.startsWith("s3://")) return null;

  const s3Key = key.replace(`s3://${BUCKET_NAME}/`, "");
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: s3Key,
  });

  return await getSignedUrl(s3Client, command, { expiresIn });
}

// Check if a path is an S3 path
export function isS3Path(path) {
  return path.startsWith("s3://");
}
