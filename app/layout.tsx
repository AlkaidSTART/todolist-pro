import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import DesktopSidebar from "./components/desktop-sidebar";
import MobileTabBar from "./components/mobile-tab-bar";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Todo Pro 任务管理",
  description: "简约高级的任务协作看板",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-CN"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex text-sm">
        <DesktopSidebar />

        <main className="flex-1 ml-0 md:ml-64 px-5 pt-6 pb-28 md:p-12 lg:p-24 max-w-6xl">
          {children}
        </main>

        <MobileTabBar />
      </body>
    </html>
  );
}
