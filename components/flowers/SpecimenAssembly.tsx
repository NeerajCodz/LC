import { useEffect, useMemo, useRef } from "react";
import { Group, Matrix4, Mesh } from "three";
import { useActiveFrame } from "@/hooks/useActiveFrame";
import { useExperienceSettings } from "@/hooks/useExperienceSettings";
import { PetalDynamics, type SurfaceForces } from "@/lib/three/petalDynamics";
import {
  CageDeformation,
  bindCageGeometry,
} from "@/lib/three/petalDeformation";
import { SurfaceClock } from "@/lib/three/surfaceClock";
import {
  specimenGeometry,
  specimenOrganGeometry,
  specimenOrganCarrier,
  type SpecimenModel,
  type SpecimenSurface,
  specimenCages,
} from "@/lib/three/specimenModel";
import { petalOpenness, stepSpring } from "@/lib/three/easing";
import type { FlowerOrgansProps } from "./FloralParts";
import type { FlowerType } from "@/lib/flowers/types";
import { createSpecimenMaterial } from "@/lib/three/specimenMaterials";
import { joinOrgans } from "@/lib/three/floralOrgans";
import { useThree } from "@react-three/fiber";
import { FloretInstances } from "./FloretInstances";

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
}: FlowerOrgansProps & { model: SpecimenModel; type: FlowerType }) {
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
  const resources = useMemo(() => {
    if (physics !== "detailed") return null;
    const { indices, patches } = specimenCages(model, constrained);
    const sim = new PetalDynamics(patches, constrained);
    patches.forEach((p, i) => {
      if (!model.surfaces[indices[i]].pinMidrib) return;
      const stride = p.columns + 1;
      for (let row = 0; row <= p.rows; row++)
        sim.inverseMass[
          sim.offsets[i] + row * stride + Math.floor(stride / 2)
        ] = 0;
    });
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
    const touch = interaction?.current,
      press = reducedMotion
        ? 0
        : (touch?.proximity ?? 0) * 0.24 + (pulse?.current ?? 0) * 0.35;
    const articulationDt = articulationClock.current.delta(
      time.current,
      reducedMotion,
    );
    model.clusters.forEach((c, i) => {
      const group = groups.current[i];
      if (!group) return;
      const point = touch?.point,
        near = point
          ? Math.max(
              0,
              1 -
                Math.hypot(
                  point[0] - c.position[0],
                  point[1] - c.position[1],
                  point[2] - c.position[2],
                ) /
                  1.2,
            )
          : 1;
      const spring = articulation.current[i];
      if (reducedMotion) {
        spring.value = 0;
        spring.velocity = 0;
      } else
        stepSpring(
          spring,
          Math.max(-0.25, Math.min(0.35, press * near)),
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
          {model.surfaces.map((s, i) =>
            s.cluster === k ? (
              <Surface
                key={i}
                surface={s}
                index={i}
                assign={(m) => {
                  meshes.current[i] = m;
                }}
                quality={quality}
                type={type}
                color={color}
                resources={resources}
              />
            ) : null,
          )}
          <Organs model={model} cluster={k} quality={quality} bloom={bloom} />
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
          <Organs
            model={model}
            cluster={k}
            quality={quality}
            bloom={bloom}
            included
          />
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
  index,
  assign,
  quality,
  type,
  color,
  resources,
}: {
  surface: SpecimenSurface;
  index: number;
  assign: (m: Mesh | null) => void;
  quality: FlowerOrgansProps["quality"];
  type: FlowerType;
  color?: string;
  resources: Resources;
}) {
  const geometry = useMemo(() => {
    const g = specimenGeometry(surface, quality),
      p = resources?.indices.indexOf(index) ?? -1;
    if (resources && p >= 0)
      bindCageGeometry(g, resources.sim.patches[p], resources.sim.offsets[p]);
    return g;
  }, [surface, quality, resources, index]);
  const material = useMemo(() => {
    const m = createSpecimenMaterial(type, surface.role, color, surface.tissue);
    if (resources && surface.flexible) resources.deformation.attach(m);
    return m;
  }, [type, surface, color, resources]);
  useEffect(() => () => geometry.dispose(), [geometry]);
  useEffect(() => () => material.dispose(), [material]);
  return (
    <mesh
      ref={assign}
      geometry={geometry}
      material={material}
      onUpdate={(m) => m.updateMorphTargets()}
      customDepthMaterial={
        surface.flexible ? resources?.shadows.depth : undefined
      }
      customDistanceMaterial={
        surface.flexible ? resources?.shadows.distance : undefined
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
    const parts = model.organs
      .filter(
        (o, i) =>
          o.cluster === cluster &&
          /stamen|anther|style|pistil|hair/.test(o.name) === included &&
          (!o.fine || quality === "high" || quality === "ultra" || i % 3 === 0),
      )
      .map((o) => specimenOrganGeometry(o, quality));
    if (parts.some((part) => part.morphAttributes.position?.length))
      for (const part of parts)
        if (!part.morphAttributes.position?.length) {
          part.morphAttributes.position = [
            part.getAttribute("position").clone(),
          ];
          part.morphAttributes.normal = [part.getAttribute("normal").clone()];
        }
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
