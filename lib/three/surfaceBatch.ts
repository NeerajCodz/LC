import {
  Box3,
  Float32BufferAttribute,
  Sphere,
  Vector3,
  Object3D,
  type DataTexture,
  type Material,
} from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import {
  specimenGeometry,
  type SpecimenModel,
  type SpecimenSurface,
  type SpecimenCluster,
} from "./specimenModel";

export interface SurfaceBatchEntry {
  surface: SpecimenSurface;
  index: number;
}
export interface SurfaceBatchGroup {
  cluster: number;
  role: SpecimenSurface["role"];
  tissue: SpecimenSurface["tissue"];
  pressure: boolean;
  entries: SurfaceBatchEntry[];
}

/** Only compatible tissues at the same anatomical insertion share a draw. */
export function surfaceBatchGroups(
  model: SpecimenModel,
  acrossClusters = false,
): SurfaceBatchGroup[] {
  const groups = new Map<string, SurfaceBatchGroup>();
  model.surfaces.forEach((surface, index) => {
    const pressure = !!surface.pressureSample;
    const key = `${acrossClusters ? "posed" : surface.cluster}/${surface.role}/${surface.tissue ?? "base"}/${pressure}`;
    let group = groups.get(key);
    if (!group) {
      group = {
        cluster: surface.cluster,
        role: surface.role,
        tissue: surface.tissue,
        pressure,
        entries: [],
      };
      groups.set(key, group);
    }
    group.entries.push({ surface, index });
  });
  return [...groups.values()];
}

/** Merge real shells, retaining each shell's fold, pressure state and phase. */
export function createSurfaceBatch(
  entries: readonly SurfaceBatchEntry[],
  clusters?: readonly SpecimenCluster[],
) {
  if (!entries.length)
    throw new Error("An ambient surface batch needs anatomy");
  const parts = entries.map(({ surface }) =>
    specimenGeometry(surface, "overview"),
  );
  const geometry = mergeGeometries(parts);
  if (!geometry) {
    parts.forEach((p) => p.dispose());
    throw new Error("Incompatible ambient shell attributes");
  }
  const starts: number[] = [],
    clusterIndices: number[] = [];
  const bounds = new Box3(),
    point = new Vector3(),
    dummy = new Object3D(),
    localBounds = new Map<number, Box3>();
  parts.forEach((part, i) => {
    const { surface, index } = entries[i];
    let local = localBounds.get(surface.cluster);
    if (!local) {
      local = new Box3();
      localBounds.set(surface.cluster, local);
    }
    const start = Math.min(
      0.8,
      Math.max(0, (surface.delay ?? 0) + index * 0.31 * 0.004),
    );
    for (let j = 0; j < part.getAttribute("position").count; j++) {
      starts.push(start);
      clusterIndices.push(surface.cluster);
    }
    if (clusters) {
      const cluster = clusters[surface.cluster];
      dummy.position.set(...cluster.position);
      dummy.rotation.set(...cluster.rotation);
      dummy.scale.setScalar(cluster.scale);
      dummy.updateMatrix();
    }
    for (const attribute of [
      part.getAttribute("position"),
      ...part.morphAttributes.position!,
    ])
      for (let j = 0; j < attribute.count; j++) {
        point.fromBufferAttribute(attribute, j);
        local.expandByPoint(point);
        if (clusters) point.applyMatrix4(dummy.matrix);
        bounds.expandByPoint(point);
      }
    part.dispose();
  });
  geometry.setAttribute("lcBloomStart", new Float32BufferAttribute(starts, 1));
  geometry.setAttribute(
    "lcClusterIndex",
    new Float32BufferAttribute(clusterIndices, 1),
  );
  geometry.setAttribute(
    "lcClosedPosition",
    geometry.morphAttributes.position![0],
  );
  geometry.setAttribute("lcClosedNormal", geometry.morphAttributes.normal![0]);
  if (geometry.morphAttributes.position!.length > 1) {
    geometry.setAttribute(
      "lcPressedPosition",
      geometry.morphAttributes.position![1],
    );
    geometry.setAttribute(
      "lcPressedNormal",
      geometry.morphAttributes.normal![1],
    );
  }
  geometry.morphAttributes = {};
  geometry.userData.lcBatchBounds = [...localBounds].map(([cluster, box]) => ({
    cluster,
    box,
  }));
  geometry.boundingBox = bounds.expandByScalar(0.025);
  geometry.boundingSphere = bounds.getBoundingSphere(new Sphere());
  return geometry;
}

export interface SurfaceBatchUniforms {
  uBatchBloom: { value: number };
  uBatchPressure: { value: number };
  uBatchPoses?: { value: DataTexture };
  uBatchPoseRows?: { value: number };
  uBatchHinge?: { value: number };
}

/** The same vertex deformation drives visible tissue and both shadow passes. */
export function bindSurfaceBatch(
  material: Material,
  uniforms: SurfaceBatchUniforms,
  pressure: boolean,
) {
  material.defines = {
    ...material.defines,
    LC_SURFACE_BATCH: 1,
    ...(pressure ? { LC_SURFACE_BATCH_PRESSURE: 1 } : {}),
    ...(uniforms.uBatchPoses ? { LC_SURFACE_BATCH_POSES: 1 } : {}),
  };
  const previous = material.onBeforeCompile,
    key = material.customProgramCacheKey;
  material.onBeforeCompile = function (shader, renderer) {
    previous.call(this, shader, renderer);
    Object.assign(shader.uniforms, uniforms);
    shader.vertexShader = shader.vertexShader
      .replace(
        "#include <common>",
        `#include <common>
      attribute vec3 lcClosedPosition; attribute vec3 lcClosedNormal;
      attribute float lcBloomStart; uniform float uBatchBloom; uniform float uBatchPressure;
      #ifdef LC_SURFACE_BATCH_PRESSURE
        attribute vec3 lcPressedPosition; attribute vec3 lcPressedNormal;
      #endif
      float lcBatchOpen() { float t=clamp((uBatchBloom-lcBloomStart)/(1.-lcBloomStart),0.,1.); return t*t*(3.-2.*t); }
      #ifdef LC_SURFACE_BATCH_POSES
        attribute float lcClusterIndex; uniform sampler2D uBatchPoses;
        uniform float uBatchPoseRows, uBatchHinge;
        vec4 lcPose(float column) { return texture2D(uBatchPoses,vec2((column+.5)/8.,(lcClusterIndex+.5)/uBatchPoseRows)); }
        mat4 lcClusterMatrix() { return mat4(lcPose(0.),lcPose(1.),lcPose(2.),lcPose(3.)); }
        mat3 lcClusterNormal() { return mat3(lcPose(5.).xyz,lcPose(6.).xyz,lcPose(7.).xyz); }
        mat3 lcHinge() { float a=uBatchHinge*lcPose(4.).x,c=cos(a),s=sin(a); return mat3(1.,0.,0.,0.,c,s,0.,-s,c); }
        float lcBatchPressure() { return lcPose(4.).y; }
      #else
        float lcBatchPressure() { return max(0.,uBatchPressure); }
      #endif
    `,
      )
      .replace(
        "#include <begin_vertex>",
        `#include <begin_vertex>
      transformed += (lcClosedPosition-position)*(1.-lcBatchOpen());
      #ifdef LC_SURFACE_BATCH_PRESSURE
        transformed += (lcPressedPosition-position)*lcBatchPressure()*lcBatchOpen();
      #endif
      #ifdef LC_SURFACE_BATCH_POSES
        transformed = (lcClusterMatrix()*vec4(lcHinge()*transformed,1.)).xyz;
      #endif
    `,
      )
      .replace(
        "#include <beginnormal_vertex>",
        `#include <beginnormal_vertex>
      objectNormal += (lcClosedNormal-normal)*(1.-lcBatchOpen());
      #ifdef LC_SURFACE_BATCH_PRESSURE
        objectNormal += (lcPressedNormal-normal)*lcBatchPressure()*lcBatchOpen();
      #endif
      #ifdef LC_SURFACE_BATCH_POSES
        objectNormal = lcClusterNormal()*lcHinge()*objectNormal;
      #endif
    `,
      );
  };
  material.customProgramCacheKey = function () {
    return `${key.call(this)}/surface-batch-v2`;
  };
}
