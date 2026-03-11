import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";

function createR2Client() {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;

  if (!accountId || !accessKeyId || !secretAccessKey) {
    throw new Error("缺少 R2_ACCOUNT_ID / R2_ACCESS_KEY_ID / R2_SECRET_ACCESS_KEY 环境变量。");
  }

  return new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey },
  });
}

/**
 * 将图片 Buffer 上传到 Cloudflare R2，返回公开访问 URL。
 * 需在 R2 控制台开启 bucket 公开访问，并配置生命周期策略（建议 24h 过期）。
 */
export async function uploadImageToR2(
  buffer: Buffer,
  mimeType: string,
): Promise<string> {
  const bucket = process.env.R2_BUCKET_NAME;
  const publicUrl = process.env.R2_PUBLIC_URL;

  if (!bucket) throw new Error("缺少 R2_BUCKET_NAME 环境变量。");
  if (!publicUrl) throw new Error("缺少 R2_PUBLIC_URL 环境变量。");

  const ext = mimeType.split("/")[1]?.replace("jpeg", "jpg") ?? "jpg";
  const key = `avatars/${randomUUID()}.${ext}`;

  const client = createR2Client();
  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: buffer,
      ContentType: mimeType,
    }),
  );

  const base = publicUrl.replace(/\/$/, "");
  return `${base}/${key}`;
}
