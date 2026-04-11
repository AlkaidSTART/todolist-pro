"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import gsap from "gsap";
import { useAppStore } from "@/lib/app-store";
import { feishuAPI } from "@/lib/feishu-api";


type NavItem = {
  label: string;
  href: string;
};

const navItems: NavItem[] = [
  { label: "概览", href: "/" },
  { label: "任务看板", href: "/tasks" },
  { label: "设置", href: "/settings" },
]; 

const isActive = (pathname: string, href: string) => {
  if (href === "/") {
    return pathname === "/";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
};

export default function DesktopSidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const navRef = useRef<HTMLDivElement | null>(null);
  const indicatorRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<string | null>(null);
  const importFeishuEvents = useAppStore((state) => state.importFeishuEvents);
  const importStatus = useAppStore((state) => state.importStatus);

  useEffect(() => {
    const code = searchParams.get('code');
    if (code) {
      handleAuthCallback(code);
    }
  }, [searchParams]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsAuthenticated(feishuAPI.isAuthenticated());
    }
  }, []);

  const handleAuthCallback = async (code: string) => {
    try {
      await feishuAPI.getTokenFromCode(code);
      setIsAuthenticated(true);
      setIsDrawerOpen(false);
    } catch (error) {
      console.error('飞书认证失败:', error);
    }
  };

  const handleFeishuAuth = () => {
    const authUrl = feishuAPI.getAuthUrl();
    window.location.href = authUrl;
  };

  const handleImportFeishuEvents = async () => {
    if (!isAuthenticated) {
      handleFeishuAuth();
      return;
    }

    setImporting(true);
    setImportResult(null);

    try {
      const now = Date.now();
      const oneMonthAhead = now + 30 * 24 * 60 * 60 * 1000;
      const events = await feishuAPI.getEvents(Math.floor(now / 1000), Math.floor(oneMonthAhead / 1000));
      const importedCount = await importFeishuEvents(events);
      setImportResult(`成功导入 ${importedCount} 个飞书日程`);
    } catch (error) {
      console.error('导入飞书日程失败:', error);
      setImportResult('导入失败，请检查飞书授权');
    } finally {
      setImporting(false);
    }
  };

  const handleLogout = () => {
    feishuAPI.logout();
    setIsAuthenticated(false);
  };

  useEffect(() => {
    const navEl = navRef.current;
    const indicatorEl = indicatorRef.current;
    if (!navEl || !indicatorEl) {
      return;
    }

    const activeIndex = navItems.findIndex((item) => isActive(pathname, item.href));
    const activeEl = itemRefs.current[activeIndex] ?? itemRefs.current[0];
    if (!activeEl) {
      return;
    }

    const navRect = navEl.getBoundingClientRect();
    const activeRect = activeEl.getBoundingClientRect();

    gsap.to(indicatorEl, {
      y: activeRect.top - navRect.top,
      height: activeRect.height,
      duration: 0.55,
      ease: "power3.out",
    });
  }, [pathname]);

  return (
    <>
      <aside className="hidden md:flex w-64 border-r border-zinc-200/60 bg-white/65 backdrop-blur-2xl p-8 flex-col fixed inset-y-0 left-0 z-10">
        <div className="font-semibold tracking-[0.22em] uppercase text-xs text-zinc-400 mb-8">Todo Pro.</div>
        
        <div ref={navRef} className="relative flex flex-col gap-2">
          <div
            ref={indicatorRef}
            className="absolute left-0 right-0 rounded-xl shadow-[0_10px_30px_rgba(24,24,27,0.24)]"
            style={{ backgroundColor: "var(--theme-accent)", top: 0, height: 0 }}
          />
          {navItems.map((item, index) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                ref={(el) => {
                  itemRefs.current[index] = el;
                }}
                href={item.href}
                className={`relative z-10 h-11 px-4 rounded-xl text-[11px] tracking-[0.16em] uppercase font-semibold flex items-center transition-colors duration-300 ${
                  active ? "text-white" : "text-zinc-500 hover:text-zinc-900"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>

        {/* 飞书日程按钮 */}
        <div className="mt-auto">
          <button 
            onClick={() => setIsDrawerOpen(true)}
            className="w-full h-11 px-4 rounded-xl text-[11px] tracking-[0.16em] uppercase font-semibold flex items-center justify-center bg-zinc-100 hover:bg-zinc-200 transition-colors duration-300"
          >
            飞书日程
          </button>
        </div>
      </aside>

      {/* 飞书日程抽屉 */}
      {isDrawerOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-end">
          <div className="bg-white w-full max-w-md h-full overflow-y-auto animate-slide-in">
            <div className="p-6 border-b border-zinc-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-zinc-900">飞书日程</h2>
                <button 
                  onClick={() => setIsDrawerOpen(false)}
                  className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-zinc-100 transition-colors duration-300"
                >
                  ×
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              {!isAuthenticated ? (
                <div>
                  <h3 className="text-sm font-semibold text-zinc-700 mb-3">授权飞书</h3>
                  <p className="text-sm text-zinc-500 mb-4">连接飞书账号以导入日程</p>
                  <button
                    onClick={handleFeishuAuth}
                    className="w-full h-11 px-4 rounded-xl text-[11px] tracking-[0.16em] uppercase font-semibold flex items-center justify-center bg-zinc-800 text-white hover:bg-zinc-700 transition-colors duration-300"
                  >
                    授权飞书
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-semibold text-zinc-700 mb-3">导入日程</h3>
                    <p className="text-sm text-zinc-500 mb-4">从飞书导入最近30天的日程</p>
                    <button
                      onClick={handleImportFeishuEvents}
                      disabled={importing || importStatus.isImporting}
                      className="w-full h-11 px-4 rounded-xl text-[11px] tracking-[0.16em] uppercase font-semibold flex items-center justify-center bg-zinc-800 text-white hover:bg-zinc-700 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {importing || importStatus.isImporting ? '导入中...' : '导入日程'}
                    </button>
                    {importStatus.isImporting && (
                      <div className="w-full bg-zinc-200 rounded-full h-1.5 mt-2">
                        <div
                          className="bg-zinc-800 h-1.5 rounded-full transition-all duration-300"
                          style={{ width: `${importStatus.progress}%` }}
                        />
                      </div>
                    )}
                    {importResult && (
                      <div className="text-sm text-zinc-500 mt-2 text-center">
                        {importResult}
                      </div>
                    )}
                  </div>
                  <div className="border-t border-zinc-200 pt-4">
                    <button
                      onClick={handleLogout}
                      className="w-full h-11 px-4 rounded-xl text-[11px] tracking-[0.16em] uppercase font-semibold flex items-center justify-center bg-zinc-100 hover:bg-zinc-200 transition-colors duration-300"
                    >
                      退出授权
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 抽屉动画样式 */}
      <style jsx global>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
        .animate-slide-in {
          animation: slideIn 0.3s ease-out;
        }
      `}</style>
    </>
  );
}
