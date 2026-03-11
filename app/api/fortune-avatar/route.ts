import { NextResponse } from "next/server";

import { generateFortuneResultFromAvatar } from "@/lib/fortune";
import type { FortuneMode } from "@/lib/pvz-data";

export const runtime = "nodejs";

type RequestPayload = {
  imageUrl?: unknown;
  mode?: unknown;
};

const allowedModes = new Set<FortuneMode>(["random", "plant", "zombie"]);

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as RequestPayload;

    const imageUrl =
      typeof payload.imageUrl === "string" ? payload.imageUrl.trim() : "";
    const mode =
      typeof payload.mode === "string" && allowedModes.has(payload.mode as FortuneMode)
        ? (payload.mode as FortuneMode)
        : null;

    if (!imageUrl) {
      return NextResponse.json({ error: "请提供头像图片链接。" }, { status: 400 });
    }

    // 只接受 HTTPS URL（防止 SSRF，不接受 data: / file: 等协议）
    if (!imageUrl.startsWith("https://")) {
      return NextResponse.json({ error: "图片链接格式不合法。" }, { status: 400 });
    }

    if (!mode) {
      return NextResponse.json({ error: "请选择有效的检测模式。" }, { status: 400 });
    }

    const result = await generateFortuneResultFromAvatar({ imageUrl, mode });

    return NextResponse.json({ result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "生成失败，请稍后重试。";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
