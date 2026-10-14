"use client";
import { useEffect, useRef, useState, type RefObject } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Box3, Group, PerspectiveCamera as ThreeCamera } from "three";
import { botanicalEvents } from "@/lib/three/events";
import { PerspectiveCamera, View } from "@react-three/drei";
import { FLOWERS } from "@/lib/flowers/catalog";
import type { FlowerType, Quality, Vec3 } from "@/lib/flowers/types";
import { fitInspectionBounds } from "@/lib/three/inspectionFraming";
import {
  inspectionStudies,
  inspectionStudyFrame,
  type InspectionStudy,
} from "@/lib/three/inspectionStudies";
import { useExperienceSettings } from "@/hooks/useExperienceSettings";
import { RenderBudget } from "./scene/RenderBudget";

function InspectionCameraFit({
  camera,
  plant,
  macroTarget,
  elevation,
  study,
  quality,
}: {
  camera: RefObject<ThreeCamera | null>;
  plant: RefObject<Group | null>;
  macroTarget?: Vec3;
  elevation?: number;
  study?: InspectionStudy;
  quality: Quality;
}) {
  const frames = useRef(0),
    fitted = useRef(false),
    box = useRef(new Box3());
  const width = useThree((state) => state.size.width),
    height = useThree((state) => state.size.height);
  useEffect(() => {
    frames.current = 0;
    fitted.current = false;
  }, [width, height]);
  useFrame(() => {
    if (
      fitted.current ||
      !camera.current ||
      !plant.current ||
      ++frames.current < 2
    )
      return;
    // View establishes its camera aspect and instanced poses on the first drawn frame.
    const scope =
      macroTarget || study
        ? (plant.current.getObjectByName("flower-head") ?? plant.current)
        : plant.current;
    scope.updateWorldMatrix(true, true);
    if (!study)
      scope.traverse((object) => {
        if (
          "computeBoundingBox" in object &&
          typeof object.computeBoundingBox === "function"
        )
          object.computeBoundingBox();
      });
    const detail = study
      ? inspectionStudyFrame(study, quality, scope.matrixWorld)
      : undefined;
    if (detail) box.current.copy(detail.box);
    else box.current.setFromObject(scope);
    if (box.current.isEmpty()) return;
    const pose = fitInspectionBounds(
      box.current,
      camera.current.aspect,
      camera.current.fov,
      detail?.target ?? macroTarget,
      detail ?? { elevation },
    );
    camera.current.position.set(...pose.position);
    camera.current.up.set(...pose.up);
    camera.current.lookAt(...pose.target);
    camera.current.updateProjectionMatrix();
    fitted.current = true;
  });
  return null;
}

function InspectionSpecimen({
  type,
  quality,
  wind,
  view,
  target,
}: {
  type: FlowerType;
  quality: Quality;
  wind: boolean;
  view: InspectionView;
  target: Vec3;
}) {
  const camera = useRef<ThreeCamera>(null),
    plant = useRef<Group>(null);
  return (
    <>
      <PerspectiveCamera
        ref={camera}
        makeDefault
        position={[0, 0.6, 5.5]}
        fov={36}
      />
      <Lighting shadows={false} followCursor={false} />
      <group ref={plant} rotation={[0, view.angle, 0]}>
        <Flower
          type={type}
          bloom={view.bloom}
          position={[0, 0.25, 0]}
          quality={quality}
          windStrength={wind ? 2 : 0}
          animateEntrance={false}
          reducedMotion={!wind}
        />
      </group>
      <InspectionCameraFit
        camera={camera}
        plant={plant}
        macroTarget={view.macro ? target : undefined}
        elevation={flowerCameraElevation(FLOWER_STRUCTURES[type], view.angle)}
        study={view.study}
        quality={quality}
      />
    </>
  );
}
import { Flower } from "./flowers/Flower";
import { Lighting } from "./scene/Lighting";
import { SafeCanvas } from "./scene/SafeCanvas";
import { FLOWER_STRUCTURES } from "@/lib/flowers/structures";
import { flowerCameraElevation, flowerHeadTarget } from "@/lib/flowers/framing";

interface InspectionView {
  name: string;
  angle: number;
  bloom: number;
  macro: boolean;
  study?: InspectionStudy;
}
const VIEWS: readonly InspectionView[] = [
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
  const [overview, setOverview] = useState(false);
  const [tier, setTier] = useState<"standard" | "constrained">("standard");
  const [studyType, setStudyType] = useState<FlowerType | null>(null);
  const { constrained } = useExperienceSettings();
  const studies = inspectionStudies(type),
    studying = studyType === type && studies.length > 0,
    views: readonly InspectionView[] = studying
      ? studies.map((study) => ({
          name: study.name,
          angle: 0,
          bloom: study.bloom,
          macro: true,
          study,
        }))
      : VIEWS;
  const structure = FLOWER_STRUCTURES[type];
  const target = flowerHeadTarget(structure, [
    0,
    0.25 - structure.stemLength,
    0,
  ]);
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
            onChange={(e) => {
              setType(e.target.value as FlowerType);
              setStudyType(null);
            }}
          >
            {FLOWERS.map((f) => (
              <option key={f.type} value={f.type}>
                {f.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Detail{" "}
          <select
            aria-label="Inspection detail"
            value={overview ? "overview" : "specimen"}
            onChange={(event) => setOverview(event.target.value === "overview")}
          >
            <option value="specimen">Specimen detail</option>
            <option value="overview">Garden overview</option>
          </select>
        </label>
        <label>
          Device tier{" "}
          <select
            aria-label="Inspection device tier"
            value={tier}
            onChange={(event) =>
              setTier(event.target.value as "standard" | "constrained")
            }
          >
            <option value="standard">Standard detail</option>
            <option value="constrained">Constrained detail</option>
          </select>
        </label>
        <button aria-pressed={wind} onClick={() => setWind(!wind)}>
          Wind study
        </button>
        {studies.length > 0 && (
          <button
            aria-pressed={studying}
            onClick={() => setStudyType(studying ? null : type)}
          >
            {type === "fritillaria"
              ? "Bell interior study"
              : "Single-floret study"}
          </button>
        )}
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: studying ? "repeat(2,1fr)" : "repeat(4,1fr)",
          gap: 10,
          marginTop: 12,
        }}
      >
        {views.map((v, i) => {
          const quality: Quality = overview
            ? "overview"
            : tier === "constrained"
              ? v.macro
                ? "medium"
                : "low"
              : v.macro
                ? "ultra"
                : "high";
          return (
            <div
              key={v.name}
              data-inspection-view={v.name}
              data-inspection-quality={quality}
              style={{
                height: studying ? 665 : 410,
                border: "1px solid #ffffff20",
              }}
            >
              <p style={{ fontSize: 13, margin: 12 }}>{v.name}</p>
              <View style={{ height: studying ? 620 : 365 }} index={i + 1}>
                <InspectionSpecimen
                  key={`${type}:${quality}`}
                  type={type}
                  quality={quality}
                  wind={wind}
                  view={v}
                  target={target}
                />
              </View>
            </div>
          );
        })}
      </div>
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none" }}>
        <SafeCanvas
          events={botanicalEvents}
          eventSource={container as React.RefObject<HTMLElement>}
          dpr={1}
          frameloop="never"
        >
          <RenderBudget
            constrained={constrained}
            gpuPacing={constrained}
            maxDpr={1}
          />
          <View.Port />
        </SafeCanvas>
      </div>
    </div>
  );
}
