import { writePrivateBlob } from "@/lib/uploads/storage-backend";

export async function savePrivateUpload(
  folder: string,
  file: File,
): Promise<{
  storageKey: string;
  byteSize: number;
  checksumSha256: string;
  blobUrl: string | null;
}> {
  const bytes = Buffer.from(await file.arrayBuffer());
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const storageKey = `${folder}/${Date.now()}-${safeName}`;
  const mimeType = file.type || "application/octet-stream";
  return writePrivateBlob(storageKey, bytes, mimeType);
}