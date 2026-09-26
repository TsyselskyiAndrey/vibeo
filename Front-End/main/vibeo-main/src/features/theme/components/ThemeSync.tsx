"use client";

import { useEffect } from "react";
import { useTheme } from "@/features/theme/hooks/useTheme";

export default function ThemeSync() {
  const { theme, isManual, syncFromSystem } = useTheme();

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
    localStorage.setItem("theme-manual", String(isManual));
  }, [theme, isManual]);

  useEffect(() => {
    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    function handleChange(e: MediaQueryListEvent) {
      syncFromSystem(e.matches ? "dark" : "light");
    }
    mql.addEventListener("change", handleChange);
    return () => mql.removeEventListener("change", handleChange);
  }, [syncFromSystem]);

  return null;
}
