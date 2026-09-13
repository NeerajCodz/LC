"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ArrowUpRight, Search } from "lucide-react";
import { FLOWERS, type FlowerInfo } from "@/lib/flowers/catalog";
import { FlowerPreview } from "./flowers/FlowerPreview";
import { Header } from "./ui/Header";
import { PreviewStage } from "./scene/PreviewStage";

type Angle = "front" | "side" | "45°" | "macro";

const PAGE_SIZE = 20;
export default function Gallery() {
  const [angle, setAngle] = useState<Angle>("front"),
    [bloom, setBloom] = useState(1),
    [query, setQuery] = useState(""),
    [page, setPage] = useState(1);
  const resultsStart = useRef<HTMLDivElement>(null);
  const matches = useMemo(() => {
    const search = query.trim().toLocaleLowerCase();
    return FLOWERS.filter(
      (info) =>
        !search ||
        [info.name, info.latin, info.family].some((value) =>
          value.toLocaleLowerCase().includes(search),
        ),
    );
  }, [query]);
  const totalPages = Math.max(1, Math.ceil(matches.length / PAGE_SIZE));
  const visibleTypes = new Set(
    matches
      .slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
      .map((info) => info.type),
  );
  const showPage = (nextPage: number) => {
    setPage(nextPage);
    requestAnimationFrame(() =>
      resultsStart.current?.scrollIntoView({ block: "start" }),
    );
  };

  return (
    <div className="gallery-page">
      <Header active="gallery" />
      <div className="collection-intro">
        <div>
          <span className="eyebrow">PROJECT LC — THE GROWING COLLECTION</span>
          <h1>
            A world in <em>bloom.</em>
          </h1>
        </div>
        <div className="gallery-search">
          <label htmlFor="collection-search">Search the collection</label>
          <div className="gallery-search-field">
            <Search size={16} aria-hidden="true" />
            <input
              id="collection-search"
              type="search"
              value={query}
              placeholder="Name, family, or Latin name"
              autoComplete="off"
              spellCheck="false"
              onChange={(event) => {
                setQuery(event.target.value);
                setPage(1);
              }}
            />
            <span aria-live="polite">
              {matches.length} {matches.length === 1 ? "flower" : "flowers"}
            </span>
          </div>
        </div>
      </div>
      <div className="gallery-toolbar">
        <div className="angle-picker" role="group" aria-label="Viewing angle">
          {(["front", "side", "45°", "macro"] as const).map((a) => (
            <button
              key={a}
              aria-pressed={a === angle}
              onClick={() => setAngle(a)}
            >
              {a === "45°" ? "45° view" : a[0].toUpperCase() + a.slice(1)}
            </button>
          ))}
        </div>
        <div className="gallery-bloom">
          <label htmlFor="collection-bloom">Bloom</label>
          <input
            id="collection-bloom"
            type="range"
            min="0"
            max="1"
            step=".01"
            value={bloom}
            onChange={(event) => setBloom(Number(event.target.value))}
          />
          <span>{Math.round(bloom * 100)}%</span>
        </div>
      </div>
      <div ref={resultsStart} className="gallery-results-start" />
      <PreviewStage className="gallery-grid">
        {/* Retain visited preview portals when filtering or changing pages. */}
        {FLOWERS.map((info, index) => (
          <SpecimenPreview
            key={info.type}
            info={info}
            index={index}
            angle={angle}
            bloom={bloom}
            shown={visibleTypes.has(info.type)}
          />
        ))}
        {matches.length === 0 && (
          <p className="gallery-empty">
            No flowers found for &ldquo;{query.trim()}&rdquo;.
          </p>
        )}
      </PreviewStage>
      {matches.length > 0 && totalPages > 1 && (
        <nav className="gallery-pagination" aria-label="Collection pages">
          <button
            type="button"
            disabled={page === 1}
            onClick={() => showPage(page - 1)}
          >
            <ArrowLeft size={14} aria-hidden="true" />
            Previous
          </button>
          <div>
            {Array.from({ length: totalPages }, (_, index) => {
              const pageNumber = index + 1;
              return (
                <button
                  key={pageNumber}
                  type="button"
                  aria-label={`Page ${pageNumber}`}
                  aria-current={pageNumber === page ? "page" : undefined}
                  onClick={() => showPage(pageNumber)}
                >
                  {pageNumber}
                </button>
              );
            })}
          </div>
          <button
            type="button"
            disabled={page === totalPages}
            onClick={() => showPage(page + 1)}
          >
            Next
            <ArrowRight size={14} aria-hidden="true" />
          </button>
        </nav>
      )}
      <footer className="collection-footer">
        <span className="footer-wordmark">living colors</span>
        <Link href="/garden">
          Step into the garden <ArrowUpRight size={16} />
        </Link>
      </footer>
    </div>
  );
}
function SpecimenPreview({
  info,
  index,
  angle,
  bloom,
  shown,
}: {
  info: FlowerInfo;
  index: number;
  angle: Angle;
  bloom: number;
  shown: boolean;
}) {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false),
    [hover, setHover] = useState(false);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([e]) => setVisible(e.isIntersecting),
      { rootMargin: "80px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  return (
    <article
      ref={ref}
      className="gallery-specimen"
      hidden={!shown}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <Link
        href={`/flower/${info.type}`}
        className="preview-link"
        aria-label={`Explore ${info.name}`}
      >
        <span className="preview-number">
          {String(index + 1).padStart(2, "0")}
        </span>
        <FlowerPreview
          className="gallery-preview"
          type={info.type}
          angle={angle === "45°" ? "three-quarter" : angle}
          bloom={bloom}
          hovered={hover}
          visible={shown && visible}
        />
        <div className="preview-caption">
          <div>
            <h2>{info.name}</h2>
            <span>{info.latin}</span>
          </div>
          <ArrowUpRight size={20} />
        </div>
      </Link>
      <Link
        className="preview-angles-link"
        href={`/flower/${info.type}/#angles`}
        aria-label={`View ${info.name} from every angle`}
      >
        View every angle <ArrowUpRight size={12} />
      </Link>
    </article>
  );
}
