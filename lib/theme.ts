export const THEMES = ["current", "black", "white"] as const;
export type Theme = (typeof THEMES)[number];
export const THEME_BACKGROUNDS: Record<Theme, string> = {
  current: "#101713",
  black: "#090909",
  white: "#f5f3ed",
};
export const THEME_STORAGE_KEY = "living-colors-theme";
export function isTheme(value: unknown): value is Theme {
  return value === "current" || value === "black" || value === "white";
}
