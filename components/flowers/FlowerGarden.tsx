"use client";
import { Suspense, useState, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { botanicalEvents } from "@/lib/three/events";
import { PerformanceMonitor } from "@react-three/drei";
import { PCFShadowMap } from "three";
import type { FlowerType, Vec3 } from "@/lib/flowers/types";
import { FLOWER_STRUCTURES } from "@/lib/flowers/structures";
import { Flower } from "./Flower";
import { Lighting } from "../scene/Lighting";
import { Environment } from "../scene/Environment";
import { SurfaceDetail } from "../scene/SurfaceDetail";
import { SceneReady } from "../scene/SceneReady";
import { RenderBudget } from "../scene/RenderBudget";
import { CameraRig } from "../scene/CameraRig";
import { Pollen } from "../scene/Pollen";
import { useExperienceSettings } from "@/hooks/useExperienceSettings";
import {
  GARDEN_GROUND,
  GARDEN_PLANTINGS,
  MOBILE_GARDEN_PLANTINGS,
} from "@/lib/flowers/garden";
import { GardenDynamics } from "../scene/GardenDynamics";
import { useTheme } from "@/hooks/useTheme";
import { THEME_BACKGROUNDS } from "@/lib/theme";
export default function FlowerGarden({
  bloom,
  paused,
  pulse,
  onReady,
  selected,
  onSelect,
  reset,
}: {
  bloom: number;
  paused: boolean;
  pulse: number;
  onReady?: () => void;
  selected: FlowerType | null;
  onSelect: (type: FlowerType) => void;
  reset: number;
}) {
  const { quality, reducedMotion, constrained } = useExperienceSettings();
  const { theme } = useTheme();
  const [degraded, setDegraded] = useState(false);
  const plantings = constrained ? MOBILE_GARDEN_PLANTINGS : GARDEN_PLANTINGS;
  const chosen = plantings.find((plant) => plant.type === selected);
  const focus = useMemo<Vec3 | undefined>(
    () =>
      chosen
        ? [
            chosen.position[0],
            chosen.position[1] +
              FLOWER_STRUCTURES[chosen.type].stemLength * chosen.scale,
            chosen.position[2],
          ]
        : undefined,
    [chosen],
  );
  return (
    <Canvas
      events={botanicalEvents}
      frameloop="never"
      shadows={!constrained && !degraded}
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
      <RenderBudget constrained={constrained || degraded} macro={!!selected} />
      <SurfaceDetail />
      <color attach="background" args={[THEME_BACKGROUNDS[theme]]} />
      <fog attach="fog" args={[THEME_BACKGROUNDS[theme], 13, 27]} />
      <Suspense fallback={null}>
        <SceneReady onReady={onReady} />
        <Lighting shadows={!constrained && !degraded} extent={6} />
        <Environment />
        <mesh
          position={[0, GARDEN_GROUND - 0.015, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          receiveShadow
        >
          <planeGeometry args={[80, 80]} />
          <meshStandardMaterial
            color={THEME_BACKGROUNDS[theme]}
            roughness={1}
          />
        </mesh>
        <GardenDynamics
          breeze={pulse}
          paused={paused}
          reducedMotion={reducedMotion}
        >
          {plantings.map((plant, i) => (
            <group
              key={plant.type}
              visible={!selected || selected === plant.type}
            >
              <Flower
                {...plant}
                rooted
                bloom={Math.max(0, Math.min(1, bloom + i * 0.018 - 0.06))}
                quality={
                  selected === plant.type
                    ? constrained
                      ? "medium"
                      : "high"
                    : quality === "low" || degraded
                      ? "low"
                      : "medium"
                }
                animationSpeed={0.85 + i * 0.055}
                windStrength={0.85}
                cursorStrength={0.8}
                interactive={!selected || selected === plant.type}
                reducedMotion={reducedMotion}
                paused={paused}
                onClick={() => onSelect(plant.type)}
              />
            </group>
          ))}
        </GardenDynamics>
        {!reducedMotion && (
          <Pollen
            count={constrained ? 12 : 90}
            bloom={bloom}
            pulse={pulse}
            paused={paused}
          />
        )}
      </Suspense>
      <CameraRig
        garden
        focus={focus}
        focusScale={chosen?.scale}
        reset={reset}
        reducedMotion={reducedMotion}
        paused={paused}
      />
      {!constrained && (
        <PerformanceMonitor onDecline={() => setDegraded(true)} />
      )}
    </Canvas>
  );
}
