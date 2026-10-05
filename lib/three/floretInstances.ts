import type { Quality } from "../flowers/types";
import { seededRandom, GOLDEN_ANGLE } from "./noise";
import { createParametricShell } from "./parametricShell";
import {
  Float32BufferAttribute,
  type InstancedMesh,
  type Mesh,
  type Object3D,
} from "three";
import { petalOpenness } from "./easing";
import {
  specimenOrganGeometry,
  type SpecimenInstanceGroup,
  type SpecimenInstancePose,
} from "./specimenModel";

export function radialFloretPoses(
  count: number,
  radius: number,
  height: number,
  seed: number,
): SpecimenInstancePose[] {
  const random = seededRandom(seed);
  return Array.from({ length: count }, (_, i) => {
    const r = radius * Math.sqrt((i + 0.5) / count),
      a = i * GOLDEN_ANGLE;
    return {
      position: [
        Math.sin(a) * r,
        height * (1 - (r / radius) ** 2),
        Math.cos(a) * r,
      ],
      rotation: [0, a, 0],
      scale: 0.92 + random() * 0.16,
      delay: 0.08 + (r / radius) * 0.12,
      phase: random() * Math.PI * 2,
    };
  });
}
/** Small organs retain all florets at low quality; only tessellation changes. */
export function specimenInstanceGeometry(
  group: SpecimenInstanceGroup,
  quality: Quality,
) {
  const [columns, rows] = {
    low: [6, 5],
    medium: [8, 7],
    high: [12, 9],
    ultra: [16, 12],
  }[quality];
  const surfaces = group.surfaces.map((surface) => {
    const g = createParametricShell({ ...surface, columns, rows });
    const side = new Float32Array(g.getAttribute("position").count);
    for (let i = 0; i < side.length; i++)
      side[i] = i < side.length / 2 ? 1 : -1;
    g.setAttribute("tissueSide", new Float32BufferAttribute(side, 1));
    return g;
  });
  const organs = group.organs.map((organ) => {
    const g = specimenOrganGeometry(
      organ,
      quality === "ultra" ? "medium" : "low",
    );
    if (!g.morphAttributes.position?.length) {
      g.morphAttributes.position = [g.getAttribute("position").clone()];
      g.morphAttributes.normal = [g.getAttribute("normal").clone()];
    }
    return g;
  });
  return { surfaces, organs };
}

/** The caller owns scratch objects. Three applies these morphs to normals and shadows. */
export function updateFloretInstances(
  mesh: InstancedMesh,
  target: Mesh,
  poses: SpecimenInstancePose[],
  bloom: number,
  time: number,
  wind: number,
  reducedMotion: boolean,
  dummy: Object3D,
) {
  for (let i = 0; i < poses.length; i++) {
    const pose = poses[i],
      open = petalOpenness(bloom, pose.delay, pose.phase);
    const folded = pose.foldedPosition ?? pose.position;
    dummy.position.set(
      folded[0] + (pose.position[0] - folded[0]) * open,
      folded[1] + (pose.position[1] - folded[1]) * open,
      folded[2] + (pose.position[2] - folded[2]) * open,
    );
    dummy.rotation.set(
      pose.rotation[0] +
        (reducedMotion ? 0 : Math.sin(time * 1.4 + pose.phase) * 0.008 * wind),
      pose.rotation[1],
      pose.rotation[2],
    );
    dummy.scale.setScalar(pose.scale);
    dummy.updateMatrix();
    mesh.setMatrixAt(i, dummy.matrix);
    target.morphTargetInfluences![0] = 1 - open;
    mesh.setMorphAt(i, target);
  }
  mesh.instanceMatrix.needsUpdate = true;
  if (mesh.morphTexture) mesh.morphTexture.needsUpdate = true;
}
