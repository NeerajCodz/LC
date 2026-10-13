import {
  DataTexture,
  FloatType,
  RGBAFormat,
  NearestFilter,
  Matrix3,
  Matrix4,
  Object3D,
  Box3,
  Vector3,
  type BufferGeometry,
  type Group,
  type Mesh,
} from "three";
import type { SpecimenCluster } from "./specimenModel";
import type { SurfaceBatchUniforms } from "./surfaceBatch";

/** Four pose columns, articulation, and three inverse-transpose normal columns. */
export interface SurfaceBatchPoses {
  texture: DataTexture;
  data: Float32Array;
  normal: Matrix3;
}

export function writeSurfaceBatchPose(
  poses: SurfaceBatchPoses,
  cluster: number,
  matrix: Matrix4,
  articulation: number,
) {
  const offset = cluster * 32;
  let changed = false;
  for (let i = 0; i < 16; i++)
    changed = writeFloat(poses.data, offset + i, matrix.elements[i]) || changed;
  changed = writeFloat(poses.data, offset + 16, articulation) || changed;
  changed =
    writeFloat(poses.data, offset + 17, Math.max(0, articulation) / 0.35) ||
    changed;
  poses.normal.getNormalMatrix(matrix);
  for (let i = 0; i < 9; i++)
    changed =
      writeFloat(
        poses.data,
        offset + 20 + Math.floor(i / 3) * 4 + (i % 3),
        poses.normal.elements[i],
      ) || changed;
  return changed;
}

function writeFloat(data: Float32Array, index: number, value: number) {
  const next = Math.fround(value),
    changed = data[index] !== next;
  data[index] = next;
  return changed;
}

export function createSurfaceBatchPoses(clusters: readonly SpecimenCluster[]) {
  const data = new Float32Array(clusters.length * 32),
    texture = new DataTexture(data, 8, clusters.length, RGBAFormat, FloatType),
    poses: SurfaceBatchPoses = { texture, data, normal: new Matrix3() },
    dummy = new Object3D();
  texture.minFilter = texture.magFilter = NearestFilter;
  texture.generateMipmaps = false;
  clusters.forEach((cluster, i) => {
    dummy.position.set(...cluster.position);
    dummy.rotation.set(...cluster.rotation);
    dummy.scale.setScalar(cluster.scale);
    dummy.updateMatrix();
    writeSurfaceBatchPose(poses, i, dummy.matrix, 0);
  });
  texture.needsUpdate = true;
  return poses;
}

/** Reuses the actual groups and owned normal scratch matrix; no frame allocations. */
export function updateSurfaceBatchPoses(
  poses: SurfaceBatchPoses,
  groups: readonly (Group | null)[],
  articulation: readonly { value: number }[],
) {
  let changed = false;
  for (let i = 0; i < articulation.length; i++) {
    const group = groups[i];
    if (group)
      changed =
        writeSurfaceBatchPose(poses, i, group.matrix, articulation[i].value) ||
        changed;
  }
  if (changed) poses.texture.needsUpdate = true;
}

function batchOpen(geometry: BufferGeometry, index: number, bloom: number) {
  const start = geometry.getAttribute("lcBloomStart").getX(index),
    t = Math.max(0, Math.min(1, (bloom - start) / (1 - start)));
  return t * t * (3 - 2 * t);
}

function poseData(uniforms: SurfaceBatchUniforms) {
  return uniforms.uBatchPoses?.value.image.data as Float32Array | undefined;
}

/** CPU counterpart of the visible, depth and distance vertex shaders. */
export function surfaceBatchVertex(
  geometry: BufferGeometry,
  index: number,
  uniforms: SurfaceBatchUniforms,
  target: Vector3,
  matrix: Matrix4,
) {
  const open = batchOpen(geometry, index, uniforms.uBatchBloom.value),
    p = geometry.getAttribute("position"),
    closed = geometry.getAttribute("lcClosedPosition"),
    pressed = geometry.getAttribute("lcPressedPosition"),
    data = poseData(uniforms),
    offset = data
      ? geometry.getAttribute("lcClusterIndex").getX(index) * 32
      : 0,
    pressure = data ? data[offset + 17] : uniforms.uBatchPressure.value;
  target.set(
    p.getX(index) + (closed.getX(index) - p.getX(index)) * (1 - open),
    p.getY(index) + (closed.getY(index) - p.getY(index)) * (1 - open),
    p.getZ(index) + (closed.getZ(index) - p.getZ(index)) * (1 - open),
  );
  if (pressed) {
    target.x += (pressed.getX(index) - p.getX(index)) * pressure * open;
    target.y += (pressed.getY(index) - p.getY(index)) * pressure * open;
    target.z += (pressed.getZ(index) - p.getZ(index)) * pressure * open;
  }
  if (data) {
    const angle = uniforms.uBatchHinge!.value * data[offset + 16],
      c = Math.cos(angle),
      s = Math.sin(angle),
      y = target.y;
    target.y = c * y - s * target.z;
    target.z = s * y + c * target.z;
    target.applyMatrix4(matrix.fromArray(data, offset));
  }
  return target;
}

export function surfaceBatchNormal(
  geometry: BufferGeometry,
  index: number,
  uniforms: SurfaceBatchUniforms,
  target: Vector3,
  normalMatrix: Matrix3,
) {
  const open = batchOpen(geometry, index, uniforms.uBatchBloom.value),
    n = geometry.getAttribute("normal"),
    closed = geometry.getAttribute("lcClosedNormal"),
    pressed = geometry.getAttribute("lcPressedNormal"),
    data = poseData(uniforms),
    offset = data
      ? geometry.getAttribute("lcClusterIndex").getX(index) * 32
      : 0,
    pressure = data ? data[offset + 17] : uniforms.uBatchPressure.value;
  target.set(
    n.getX(index) + (closed.getX(index) - n.getX(index)) * (1 - open),
    n.getY(index) + (closed.getY(index) - n.getY(index)) * (1 - open),
    n.getZ(index) + (closed.getZ(index) - n.getZ(index)) * (1 - open),
  );
  if (pressed) {
    target.x += (pressed.getX(index) - n.getX(index)) * pressure * open;
    target.y += (pressed.getY(index) - n.getY(index)) * pressure * open;
    target.z += (pressed.getZ(index) - n.getZ(index)) * pressure * open;
  }
  if (data) {
    const angle = uniforms.uBatchHinge!.value * data[offset + 16],
      c = Math.cos(angle),
      s = Math.sin(angle),
      y = target.y;
    target.y = c * y - s * target.z;
    target.z = s * y + c * target.z;
    for (let i = 0; i < 9; i++)
      normalMatrix.elements[i] =
        data[offset + 20 + Math.floor(i / 3) * 4 + (i % 3)];
    target.applyMatrix3(normalMatrix);
  }
  return target.normalize();
}

/** Precise bounds and raycasts must read the same posed vertices as WebGL. */
export function bindSurfaceBatchVertices(
  mesh: Mesh,
  uniforms: SurfaceBatchUniforms,
) {
  const matrix = new Matrix4();
  mesh.getVertexPosition = (index, target) =>
    surfaceBatchVertex(mesh.geometry, index, uniforms, target, matrix);
  boundsScratch.set(mesh, {
    matrix: new Matrix4(),
    hinge: new Matrix4(),
    box: new Box3(),
    bound: new Box3(),
    size: new Vector3(),
  });
  refreshSurfaceBatchBounds(mesh, uniforms);
}

const boundsScratch = new WeakMap<
  Mesh,
  { matrix: Matrix4; hinge: Matrix4; box: Box3; bound: Box3; size: Vector3 }
>();

/** Transform cached local interval boxes, including all fold/pressure targets.
 * Uses only owned scratch objects; also covers articulation spring overshoot. */
export function refreshSurfaceBatchBounds(
  mesh: Mesh,
  uniforms: SurfaceBatchUniforms,
) {
  const data = poseData(uniforms),
    scratch = boundsScratch.get(mesh);
  if (!data || !scratch) return;
  const parts = mesh.geometry.userData.lcBatchBounds as {
    cluster: number;
    box: Box3;
  }[];
  scratch.bound.makeEmpty();
  for (const part of parts) {
    const offset = part.cluster * 32,
      angle = uniforms.uBatchHinge!.value * data[offset + 16],
      overshoot = Math.max(0, data[offset + 17] - 1);
    scratch.matrix
      .fromArray(data, offset)
      .multiply(scratch.hinge.makeRotationX(angle));
    scratch.box.copy(part.box);
    if (overshoot)
      scratch.box.expandByScalar(
        part.box.getSize(scratch.size).length() * overshoot,
      );
    scratch.box.applyMatrix4(scratch.matrix);
    scratch.bound.union(scratch.box);
  }
  mesh.geometry.boundingBox!.copy(scratch.bound);
  scratch.bound.getBoundingSphere(mesh.geometry.boundingSphere!);
}
