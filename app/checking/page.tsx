"use client";

import { useEffect, useRef, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

import type { FortuneResult } from "@/lib/fortune";

type ApiResponse = {
  result?: FortuneResult;
  error?: string;
};

const NICKNAME_STEPS = ["分析昵称", "匹配图鉴", "生成答案"] as const;
const AVATAR_STEPS = ["分析头像", "提取气质", "匹配图鉴"] as const;

function CheckingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const hasFetched = useRef(false);

  const [error, setError] = useState("");
  const [stepIndex, setStepIndex] = useState(0);

  const nickname = searchParams.get("nickname") ?? "";
  const mode = searchParams.get("mode") ?? "random";
  const source = searchParams.get("source") ?? "nickname";
  const isAvatarMode = source === "avatar";

  const STEPS = isAvatarMode ? AVATAR_STEPS : NICKNAME_STEPS;

  // 分步骤动画（纯视觉，与真实进度无关）
  useEffect(() => {
    const timers = [
      setTimeout(() => setStepIndex(1), 700),
      setTimeout(() => setStepIndex(2), 2000),
      setTimeout(() => setStepIndex(3), 3600),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    if (isAvatarMode) {
      void fetchAvatarResult();
    } else {
      if (!nickname) {
        router.replace("/");
        return;
      }
      void fetchNicknameResult();
    }

    async function fetchNicknameResult() {
      try {
        const response = await fetch("/api/fortune", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nickname, mode }),
        });
        const payload = (await response.json()) as ApiResponse;

        if (!response.ok || !payload.result) {
          throw new Error(payload.error ?? "生成失败，请稍后再试。");
        }

        sessionStorage.setItem("pvz-result", JSON.stringify(payload.result));
        router.replace("/result");
      } catch (err) {
        setError(err instanceof Error ? err.message : "生成失败，请稍后再试。");
      }
    }

    async function fetchAvatarResult() {
      try {
        const imageDataUrl = sessionStorage.getItem("pvz-avatar-data");
        if (!imageDataUrl) {
          router.replace("/");
          return;
        }

        const response = await fetch("/api/fortune-avatar", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageDataUrl, mode }),
        });
        const payload = (await response.json()) as ApiResponse;

        if (!response.ok || !payload.result) {
          throw new Error(payload.error ?? "生成失败，请稍后再试。");
        }

        sessionStorage.setItem("pvz-result", JSON.stringify(payload.result));
        router.replace("/result");
      } catch (err) {
        setError(err instanceof Error ? err.message : "生成失败，请稍后再试。");
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center px-5 py-8">
        <div className="flex flex-col items-center gap-6 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full border border-[#d7b983] bg-[#fff5dc] text-4xl shadow-[0_8px_24px_-12px_rgba(140,78,29,0.3)]">
            🥀
          </div>
          <div>
            <p className="text-xl font-semibold text-[#2d3d1e]">图鉴翻车了</p>
            <p className="mt-2 max-w-xs text-sm leading-7 text-[#6d5d32]">{error}</p>
          </div>
          <Link
            href="/"
            className="inline-flex h-12 items-center justify-center rounded-full border border-[#496f1f] bg-[linear-gradient(135deg,#8bc949,#5f8f26)] px-8 text-sm font-semibold text-white shadow-[0_12px_24px_-14px_rgba(60,96,21,0.92)] hover:-translate-y-0.5"
          >
            返回重试
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-5 py-8">
      <div className="flex flex-col items-center gap-10 text-center">
        {/* 双环旋转动画 */}
        <div className="relative flex h-28 w-28 items-center justify-center">
          {/* 外环 */}
          <div className="absolute inset-0 animate-spin rounded-full border-[3px] border-[rgba(197,224,138,0.25)] border-t-[#5f8f26]" />
          {/* 内环（反转） */}
          <div
            className="absolute inset-3 animate-spin rounded-full border-[3px] border-[rgba(197,224,138,0.18)] border-b-[#8bc949]"
            style={{ animationDirection: "reverse", animationDuration: "0.7s" }}
          />
          {/* 中心图标 */}
          <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-[#eef7d9] text-2xl shadow-[0_4px_12px_-4px_rgba(95,143,38,0.4)]">
            {isAvatarMode ? "🖼️" : "🌿"}
          </div>
        </div>

        {/* 主文案 */}
        <div className="flex flex-col gap-2">
          <p className="text-xs uppercase tracking-[0.28em] text-[#8b7440]">AI Fortune Engine</p>
          <p className="text-2xl font-semibold text-[#2d3d1e]">正在翻图鉴</p>
          {isAvatarMode ? (
            <p className="text-sm leading-7 text-[#6d5d32]">AI 正在分析你的头像</p>
          ) : (
            <p className="text-sm leading-7 text-[#6d5d32]">
              AI 正在为{" "}
              <span className="rounded-md bg-[#eef7d9] px-2 py-0.5 font-semibold text-[#3d5c20]">
                {nickname}
              </span>{" "}
              寻找专属角色
            </p>
          )}
        </div>

        {/* 分步骤进度条 */}
        <div className="flex items-center gap-2">
          {STEPS.map((step, i) => {
            const done = i < stepIndex;
            const active = i === stepIndex;
            return (
              <div key={step} className="flex items-center gap-2">
                <span
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-all duration-500 ${
                    done
                      ? "border-[#6e9f3c] bg-[#eef7d9] text-[#3d5c20]"
                      : active
                        ? "border-[#6e9f3c]/50 bg-[#f5fce8] text-[#5a7c2a] shadow-[0_0_0_3px_rgba(110,159,60,0.12)]"
                        : "border-[var(--line)] bg-white/50 text-[#a19166]"
                  }`}
                >
                  {done ? "✓ " : ""}{step}
                </span>
                {i < STEPS.length - 1 && (
                  <span className="text-[#c5b07a] text-xs">→</span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}

export default function CheckingPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center">
          <p className="text-sm text-[#6d5d32]">加载中...</p>
        </main>
      }
    >
      <CheckingContent />
    </Suspense>
  );
}
