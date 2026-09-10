import { PerspectiveCamera } from "@react-three/drei";
import { Suspense } from "react";
import { FLOWER_STRUCTURES } from "@/lib/flowers/structures";
import { Flower } from "./Flower";
import { Lighting } from "../scene/Lighting";
import { Environment } from "../scene/Environment";
import { SurfaceDetail } from "../scene/SurfaceDetail";
import { useExperienceSettings } from "@/hooks/useExperienceSettings";
import type { FlowerType } from "@/lib/flowers/types";
import type { FlowerView } from "@/lib/flowers/views";

/** Shared camera, lighting, and flower composition for inline previews. */
export function BotanicalView({
  type,
  angle,
  bloom = 1,
  hovered = false,
  detailed = false,
}: {
  type: FlowerType;
  angle: FlowerView;
  bloom?: number;
  hovered?: boolean;
  detailed?: boolean;
}) {
  const { reducedMotion, quality } = useExperienceSettings();
  const macro = angle === "macro";
  const structure = FLOWER_STRUCTURES[type],
    center = structure.headCenter ?? [0, 0.25, 0];
  const cx = center[0],
    cy =
      0.25 +
      center[1] * Math.cos(structure.headTilt) -
      center[2] * Math.sin(structure.headTilt),
    cz =
      center[1] * Math.sin(structure.headTilt) +
      center[2] * Math.cos(structure.headTilt);
  const distance = macro ? 2.8 : quality === "low" ? 6.6 : 5.5;
  const azimuth =
    angle === "side"
      ? Math.PI / 2
      : angle === "three-quarter"
        ? Math.PI / 4
        : 0;
  return (
    <Suspense fallback={null}>
      <SurfaceDetail />
      <PerspectiveCamera
        makeDefault
        position={[
          Math.sin(azimuth) * distance + (macro ? cx : 0),
          macro ? cy + 0.9 : 1.7,
          Math.cos(azimuth) * distance + (macro ? cz : 0),
        ]}
        fov={36}
        onUpdate={(camera) =>
          camera.lookAt(macro ? cx : 0, macro ? cy : 0.05, macro ? cz : 0)
        }
      />
      <Lighting shadows={false} />
      <Environment />
      <Flower
        type={type}
        position={[0, 0.25, 0]}
        bloom={bloom}
        animateEntrance={false}
        hovered={hovered}
        interactive={detailed}
        quality={
          quality === "low"
            ? "low"
            : macro
              ? "ultra"
              : detailed
                ? "high"
                : "medium"
        }
        windStrength={0.25}
        cursorStrength={0.35}
        reducedMotion={reducedMotion}
      />
    </Suspense>
  );
}
