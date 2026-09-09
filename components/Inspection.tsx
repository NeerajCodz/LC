"use client";
import { useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { PerspectiveCamera, View } from "@react-three/drei";
import { FLOWERS } from "@/lib/flowers/catalog";
import type { FlowerType } from "@/lib/flowers/types";
import { Flower } from "./flowers/Flower";
import { Lighting } from "./scene/Lighting";

const VIEWS = [
  { name: "Front · full", angle: 0, bloom: 1, macro: false },
  { name: "Side · full", angle: Math.PI / 2, bloom: 1, macro: false },
  { name: "45° · full", angle: Math.PI / 4, bloom: 1, macro: false },
  { name: "Macro · full", angle: 0, bloom: 1, macro: true },
  { name: "Front · bud", angle: 0, bloom: 0, macro: false },
  { name: "Front · half", angle: 0, bloom: 0.5, macro: false },
  { name: "Side · bud", angle: Math.PI / 2, bloom: 0, macro: false },
];
/** Development-only visual fixture. Every tile renders the production Flower API. */
export default function Inspection() {
  const container = useRef<HTMLDivElement>(null);
  const [type, setType] = useState<FlowerType>("rose");
  return (
    <div ref={container} style={{ padding: 20 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 24,
          position: "relative",
          zIndex: 2,
        }}
      >
        <h1 style={{ fontSize: 22, margin: 0 }}>Geometry inspection</h1>
        <label>
          Species{" "}
          <select
            aria-label="Inspection species"
            value={type}
            onChange={(e) => setType(e.target.value as FlowerType)}
          >
            {FLOWERS.map((f) => (
              <option key={f.type} value={f.type}>
                {f.name}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4,1fr)",
          gap: 10,
          marginTop: 12,
        }}
      >
        {VIEWS.map((v, i) => (
          <div
            key={v.name}
            style={{ height: 410, border: "1px solid #ffffff20" }}
          >
            <p style={{ fontSize: 13, margin: 12 }}>{v.name}</p>
            <View style={{ height: 365 }} index={i + 1}>
              <PerspectiveCamera
                makeDefault
                position={[0, v.macro ? 1.25 : 1.5, v.macro ? 2.8 : 5.5]}
                fov={36}
                onUpdate={(c) => c.lookAt(0, v.macro ? 0.65 : 0.15, 0)}
              />
              <Lighting shadows={false} />
              <group rotation={[0, v.angle, 0]}>
                <Flower
                  key={type}
                  type={type}
                  bloom={v.bloom}
                  position={[0, 0.25, 0]}
                  quality={v.macro ? "ultra" : "high"}
                  windStrength={0}
                  reducedMotion
                />
              </group>
            </View>
          </div>
        ))}
      </div>
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none" }}>
        <Canvas eventSource={container as React.RefObject<HTMLElement>} dpr={1}>
          <View.Port />
        </Canvas>
      </div>
    </div>
  );
}
