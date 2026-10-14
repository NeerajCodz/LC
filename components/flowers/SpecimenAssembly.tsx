import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { Group, Matrix4, Mesh } from "three";
import { useActiveFrame } from "@/hooks/useActiveFrame";
import { useExperienceSettings } from "@/hooks/useExperienceSettings";
import { PetalDynamics, type SurfaceForces } from "@/lib/three/petalDynamics";
import {
  CageDeformation,
  bindCageGeometry,
  bindCageRaycast,
} from "@/lib/three/petalDeformation";
import { SurfaceClock } from "@/lib/three/surfaceClock";
import {
  specimenGeometry,
  specimenOrganParts,
  specimenOrganCarrier,
  type SpecimenModel,
  type SpecimenSurface,
  specimenCages,
  applySpecimenPins,
} from "@/lib/three/specimenModel";
import { petalOpenness, stepSpring } from "@/lib/three/easing";
import type { FlowerOrgansProps } from "./FloralParts";
import type { FlowerType } from "@/lib/flowers/types";
import { createSpecimenMaterial } from "@/lib/three/specimenMaterials";
import { joinOrgans } from "@/lib/three/floralOrgans";
import { useThree } from "@react-three/fiber";
import { FloretInstances } from "./FloretInstances";
import { OverviewSurfaces, type OverviewDraw } from "./OverviewSurfaces";
import { surfaceBatchGroups } from "@/lib/three/surfaceBatch";
import { organBatchGroups } from "@/lib/three/organBatch";
import { OverviewOrgans, type OverviewOrganDraw } from "./OverviewOrgans";
import {
  createSurfaceBatchPoses,
  updateSurfaceBatchPoses,
  refreshSurfaceBatchBounds,
} from "@/lib/three/surfaceBatchPose";
import { specimenPressTarget } from "@/lib/three/specimenMotion";

/** Dedicated anatomy shares only rendering and cage transfer, not its shape. */
export function SpecimenAssembly({
  model,
  type,
  bloom,
  time,
  wind,
  quality,
  color,
  pulse,
  interaction,
  motion,
  physics = "ambient",
  reducedMotion = false,
  raycastCages = false,
}: FlowerOrgansProps & {
  model: SpecimenModel;
  type: FlowerType;
  raycastCages?: boolean;
}) {
  const { constrained } = useExperienceSettings();
  const canvas = useThree((state) => state.gl.domElement);
  const cost = useRef({
    frames: 0,
    mean: 0,
    steps: 0,
    transfer: 0,
    transfers: 0,
  });
  const groups = useRef<(Group | null)[]>([]),
    meshes = useRef<(Mesh | null)[]>([]);
  const batching = quality === "overview" && physics !== "detailed";
  const batches = useMemo(
    () => (batching ? surfaceBatchGroups(model, true) : []),
    [model, batching],
  );
  const overviewDraws = useRef<(OverviewDraw | null)[]>([]);
  const organBatches = useMemo(
    () => (batching ? organBatchGroups(model) : []),
    [model, batching],
  );
  const overviewOrganDraws = useRef<(OverviewOrganDraw | null)[]>([]);
  const overviewPoses = useMemo(
    () => (batching ? createSurfaceBatchPoses(model.clusters) : null),
    [model, batching],
  );
  useEffect(() => () => overviewPoses?.texture.dispose(), [overviewPoses]);
  const resources = useMemo(() => {
    if (physics !== "detailed") return null;
    const { indices, patches } = specimenCages(model, constrained);
    const sim = new PetalDynamics(patches, constrained);
    applySpecimenPins(sim, model, indices);
    const deformation = new CageDeformation(sim),
      shadows = deformation.shadows();
    return {
      sim,
      deformation,
      shadows,
      indices,
      inverses: patches.map(() => new Matrix4()),
      matrices: patches.map(() => new Matrix4()),
      clock: new SurfaceClock(),
    };
  }, [model, physics, constrained]);
  useEffect(
    () => () => {
      resources?.deformation.dispose();
      resources?.shadows.depth.dispose();
      resources?.shadows.distance.dispose();
    },
    [resources],
  );
  const force = useRef<SurfaceForces>({
    wind: 0,
    time: 0,
    pulse: 0,
    x: 0,
    y: 0,
    z: 0,
    proximity: 0,
  });
  const initialized = useRef<PetalDynamics | null>(null);
  const articulation = useRef(
      model.clusters.map(() => ({ value: 0, velocity: 0 })),
    ),
    articulationClock = useRef(new SurfaceClock());
  useEffect(() => {
    if (!resources) return;
    cost.current = { frames: 0, mean: 0, steps: 0, transfer: 0, transfers: 0 };
    canvas.setAttribute(
      "data-petal-nodes",
      String(resources.sim.inverseMass.length),
    );
    canvas.setAttribute("data-petal-steps", "0");
    return () => {
      for (const key of [
        "data-petal-nodes",
        "data-petal-steps",
        "data-petal-ms",
        "data-petal-transfer-ms",
        "data-petal-physics",
      ])
        canvas.removeAttribute(key);
    };
  }, [canvas, resources]);
  useActiveFrame(() => {
    const touch = interaction?.current;
    const articulationDt = articulationClock.current.delta(
      time.current,
      reducedMotion,
    );
    model.clusters.forEach((c, i) => {
      const group = groups.current[i];
      if (!group) return;
      const spring = articulation.current[i];
      if (reducedMotion) {
        spring.value = 0;
        spring.velocity = 0;
      } else
        stepSpring(
          spring,
          specimenPressTarget(
            c.position,
            touch?.point,
            touch?.proximity ?? 0,
            pulse?.current ?? 0,
            reducedMotion,
          ),
          articulationDt,
          65,
        );
      group.rotation.x =
        c.rotation[0] +
        (reducedMotion
          ? 0
          : Math.sin(time.current * 1.3 + i * 0.9) * c.nod * 0.4 * wind);
      group.rotation.z =
        c.rotation[2] +
        (reducedMotion
          ? 0
          : Math.sin(time.current * 1.6 + i * 1.7) * c.nod * wind +
            (motion?.current.contact ?? 0) * c.nod);
      group.updateMatrix();
    });
    if (overviewPoses)
      updateSurfaceBatchPoses(
        overviewPoses,
        groups.current,
        articulation.current,
      );
    model.surfaces.forEach((s, i) => {
      const mesh = meshes.current[i];
      if (!mesh) return;
      const open = petalOpenness(bloom.current, s.delay ?? 0, i * 0.31);
      if (mesh.morphTargetInfluences) mesh.morphTargetInfluences[0] = 1 - open;
      if (s.pressureSample && mesh.morphTargetInfluences)
        mesh.morphTargetInfluences[1] =
          (Math.max(0, articulation.current[s.cluster].value) / 0.35) * open;
      mesh.rotation.x =
        s.role === "wing" || s.role === "keel"
          ? articulation.current[s.cluster].value
          : 0;
      mesh.updateMatrix();
    });
    for (const draw of overviewDraws.current) {
      if (!draw) continue;
      draw.uniforms.uBatchBloom.value = bloom.current;
      refreshSurfaceBatchBounds(draw.mesh, draw.uniforms);
    }
    for (const draw of overviewOrganDraws.current) {
      if (!draw) continue;
      draw.uniforms.uBatchBloom.value = bloom.current;
      refreshSurfaceBatchBounds(draw.mesh, draw.uniforms);
    }
    if (!resources) return;
    const { sim, deformation, indices, matrices, inverses, clock } = resources;
    for (let p = 0; p < indices.length; p++) {
      const i = indices[p],
        s = model.surfaces[i],
        g = groups.current[s.cluster],
        m = meshes.current[i];
      if (!g || !m) continue;
      matrices[p].multiplyMatrices(g.matrix, m.matrix);
      inverses[p].copy(matrices[p]).invert();
      sim.setRest(
        p,
        petalOpenness(bloom.current, s.delay ?? 0, i * 0.31),
        matrices[p].elements,
        s.pressureSample
          ? Math.max(0, articulation.current[s.cluster].value) / 0.35
          : 0,
      );
    }
    const dt = clock.delta(time.current, reducedMotion);
    if (initialized.current !== sim || dt < 0) {
      sim.reset();
      initialized.current = sim;
    } else if (dt > 0) {
      const f = force.current;
      f.wind = wind;
      f.time = time.current;
      f.pulse = pulse?.current ?? 0;
      f.proximity = touch?.proximity ?? 0;
      f.x = touch?.point?.[0] ?? 0;
      f.y = touch?.point?.[1] ?? 0;
      f.z = touch?.point?.[2] ?? 0;
      const start = performance.now();
      sim.step(dt, f);
      const elapsed = performance.now() - start;
      cost.current.mean +=
        (elapsed - cost.current.mean) / Math.min(60, ++cost.current.frames);
      cost.current.steps++;
    }
    deformation.setEnabled(!reducedMotion);
    if (dt !== 0) {
      const start = performance.now();
      deformation.update(inverses);
      cost.current.transfer +=
        (performance.now() - start - cost.current.transfer) /
        Math.min(60, ++cost.current.transfers);
    }
    canvas.setAttribute(
      "data-petal-physics",
      reducedMotion ? "settled" : "detailed",
    );
    if (cost.current.frames % 30 === 0) {
      canvas.setAttribute("data-petal-nodes", String(sim.inverseMass.length));
      canvas.setAttribute("data-petal-ms", cost.current.mean.toFixed(2));
      canvas.setAttribute(
        "data-petal-transfer-ms",
        cost.current.transfer.toFixed(2),
      );
      canvas.setAttribute("data-petal-steps", String(cost.current.steps));
    }
  });
  return (
    <group>
      {batching &&
        overviewPoses &&
        batches.map((batch, i) => (
          <OverviewSurfaces
            key={i}
            group={batch}
            type={type}
            color={color}
            clusters={model.clusters}
            poses={overviewPoses}
            assign={(draw) => {
              overviewDraws.current[i] = draw;
            }}
          />
        ))}
      {batching &&
        overviewPoses &&
        organBatches.map((group, i) => (
          <OverviewOrgans
            key={group.included ? "included" : "fixed"}
            model={model}
            group={group}
            poses={overviewPoses}
            assign={(draw) => {
              overviewOrganDraws.current[i] = draw;
            }}
          />
        ))}
      {model.clusters.map((c, k) => (
        <group
          key={k}
          ref={(g) => {
            groups.current[k] = g;
          }}
          position={c.position}
          rotation={c.rotation}
          scale={c.scale}
        >
          {!batching &&
            model.surfaces.map((s, i) =>
              s.cluster === k ? (
                <Surface
                  key={i}
                  surface={s}
                  cageIndex={
                    s.cageAttachment
                      ? model.surfaces.indexOf(s.cageAttachment.surface)
                      : i
                  }
                  assign={(m) => {
                    meshes.current[i] = m;
                  }}
                  quality={quality}
                  type={type}
                  color={color}
                  resources={resources}
                  raycastCages={raycastCages}
                />
              ) : null,
            )}
          {!batching && (
            <Organs model={model} cluster={k} quality={quality} bloom={bloom} />
          )}
          {model.instances
            ?.filter((g) => g.cluster === k)
            .map((g) => (
              <FloretInstances
                key={g.name}
                group={g}
                type={type}
                bloom={bloom}
                time={time}
                wind={wind}
                quality={quality}
                color={color}
                reducedMotion={reducedMotion}
              />
            ))}
          {!batching && (
            <Organs
              model={model}
              cluster={k}
              quality={quality}
              bloom={bloom}
              included
            />
          )}
        </group>
      ))}
    </group>
  );
}
type Resources = {
  sim: PetalDynamics;
  deformation: CageDeformation;
  indices: number[];
  shadows: ReturnType<CageDeformation["shadows"]>;
} | null;
function Surface({
  surface,
  cageIndex,
  assign,
  quality,
  type,
  color,
  resources,
  raycastCages,
}: {
  surface: SpecimenSurface;
  cageIndex: number;
  assign: (m: Mesh | null) => void;
  quality: FlowerOrgansProps["quality"];
  type: FlowerType;
  color?: string;
  resources: Resources;
  raycastCages: boolean;
}) {
  const mesh = useRef<Mesh>(null);
  const deformed = surface.flexible || !!surface.cageAttachment;
  const geometry = useMemo(() => {
    const g = specimenGeometry(surface, quality),
      p = resources?.indices.indexOf(cageIndex) ?? -1;
    if (resources && p >= 0)
      bindCageGeometry(
        g,
        resources.sim.patches[p],
        resources.sim.offsets[p],
        surface.cageAttachment
          ? { mapUv: surface.cageAttachment.uv, thickness: surface.thickness }
          : undefined,
      );
    return g;
  }, [surface, quality, resources, cageIndex]);
  const material = useMemo(() => {
    const m = createSpecimenMaterial(type, surface.role, color, surface.tissue);
    if (resources && deformed) resources.deformation.attach(m);
    return m;
  }, [type, surface, color, resources, deformed]);
  useEffect(() => () => geometry.dispose(), [geometry]);
  useEffect(() => () => material.dispose(), [material]);
  useLayoutEffect(() => {
    if (mesh.current && resources && raycastCages && deformed)
      return bindCageRaycast(mesh.current, resources.deformation);
  }, [geometry, resources, raycastCages, deformed]);
  return (
    <mesh
      ref={(value) => {
        mesh.current = value;
        assign(value);
      }}
      geometry={geometry}
      material={material}
      onUpdate={(m) => m.updateMorphTargets()}
      customDepthMaterial={deformed ? resources?.shadows.depth : undefined}
      customDistanceMaterial={
        deformed ? resources?.shadows.distance : undefined
      }
      castShadow
      receiveShadow
    />
  );
}
function Organs({
  model,
  cluster,
  quality,
  bloom,
  included = false,
}: {
  model: SpecimenModel;
  cluster: number;
  quality: FlowerOrgansProps["quality"];
  bloom: FlowerOrgansProps["bloom"];
  included?: boolean;
}) {
  const g = useMemo(() => {
    const parts = specimenOrganParts(model, cluster, quality, included).map(
      (part) => part.geometry,
    );
    return parts.length ? joinOrgans(parts) : null;
  }, [model, cluster, quality, included]);
  const mesh = useRef<Mesh>(null);
  const carrier = useMemo(
    () => specimenOrganCarrier(model, cluster),
    [model, cluster],
  );
  useActiveFrame(() => {
    if (!mesh.current || !included) return;
    const open = petalOpenness(bloom.current, carrier.delay, carrier.phase);
    if (mesh.current.morphTargetInfluences) {
      mesh.current.morphTargetInfluences[0] = 1 - open;
      mesh.current.scale.setScalar(1);
    } else mesh.current.scale.setScalar(0.5 + 0.5 * open);
  });
  useEffect(() => () => g?.dispose(), [g]);
  if (!g) return null;
  return (
    <mesh
      ref={mesh}
      geometry={g}
      onUpdate={(m) => m.updateMorphTargets()}
      castShadow
      receiveShadow
    >
      <meshStandardMaterial vertexColors roughness={0.68} />
    </mesh>
  );
}
