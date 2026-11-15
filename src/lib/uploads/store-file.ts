import { prisma } from "@/lib/db";
import { savePrivateUpload } from "@/lib/uploads/save-file";

export async function storeUploadedFile(file: File, folder: string) {
  const saved = await savePrivateUpload(folder, file);
  return prisma.storedFile.create({
    data: {
      storageKey: saved.storageKey,
      blobUrl: saved.blobUrl,
      originalFilename: file.name,
      mimeType: file.type || "application/octet-stream",
      byteSize: saved.byteSize,
      checksumSha256: saved.checksumSha256,
    },
  });
}

const EXPENSE_BILL_MAX_BYTES = 10 * 1024 * 1024;

const EXPENSE_BILL_MIME_PREFIXES = ["image/"] as const;
const EXPENSE_BILL_MIME_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/heic",
  "image/heif",
]);

export function validateExpenseBillFile(file: File): string | null {
  if (file.size === 0) return "Empty file";
  if (file.size > EXPENSE_BILL_MAX_BYTES) {
    return "File must be 10 MB or smaller";
  }
  const type = file.type || "application/octet-stream";
  const ok =
    EXPENSE_BILL_MIME_TYPES.has(type) ||
    EXPENSE_BILL_MIME_PREFIXES.some((p) => type.startsWith(p));
  if (!ok) {
    return "Upload a PDF or image (JPEG, PNG, WebP)";
  }
  return null;
}
