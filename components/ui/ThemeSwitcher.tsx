"use client";
import { useTheme } from "@/hooks/useTheme";
import { THEMES } from "@/lib/theme";

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  return (
    <div className="theme-switcher" role="group" aria-label="Color theme">
      <span>Theme</span>
      {THEMES.map((value) => (
        <button
          key={value}
          aria-pressed={theme === value}
          aria-label={`${value[0].toUpperCase() + value.slice(1)} theme`}
          onClick={() => setTheme(value)}
        >
          <i className={`theme-swatch theme-swatch-${value}`} />
          {value[0].toUpperCase() + value.slice(1)}
        </button>
      ))}
    </div>
  );
}
