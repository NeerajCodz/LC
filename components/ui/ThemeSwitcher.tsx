"use client";
import { useTheme } from "@/hooks/useTheme";
import { THEMES } from "@/lib/theme";
import { Leaf, Moon, Sun } from "lucide-react";

const THEME_ICONS = { current: Leaf, black: Moon, white: Sun };
const THEME_LABELS = { current: "Current", black: "Black", white: "White" };

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const nextTheme = THEMES[(THEMES.indexOf(theme) + 1) % THEMES.length];
  const label = `Theme: ${THEME_LABELS[theme]}. Switch to ${THEME_LABELS[nextTheme]} theme`;
  return (
    <button
      type="button"
      className="theme-toggle"
      data-theme={theme}
      aria-label={label}
      title={label}
      onClick={() => setTheme(nextTheme)}
    >
      <span className="theme-toggle-thumb" aria-hidden="true" />
      {THEMES.map((value) => (
        <ThemeIcon key={value} theme={value} selected={value === theme} />
      ))}
      <span className="sr-only" aria-live="polite">
        {THEME_LABELS[theme]} theme
      </span>
    </button>
  );
}

function ThemeIcon({
  theme,
  selected,
}: {
  theme: (typeof THEMES)[number];
  selected: boolean;
}) {
  const Icon = THEME_ICONS[theme];
  return (
    <span
      className={`theme-toggle-icon${selected ? " is-selected" : ""}`}
      aria-hidden="true"
    >
      <Icon size={15} strokeWidth={1.6} />
    </span>
  );
}
