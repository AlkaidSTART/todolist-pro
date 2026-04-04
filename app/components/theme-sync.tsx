"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { themePalettes, useAppStore } from "@/lib/app-store";

export default function ThemeSync() {
  const themeMode = useAppStore((state) => state.settings.theme);
  const palette = useAppStore((state) => state.settings.palette);

  useEffect(() => {
    const root = document.documentElement;
    const media = window.matchMedia("(prefers-color-scheme: dark)");

    const applyMode = () => {
      const resolvedMode =
        themeMode === "system" ? (media.matches ? "dark" : "light") : themeMode;

      root.setAttribute("data-ui-mode", resolvedMode);
    };

    applyMode();

    const handleMediaChange = () => {
      if (themeMode === "system") {
        applyMode();
      }
    };

    media.addEventListener("change", handleMediaChange);
    return () => media.removeEventListener("change", handleMediaChange);
  }, [themeMode]);

  useEffect(() => {
    const root = document.documentElement;
    const tokens = themePalettes[palette];

    gsap.to(root, {
      "--theme-accent": tokens.accent,
      "--theme-accent-soft": tokens.accentSoft,
      "--theme-bg-start": tokens.bgStart,
      "--theme-bg-end": tokens.bgEnd,
      "--theme-surface": tokens.surface,
      duration: 0.7,
      ease: "power2.out",
    });
  }, [palette]);

  return null;
}