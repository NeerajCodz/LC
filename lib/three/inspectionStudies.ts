import { Box3, Euler, Matrix4, Vector3, type BufferGeometry } from "three";
import type { FlowerType, Quality, Vec3 } from "../flowers/types";
import { FRITILLARIA_MODEL } from "../../components/flowers/fritillaria/fritillariaGeometry";
import { HOYA_MODEL } from "../../components/flowers/hoya/hoyaGeometry";
import { TORENIA_MODEL } from "../../components/flowers/torenia/toreniaGeometry";
import { petalOpenness } from "./easing";
import {
  specimenGeometry,
  specimenOrganCarrier,
  specimenOrganParts,
  type SpecimenModel,
} from "./specimenModel";

export interface InspectionStudy {
  name: string;
  model: SpecimenModel;
  cluster: number;
  bloom: number;
  target: Vec3;
  back: Vec3;
  up: Vec3;
}

const BELL: Omit<InspectionStudy, "name" | "back"> = {
  model: FRITILLARIA_MODEL,
  cluster: 1,
  bloom: 1,
  target: [0, 0.38, 0],
  up: [0, 0, -1],
};
const HOYA: Omit<InspectionStudy, "name" | "bloom" | "target"> = {
  model: HOYA_MODEL,
  cluster: 0,
  back: [0, 1, 0],
  up: [0, 0, -1],
};
const STUDIES: Partial<Record<FlowerType, readonly InspectionStudy[]>> = {
  fritillaria: [
    {
      ...BELL,
      name: "Bell interior · axial",
      // Keep the view parallel to the bell axis, offset enough for the inner
      // pads to clear the foreground paired anthers without moving any tissue.
      target: [0, 0.38, 0.03],
      back: [0, 1, 0],
    },
    { ...BELL, name: "Bell interior · oblique", back: [0.1, 1, -0.08] },
  ],
  hoya: [
    { ...HOYA, name: "Single floret · full", bloom: 1, target: [0, 0.06, 0] },
    { ...HOYA, name: "Single floret · bud", bloom: 0, target: [0, 0.17, 0] },
  ],
  torenia: [
    {
      model: TORENIA_MODEL,
      cluster: 0,
      name: "Single floret · full",
      bloom: 1,
      target: [0, 0, 0.48],
      back: [0, 0, 1],
      up: [0, 1, 0],
    },
    {
      model: TORENIA_MODEL,
      cluster: 0,
      name: "Single floret · bud",
      bloom: 0,
      target: [0, 0, 0.34],
      back: [0.65, 0, 1],
      up: [0, 1, 0],
    },
  ],
};
export function inspectionStudies(
  type: FlowerType,
): readonly InspectionStudy[] {
  return STUDIES[type] ?? [];
}

/** Dev-only framing from the same sealed/morphed geometry as the renderer.
 * It never removes neighboring flowers, even when overview batches their meshes.
 */
export function inspectionStudyFrame(
  study: InspectionStudy,
  quality: Quality,
  head: Matrix4,
) {
  const { model, cluster, bloom } = study,
    pose = model.clusters[cluster],
    transform = new Matrix4()
      .makeRotationFromEuler(new Euler(...pose.rotation))
      .scale(new Vector3(pose.scale, pose.scale, pose.scale))
      .setPosition(...pose.position)
      .premultiply(head),
    box = new Box3(),
    point = new Vector3(),
    folded = new Vector3();
  const include = (
    geometry: BufferGeometry,
    open: number,
    fallbackScale = 1,
  ) => {
    const position = geometry.getAttribute("position"),
      target = geometry.morphAttributes.position?.[0];
    for (let i = 0; i < position.count; i++) {
      point.fromBufferAttribute(position, i);
      if (target) point.lerp(folded.fromBufferAttribute(target, i), 1 - open);
      point.multiplyScalar(fallbackScale).applyMatrix4(transform);
      box.expandByPoint(point);
    }
    geometry.dispose();
  };
  model.surfaces.forEach((surface, index) => {
    if (surface.cluster === cluster)
      include(
        specimenGeometry(surface, quality),
        petalOpenness(bloom, surface.delay ?? 0, index * 0.31),
      );
  });
  const carrier = specimenOrganCarrier(model, cluster),
    open = petalOpenness(bloom, carrier.delay, carrier.phase);
  for (const included of [false, true])
    for (const { geometry } of specimenOrganParts(
      model,
      cluster,
      quality,
      included,
    )) {
      const morphed = !!geometry.morphAttributes.position?.length;
      include(
        geometry,
        included ? open : 1,
        included && !morphed ? 0.5 + 0.5 * open : 1,
      );
    }
  return {
    box,
    target: new Vector3(...study.target)
      .applyMatrix4(transform)
      .toArray() as Vec3,
    back: new Vector3(...study.back)
      .transformDirection(transform)
      .toArray() as Vec3,
    up: new Vector3(...study.up)
      .transformDirection(transform)
      .toArray() as Vec3,
  };
}
