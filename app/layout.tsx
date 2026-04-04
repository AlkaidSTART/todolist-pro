import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "Todo Pro",
  description: "Minimalist task management",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased bg-zinc-50 text-zinc-900`}
    >
      <body className="min-h-full flex text-sm">
        <aside className="w-64 border-r border-zinc-200/60 bg-white/50 backdrop-blur-xl p-8 flex flex-col gap-8 fixed inset-y-0 left-0">
          <div className="font-semibold tracking-widest uppercase text-xs text-zinc-400">Todo Pro.</div>
          <nav className="flex flex-col gap-3">
            <a href="/" className="text-zinc-500 hover:text-zinc-900 transition-colors duration-300">Overview</a>
            <a href="/tasks" className="text-zinc-500 hover:text-zinc-900 transition-colors duration-300">Kanban</a>
            <a href="/settings" className="text-zinc-500 hover:text-zinc-900 transition-colors duration-300">Settings</a>
          </nav>
        </aside>
        <main className="flex-1 ml-64 p-12 lg:p-24 max-w-6xl">
          {children}
        </main>
      </body>
    </html>
  );
}
