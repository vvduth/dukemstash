import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID!;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID!;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY!;

export const R2_BUCKET = process.env.R2_BUCKET_NAME!;

export const r2Client = new S3Client({
  region: "auto",
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

export async function deleteR2Object(key: string) {
  await r2Client.send(
    new DeleteObjectCommand({ Bucket: R2_BUCKET, Key: key })
  );
}

// File validation constants
export const IMAGE_MAX_SIZE = 5 * 1024 * 1024; // 5 MB
export const FILE_MAX_SIZE = 10 * 1024 * 1024; // 10 MB

export const IMAGE_EXTENSIONS = [".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg"];
export const FILE_EXTENSIONS = [".pdf", ".txt", ".md", ".json", ".yaml", ".yml", ".xml", ".csv", ".toml", ".ini"];

export const IMAGE_MIME_TYPES = [
  "image/png",
  "image/jpeg",
  "image/gif",
  "image/webp",
  "image/svg+xml",
];

export const FILE_MIME_TYPES = [
  "application/pdf",
  "text/plain",
  "text/markdown",
  "application/json",
  "application/x-yaml",
  "text/yaml",
  "application/xml",
  "text/xml",
  "text/csv",
  "application/toml",
];

export function getAcceptString(type: "image" | "file"): string {
  if (type === "image") {
    return IMAGE_MIME_TYPES.join(",");
  }
  return FILE_MIME_TYPES.join(",");
}

export function validateFile(
  file: { name: string; size: number; type: string },
  itemType: "image" | "file"
): string | null {
  const maxSize = itemType === "image" ? IMAGE_MAX_SIZE : FILE_MAX_SIZE;
  const allowedMimes = itemType === "image" ? IMAGE_MIME_TYPES : FILE_MIME_TYPES;
  const allowedExts = itemType === "image" ? IMAGE_EXTENSIONS : FILE_EXTENSIONS;

  if (file.size > maxSize) {
    const maxMB = maxSize / (1024 * 1024);
    return `File size exceeds ${maxMB} MB limit`;
  }

  const ext = "." + file.name.split(".").pop()?.toLowerCase();
  if (!allowedExts.includes(ext)) {
    return `File type not allowed. Accepted: ${allowedExts.join(", ")}`;
  }

  // Also check MIME type (but allow empty/octet-stream for some edge cases)
  if (file.type && file.type !== "application/octet-stream" && !allowedMimes.includes(file.type)) {
    return `MIME type "${file.type}" not allowed`;
  }

  return null;
}
