"use client";

import { useCallback, useEffect, useState } from "react";

export type Theme = "dark" | "light";

const STORAGE_KEY = "sentiwellyn-theme";

function readTheme(): Theme {
  if (typeof document === "undefined") return "dark";
  return document.documentElement.dataset.theme === "light" ? "light" : "dark";
}

/**
 * Reads the theme the bootstrap script already applied, so there is no
 * second source of truth and no first-paint flash.
 */
export function useTheme() {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    setTheme(readTheme());
  }, []);

  const toggle = useCallback(() => {
    const next: Theme = readTheme() === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Private mode or blocked storage: the toggle still works for this session.
    }
    setTheme(next);
  }, []);

  return { theme, toggle };
}
