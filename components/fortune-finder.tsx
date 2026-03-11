"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

import type { FortuneMode } from "@/lib/pvz-data";

type FortuneFinderProps = {
  plantCount: number;
  zombieCount: number;
};

type DetectionSource = "nickname" | "avatar";

const modeOptions: Array<{
  value: FortuneMode;
  label: string;
  description: string;
}> = [
  { value: "random", label: "随机", description: "植物或僵尸都可能中签" },
  { value: "plant", label: "植物", description: "只在植物图鉴里挑本命植" },
  { value: "zombie", label: "僵尸", description: "只在僵尸图鉴里挑本命僵" },
];

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export default function FortuneFinder({
  plantCount,
  zombieCount,
}: FortuneFinderProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [detectionSource, setDetectionSource] = useState<DetectionSource>("nickname");
  const [nickname, setNickname] = useState("");
  const [mode, setMode] = useState<FortuneMode>("random");
  const [isNavigating, setIsNavigating] = useState(false);

  const [avatarDataUrl, setAvatarDataUrl] = useState<string | null>(null);
  const [avatarError, setAvatarError] = useState("");

  const canSubmitNickname = nickname.trim().length > 0 && !isNavigating;
  const canSubmitAvatar = avatarDataUrl !== null && !isNavigating;

  function handleNicknameSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmitNickname) return;

    setIsNavigating(true);
    const params = new URLSearchParams({ nickname: nickname.trim(), mode });
    router.push(`/checking?${params.toString()}`);
  }

  function handleAvatarSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmitAvatar || !avatarDataUrl) return;

    setIsNavigating(true);
    sessionStorage.setItem("pvz-avatar-data", avatarDataUrl);
    const params = new URLSearchParams({ mode, source: "avatar" });
    router.push(`/checking?${params.toString()}`);
  }

  function setFile(file: File) {
    setAvatarError("");
    if (!file.type.startsWith("image/")) {
      setAvatarError("请上传图片文件。");
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setAvatarError("图片超过 5MB，请压缩后重试。");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result;
      if (typeof result === "string") setAvatarDataUrl(result);
    };
    reader.readAsDataURL(file);
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) setFile(file);
    // 重置 input，允许重新选择同一文件
    event.target.value = "";
  }

  function handleDropZoneClick() {
    fileInputRef.current?.click();
  }

  function handleDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (file) setFile(file);
  }

  function handleDragOver(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
  }

  return (
    <section className="flex flex-col gap-4 rounded-[1.75rem] border border-[var(--line)] bg-[#fffbee]/85 p-5 shadow-[0_24px_60px_-35px_var(--shadow)] md:p-6">
      {/* 顶部信息栏 */}
      <div className="rounded-[1.4rem] border border-[var(--line)] bg-[#2f421d] px-5 py-4 text-[#fff7d6]">
        <p className="text-sm uppercase tracking-[0.24em] text-[#d8ff9b]">AI Fortune Engine</p>
        <p className="mt-2 text-xl font-semibold">昵称进来，图鉴答案出去。</p>
        <p className="mt-2 text-sm leading-7 text-[#ecf4d7]">
          当前已接入 {plantCount} 个植物条目与 {zombieCount} 个僵尸条目。
        </p>
      </div>

      {/* Tab 切换栏 */}
      <div className="flex gap-2 rounded-[1.2rem] border border-[var(--line)] bg-white/60 p-1">
        {(["nickname", "avatar"] as DetectionSource[]).map((src) => {
          const active = detectionSource === src;
          const label = src === "nickname" ? "昵称检测" : "头像检测";
          return (
            <button
              key={src}
              type="button"
              aria-pressed={active}
              className={`flex-1 rounded-[0.9rem] px-4 py-2.5 text-sm font-semibold transition-all duration-200 ${
                active
                  ? "bg-[#2f421d] text-[#d8ff9b] shadow-[0_4px_12px_-4px_rgba(47,66,29,0.5)]"
                  : "text-[#58451e] hover:bg-[#f5efdd]"
              }`}
              onClick={() => {
                setDetectionSource(src);
                setAvatarError("");
              }}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* 昵称模式 */}
      {detectionSource === "nickname" && (
        <form className="flex flex-col gap-4" onSubmit={handleNicknameSubmit}>
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

          <ModeSelector mode={mode} onChange={setMode} />

          <button
            className="mt-2 inline-flex h-14 items-center justify-center rounded-full border border-[#496f1f] bg-[linear-gradient(135deg,#8bc949,#5f8f26)] px-6 text-base font-semibold text-white shadow-[0_16px_30px_-18px_rgba(60,96,21,0.92)] disabled:cursor-not-allowed disabled:opacity-55"
            disabled={!canSubmitNickname}
            type="submit"
          >
            {isNavigating ? "正在跳转..." : "开始检测"}
          </button>
        </form>
      )}

      {/* 头像模式 */}
      {detectionSource === "avatar" && (
        <form className="flex flex-col gap-4" onSubmit={handleAvatarSubmit}>
          <div className="flex flex-col gap-2">
            <span className="text-sm font-semibold text-[#58451e]">上传头像</span>

            <div
              role="button"
              tabIndex={0}
              aria-label="点击或拖拽上传头像图片"
              className="flex min-h-[9rem] cursor-pointer flex-col items-center justify-center gap-3 rounded-[1.2rem] border-2 border-dashed border-[var(--line)] bg-white/70 px-4 py-6 transition-colors hover:border-[var(--line-strong)] hover:bg-[#f9f5e8]"
              onClick={handleDropZoneClick}
              onKeyDown={(e) => e.key === "Enter" && handleDropZoneClick()}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            >
              {avatarDataUrl ? (
                <div className="flex flex-col items-center gap-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={avatarDataUrl}
                    alt="头像预览"
                    className="h-24 w-24 rounded-2xl object-cover shadow-[0_8px_20px_-8px_rgba(0,0,0,0.18)]"
                  />
                  <p className="text-xs text-[#7a6a42]">点击重新上传</p>
                </div>
              ) : (
                <>
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#eef7d9] text-2xl shadow-[0_4px_10px_-4px_rgba(95,143,38,0.3)]">
                    🖼️
                  </div>
                  <p className="text-sm font-medium text-[#58451e]">点击或拖拽上传头像</p>
                  <p className="text-xs text-[#a19166]">支持 JPG / PNG / WebP，最大 5MB</p>
                </>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />

            {avatarError && (
              <p className="text-xs text-red-500">{avatarError}</p>
            )}
          </div>

          <ModeSelector mode={mode} onChange={setMode} />

          <button
            className="mt-2 inline-flex h-14 items-center justify-center rounded-full border border-[#496f1f] bg-[linear-gradient(135deg,#8bc949,#5f8f26)] px-6 text-base font-semibold text-white shadow-[0_16px_30px_-18px_rgba(60,96,21,0.92)] disabled:cursor-not-allowed disabled:opacity-55"
            disabled={!canSubmitAvatar}
            type="submit"
          >
            {isNavigating ? "正在跳转..." : "开始检测"}
          </button>
        </form>
      )}
    </section>
  );
}

function ModeSelector({
  mode,
  onChange,
}: {
  mode: FortuneMode;
  onChange: (value: FortuneMode) => void;
}) {
  return (
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
              onClick={() => onChange(option.value)}
            >
              <p className="text-base font-semibold text-[#2f341c]">{option.label}</p>
              <p className="mt-2 text-sm leading-6 text-[#6d5d32]">{option.description}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
