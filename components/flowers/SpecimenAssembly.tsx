import { useEffect, useMemo, useRef, useState } from "react";
import { Group, Matrix4, Mesh } from "three";
import { useActiveFrame } from "@/hooks/useActiveFrame";
import { isConstrainedDevice } from "@/lib/performance";
import {
  createCagePatch,
  PetalDynamics,
  type SurfaceForces,
} from "@/lib/three/petalDynamics";
import {
  CageDeformation,
  bindCageGeometry,
} from "@/lib/three/petalDeformation";
import { SurfaceClock } from "@/lib/three/surfaceClock";
import {
  specimenGeometry,
  specimenOrganGeometry,
  type SpecimenModel,
  type SpecimenSurface,
} from "@/lib/three/specimenModel";
import { petalOpenness } from "@/lib/three/easing";
import type { FlowerOrgansProps } from "./FloralParts";
import type { FlowerType } from "@/lib/flowers/types";
import { createSpecimenMaterial } from "@/lib/three/specimenMaterials";

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
  const [constrained] = useState(isConstrainedDevice);
  const groups = useRef<(Group | null)[]>([]),
    meshes = useRef<(Mesh | null)[]>([]);
  const resources = useMemo(() => {
    if (physics !== "detailed") return null;
    const indices = model.surfaces.flatMap((s, i) => (s.flexible ? [i] : []));
    const patches = indices.map((i) => {
      const s = model.surfaces[i],
        [columns, rows] = (constrained ? s.mobileCage : s.cage) ?? [3, 5];
      return createCagePatch({
        ...s,
        columns,
        rows,
        compliance: s.compliance ?? 0.00008,
      });
    });
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
  useActiveFrame(() => {
    const touch = interaction?.current,
      press = reducedMotion
        ? 0
        : (touch?.proximity ?? 0) * 0.035 + (pulse?.current ?? 0) * 0.04;
    model.clusters.forEach((c, i) => {
      const group = groups.current[i];
      if (!group) return;
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
      mesh.rotation.x = s.role === "wing" || s.role === "keel" ? press : 0;
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
      sim.step(dt, f);
    }
    deformation.setEnabled(!reducedMotion);
    if (dt !== 0) deformation.update(inverses);
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
          {model.organs
            .filter((o) => o.cluster === k)
            .map((o, i) => (
              <Organ key={i} organ={o} quality={quality} />
            ))}
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
    const m = createSpecimenMaterial(type, surface.role, color);
    if (resources && surface.flexible) resources.deformation.attach(m);
    return m;
  }, [type, surface, color, resources]);
  useEffect(
    () => () => {
      geometry.dispose();
      material.dispose();
    },
    [geometry, material],
  );
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
function Organ({
  organ,
  quality,
}: {
  organ: SpecimenModel["organs"][number];
  quality: FlowerOrgansProps["quality"];
}) {
  const g = useMemo(
    () => specimenOrganGeometry(organ, quality),
    [organ, quality],
  );
  useEffect(() => () => g.dispose(), [g]);
  return (
    <mesh geometry={g} castShadow receiveShadow>
      <meshStandardMaterial vertexColors roughness={0.68} />
    </mesh>
  );
}
