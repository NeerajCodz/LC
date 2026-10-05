"use client";
import { useRef, useState } from "react";
import { botanicalEvents } from "@/lib/three/events";
import { PerspectiveCamera, View } from "@react-three/drei";
import { FLOWERS } from "@/lib/flowers/catalog";
import type { FlowerType } from "@/lib/flowers/types";
import { Flower } from "./flowers/Flower";
import { Lighting } from "./scene/Lighting";
import { SafeCanvas } from "./scene/SafeCanvas";
import { FLOWER_STRUCTURES } from "@/lib/flowers/structures";

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
  const [wind, setWind] = useState(false);
  const structure = FLOWER_STRUCTURES[type],
    center = structure.headCenter ?? [0, 0.25, 0];
  const targetY =
    0.25 +
    center[1] * Math.cos(structure.headTilt) -
    center[2] * Math.sin(structure.headTilt);
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
        <button aria-pressed={wind} onClick={() => setWind(!wind)}>
          Wind study
        </button>
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
                position={[
                  v.macro ? center[0] : 0,
                  v.macro ? targetY + 0.8 : 0.6,
                  (v.macro ? 3 : 5.5) * (structure.previewScale ?? 1),
                ]}
                fov={36}
                onUpdate={(c) =>
                  c.lookAt(
                    v.macro ? center[0] : 0,
                    v.macro ? targetY : -0.45,
                    v.macro ? center[2] : 0,
                  )
                }
              />
              <Lighting shadows={false} followCursor={false} />
              <group rotation={[0, v.angle, 0]}>
                <Flower
                  key={type}
                  type={type}
                  bloom={v.bloom}
                  position={[0, 0.25, 0]}
                  quality={v.macro ? "ultra" : "high"}
                  windStrength={wind ? 2 : 0}
                  animateEntrance={false}
                  reducedMotion={!wind}
                />
              </group>
            </View>
          </div>
        ))}
      </div>
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none" }}>
        <SafeCanvas
          events={botanicalEvents}
          eventSource={container as React.RefObject<HTMLElement>}
          dpr={1}
        >
          <View.Port />
        </SafeCanvas>
      </div>
    </div>
  );
}
