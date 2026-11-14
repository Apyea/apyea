import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const UPLOAD_ROOT = path.join(process.cwd(), "uploads");

export async function savePrivateUpload(
  folder: string,
  file: File,
): Promise<{ storageKey: string; byteSize: number; checksumSha256: string }> {
  const bytes = Buffer.from(await file.arrayBuffer());
  const checksumSha256 = createHash("sha256").update(bytes).digest("hex");
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const storageKey = `${folder}/${Date.now()}-${safeName}`;
  const fullPath = path.join(UPLOAD_ROOT, storageKey);
  await mkdir(path.dirname(fullPath), { recursive: true });
  await writeFile(fullPath, bytes);
  return { storageKey, byteSize: bytes.length, checksumSha256 };
}
