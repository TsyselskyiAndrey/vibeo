"use client";

import { createContext, useReducer, useCallback, type ReactNode } from "react";

export type Theme = "dark" | "light";

interface ThemeState {
  value: Theme;
  isManual: boolean;
}

type ThemeAction = { type: "SET_THEME"; payload: Theme } | { type: "TOGGLE_THEME" } | { type: "SYNC_FROM_SYSTEM"; payload: Theme };

function themeReducer(state: ThemeState, action: ThemeAction): ThemeState {
  switch (action.type) {
    case "SET_THEME":
      return { value: action.payload, isManual: true };
    case "TOGGLE_THEME":
      return { value: state.value === "dark" ? "light" : "dark", isManual: true };
    case "SYNC_FROM_SYSTEM":
      return state.isManual ? state : { ...state, value: action.payload };
    default:
      return state;
  }
}

function readInitialTheme(): Theme {
  if (typeof document === "undefined") return "dark";
  return document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark";
}

function readIsManual(): boolean {
  if (typeof localStorage === "undefined") return false;
  return localStorage.getItem("theme-manual") === "true";
}

export interface ThemeContextValue {
  theme: Theme;
  isManual: boolean;
  setTheme: (t: Theme) => void;
  toggleTheme: () => void;
  syncFromSystem: (t: Theme) => void;
}

export const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(themeReducer, undefined, () => ({
    value: readInitialTheme(),
    isManual: readIsManual(),
  }));

  const setTheme = useCallback((t: Theme) => dispatch({ type: "SET_THEME", payload: t }), []);

  const toggleTheme = useCallback(() => dispatch({ type: "TOGGLE_THEME" }), []);

  const syncFromSystem = useCallback((t: Theme) => dispatch({ type: "SYNC_FROM_SYSTEM", payload: t }), []);

  return (
    <ThemeContext.Provider
      value={{
        theme: state.value,
        isManual: state.isManual,
        setTheme,
        toggleTheme,
        syncFromSystem,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

