import { useRef } from "react";
import type { SpotLight } from "three";
import { useActiveFrame } from "@/hooks/useActiveFrame";
import { damp } from "@/lib/three/easing";

export function Lighting({
  shadows = true,
  extent = 4,
  cursor = true,
}: {
  shadows?: boolean;
  extent?: number;
  cursor?: boolean;
}) {
  return (
    <>
      <ambientLight intensity={0.24} color="#e6e8e3" />
      <directionalLight
        position={[-3.5, 5, 4]}
        intensity={2.5}
        color="#fff6ee"
        castShadow={shadows}
        shadow-mapSize={[1024, 1024]}
        shadow-intensity={0.55}
        shadow-radius={5}
        shadow-bias={-0.00006}
        shadow-normalBias={0.012}
        shadow-camera-near={0.5}
        shadow-camera-far={18}
        shadow-camera-left={-extent}
        shadow-camera-right={extent}
        shadow-camera-top={extent}
        shadow-camera-bottom={-extent}
      />
      <directionalLight
        position={[3, 1.5, 1]}
        intensity={0.9}
        color="#e1e9f0"
      />
      <CursorLight extent={extent} enabled={cursor} />
    </>
  );
}

function CursorLight({
  extent,
  enabled,
}: {
  extent: number;
  enabled: boolean;
}) {
  const light = useRef<SpotLight>(null);
  useActiveFrame(({ pointer }, dt) => {
    if (!enabled || !light.current) return;
    const range = Math.min(extent, 4);
    const x = pointer.x * range;
    const y = 2.5 + pointer.y * range * 0.65;
    light.current.position.x = damp(light.current.position.x, x, 7, dt);
    light.current.position.y = damp(light.current.position.y, y, 7, dt);
    light.current.target.position.x = light.current.position.x;
    light.current.target.position.y = light.current.position.y;
    light.current.target.updateMatrixWorld();
  });
  return (
    <spotLight
      ref={light}
      position={[1, 4, 4]}
      intensity={14}
      angle={0.65}
      penumbra={1}
      color="#f4e4d5"
    />
  );
}
