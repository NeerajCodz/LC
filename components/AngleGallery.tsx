"use client";
import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { FlowerPreview } from "./flowers/FlowerPreview";
import { FLOWER_VIEWS } from "@/lib/flowers/views";
import { getFlower } from "@/lib/flowers/catalog";
import type { FlowerType } from "@/lib/flowers/types";
import { useInView } from "@/hooks/useInView";
import { PreviewStage } from "./scene/PreviewStage";

export default function AngleGallery({ type }: { type: FlowerType }) {
  const [bloom, setBloom] = useState(1);
  const info = getFlower(type);
  return (
    <section
      id="angles"
      className="angle-gallery"
      aria-labelledby="angle-gallery-title"
    >
      <div className="angle-gallery-heading">
        <div>
          <span className="eyebrow">THE {info.name.toUpperCase()} GALLERY</span>
          <h2 id="angle-gallery-title">
            Beautiful from <em>every angle.</em>
          </h2>
        </div>
        <p>{info.detail}</p>
      </div>
      <div className="angle-gallery-tools">
        <span>Four perspectives. One living specimen.</span>
        <div className="gallery-bloom">
          <label htmlFor="angle-bloom">Unfold all views</label>
          <input
            id="angle-bloom"
            aria-label="Angle gallery bloom"
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
      <PreviewStage className="angle-gallery-grid">
        {FLOWER_VIEWS.map((view) => (
          <AngleFrame key={view.id} type={type} view={view} bloom={bloom} />
        ))}
      </PreviewStage>
      <div className="angle-gallery-end">
        <span>Move gently to explore the form.</span>
        <Link href="/gallery">
          Discover all fifteen flowers <ArrowUpRight size={15} />
        </Link>
      </div>
    </section>
  );
}

function AngleFrame({
  type,
  view,
  bloom,
}: {
  type: FlowerType;
  view: (typeof FLOWER_VIEWS)[number];
  bloom: number;
}) {
  const { ref, visible } = useInView<HTMLElement>();
  const [hovered, setHovered] = useState(false);
  return (
    <figure
      ref={ref}
      className={`angle-frame angle-frame-${view.id}`}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
    >
      <span className="angle-frame-number">
        {view.number} / {view.label.toUpperCase()}
      </span>
      <FlowerPreview
        className="angle-frame-view"
        type={type}
        angle={view.id}
        bloom={bloom}
        hovered={hovered}
        visible={visible}
        detailed
      />
      <figcaption>
        <h3>
          {view.label}
          <span> view</span>
        </h3>
        <p>{view.detail}</p>
      </figcaption>
    </figure>
  );
}
