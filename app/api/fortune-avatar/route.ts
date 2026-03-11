import { NextResponse } from "next/server";

import { generateFortuneResultFromAvatar } from "@/lib/fortune";
import type { FortuneMode } from "@/lib/pvz-data";

export const runtime = "nodejs";

type RequestPayload = {
  imageDataUrl?: unknown;
  mode?: unknown;
};

const allowedModes = new Set<FortuneMode>(["random", "plant", "zombie"]);

// 7MB base64 上限
const MAX_IMAGE_SIZE = 7 * 1024 * 1024;

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as RequestPayload;

    const imageDataUrl =
      typeof payload.imageDataUrl === "string" ? payload.imageDataUrl : "";
    const mode =
      typeof payload.mode === "string" && allowedModes.has(payload.mode as FortuneMode)
        ? (payload.mode as FortuneMode)
        : null;

    if (!imageDataUrl) {
      return NextResponse.json({ error: "请提供头像图片。" }, { status: 400 });
    }

    if (!imageDataUrl.startsWith("data:image/")) {
      return NextResponse.json({ error: "图片格式不合法。" }, { status: 400 });
    }

    if (imageDataUrl.length > MAX_IMAGE_SIZE) {
      return NextResponse.json({ error: "图片体积过大，请压缩后重试。" }, { status: 400 });
    }

    if (!mode) {
      return NextResponse.json({ error: "请选择有效的检测模式。" }, { status: 400 });
    }

    const result = await generateFortuneResultFromAvatar({ imageDataUrl, mode });

    return NextResponse.json({ result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "生成失败，请稍后重试。";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
