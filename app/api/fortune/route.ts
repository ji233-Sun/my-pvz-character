import { NextResponse } from "next/server";

import { generateFortuneResult } from "@/lib/fortune";
import type { FortuneMode } from "@/lib/pvz-data";

export const runtime = "nodejs";

type RequestPayload = {
  nickname?: unknown;
  mode?: unknown;
};

const allowedModes = new Set<FortuneMode>(["random", "plant", "zombie"]);

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as RequestPayload;
    const nickname =
      typeof payload.nickname === "string" ? payload.nickname.trim().slice(0, 24) : "";
    const mode =
      typeof payload.mode === "string" && allowedModes.has(payload.mode as FortuneMode)
        ? (payload.mode as FortuneMode)
        : null;

    if (!nickname) {
      return NextResponse.json({ error: "请输入昵称。" }, { status: 400 });
    }

    if (!mode) {
      return NextResponse.json({ error: "请选择有效的检测模式。" }, { status: 400 });
    }

    const result = await generateFortuneResult({
      nickname,
      mode,
    });

    return NextResponse.json({ result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "生成失败，请稍后重试。";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
