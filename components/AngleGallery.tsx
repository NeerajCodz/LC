"use client";
import { useState, type RefObject } from "react";
import Link from "next/link";
import { Canvas } from "@react-three/fiber";
import { View } from "@react-three/drei";
import { ArrowUpRight } from "lucide-react";
import { BotanicalView } from "./flowers/BotanicalView";
import { FLOWER_VIEWS } from "@/lib/flowers/views";
import { getFlower } from "@/lib/flowers/catalog";
import type { FlowerType } from "@/lib/flowers/types";
import { useInView } from "@/hooks/useInView";
import { useExperienceSettings } from "@/hooks/useExperienceSettings";

export default function AngleGallery({ type }: { type: FlowerType }) {
  const { ref, visible } = useInView<HTMLElement>();
  const [bloom, setBloom] = useState(1);
  const { quality } = useExperienceSettings();
  const info = getFlower(type);
  return (
    <section
      id="angles"
      className="angle-gallery"
      ref={ref}
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
      <div className="angle-gallery-grid">
        {FLOWER_VIEWS.map((view, i) => (
          <AngleFrame
            key={view.id}
            type={type}
            view={view}
            index={i + 1}
            bloom={bloom}
          />
        ))}
      </div>
      {visible && (
        <div className="angle-gallery-canvas" aria-hidden="true">
          <Canvas
            eventSource={ref as RefObject<HTMLElement>}
            dpr={quality === "low" ? 1 : [1, 1.5]}
            gl={{ antialias: true, alpha: true }}
          >
            <View.Port />
          </Canvas>
        </div>
      )}
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
  index,
  bloom,
}: {
  type: FlowerType;
  view: (typeof FLOWER_VIEWS)[number];
  index: number;
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
      <View className="angle-frame-view" index={index} visible={visible}>
        {visible && (
          <BotanicalView
            type={type}
            angle={view.id}
            bloom={bloom}
            hovered={hovered}
            detailed
          />
        )}
      </View>
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
