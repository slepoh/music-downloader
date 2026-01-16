import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "COCO音乐下载站",
  description: "简约纯净的音乐下载工具",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-slate-50`}
      >
        {/* Announcement Bar */}
        <div className="w-full bg-orange-50/90 border-b border-orange-100 px-4 py-2 text-center text-xs sm:text-sm text-orange-800 flex flex-wrap items-center justify-center gap-1 backdrop-blur-sm fixed top-0 left-0 right-0 z-[60]">
          <span>本站默认提供完整的下载功能，若需完整体验第三方软件CoCoMusic，请访问</span>
          <a 
            href="https://coco.markqq.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="font-semibold underline hover:text-orange-600 transition-colors"
          >
            CoCoMusic官网
          </a>
          <span>或加入qq群：7744351610</span>
        </div>
        <Navbar />
        <div className="pt-24 min-h-screen">
          {children}
        </div>
      </body>
    </html>
  );
}
