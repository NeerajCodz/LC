"use client";
import { Suspense, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { botanicalEvents } from "@/lib/three/events";
import { ContactShadows } from "@react-three/drei";
import { ACESFilmicToneMapping, PCFShadowMap } from "three";
import type { FlowerType } from "@/lib/flowers/types";
import { useExperienceSettings } from "@/hooks/useExperienceSettings";
import { Lighting } from "../scene/Lighting";
import { Environment } from "../scene/Environment";
import { CameraRig, type ViewAngle } from "../scene/CameraRig";
import { PostProcessing } from "../scene/PostProcessing";
import { Pollen } from "../scene/Pollen";
import { Flower } from "./Flower";
import { RenderDiagnostics } from "../scene/RenderDiagnostics";
import { useTheme } from "@/hooks/useTheme";
import { THEME_BACKGROUNDS } from "@/lib/theme";

export interface SceneProps {
  type: FlowerType;
  bloom: number;
  growth?: number;
  macro?: boolean;
  paused?: boolean;
  pulse?: number;
  angle?: ViewAngle;
  active?: boolean;
  onFlowerClick?: () => void;
  onReady?: () => void;
}
export default function FlowerScene({
  type,
  bloom,
  growth = 1,
  macro = false,
  paused = false,
  pulse = 0,
  angle,
  active = true,
  onFlowerClick,
  onReady,
}: SceneProps) {
  const { quality, reducedMotion } = useExperienceSettings();
  const { theme } = useTheme();
  const [hovered, setHovered] = useState(false);
  const [available] = useState(() => {
    const context = document.createElement("canvas").getContext("webgl2");
    const supported = !!context;
    context?.getExtension("WEBGL_lose_context")?.loseContext();
    return supported;
  });
  if (!available)
    return (
      <div className="webgl-message">
        <p>This collection needs WebGL 2.</p>
        <span>Enable hardware acceleration in your browser, then reload.</span>
        <button onClick={() => location.reload()}>Try again</button>
      </div>
    );
  return (
    <Canvas
      events={botanicalEvents}
      className={hovered ? "flower-canvas is-hovered" : "flower-canvas"}
      frameloop={active ? "always" : "never"}
      resize={{ scroll: false }}
      shadows={quality !== "low"}
      dpr={macro ? [2, 2.5] : [1.5, 2]}
      camera={{ position: [0, 1.5, 7.5], fov: 38, near: 0.1, far: 45 }}
      gl={{
        antialias: true,
        alpha: false,
        powerPreference: "high-performance",
        toneMapping: ACESFilmicToneMapping,
        toneMappingExposure: 1.05,
      }}
      onCreated={({ gl }) => {
        gl.shadowMap.type = PCFShadowMap;
        onReady?.();
      }}
    >
      <color attach="background" args={[THEME_BACKGROUNDS[theme]]} />
      <fog attach="fog" args={[THEME_BACKGROUNDS[theme], 11, 25]} />
      <Suspense fallback={null}>
        <Lighting shadows={quality !== "low"} />
        <Environment resolution={macro ? 512 : 256} />
        <Flower
          key={type}
          type={type}
          position={[0, 0.5, 0]}
          bloom={bloom}
          growth={growth}
          quality={macro ? "ultra" : "high"}
          windStrength={0.8}
          interactive
          hovered={hovered}
          reducedMotion={reducedMotion}
          paused={paused}
          pulse={pulse}
          onHover={setHovered}
          onClick={onFlowerClick}
        />
        <ContactShadows
          position={[0, -1.78, 0]}
          opacity={0.22}
          scale={14}
          blur={3.5}
          far={5}
          resolution={256}
          frames={1}
        />
        {!reducedMotion && (
          <Pollen
            count={quality === "low" ? 22 : 80}
            bloom={bloom}
            pulse={pulse}
            paused={paused}
          />
        )}
        {quality !== "low" && <PostProcessing />}
      </Suspense>
      <CameraRig
        macro={macro}
        reducedMotion={reducedMotion}
        paused={paused}
        angle={angle}
      />
      {process.env.NODE_ENV === "development" && <RenderDiagnostics />}
    </Canvas>
  );
}
