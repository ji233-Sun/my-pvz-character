"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import type { FortuneMode } from "@/lib/pvz-data";

type FortuneFinderProps = {
  plantCount: number;
  zombieCount: number;
};

const modeOptions: Array<{
  value: FortuneMode;
  label: string;
  description: string;
}> = [
  { value: "random", label: "随机", description: "植物或僵尸都可能中签" },
  { value: "plant", label: "植物", description: "只在植物图鉴里挑本命植" },
  { value: "zombie", label: "僵尸", description: "只在僵尸图鉴里挑本命僵" },
];

export default function FortuneFinder({
  plantCount,
  zombieCount,
}: FortuneFinderProps) {
  const router = useRouter();
  const [nickname, setNickname] = useState("");
  const [mode, setMode] = useState<FortuneMode>("random");
  const [isNavigating, setIsNavigating] = useState(false);

  const canSubmit = nickname.trim().length > 0 && !isNavigating;

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) return;

    setIsNavigating(true);
    const params = new URLSearchParams({ nickname: nickname.trim(), mode });
    router.push(`/checking?${params.toString()}`);
  }

  return (
    <section className="flex flex-col gap-4 rounded-[1.75rem] border border-[var(--line)] bg-[#fffbee]/85 p-5 shadow-[0_24px_60px_-35px_var(--shadow)] md:p-6">
      <div className="rounded-[1.4rem] border border-[var(--line)] bg-[#2f421d] px-5 py-4 text-[#fff7d6]">
        <p className="text-sm uppercase tracking-[0.24em] text-[#d8ff9b]">AI Fortune Engine</p>
        <p className="mt-2 text-xl font-semibold">昵称进来，图鉴答案出去。</p>
        <p className="mt-2 text-sm leading-7 text-[#ecf4d7]">
          当前已接入 {plantCount} 个植物条目与 {zombieCount} 个僵尸条目。
        </p>
      </div>

      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <label className="flex flex-col gap-2">
          <span className="text-sm font-semibold text-[#58451e]">你的昵称</span>
          <input
            className="h-14 rounded-[1rem] border border-[var(--line)] bg-white px-4 text-base text-[#2d2816] outline-none ring-0 placeholder:text-[#a19166] focus:border-[var(--line-strong)] focus:shadow-[0_0_0_4px_rgba(246,188,67,0.18)]"
            maxLength={24}
            placeholder="比如：夜班豌豆、失眠队长、风暴阿福"
            value={nickname}
            onChange={(event) => setNickname(event.target.value)}
          />
        </label>

        <div className="flex flex-col gap-2">
          <span className="text-sm font-semibold text-[#58451e]">检测模式</span>
          <div className="grid gap-3 md:grid-cols-3">
            {modeOptions.map((option) => {
              const active = option.value === mode;

              return (
                <button
                  key={option.value}
                  type="button"
                  aria-pressed={active}
                  className={`rounded-[1.2rem] border px-4 py-4 text-left ${
                    active
                      ? "border-[#6e9f3c] bg-[#eef7d9] shadow-[0_14px_30px_-24px_rgba(69,104,29,0.9)]"
                      : "border-[var(--line)] bg-white/75 hover:-translate-y-0.5 hover:border-[var(--line-strong)]"
                  }`}
                  onClick={() => setMode(option.value)}
                >
                  <p className="text-base font-semibold text-[#2f341c]">{option.label}</p>
                  <p className="mt-2 text-sm leading-6 text-[#6d5d32]">{option.description}</p>
                </button>
              );
            })}
          </div>
        </div>

        <button
          className="mt-2 inline-flex h-14 items-center justify-center rounded-full border border-[#496f1f] bg-[linear-gradient(135deg,#8bc949,#5f8f26)] px-6 text-base font-semibold text-white shadow-[0_16px_30px_-18px_rgba(60,96,21,0.92)] disabled:cursor-not-allowed disabled:opacity-55"
          disabled={!canSubmit}
          type="submit"
        >
          {isNavigating ? "正在跳转..." : "开始检测"}
        </button>
      </form>
    </section>
  );
}
