import {
  BufferGeometry,
  Float32BufferAttribute,
  DataTexture,
  FloatType,
  RGBAFormat,
  NearestFilter,
  NoColorSpace,
  MeshDepthMaterial,
  MeshDistanceMaterial,
  RGBADepthPacking,
  DoubleSide,
  type Material,
  type Matrix4,
} from "three";
import type { CagePatch, PetalDynamics } from "./petalDynamics";

/** Four bilinear cage samples per vertex, shared by both sealed shell sides. */
export function bindCageGeometry(
  geometry: BufferGeometry,
  patch: CagePatch,
  offset: number,
) {
  const uv = geometry.getAttribute("uv"),
    count = uv.count;
  const ids = new Float32Array(count * 4),
    weights = new Float32Array(count * 4),
    sides = new Float32Array(count);
  const stride = patch.periodic ? patch.columns : patch.columns + 1;
  for (let i = 0; i < count; i++) {
    const u = Math.max(0, Math.min(1, uv.getX(i))) * patch.columns;
    const v = Math.max(0, Math.min(1, uv.getY(i))) * patch.rows;
    const col = Math.min(patch.columns - 1, Math.floor(u)),
      row = Math.min(patch.rows - 1, Math.floor(v));
    const right = patch.periodic ? (col + 1) % stride : col + 1;
    const x = u - col,
      y = v - row,
      k = i * 4;
    ids[k] = offset + row * stride + col;
    ids[k + 1] = offset + row * stride + right;
    ids[k + 2] = offset + (row + 1) * stride + col;
    ids[k + 3] = offset + (row + 1) * stride + right;
    weights[k] = (1 - x) * (1 - y);
    weights[k + 1] = x * (1 - y);
    weights[k + 2] = (1 - x) * y;
    weights[k + 3] = x * y;
    sides[i] =
      (i < count / 2 ? 1 : -1) * patch.thickness * 0.5 * (1 - 0.2 * uv.getY(i));
  }
  geometry.setAttribute("cageIndices", new Float32BufferAttribute(ids, 4));
  geometry.setAttribute("cageWeights", new Float32BufferAttribute(weights, 4));
  geometry.setAttribute("cageSide", new Float32BufferAttribute(sides, 1));
}

/** Two rows: local displacement, then local normal delta. WebGL 2 only. */
export class CageDeformation {
  readonly data: Float32Array;
  readonly texture: DataTexture;
  readonly enabled = { value: 0 };
  constructor(readonly simulation: PetalDynamics) {
    const count = simulation.inverseMass.length;
    this.data = new Float32Array(Math.max(1, count) * 8);
    this.texture = new DataTexture(
      this.data,
      Math.max(1, count),
      2,
      RGBAFormat,
      FloatType,
    );
    this.texture.minFilter = this.texture.magFilter = NearestFilter;
    this.texture.colorSpace = NoColorSpace;
    this.texture.generateMipmaps = false;
    this.texture.needsUpdate = true;
  }

  update(inverses: readonly Matrix4[]) {
    const sim = this.simulation,
      count = sim.inverseMass.length;
    for (let node = 0; node < count; node++) {
      const k = node * 3,
        o = node * 4,
        n = o + count * 4;
      const m = inverses[sim.surface[node]].elements;
      const x = sim.positions[k] - sim.rest[k],
        y = sim.positions[k + 1] - sim.rest[k + 1],
        z = sim.positions[k + 2] - sim.rest[k + 2];
      this.data[o] = m[0] * x + m[4] * y + m[8] * z;
      this.data[o + 1] = m[1] * x + m[5] * y + m[9] * z;
      this.data[o + 2] = m[2] * x + m[6] * y + m[10] * z;
      let nx =
        m[0] * sim.normals[k] +
        m[4] * sim.normals[k + 1] +
        m[8] * sim.normals[k + 2];
      let ny =
        m[1] * sim.normals[k] +
        m[5] * sim.normals[k + 1] +
        m[9] * sim.normals[k + 2];
      let nz =
        m[2] * sim.normals[k] +
        m[6] * sim.normals[k + 1] +
        m[10] * sim.normals[k + 2];
      const length = Math.hypot(nx, ny, nz) || 1;
      nx /= length;
      ny /= length;
      nz /= length;
      let rx =
        m[0] * sim.restNormals[k] +
        m[4] * sim.restNormals[k + 1] +
        m[8] * sim.restNormals[k + 2];
      let ry =
        m[1] * sim.restNormals[k] +
        m[5] * sim.restNormals[k + 1] +
        m[9] * sim.restNormals[k + 2];
      let rz =
        m[2] * sim.restNormals[k] +
        m[6] * sim.restNormals[k + 1] +
        m[10] * sim.restNormals[k + 2];
      const restLength = Math.hypot(rx, ry, rz) || 1;
      rx /= restLength;
      ry /= restLength;
      rz /= restLength;
      this.data[n] = nx - rx;
      this.data[n + 1] = ny - ry;
      this.data[n + 2] = nz - rz;
    }
    this.texture.needsUpdate = true;
  }

  setEnabled(enabled: boolean) {
    this.enabled.value = enabled ? 1 : 0;
  }

  attach(material: Material) {
    const previous = material.onBeforeCompile,
      key = material.customProgramCacheKey.bind(material);
    const program = key();
    material.onBeforeCompile = (shader, renderer) => {
      previous.call(material, shader, renderer);
      shader.uniforms.uCageTexture = { value: this.texture };
      shader.uniforms.uCageNodes = {
        value: Math.max(1, this.simulation.inverseMass.length),
      };
      shader.uniforms.uCageEnabled = this.enabled;
      shader.vertexShader = shader.vertexShader
        .replace(
          "#include <common>",
          `#include <common>
        attribute vec4 cageIndices, cageWeights;
        attribute float cageSide;
        uniform sampler2D uCageTexture;
        uniform float uCageNodes, uCageEnabled;
        vec3 cageSample(float row) {
          return (texture2D(uCageTexture,vec2((cageIndices.x+.5)/uCageNodes,row)).xyz*cageWeights.x
            +texture2D(uCageTexture,vec2((cageIndices.y+.5)/uCageNodes,row)).xyz*cageWeights.y
            +texture2D(uCageTexture,vec2((cageIndices.z+.5)/uCageNodes,row)).xyz*cageWeights.z
            +texture2D(uCageTexture,vec2((cageIndices.w+.5)/uCageNodes,row)).xyz*cageWeights.w)*uCageEnabled;
        }
      `,
        )
        .replace(
          "#include <morphnormal_vertex>",
          `#include <morphnormal_vertex>
        objectNormal=normalize(objectNormal+cageSample(.75)*sign(cageSide));
      `,
        )
        .replace(
          "#include <morphtarget_vertex>",
          `#include <morphtarget_vertex>
        transformed+=cageSample(.25)+cageSample(.75)*cageSide;
      `,
        );
    };
    material.customProgramCacheKey = () => `${program}-cage-v1`;
    material.needsUpdate = true;
  }

  shadows() {
    const depth = new MeshDepthMaterial({
      depthPacking: RGBADepthPacking,
      side: DoubleSide,
    });
    const distance = new MeshDistanceMaterial({ side: DoubleSide });
    this.attach(depth);
    this.attach(distance);
    return { depth, distance };
  }
  dispose() {
    this.texture.dispose();
  }
}
