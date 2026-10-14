import {
  Box3,
  Float32BufferAttribute,
  Object3D,
  Sphere,
  Vector3,
  MeshStandardMaterial,
  MeshDepthMaterial,
  MeshDistanceMaterial,
  RGBADepthPacking,
} from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import {
  specimenOrganCarrier,
  specimenOrganFollowsBloom,
  specimenOrganParts,
  type SpecimenModel,
} from "./specimenModel";
import { bindSurfaceBatch, type SurfaceBatchUniforms } from "./surfaceBatch";

/** Match the ordinary organ material while deforming both shadow passes identically. */
export function createOrganBatchMaterials(uniforms: SurfaceBatchUniforms) {
  const materials = {
    tissue: new MeshStandardMaterial({ vertexColors: true, roughness: 0.68 }),
    depth: new MeshDepthMaterial({ depthPacking: RGBADepthPacking }),
    distance: new MeshDistanceMaterial(),
  };
  for (const material of Object.values(materials))
    bindSurfaceBatch(material, uniforms, false);
  return materials;
}

export interface OrganBatchGroup {
  included: boolean;
  clusters: number[];
}

/** Ordinary organs share one material; fixed and included tissue keep separate draws. */
export function organBatchGroups(model: SpecimenModel): OrganBatchGroup[] {
  return [false, true].flatMap((included) => {
    const clusters = model.clusters.flatMap((_, cluster) =>
      model.organs.some(
        (organ, index) =>
          organ.cluster === cluster &&
          specimenOrganFollowsBloom(organ) === included &&
          (!organ.fine || index % 3 === 0),
      )
        ? [cluster]
        : [],
    );
    return clusters.length ? [{ included, clusters }] : [];
  });
}

/** Preserve each original partition before merging, including its legacy half-scale fallback. */
export function createOrganBatch(model: SpecimenModel, group: OrganBatchGroup) {
  const localBounds: { cluster: number; box: Box3 }[] = [],
    point = new Vector3(),
    pose = new Object3D(),
    bounds = new Box3(),
    parts = group.clusters.flatMap((cluster) => {
      const original = specimenOrganParts(
          model,
          cluster,
          "overview",
          group.included,
        ),
        carrier = specimenOrganCarrier(model, cluster),
        start = Math.min(
          0.8,
          Math.max(0, carrier.delay + carrier.phase * 0.004),
        ),
        hasMorph = original.some(
          ({ geometry }) => geometry.morphAttributes.position?.length,
        ),
        box = new Box3();
      localBounds.push({ cluster, box });
      const clusterPose = model.clusters[cluster];
      pose.position.set(...clusterPose.position);
      pose.rotation.set(...clusterPose.rotation);
      pose.scale.setScalar(clusterPose.scale);
      pose.updateMatrix();
      return original.map(({ geometry }) => {
        const position = geometry.getAttribute("position"),
          normal = geometry.getAttribute("normal"),
          closedPosition = group.included
            ? hasMorph
              ? geometry.morphAttributes.position![0]
              : new Float32BufferAttribute(
                  Float32Array.from(position.array, (value) => value * 0.5),
                  3,
                )
            : position,
          closedNormal =
            group.included && hasMorph
              ? geometry.morphAttributes.normal![0]
              : normal;
        geometry.setAttribute("lcClosedPosition", closedPosition);
        geometry.setAttribute("lcClosedNormal", closedNormal);
        geometry.setAttribute(
          "lcBloomStart",
          new Float32BufferAttribute(
            new Float32Array(position.count).fill(group.included ? start : 0),
            1,
          ),
        );
        geometry.setAttribute(
          "lcClusterIndex",
          new Float32BufferAttribute(
            new Float32Array(position.count).fill(cluster),
            1,
          ),
        );
        geometry.morphAttributes = {};
        for (const attribute of [position, closedPosition])
          for (let vertex = 0; vertex < attribute.count; vertex++) {
            point.fromBufferAttribute(attribute, vertex);
            box.expandByPoint(point);
            bounds.expandByPoint(point.applyMatrix4(pose.matrix));
          }
        return geometry;
      });
    });
  if (!parts.length) throw new Error("An ambient organ batch needs anatomy");
  const geometry = mergeGeometries(parts);
  parts.forEach((part) => part.dispose());
  if (!geometry) throw new Error("Incompatible ambient organ attributes");
  geometry.userData.lcBatchBounds = localBounds;
  geometry.boundingBox = bounds.expandByScalar(0.025);
  geometry.boundingSphere = bounds.getBoundingSphere(new Sphere());
  return geometry;
}
