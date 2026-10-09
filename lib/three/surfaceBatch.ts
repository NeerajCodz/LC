import {
  Box3,
  Float32BufferAttribute,
  Sphere,
  Vector3,
  type Material,
} from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import {
  specimenGeometry,
  type SpecimenModel,
  type SpecimenSurface,
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
export function surfaceBatchGroups(model: SpecimenModel): SurfaceBatchGroup[] {
  const groups = new Map<string, SurfaceBatchGroup>();
  model.surfaces.forEach((surface, index) => {
    const pressure = !!surface.pressureSample;
    const key = `${surface.cluster}/${surface.role}/${surface.tissue ?? "base"}/${pressure}`;
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
export function createSurfaceBatch(entries: readonly SurfaceBatchEntry[]) {
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
  const starts: number[] = [];
  const bounds = new Box3(),
    point = new Vector3();
  parts.forEach((part, i) => {
    const { surface, index } = entries[i];
    const start = Math.min(
      0.8,
      Math.max(0, (surface.delay ?? 0) + index * 0.31 * 0.004),
    );
    for (let j = 0; j < part.getAttribute("position").count; j++)
      starts.push(start);
    for (const attribute of [
      part.getAttribute("position"),
      ...part.morphAttributes.position!,
    ])
      for (let j = 0; j < attribute.count; j++)
        bounds.expandByPoint(point.fromBufferAttribute(attribute, j));
    part.dispose();
  });
  geometry.setAttribute("lcBloomStart", new Float32BufferAttribute(starts, 1));
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
  geometry.boundingBox = bounds.expandByScalar(0.025);
  geometry.boundingSphere = bounds.getBoundingSphere(new Sphere());
  return geometry;
}

export interface SurfaceBatchUniforms {
  uBatchBloom: { value: number };
  uBatchPressure: { value: number };
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
    `,
      )
      .replace(
        "#include <begin_vertex>",
        `#include <begin_vertex>
      transformed += (lcClosedPosition-position)*(1.-lcBatchOpen());
      #ifdef LC_SURFACE_BATCH_PRESSURE
        transformed += (lcPressedPosition-position)*max(0.,uBatchPressure)*lcBatchOpen();
      #endif
    `,
      )
      .replace(
        "#include <beginnormal_vertex>",
        `#include <beginnormal_vertex>
      objectNormal += (lcClosedNormal-normal)*(1.-lcBatchOpen());
      #ifdef LC_SURFACE_BATCH_PRESSURE
        objectNormal += (lcPressedNormal-normal)*max(0.,uBatchPressure)*lcBatchOpen();
      #endif
    `,
      );
  };
  material.customProgramCacheKey = function () {
    return `${key.call(this)}/surface-batch-v1`;
  };
}
