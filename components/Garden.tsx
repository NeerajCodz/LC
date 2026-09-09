"use client";
import dynamic from "next/dynamic";
import { useState } from "react";
import Link from "next/link";
import { Pause, Play, Wind, ArrowUpRight } from "lucide-react";
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
  return (
    <main className="garden-page">
      <div className="garden-scene">
        <Scene
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
          Let it <em>grow.</em>
        </h1>
        <p>Different forms. A shared rhythm.</p>
      </div>
      <div className="garden-tools">
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
        Move gently through the garden. Select a flower to meet it.
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
