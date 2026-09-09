"use client";
import { useSyncExternalStore } from "react";
import { isTheme, THEME_STORAGE_KEY, type Theme } from "@/lib/theme";

const CHANGE_EVENT = "living-colors-theme-change";
function readTheme(): Theme {
  const value = document.documentElement.dataset.theme;
  return isTheme(value) ? value : "current";
}
function subscribe(listener: () => void) {
  const onStorage = (event: StorageEvent) => {
    if (event.key !== THEME_STORAGE_KEY && event.key !== null) return;
    document.documentElement.dataset.theme = isTheme(event.newValue)
      ? event.newValue
      : "current";
    listener();
  };
  window.addEventListener(CHANGE_EVENT, listener);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(CHANGE_EVENT, listener);
    window.removeEventListener("storage", onStorage);
  };
}
function setTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Viewing and switching still work when storage is unavailable.
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}
export function useTheme() {
  const theme = useSyncExternalStore<Theme>(
    subscribe,
    readTheme,
    () => "current",
  );
  return { theme, setTheme };
}
