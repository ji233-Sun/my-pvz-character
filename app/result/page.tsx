"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import AnalysisCard from "@/components/analysis-card";
import type { FortuneResult } from "@/lib/fortune";

export default function ResultPage() {
  const router = useRouter();
  const [result, setResult] = useState<FortuneResult | null>(null);
  const [mounted, setMounted] = useState(false);
  const [showCard, setShowCard] = useState(false);
  const [avatarDataUrl, setAvatarDataUrl] = useState<string | undefined>(undefined);

  useEffect(() => {
    setMounted(true);
    const stored = sessionStorage.getItem("pvz-result");
    if (!stored) {
      router.replace("/");
      return;
    }
    try {
      setResult(JSON.parse(stored) as FortuneResult);
      const avatar = sessionStorage.getItem("pvz-avatar-data");
      if (avatar) setAvatarDataUrl(avatar);
    } catch {
      router.replace("/");
    }
  }, [router]);

  // 等待客户端挂载，避免 hydration 闪烁
  if (!mounted || !result) return null;

  const isPlant = result.characterType === "plant";

  const accentGradient = isPlant
    ? "from-[#f0fcd8] via-[#f6ffee] to-[#ddf5b0]"
    : "from-[#fff4e0] via-[#fffdf8] to-[#f0d9ba]";

  const typeBadgeClass = isPlant
    ? "border-[#71a239]/40 bg-[#eef8d7] text-[#40621d]"
    : "border-[#9b5f37]/35 bg-[#fff1e3] text-[#7f4721]";

  return (
    <main className="min-h-screen px-4 py-8 md:px-8 lg:px-10">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">

        {/* 顶部导航 */}
        <nav className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-white/60 px-4 py-2 text-sm font-medium text-[#58451e] hover:-translate-y-0.5 hover:border-[var(--line-strong)] hover:bg-white/90"
          >
            ← 返回首页
          </Link>
          <span className="text-sm font-medium text-[#8b7440]">PVZ2 本命检测所</span>
        </nav>

        {/* 结果卡片 */}
        <article
          className={`overflow-hidden rounded-[2rem] border border-[var(--line)] bg-gradient-to-br ${accentGradient} shadow-[0_30px_80px_-40px_var(--shadow)]`}
        >
          <div className="flex flex-col gap-5 p-6 md:p-7">

              {/* 类型标签组 */}
              <div className="flex flex-wrap gap-2">
                <span
                  className={`rounded-full border px-3 py-1 text-sm font-semibold ${typeBadgeClass}`}
                >
                  {isPlant ? "本命植" : "本命僵"}
                </span>
                <span className="rounded-full border border-[var(--line)] bg-white/70 px-3 py-1 text-sm font-medium text-[#6d5d32]">
                  {result.classification}
                </span>
                <span className="rounded-full border border-[var(--line)] bg-white/70 px-3 py-1 text-sm font-medium text-[#6d5d32]">
                  {result.rarity}
                </span>
              </div>

              {/* 名称区 */}
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.28em] text-[#7b6a3f]">
                  {result.nickname} 的图鉴答案
                </p>
                <h1 className="mt-1.5 font-display text-4xl leading-none text-[#23321e] md:text-5xl">
                  {result.name}
                </h1>
                <p className="mt-3 text-base leading-7 text-[#5a4d2d]">{result.summary}</p>
              </div>

              {/* 理由卡片 */}
              <blockquote className="rounded-[1.2rem] border border-[var(--line)] bg-white/65 px-5 py-4 text-sm leading-7 text-[#40371f]">
                {result.reason}
              </blockquote>

              {/* 属性标签 */}
              {result.attributes.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {result.attributes.map((attr) => (
                    <span
                      key={attr}
                      className="rounded-full bg-[#2e4120] px-3 py-1 text-xs font-medium text-[#f7f5de]"
                    >
                      {attr}
                    </span>
                  ))}
                </div>
              )}

              {/* 气质标签 */}
              <div className="flex flex-wrap gap-2">
                {result.vibeTags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-[var(--line)] bg-white/75 px-3 py-1.5 text-sm text-[#5f5332]"
                  >
                    #{tag}
                  </span>
                ))}
              </div>

              {/* 数值面板：2 列网格 */}
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {result.panel.map((item) => {
                  const spaceIdx = item.lastIndexOf(" ");
                  const label = item.slice(0, spaceIdx);
                  const value = item.slice(spaceIdx + 1);
                  return (
                    <div
                      key={item}
                      className="flex items-center justify-between rounded-[0.9rem] bg-[#f5e7b7]/80 px-4 py-3"
                    >
                      <span className="text-sm text-[#7a5c1e]">{label}</span>
                      <span className="text-lg font-bold leading-none text-[#3d2a07]">
                        {value}
                      </span>
                    </div>
                  );
                })}
              </div>
          </div>
        </article>

        {/* 底部操作 */}
        <div className="flex flex-col items-center gap-3">
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => setShowCard(true)}
              className="inline-flex h-13 items-center justify-center gap-2 rounded-full border border-[var(--line-strong)] bg-white/80 px-8 py-3.5 text-base font-semibold text-[#40621d] hover:-translate-y-0.5"
            >
              生成分析卡片
            </button>
            <Link
              href="/"
              className="inline-flex h-13 items-center justify-center rounded-full border border-[#496f1f] bg-[linear-gradient(135deg,#8bc949,#5f8f26)] px-10 py-3.5 text-base font-semibold text-white shadow-[0_16px_30px_-18px_rgba(60,96,21,0.92)] hover:-translate-y-0.5"
            >
              再测一次
            </Link>
          </div>
          <p className="text-xs text-[#a19166]">
            结果由 AI 随机生成，仅供娱乐
          </p>
        </div>

      </div>

      {/* 分析卡片弹层 */}
      {showCard && (
        <AnalysisCard result={result} avatarDataUrl={avatarDataUrl} onClose={() => setShowCard(false)} />
      )}
    </main>
  );
}
