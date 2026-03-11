"use client";

import { useCallback, useEffect, useRef } from "react";
import QRCode from "qrcode";

import type { FortuneResult } from "@/lib/fortune";

// ── 卡片尺寸 ────────────────────────────────────────────────────────────────
const W = 900;
const H = 480;
const SCALE = 2; // 2x 分辨率，下载图片更清晰
const PAD = 46;
const APP_URL = "https://mpc.pvzflare.com/";
const APP_HOST = "mpc.pvzflare.com";
const STRIP_Y = 382; // 分隔线 Y

// ── Canvas 工具函数 ──────────────────────────────────────────────────────────

function roundRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}

/** 绘制胶囊标签，返回宽度 */
function drawPill(
  ctx: CanvasRenderingContext2D,
  x: number,
  centerY: number,
  text: string,
  bg: string,
  fg: string,
  border: string,
  fontSize: number,
): number {
  ctx.font = `600 ${fontSize}px "Noto Sans SC", sans-serif`;
  const tw = ctx.measureText(text).width;
  const h = fontSize + 14;
  const w = tw + 26;
  roundRectPath(ctx, x, centerY - h / 2, w, h, h / 2);
  ctx.fillStyle = bg;
  ctx.fill();
  ctx.strokeStyle = border;
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.fillStyle = fg;
  ctx.textBaseline = "middle";
  ctx.fillText(text, x + 13, centerY);
  return w;
}

/** 逐字换行，返回换行后的下一行 Y（top 基准） */
function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxW: number,
  lineH: number,
  maxLines: number,
): number {
  let line = "";
  let curY = y;
  let lines = 0;
  for (const ch of text) {
    const test = line + ch;
    if (ctx.measureText(test).width > maxW && line) {
      ctx.fillText(line, x, curY);
      line = ch;
      curY += lineH;
      lines++;
      if (lines >= maxLines) return curY;
    } else {
      line = test;
    }
  }
  if (line && lines < maxLines) {
    ctx.fillText(line, x, curY);
    curY += lineH;
  }
  return curY;
}

/** 统计换行后的行数（不绘制） */
function countLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxW: number,
  maxLines: number,
): number {
  let line = "";
  let count = 1;
  for (const ch of text) {
    const test = line + ch;
    if (ctx.measureText(test).width > maxW && line) {
      count++;
      if (count >= maxLines) return maxLines;
      line = ch;
    } else {
      line = test;
    }
  }
  return Math.min(count, maxLines);
}

// ── 组件 ─────────────────────────────────────────────────────────────────────

interface Props {
  result: FortuneResult;
  onClose: () => void;
}

export default function AnalysisCard({ result, onClose }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isPlant = result.characterType === "plant";

  const draw = useCallback(async () => {
    await document.fonts.ready;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // 2x 缩放，所有坐标保持逻辑值不变
    ctx.scale(SCALE, SCALE);

    // ── 背景渐变 ──────────────────────────────────────────────────
    const bgGrad = ctx.createLinearGradient(0, 0, W, H);
    if (isPlant) {
      bgGrad.addColorStop(0, "#f0fcd8");
      bgGrad.addColorStop(0.5, "#f8ffef");
      bgGrad.addColorStop(1, "#ddf5b0");
    } else {
      bgGrad.addColorStop(0, "#fff4e0");
      bgGrad.addColorStop(0.5, "#fffdf8");
      bgGrad.addColorStop(1, "#f0d9ba");
    }
    roundRectPath(ctx, 0, 0, W, H, 32);
    ctx.fillStyle = bgGrad;
    ctx.fill();

    // 顶部高光叠加
    const hlGrad = ctx.createLinearGradient(0, 0, 0, H * 0.4);
    hlGrad.addColorStop(0, "rgba(255,255,255,0.42)");
    hlGrad.addColorStop(1, "rgba(255,255,255,0)");
    roundRectPath(ctx, 0, 0, W, H, 32);
    ctx.fillStyle = hlGrad;
    ctx.fill();

    // 边框
    roundRectPath(ctx, 0.75, 0.75, W - 1.5, H - 1.5, 31.5);
    ctx.strokeStyle = isPlant ? "rgba(113,162,57,0.35)" : "rgba(155,95,55,0.35)";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // ── 类型标签组 ────────────────────────────────────────────────
    const [tBg, tFg, tBd] = isPlant
      ? ["#eef8d7", "#40621d", "rgba(113,162,57,0.4)"]
      : ["#fff1e3", "#7f4721", "rgba(155,95,55,0.35)"];
    let bx = PAD;
    const badgeCY = 68;
    bx += drawPill(ctx, bx, badgeCY, isPlant ? "本命植" : "本命僵", tBg, tFg, tBd, 13);
    bx += 10;
    bx += drawPill(
      ctx,
      bx,
      badgeCY,
      result.classification,
      "rgba(255,255,255,0.82)",
      "#6d5d32",
      "rgba(0,0,0,0.08)",
      12,
    );
    bx += 10;
    drawPill(
      ctx,
      bx,
      badgeCY,
      result.rarity,
      "rgba(255,255,255,0.82)",
      "#6d5d32",
      "rgba(0,0,0,0.08)",
      12,
    );

    // ── 昵称副标题 ────────────────────────────────────────────────
    ctx.font = '400 12px "Noto Sans SC", sans-serif';
    ctx.fillStyle = "#7b6a3f";
    ctx.textBaseline = "alphabetic";
    ctx.fillText(`${result.nickname} 的图鉴答案`, PAD, 104);

    // ── 角色名称 ──────────────────────────────────────────────────
    ctx.font = '400 50px "ZCOOL KuaiLe", "Noto Sans SC", sans-serif';
    ctx.fillStyle = "#23321e";
    ctx.fillText(result.name, PAD, 158);

    // ── 一句短评 ──────────────────────────────────────────────────
    ctx.font = '400 14px "Noto Sans SC", sans-serif';
    ctx.fillStyle = "#5a4d2d";
    ctx.textBaseline = "top";
    const afterSummary = wrapText(ctx, result.summary, PAD, 172, W - PAD * 2, 23, 2);

    // ── 理由引用框 ────────────────────────────────────────────────
    const rBoxY = afterSummary + 10;
    const rPad = 16;
    const rMaxW = W - PAD * 2 - rPad * 2;
    ctx.font = '400 13px "Noto Sans SC", sans-serif';
    const rLines = countLines(ctx, result.reason, rMaxW, 3);
    const rBoxH = rLines * 21 + rPad * 2;
    roundRectPath(ctx, PAD, rBoxY, W - PAD * 2, rBoxH, 16);
    ctx.fillStyle = "rgba(255,255,255,0.62)";
    ctx.fill();
    ctx.strokeStyle = "rgba(0,0,0,0.06)";
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.fillStyle = "#40371f";
    ctx.textBaseline = "top";
    wrapText(ctx, result.reason, PAD + rPad, rBoxY + rPad, rMaxW, 21, 3);

    // ── 气质标签 ──────────────────────────────────────────────────
    const tagsY = rBoxY + rBoxH + 14;
    let tx = PAD;
    for (const tag of result.vibeTags) {
      const label = `#${tag}`;
      ctx.font = '400 12px "Noto Sans SC", sans-serif';
      const tw2 = ctx.measureText(label).width;
      const tagW = tw2 + 22;
      const tagH = 27;
      roundRectPath(ctx, tx, tagsY, tagW, tagH, tagH / 2);
      ctx.fillStyle = "rgba(255,255,255,0.75)";
      ctx.fill();
      ctx.strokeStyle = "rgba(0,0,0,0.08)";
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.fillStyle = "#5f5332";
      ctx.textBaseline = "middle";
      ctx.fillText(label, tx + 11, tagsY + tagH / 2);
      tx += tagW + 8;
    }

    // ── 底部分隔线 ────────────────────────────────────────────────
    ctx.beginPath();
    ctx.moveTo(PAD, STRIP_Y);
    ctx.lineTo(W - PAD, STRIP_Y);
    ctx.strokeStyle = isPlant ? "rgba(113,162,57,0.18)" : "rgba(155,95,55,0.18)";
    ctx.lineWidth = 1;
    ctx.stroke();

    // ── 二维码 ────────────────────────────────────────────────────
    const qrSize = 76;
    const qrX = W - PAD - qrSize - 3;
    const qrY = STRIP_Y + 8;

    try {
      const qrDataUrl = await QRCode.toDataURL(APP_URL, {
        type: "image/png" as const,
        width: qrSize,
        margin: 1,
        color: {
          dark: isPlant ? "#2e4120" : "#5a2c10",
          light: "#ffffff",
        },
      });
      const qrImg = new Image();
      qrImg.src = qrDataUrl;
      await new Promise<void>((resolve) => {
        qrImg.onload = () => resolve();
      });
      // 二维码背景
      roundRectPath(ctx, qrX - 4, qrY - 4, qrSize + 8, qrSize + 8, 12);
      ctx.fillStyle = "rgba(255,255,255,0.88)";
      ctx.fill();
      ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);
    } catch {
      // 二维码生成失败时显示占位
      roundRectPath(ctx, qrX - 4, qrY - 4, qrSize + 8, qrSize + 8, 12);
      ctx.fillStyle = "rgba(255,255,255,0.6)";
      ctx.fill();
    }

    // ── 底部左侧文字 ──────────────────────────────────────────────
    const textColor = isPlant ? "rgba(46,65,32,0.9)" : "rgba(90,44,16,0.9)";
    const dimColor = isPlant ? "rgba(64,98,29,0.55)" : "rgba(127,71,33,0.55)";

    ctx.font = '600 14px "Noto Sans SC", sans-serif';
    ctx.fillStyle = textColor;
    ctx.textBaseline = "alphabetic";
    ctx.fillText("PVZ2 本命检测所", PAD, STRIP_Y + 28);

    ctx.font = '400 12px "Noto Sans SC", sans-serif';
    ctx.fillStyle = dimColor;
    ctx.fillText("扫码来测测你的本命植 / 本命僵", PAD, STRIP_Y + 48);

    ctx.font = '400 11px "Noto Sans SC", sans-serif';
    ctx.fillStyle = dimColor;
    ctx.fillText(APP_HOST, PAD, STRIP_Y + 66);
  }, [isPlant, result]);

  useEffect(() => {
    void draw();
  }, [draw]);

  function handleDownload() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const a = document.createElement("a");
    a.download = `pvz2-${result.name}-本命卡.png`;
    a.href = canvas.toDataURL("image/png");
    a.click();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div className="flex flex-col items-center gap-4" onClick={(e) => e.stopPropagation()}>
        <canvas
          ref={canvasRef}
          width={W * SCALE}
          height={H * SCALE}
          className="rounded-2xl shadow-2xl"
          style={{ maxWidth: "min(900px, calc(100vw - 2rem))", height: "auto" }}
        />
        <div className="flex gap-3">
          <button
            onClick={handleDownload}
            className={`inline-flex items-center gap-2 rounded-full px-7 py-2.5 text-sm font-semibold text-white shadow-lg ${
              isPlant
                ? "bg-[linear-gradient(135deg,#8bc949,#5f8f26)]"
                : "bg-[linear-gradient(135deg,#f0a030,#c06820)]"
            }`}
          >
            ↓ 下载卡片
          </button>
          <button
            onClick={onClose}
            className="inline-flex items-center rounded-full border border-white/30 bg-white/15 px-7 py-2.5 text-sm font-semibold text-white"
          >
            关闭
          </button>
        </div>
        <p className="text-xs text-white/50">点击空白区域关闭</p>
      </div>
    </div>
  );
}
