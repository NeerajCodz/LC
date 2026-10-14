import { useEffect, useMemo, useRef, type ComponentRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { Fog, PerspectiveCamera, Vector3 } from "three";
import type { FlowerStructure, Vec3 } from "@/lib/flowers/types";
import {
  flowerPortraitPose,
  flowerPortraitVisibility,
  flowerCameraElevation,
  flowerCameraPose,
} from "@/lib/flowers/framing";
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
  specimenScale = 1,
  specimenStructure,
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
  specimenScale?: number;
  specimenStructure?: FlowerStructure;
  reset?: number;
}) {
  const controls = useRef<ComponentRef<typeof OrbitControls>>(null);
  const destination = useRef(new Vector3());
  const lookAt = useRef(new Vector3());
  const transitioning = useRef(true);
  const { size, gl } = useThree();
  const resetVisibility = useRef(false);
  const target = focus ?? (macro ? specimenTarget : undefined);
  const x = target?.[0],
    y = target?.[1],
    z = target?.[2];
  const portrait = useMemo(() => {
    if (focus || garden || macro || !specimenStructure) return undefined;
    const azimuth =
      angle === "side"
        ? Math.PI / 2
        : angle === "three-quarter"
          ? Math.PI / 4
          : 0;
    return flowerPortraitPose(
      specimenStructure,
      [0, -1.78, 0],
      size.width / size.height,
      38,
      azimuth,
      size.width >= 700,
    );
  }, [focus, garden, macro, specimenStructure, angle, size.width, size.height]);
  const visibility = useMemo(
    () =>
      portrait && specimenStructure
        ? flowerPortraitVisibility(specimenStructure, portrait, [0, -1.78, 0])
        : undefined,
    [portrait, specimenStructure],
  );
  useEffect(() => {
    if (visibility) resetVisibility.current = true;
    // Keep the widened envelope during a macro or legacy-specimen transition.
    // Once it completes, explicitly restore defaults on the retained scene.
  }, [visibility]);
  useEffect(() => {
    const mobile = size.width < 700;
    const azimuth =
      angle === "side"
        ? Math.PI / 2
        : angle === "three-quarter"
          ? Math.PI / 4
          : 0;
    if (portrait) {
      destination.current.set(...portrait.position);
      lookAt.current.set(...portrait.target);
      transitioning.current = true;
      return;
    }
    const distance = focus
      ? focusScale * (mobile ? 7 : 4.2)
      : garden
        ? (gardenDistance ?? (mobile ? 15 : 14)) *
          (mobile ? Math.min(1, (0.57 * size.height) / size.width) : 1)
        : macro
          ? 3 * Math.sqrt(specimenScale)
          : mobile
            ? 6.8 * specimenScale
            : 6.15 * specimenScale;
    lookAt.current.set(
      x ?? (garden || macro || mobile ? 0 : -0.75),
      y ?? (garden ? -0.9 : macro ? 0.55 : -0.14),
      z ?? 0,
    );
    if (
      specimenStructure &&
      flowerCameraElevation(specimenStructure, azimuth) !== undefined &&
      (focus || macro)
    ) {
      const pose = flowerCameraPose(
        specimenStructure,
        lookAt.current.toArray() as Vec3,
        distance,
        azimuth,
      );
      destination.current.set(...pose.position);
      transitioning.current = true;
      return;
    }
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
    specimenScale,
    specimenStructure,
    portrait,
    reset,
    focus,
    gardenDistance,
  ]);
  useFrame(({ camera, scene }, dt) => {
    // Theme changes replace the attached Fog object after React renders.
    // Reapply the envelope to that object before drawing the current frame.
    if (visibility) {
      if (scene.fog instanceof Fog) {
        scene.fog.near = visibility.fogNear;
        scene.fog.far = visibility.fogFar;
      }
      if (
        camera instanceof PerspectiveCamera &&
        camera.far !== visibility.cameraFar
      ) {
        camera.far = visibility.cameraFar;
        camera.updateProjectionMatrix();
      }
    }
    if (!controls.current) return;
    if (transitioning.current) {
      const alpha = reducedMotion ? 1 : 1 - Math.exp(-4 * Math.min(dt, 0.05));
      camera.position.lerp(destination.current, alpha);
      controls.current.target.lerp(lookAt.current, alpha);
      controls.current.update();
      if (camera.position.distanceToSquared(destination.current) < 0.00001)
        transitioning.current = false;
    }
    if (!visibility && resetVisibility.current && !transitioning.current) {
      // Manual input can interrupt a distant transition; retain visibility until
      // the camera returns inside the established standalone viewing range.
      if (camera.position.distanceTo(controls.current.target) > 15) return;
      if (scene.fog instanceof Fog) {
        scene.fog.near = 11;
        scene.fog.far = 25;
      }
      if (camera instanceof PerspectiveCamera) {
        camera.far = 45;
        camera.updateProjectionMatrix();
      }
      resetVisibility.current = false;
    }
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
      maxDistance={
        garden
          ? Math.max(30, (gardenDistance ?? 14) * 1.8)
          : visibility
            ? visibility.maxDistance
            : 15
      }
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
