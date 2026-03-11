import type { Metadata } from "next";
import { Geist_Mono, Noto_Sans_SC, ZCOOL_KuaiLe } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const notoSansSc = Noto_Sans_SC({
  variable: "--font-noto-sans-sc",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const zcoolKuaiLe = ZCOOL_KuaiLe({
  variable: "--font-zcool-kuaile",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "PVZ2 本命检测所",
  description: "输入昵称，让 AI 从植物大战僵尸 2 图鉴里推断你的本命植或本命僵。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body
        className={`${notoSansSc.variable} ${geistMono.variable} ${zcoolKuaiLe.variable} antialiased`}
      >
        {children}
        <Analytics />
      </body>
    </html>
  );
}
