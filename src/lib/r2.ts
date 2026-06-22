// Browser-side R2 upload via Cloudflare R2 S3-compatible API.
// SECURITY NOTE: VITE_* env vars are shipped to clients. Scope the R2 token to
// "Object Read & Write" on a single bucket only — never use an account-wide key.
import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

const ACCOUNT_ID = import.meta.env.VITE_R2_ACCOUNT_ID as string | undefined;
const ACCESS_KEY = import.meta.env.VITE_R2_ACCESS_KEY_ID as string | undefined;
const SECRET_KEY = import.meta.env.VITE_R2_SECRET_ACCESS_KEY as string | undefined;
const BUCKET = (import.meta.env.VITE_R2_BUCKET as string | undefined) ?? "";
const PUBLIC_URL = ((import.meta.env.VITE_R2_PUBLIC_URL as string | undefined) ?? "").replace(/\/$/, "");

export const r2Configured = Boolean(ACCOUNT_ID && ACCESS_KEY && SECRET_KEY && BUCKET && PUBLIC_URL);

let _client: S3Client | null = null;
function client(): S3Client {
  if (!r2Configured) throw new Error("R2 not configured. Add VITE_R2_* secrets.");
  if (!_client) {
    _client = new S3Client({
      region: "auto",
      endpoint: `https://${ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: { accessKeyId: ACCESS_KEY!, secretAccessKey: SECRET_KEY! },
    });
  }
  return _client;
}

export async function uploadToR2(
  file: File,
  prefix = "resumes",
): Promise<{ key: string; url: string }> {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "bin";
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 80);
  const key = `${prefix}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${safeName}`;
  const buf = new Uint8Array(await file.arrayBuffer());

  await client().send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: buf,
      ContentType: file.type || `application/${ext}`,
    }),
  );

  return { key, url: `${PUBLIC_URL}/${key}` };
}

export async function deleteFromR2(key: string): Promise<void> {
  if (!r2Configured || !key) return;
  try {
    await client().send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));
  } catch (e) {
    console.warn("R2 delete failed", e);
  }
}
