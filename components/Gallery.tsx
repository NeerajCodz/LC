"use client";
import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Canvas } from "@react-three/fiber";
import { PerspectiveCamera, View } from "@react-three/drei";
import { ArrowUpRight } from "lucide-react";
import { FLOWERS, type FlowerInfo } from "@/lib/flowers/catalog";
import { Flower } from "./flowers/Flower";
import { Lighting } from "./scene/Lighting";
import { Header } from "./ui/Header";
import { useExperienceSettings } from "@/hooks/useExperienceSettings";

type Angle = "front" | "side" | "45°" | "macro";
export default function Gallery() {
  const container = useRef<HTMLDivElement>(null);
  const [angle, setAngle] = useState<Angle>("front"),
    [bloom, setBloom] = useState(1);
  return (
    <div ref={container} className="gallery-page">
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
      <div className="gallery-grid">
        {FLOWERS.map((info, i) => (
          <SpecimenPreview
            key={info.type}
            info={info}
            index={i}
            angle={angle}
            bloom={bloom}
          />
        ))}
      </div>
      <div className="gallery-canvas">
        <Canvas
          eventSource={container as React.RefObject<HTMLElement>}
          dpr={[1, 1.4]}
          gl={{ antialias: true, alpha: true }}
        >
          <View.Port />
        </Canvas>
      </div>
      <footer className="collection-footer">
        <span>Fifteen species. Infinite small details.</span>
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
  const { reducedMotion, quality } = useExperienceSettings();
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
  const macro = angle === "macro";
  return (
    <article
      ref={ref}
      className="gallery-specimen"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <Link
        href={`/?flower=${info.type}`}
        className="preview-link"
        aria-label={`Explore ${info.name}`}
      >
        <span className="preview-number">
          {String(index + 1).padStart(2, "0")} / 15
        </span>
        <View className="gallery-preview" index={index + 1} visible={visible}>
          {visible && (
            <Suspense fallback={null}>
              <PerspectiveCamera
                makeDefault
                position={[
                  0,
                  macro ? 1.4 : 1.7,
                  macro
                    ? quality === "low"
                      ? 3.5
                      : 2.8
                    : quality === "low"
                      ? 7
                      : 5.5,
                ]}
                fov={36}
                onUpdate={(camera) => camera.lookAt(0, macro ? 0.5 : 0.05, 0)}
              />
              <Lighting shadows={false} />
              <group
                rotation={[
                  0,
                  angle === "side"
                    ? Math.PI / 2
                    : angle === "45°"
                      ? Math.PI / 4
                      : 0,
                  0,
                ]}
              >
                <Flower
                  type={info.type}
                  position={[0, 0.25, 0]}
                  bloom={bloom}
                  hovered={hover}
                  quality="low"
                  windStrength={0.3}
                  reducedMotion={reducedMotion}
                />
              </group>
            </Suspense>
          )}
        </View>
        <div className="preview-caption">
          <div>
            <h2>{info.name}</h2>
            <span>{info.latin}</span>
          </div>
          <ArrowUpRight size={20} />
        </div>
      </Link>
    </article>
  );
}
