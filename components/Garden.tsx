"use client";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Pause, Play, Wind, ArrowUpRight } from "lucide-react";
import { FLOWERS, getFlower } from "@/lib/flowers/catalog";
import type { FlowerType } from "@/lib/flowers/types";
import { Header } from "./ui/Header";
import { BloomLoader } from "./ui/BloomLoader";
const Scene = dynamic(() => import("./flowers/FlowerGarden"), {
  ssr: false,
});
export default function Garden() {
  const [bloom, setBloom] = useState(1),
    [paused, setPaused] = useState(false),
    [pulse, setPulse] = useState(0),
    [ready, setReady] = useState(false);
  const [selected, setSelected] = useState<FlowerType | null>(null);
  const [reset, setReset] = useState(0);
  useEffect(() => {
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelected(null);
        setReset((v) => v + 1);
      }
    };
    window.addEventListener("keydown", escape);
    return () => window.removeEventListener("keydown", escape);
  }, []);
  return (
    <main className="garden-page">
      <div className="garden-scene">
        <Scene
          selected={selected}
          onSelect={setSelected}
          reset={reset}
          bloom={bloom}
          paused={paused}
          pulse={pulse}
          onReady={() => setReady(true)}
        />
        {!ready && <BloomLoader variant="overlay" />}
      </div>
      <Header active="garden" />
      <div className="garden-heading">
        <span className="eyebrow">A SMALL PLACE TO GET LOST</span>
        <h1>
          {selected ? (
            getFlower(selected).name
          ) : (
            <>
              Let it <em>grow.</em>
            </>
          )}
        </h1>
        <p>
          {selected
            ? "A closer look, within the garden."
            : "Different forms. A shared rhythm."}
        </p>
      </div>
      <div className="garden-tools">
        <select
          aria-label="Explore a garden flower"
          value={selected ?? ""}
          onChange={(event) =>
            setSelected(
              event.target.value ? (event.target.value as FlowerType) : null,
            )
          }
        >
          <option value="">Full garden</option>
          {FLOWERS.map((flower) => (
            <option key={flower.type} value={flower.type}>
              {flower.name}
            </option>
          ))}
        </select>
        <button
          onClick={() => {
            setSelected(null);
            setReset((v) => v + 1);
          }}
        >
          {selected ? "Return to garden" : "Reset view"}
        </button>
        {selected && (
          <Link href={`/flower/${selected}/`}>
            Specimen <ArrowUpRight size={13} />
          </Link>
        )}
        <button
          onClick={() => {
            setPaused(false);
            setPulse((p) => p + 1);
          }}
        >
          <Wind size={16} /> A passing breeze
        </button>
        <button
          aria-label={paused ? "Resume garden" : "Pause garden"}
          onClick={() => setPaused(!paused)}
        >
          {paused ? <Play size={16} /> : <Pause size={16} />}
        </button>
      </div>
      <div className="bloom-panel">
        <div className="bloom-label">
          <label htmlFor="garden-bloom">A garden, unfolding</label>
          <span>{Math.round(bloom * 100)}%</span>
        </div>
        <input
          id="garden-bloom"
          aria-label="Garden bloom amount"
          type="range"
          min="0"
          max="1"
          step=".01"
          value={bloom}
          onChange={(e) => setBloom(Number(e.target.value))}
        />
        <div className="bloom-endpoints">
          <span>Bud</span>
          <span>Full bloom</span>
        </div>
      </div>
      <div className="garden-hint">
        Drag to rotate / Scroll or pinch to zoom / Tap for macro
      </div>
      <footer className="experience-footer">
        <span className="footer-wordmark">living colors</span>
        <Link href="/gallery">
          Meet every species <ArrowUpRight size={13} />
        </Link>
        <span>PROJECT LC · ALWAYS GROWING</span>
      </footer>
    </main>
  );
}
