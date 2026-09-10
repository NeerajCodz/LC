"use client";
import { Suspense, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { botanicalEvents } from "@/lib/three/events";
import { ContactShadows, PerformanceMonitor } from "@react-three/drei";
import { PCFShadowMap } from "three";
import { useRouter } from "next/navigation";
import { Flower } from "./Flower";
import { Lighting } from "../scene/Lighting";
import { Environment } from "../scene/Environment";
import { SurfaceDetail } from "../scene/SurfaceDetail";
import { SceneReady } from "../scene/SceneReady";
import { RenderBudget } from "../scene/RenderBudget";
import { CameraRig } from "../scene/CameraRig";
import { Pollen } from "../scene/Pollen";
import { useExperienceSettings } from "@/hooks/useExperienceSettings";
import type { FlowerType, Vec3 } from "@/lib/flowers/types";
import { useTheme } from "@/hooks/useTheme";
import { THEME_BACKGROUNDS } from "@/lib/theme";
const PLANTS: {
  type: FlowerType;
  position: Vec3;
  scale: number;
  rotation: Vec3;
}[] = [
  {
    type: "lavender",
    position: [-2.6, -0.05, -0.2],
    scale: 0.95,
    rotation: [0, 0.2, -0.09],
  },
  {
    type: "sunflower",
    position: [-1.65, 0.4, -0.8],
    scale: 0.95,
    rotation: [0, -0.1, 0.09],
  },
  {
    type: "lily",
    position: [-0.45, 0.15, -1],
    scale: 0.86,
    rotation: [0, -0.4, 0],
  },
  {
    type: "peony",
    position: [1.05, 0.45, -0.7],
    scale: 1,
    rotation: [0, -0.22, -0.04],
  },
  {
    type: "cherry-blossom",
    position: [2.35, 0.2, -0.5],
    scale: 0.93,
    rotation: [0, -0.15, -0.09],
  },
  {
    type: "daisy",
    position: [-1.6, -0.45, 1.05],
    scale: 0.6,
    rotation: [0, 0.15, 0.12],
  },
  {
    type: "tulip",
    position: [-0.65, -0.15, 0.7],
    scale: 0.78,
    rotation: [0, -0.1, -0.04],
  },
  {
    type: "rose",
    position: [0.55, -0.25, 0.9],
    scale: 0.72,
    rotation: [0, 0.15, 0.1],
  },
  {
    type: "marigold",
    position: [1.7, -0.48, 1.0],
    scale: 0.7,
    rotation: [0, -0.14, -0.07],
  },
];
export default function FlowerGarden({
  bloom,
  paused,
  pulse,
  onReady,
}: {
  bloom: number;
  paused: boolean;
  pulse: number;
  onReady?: () => void;
}) {
  const { quality, reducedMotion, constrained } = useExperienceSettings();
  const { theme } = useTheme();
  const [degraded, setDegraded] = useState(false);
  const router = useRouter();
  return (
    <Canvas
      events={botanicalEvents}
      frameloop="never"
      shadows={quality !== "low"}
      dpr={1}
      camera={{ position: [0, 3.6, 11], fov: 39, near: 0.1, far: 50 }}
      gl={{
        antialias: true,
        powerPreference: constrained ? "low-power" : "high-performance",
      }}
      onCreated={({ gl }) => {
        gl.shadowMap.type = PCFShadowMap;
      }}
    >
      <RenderBudget constrained={constrained || degraded} />
      <SurfaceDetail />
      <color attach="background" args={[THEME_BACKGROUNDS[theme]]} />
      <fog attach="fog" args={[THEME_BACKGROUNDS[theme], 13, 27]} />
      <Suspense fallback={null}>
        <SceneReady onReady={onReady} />
        <Lighting shadows={quality !== "low"} />
        <Environment />
        {PLANTS.map((plant, i) => (
          <Flower
            key={plant.type}
            {...plant}
            position={
              quality === "low"
                ? [
                    plant.position[0] * 0.65,
                    plant.position[1],
                    plant.position[2],
                  ]
                : plant.position
            }
            bloom={Math.max(0, Math.min(1, bloom + i * 0.018 - 0.06))}
            quality={quality === "low" || degraded ? "low" : "medium"}
            animationSpeed={0.85 + i * 0.055}
            windStrength={0.85}
            cursorStrength={0.8}
            interactive
            reducedMotion={reducedMotion}
            paused={paused}
            pulse={pulse}
            onClick={() => router.push(`/flower/${plant.type}`)}
          />
        ))}
        {!constrained && (
          <ContactShadows
            position={[0, -1.8, 0]}
            opacity={0.28}
            scale={15}
            blur={3.5}
            far={5}
            resolution={256}
            frames={1}
          />
        )}
        {!reducedMotion && (
          <Pollen
            count={constrained ? 12 : 90}
            bloom={bloom}
            pulse={pulse}
            paused={paused}
          />
        )}
      </Suspense>
      <CameraRig garden reducedMotion={reducedMotion} paused={paused} />
      <PerformanceMonitor onDecline={() => setDegraded(true)} />
    </Canvas>
  );
}
