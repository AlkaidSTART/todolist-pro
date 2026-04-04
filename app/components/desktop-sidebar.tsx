"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import gsap from "gsap";

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
  const navRef = useRef<HTMLDivElement | null>(null);
  const indicatorRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef<(HTMLAnchorElement | null)[]>([]);

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
    <aside className="hidden md:flex w-64 border-r border-zinc-200/60 bg-white/65 backdrop-blur-2xl p-8 flex-col gap-8 fixed inset-y-0 left-0">
      <div className="font-semibold tracking-[0.22em] uppercase text-xs text-zinc-400">Todo Pro.</div>
      <div ref={navRef} className="relative flex flex-col gap-2">
        <div
          ref={indicatorRef}
          className="absolute left-0 right-0 rounded-xl bg-zinc-900 shadow-[0_10px_30px_rgba(24,24,27,0.24)]"
          style={{ top: 0, height: 0 }}
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
    </aside>
  );
}
