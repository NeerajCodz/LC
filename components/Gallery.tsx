"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { FLOWERS, type FlowerInfo } from "@/lib/flowers/catalog";
import { FlowerPreview } from "./flowers/FlowerPreview";
import { Header } from "./ui/Header";
import { PreviewStage } from "./scene/PreviewStage";

type Angle = "front" | "side" | "45°" | "macro";
export default function Gallery() {
  const [angle, setAngle] = useState<Angle>("front"),
    [bloom, setBloom] = useState(1);
  return (
    <div className="gallery-page">
      <Header active="gallery" />
      <div className="collection-intro">
        <div>
          <span className="eyebrow">THE LIVING COLLECTION — VOLUME 01</span>
          <h1>
            Fifteen little <em>wonders.</em>
          </h1>
        </div>
        <p>
          A closer look at nature’s extraordinary forms.
          <br />
          Choose a specimen. Watch it unfold.
        </p>
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
            onChange={(e) => setBloom(Number(e.target.value))}
          />
          <span>{Math.round(bloom * 100)}%</span>
        </div>
      </div>
      <PreviewStage className="gallery-grid">
        {FLOWERS.map((info, i) => (
          <SpecimenPreview
            key={info.type}
            info={info}
            index={i}
            angle={angle}
            bloom={bloom}
          />
        ))}
      </PreviewStage>
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
}: {
  info: FlowerInfo;
  index: number;
  angle: Angle;
  bloom: number;
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
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <Link
        href={`/flower/${info.type}`}
        className="preview-link"
        aria-label={`Explore ${info.name}`}
      >
        <span className="preview-number">
          {String(index + 1).padStart(2, "0")} / 15
        </span>
        <FlowerPreview
          className="gallery-preview"
          type={info.type}
          angle={angle === "45°" ? "three-quarter" : angle}
          bloom={bloom}
          hovered={hover}
          visible={visible}
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
