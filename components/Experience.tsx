"use client";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  Maximize2,
  Minimize2,
  Pause,
  Play,
  RotateCcw,
  SlidersHorizontal,
  X,
  MoveUpRight,
} from "lucide-react";
import { FLOWERS, getFlower } from "@/lib/flowers/catalog";
import type { FlowerType } from "@/lib/flowers/types";
import { Header } from "./ui/Header";
import { BloomLoader } from "./ui/BloomLoader";
import { useExperienceSettings } from "@/hooks/useExperienceSettings";
import { useInView } from "@/hooks/useInView";
import AngleGallery from "./AngleGallery";
const Scene = dynamic(() => import("./flowers/FlowerScene"), { ssr: false });

export default function Experience({
  initialType,
}: {
  initialType: FlowerType;
}) {
  const router = useRouter();
  const { ref: hero, visible: heroVisible } = useInView<HTMLElement>();
  const pickerTrigger = useRef<HTMLButtonElement>(null);
  const type = initialType;
  const [target, setTarget] = useState(1),
    [bloom, setBloom] = useState(0),
    [switching, setSwitching] = useState(false),
    [picker, setPicker] = useState(false),
    [macro, setMacro] = useState(false),
    [paused, setPaused] = useState(false),
    [pulse, setPulse] = useState(0),
    [ready, setReady] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const introTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { reducedMotion } = useExperienceSettings();
  const info = getFlower(type),
    index = FLOWERS.findIndex((f) => f.type === type);
  useEffect(() => {
    if (!ready) return;
    const id = setTimeout(() => setBloom(target), reducedMotion ? 0 : 900);
    introTimer.current = id;
    return () => clearTimeout(id);
  }, [ready, reducedMotion, target]);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );
  useEffect(() => {
    if (!picker) return;
    const trigger = pickerTrigger.current;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
      trigger?.focus();
    };
  }, [picker]);
  function choose(next: FlowerType) {
    if (switching) return;
    if (next === type) {
      setPicker(false);
      return;
    }
    if (introTimer.current) clearTimeout(introTimer.current);
    if (timer.current) clearTimeout(timer.current);
    setPicker(false);
    setSwitching(true);
    setPaused(false);
    setMacro(false);
    setBloom(0);
    timer.current = setTimeout(
      () => {
        router.push(`/flower/${next}`, { scroll: false });
      },
      reducedMotion ? 0 : 1900,
    );
  }
  function setAmount(value: number) {
    if (timer.current) clearTimeout(timer.current);
    if (introTimer.current) clearTimeout(introTimer.current);
    setTarget(value);
    setBloom(value);
    setPaused(false);
  }
  function replay() {
    if (introTimer.current) clearTimeout(introTimer.current);
    setBloom(0);
    setPaused(false);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(
      () => setBloom(target),
      reducedMotion ? 0 : 2000,
    );
  }
  return (
    <main>
      {process.env.NODE_ENV === "development" && (
        <output id="render-stats" className="sr-only" />
      )}
      <section
        ref={hero}
        className="experience"
        aria-label="Interactive botanical specimen"
      >
        <div className="scene-wrap">
          <Scene
            active={heroVisible}
            type={type}
            bloom={bloom}
            macro={macro}
            paused={paused}
            pulse={pulse}
            onReady={() => setReady(true)}
            onFlowerClick={() => {
              if (!reducedMotion) setPulse((p) => p + 1);
              setMacro((m) => !m);
            }}
          />
        </div>
        {!ready && <BloomLoader variant="overlay" />}
        <Header
          onNavigate={(href) => {
            if (href === window.location.pathname) {
              setMacro(false);
              return;
            }
            if (timer.current) clearTimeout(timer.current);
            if (introTimer.current) clearTimeout(introTimer.current);
            setBloom(0);
            setPaused(false);
            setSwitching(true);
            timer.current = setTimeout(
              () => router.push(href),
              reducedMotion ? 0 : 1500,
            );
          }}
        />
        <div className={`specimen-copy ${macro ? "quiet" : ""}`}>
          <div className="eyebrow">
            <span className="live-dot" /> PROJECT LC · LIVING COLORS{" "}
            <span className="copy-rule" />
          </div>
          <div className="specimen-heading" key={type}>
            <p className="specimen-number">
              SPECIMEN {String(index + 1).padStart(2, "0")}
            </p>
            <h1 className={info.name.length > 12 ? "long-name" : ""}>
              {info.name}
              <span>.</span>
            </h1>
            <p className="latin">{info.latin}</p>
            <p className="description">{info.description}</p>
          </div>
          <button
            ref={pickerTrigger}
            className="text-button"
            onClick={() => setPicker(true)}
          >
            Explore the collection <MoveUpRight size={16} />
          </button>
          <a className="angle-gallery-link" href="#angles">
            View every angle <ArrowRight size={13} />
          </a>
        </div>
        <div className="right-annotation">
          <span>FORM, LIGHT & A LITTLE LIFE</span>
          <i />
          <span>{info.family.toUpperCase()}</span>
        </div>
        <div className="view-controls">
          <button
            title={macro ? "Return to full flower" : "Explore close-up"}
            aria-label={macro ? "Return to full flower" : "Explore close-up"}
            onClick={() => setMacro(!macro)}
          >
            {macro ? <Minimize2 size={17} /> : <Maximize2 size={17} />}
          </button>
          <button
            title={paused ? "Resume motion" : "Pause motion"}
            aria-label={paused ? "Resume motion" : "Pause motion"}
            onClick={() => setPaused(!paused)}
          >
            {paused ? <Play size={17} /> : <Pause size={17} />}
          </button>
        </div>
        <div className="specimen-pagination">
          <button
            aria-label="Previous flower"
            disabled={switching}
            onClick={() =>
              choose(
                FLOWERS[(index + FLOWERS.length - 1) % FLOWERS.length].type,
              )
            }
          >
            <ArrowLeft size={18} />
          </button>
          <span>{String(index + 1).padStart(2, "0")}</span>
          <button
            aria-label="Next flower"
            disabled={switching}
            onClick={() => choose(FLOWERS[(index + 1) % FLOWERS.length].type)}
          >
            <ArrowRight size={18} />
          </button>
        </div>
        <div className="bloom-panel">
          <div className="bloom-label">
            <SlidersHorizontal size={15} />
            <label htmlFor="bloom">The art of unfolding</label>
            <span>{Math.round(target * 100)}%</span>
          </div>
          <input
            id="bloom"
            aria-label="Bloom amount"
            type="range"
            min="0"
            max="1"
            step=".01"
            value={target}
            disabled={switching}
            onChange={(e) => setAmount(Number(e.target.value))}
          />
          <div className="bloom-endpoints">
            <span>Bud</span>
            <button onClick={replay} disabled={switching}>
              <RotateCcw size={11} /> Replay bloom
            </button>
            <span>Full bloom</span>
          </div>
        </div>
        <div className="interaction-hint">
          <span className="hint-cross">✧</span>
          <span>Move to sway. Click to get closer.</span>
        </div>
        <footer className="experience-footer">
          <span className="footer-wordmark">living colors</span>
          <a href="#unfold">
            Take a moment <ChevronDown size={13} />
          </a>
          <span className="rendering-note">
            <span className="live-dot" /> REAL-TIME · EVER-CHANGING
          </span>
        </footer>
      </section>
      <AngleGallery type={type} />
      <ScrollStudy type={type} />
      {picker && (
        <div
          className="collection-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Choose a flower"
          onKeyDown={(e) => {
            if (e.key === "Escape") setPicker(false);
            if (e.key === "Tab") {
              const buttons = Array.from(
                e.currentTarget.querySelectorAll("button"),
              );
              const current = buttons.indexOf(
                document.activeElement as HTMLButtonElement,
              );
              if (e.shiftKey && current === 0) {
                e.preventDefault();
                buttons.at(-1)?.focus();
              } else if (!e.shiftKey && current === buttons.length - 1) {
                e.preventDefault();
                buttons[0]?.focus();
              }
            }
          }}
        >
          <div className="overlay-header">
            <span className="eyebrow">PROJECT LC — ALWAYS GROWING</span>
            <button
              autoFocus
              aria-label="Close collection"
              onClick={() => setPicker(false)}
            >
              <X size={25} />
            </button>
          </div>
          <h2>
            The living collection<span>.</span>
          </h2>
          <p className="collection-mission">
            Our mission: bring every single flower in the world to life in 3D.
          </p>
          <div className="species-list">
            {FLOWERS.map((flower, i) => (
              <button
                key={flower.type}
                className={flower.type === type ? "selected" : ""}
                onClick={() => choose(flower.type)}
              >
                <span className="species-index">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span>
                  {flower.name}
                  <small>{flower.latin}</small>
                </span>
                <span
                  className="species-color"
                  style={{ background: flower.color }}
                />
                <ArrowRight size={18} />
              </button>
            ))}
          </div>
        </div>
      )}
      <span className="sr-only" aria-live="polite">
        {switching
          ? "Gently closing the flower"
          : `${info.name}, specimen ${index + 1}`}
      </span>
    </main>
  );
}

function ScrollStudy({ type }: { type: FlowerType }) {
  const { ref: section, visible, visited } = useInView<HTMLElement>();
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const node = section.current;
    if (!node) return;
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const r = node.getBoundingClientRect();
        setProgress(
          Math.min(1, Math.max(0, -r.top / (r.height - innerHeight))),
        );
      });
    };
    addEventListener("scroll", update, { passive: true });
    update();
    return () => {
      removeEventListener("scroll", update);
      cancelAnimationFrame(frame);
    };
  }, [section]);
  return (
    <section id="unfold" className="scroll-study" ref={section}>
      <div className="scroll-sticky">
        <div className="scroll-copy">
          <span className="eyebrow">AN EXERCISE IN PATIENCE</span>
          <h2>
            Beautiful things
            <br />
            take their <em>time.</em>
          </h2>
          <p>Keep scrolling. Let nature set the pace.</p>
          <div className="scroll-stages">
            <span className={progress < 0.4 ? "active" : ""}>
              01 — Becoming
            </span>
            <span className={progress >= 0.4 && progress < 0.8 ? "active" : ""}>
              02 — Unfolding
            </span>
            <span className={progress >= 0.8 ? "active" : ""}>
              03 — In full bloom
            </span>
          </div>
        </div>
        <div className="scroll-scene">
          {visited && (
            <Scene
              active={visible}
              type={type}
              bloom={Math.max(0, (progress - 0.4) / 0.4)}
              growth={Math.min(1, progress / 0.35)}
            />
          )}
        </div>
        <span className="scroll-progress">
          {Math.round(progress * 100)} / 100
        </span>
      </div>
    </section>
  );
}
