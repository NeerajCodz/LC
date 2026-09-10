"use client";
import { Suspense, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { botanicalEvents } from "@/lib/three/events";
import { PerformanceMonitor } from "@react-three/drei";
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
      <RenderBudget constrained={constrained || degraded} />
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
          {(constrained ? MOBILE_GARDEN_PLANTINGS : GARDEN_PLANTINGS).map(
            (plant, i) => (
              <Flower
                key={plant.type}
                {...plant}
                rooted
                bloom={Math.max(0, Math.min(1, bloom + i * 0.018 - 0.06))}
                quality={quality === "low" || degraded ? "low" : "medium"}
                animationSpeed={0.85 + i * 0.055}
                windStrength={0.85}
                cursorStrength={0.8}
                interactive
                reducedMotion={reducedMotion}
                paused={paused}
                onClick={() => router.push(`/flower/${plant.type}`)}
              />
            ),
          )}
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
      <CameraRig garden reducedMotion={reducedMotion} paused={paused} />
      {!constrained && (
        <PerformanceMonitor onDecline={() => setDegraded(true)} />
      )}
    </Canvas>
  );
}
