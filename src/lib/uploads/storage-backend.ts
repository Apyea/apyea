import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { put } from "@vercel/blob";

const UPLOAD_ROOT = path.join(process.cwd(), "uploads");

export function usesBlobStorage(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN?.trim());
}

function assertCanWriteLocally(): void {
  if (process.env.VERCEL === "1" && !usesBlobStorage()) {
    throw new Error(
      "File uploads on Vercel require BLOB_READ_WRITE_TOKEN. Add a Blob store in the Vercel project → Storage → Environment Variables.",
    );
  }
}

export type StoredBlob = {
  storageKey: string;
  byteSize: number;
  checksumSha256: string;
  blobUrl: string | null;
};

export async function writePrivateBlob(
  storageKey: string,
  bytes: Buffer,
  mimeType: string,
): Promise<StoredBlob> {
  const checksumSha256 = createHash("sha256").update(bytes).digest("hex");

  if (usesBlobStorage()) {
    const blob = await put(storageKey, bytes, {
      access: "public",
      contentType: mimeType,
      addRandomSuffix: false,
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });
    return {
      storageKey,
      byteSize: bytes.length,
      checksumSha256,
      blobUrl: blob.url,
    };
  }

  assertCanWriteLocally();
  const fullPath = path.join(UPLOAD_ROOT, storageKey);
  await mkdir(path.dirname(fullPath), { recursive: true });
  await writeFile(fullPath, bytes);
  return {
    storageKey,
    byteSize: bytes.length,
    checksumSha256,
    blobUrl: null,
  };
}

export async function readPrivateBlob(stored: {
  storageKey: string;
  blobUrl: string | null;
}): Promise<Buffer> {
  if (stored.blobUrl) {
    const res = await fetch(stored.blobUrl);
    if (!res.ok) throw new Error("Blob not found");
    return Buffer.from(await res.arrayBuffer());
  }

  const filePath = path.join(UPLOAD_ROOT, stored.storageKey);
  return readFile(filePath);
}