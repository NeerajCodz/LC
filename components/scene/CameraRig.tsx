import { useEffect, useRef, type ComponentRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { Vector3 } from "three";
import type { Vec3 } from "@/lib/flowers/types";
export type ViewAngle = "portrait" | "front" | "side" | "three-quarter";
export function CameraRig({
  macro = false,
  reducedMotion = false,
  angle = "portrait",
  garden = false,
  gardenDistance,
  focus,
  focusScale = 1,
  specimenTarget,
  reset = 0,
}: {
  macro?: boolean;
  reducedMotion?: boolean;
  paused?: boolean;
  angle?: ViewAngle;
  garden?: boolean;
  gardenDistance?: number;
  focus?: Vec3;
  focusScale?: number;
  specimenTarget?: Vec3;
  reset?: number;
}) {
  const controls = useRef<ComponentRef<typeof OrbitControls>>(null);
  const destination = useRef(new Vector3());
  const lookAt = useRef(new Vector3());
  const transitioning = useRef(true);
  const { size, gl } = useThree();
  const target = focus ?? (macro ? specimenTarget : undefined);
  const x = target?.[0],
    y = target?.[1],
    z = target?.[2];
  useEffect(() => {
    const mobile = size.width < 700;
    const distance = focus
      ? focusScale * (mobile ? 7 : 4.2)
      : garden
        ? (gardenDistance ?? (mobile ? 15 : 14)) *
          (mobile ? Math.min(1, (0.57 * size.height) / size.width) : 1)
        : macro
          ? 3
          : mobile
            ? 6.8
            : 6.15;
    const azimuth =
      angle === "side"
        ? Math.PI / 2
        : angle === "three-quarter"
          ? Math.PI / 4
          : 0;
    lookAt.current.set(
      x ?? (garden || macro || mobile ? 0 : -0.75),
      y ?? (garden ? -0.9 : macro ? 0.55 : -0.14),
      z ?? 0,
    );
    destination.current.set(
      (x ?? 0) + Math.sin(azimuth) * distance,
      y !== undefined
        ? y + distance * 0.32
        : garden
          ? Math.max(5, distance * 0.37)
          : 1.5,
      (z ?? 0) + Math.cos(azimuth) * distance,
    );
    transitioning.current = true;
  }, [
    macro,
    garden,
    angle,
    size.width,
    size.height,
    x,
    y,
    z,
    focusScale,
    reset,
    focus,
    gardenDistance,
  ]);
  useFrame(({ camera }, dt) => {
    if (!transitioning.current || !controls.current) return;
    const alpha = reducedMotion ? 1 : 1 - Math.exp(-4 * Math.min(dt, 0.05));
    camera.position.lerp(destination.current, alpha);
    controls.current.target.lerp(lookAt.current, alpha);
    controls.current.update();
    if (camera.position.distanceToSquared(destination.current) < 0.00001)
      transitioning.current = false;
  });
  return (
    <OrbitControls
      ref={controls}
      makeDefault
      enablePan={false}
      enableDamping={!reducedMotion}
      dampingFactor={0.09}
      rotateSpeed={0.65}
      zoomSpeed={0.7}
      minDistance={focus ? focusScale * 1.4 : 1.2}
      maxDistance={garden ? Math.max(30, (gardenDistance ?? 14) * 1.8) : 15}
      minPolarAngle={0.08}
      maxPolarAngle={Math.PI * 0.87}
      onStart={() => {
        transitioning.current = false;
      }}
      onChange={() => {
        if (controls.current)
          gl.domElement.setAttribute(
            "data-viewer-distance",
            controls.current.getDistance().toFixed(3),
          );
        if (controls.current)
          gl.domElement.setAttribute(
            "data-viewer-angle",
            controls.current.getAzimuthalAngle().toFixed(3),
          );
      }}
    />
  );
}
