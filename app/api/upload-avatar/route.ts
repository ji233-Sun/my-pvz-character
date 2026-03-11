import { NextResponse } from "next/server";

import { uploadImageToR2 } from "@/lib/r2";

export const runtime = "nodejs";

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "请上传图片文件。" }, { status: 400 });
    }

    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      return NextResponse.json({ error: "仅支持 JPG / PNG / WebP 格式。" }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "图片超过 5MB，请压缩后重试。" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const url = await uploadImageToR2(buffer, file.type);

    return NextResponse.json({ url });
  } catch (error) {
    const message = error instanceof Error ? error.message : "上传失败，请稍后重试。";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
