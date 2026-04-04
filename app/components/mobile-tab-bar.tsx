"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import gsap from "gsap";

type TabItem = {
  label: string;
  href: string;
};

const tabs: TabItem[] = [
  { label: "概览", href: "/" },
  { label: "任务", href: "/tasks" },
  { label: "设置", href: "/settings" },
];

const isTabActive = (pathname: string, href: string) => {
  if (href === "/") {
    return pathname === "/";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
};

export default function MobileTabBar() {
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

    const activeIndex = tabs.findIndex((tab) => isTabActive(pathname, tab.href));
    const activeEl = itemRefs.current[activeIndex] ?? itemRefs.current[0];
    if (!activeEl) {
      return;
    }

    const navRect = navEl.getBoundingClientRect();
    const activeRect = activeEl.getBoundingClientRect();

    gsap.to(indicatorEl, {
      x: activeRect.left - navRect.left,
      width: activeRect.width,
      duration: 0.55,
      ease: "power3.out",
    });
  }, [pathname]);

  return (
    <div className="md:hidden fixed bottom-4 inset-x-4 z-50">
      <nav
        ref={navRef}
        className="relative h-16 border border-zinc-200/70 rounded-2xl bg-white/90 backdrop-blur-2xl shadow-[0_12px_35px_rgba(0,0,0,0.08)]"
      >
        <div
          ref={indicatorRef}
          className="absolute top-1/2 -translate-y-1/2 left-0 h-10 rounded-xl shadow-[0_8px_22px_rgba(24,24,27,0.22)]"
          style={{ width: 0, backgroundColor: "var(--theme-accent)" }}
        />
        <ul className="relative z-10 h-full grid grid-cols-3 px-2">
          {tabs.map((tab, index) => {
            const active = isTabActive(pathname, tab.href);
            return (
              <li key={tab.href} className="flex items-center justify-center">
                <Link
                  ref={(el) => {
                    itemRefs.current[index] = el;
                  }}
                  href={tab.href}
                  className={`h-10 px-4 rounded-xl text-[11px] tracking-[0.12em] font-semibold transition-colors duration-300 flex items-center justify-center ${
                    active ? "text-white" : "text-zinc-500"
                  }`}
                >
                  {tab.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
