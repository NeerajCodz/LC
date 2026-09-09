import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { MouseEvent } from "react";
import { ThemeSwitcher } from "./ThemeSwitcher";
export function Header({
  active = "specimen",
  onNavigate,
}: {
  active?: "specimen" | "garden" | "gallery";
  onNavigate?: (href: string) => void;
}) {
  const navigate = (event: MouseEvent<HTMLAnchorElement>, href: string) => {
    if (
      onNavigate &&
      !event.metaKey &&
      !event.ctrlKey &&
      !event.shiftKey &&
      !event.altKey
    ) {
      event.preventDefault();
      onNavigate(href);
    }
  };
  return (
    <header className="site-header">
      <Link
        href="/"
        className="wordmark"
        aria-label="Living Colors home"
        onClick={(e) => navigate(e, "/")}
      >
        <span>LC</span>
      </Link>
      <nav aria-label="Main navigation">
        <Link
          href="/"
          onClick={(e) => navigate(e, "/")}
          aria-current={active === "specimen" ? "page" : undefined}
        >
          The specimen
        </Link>
        <Link
          href="/garden"
          onClick={(e) => navigate(e, "/garden")}
          aria-current={active === "garden" ? "page" : undefined}
        >
          The garden
        </Link>
        <Link
          href="/gallery"
          onClick={(e) => navigate(e, "/gallery")}
          aria-current={active === "gallery" ? "page" : undefined}
        >
          The collection <ArrowUpRight size={13} />
        </Link>
      </nav>
      <ThemeSwitcher />
    </header>
  );
}
