import type { Vec3 } from "../flowers/types";
import { PetalContacts } from "./petalContacts";

export interface CagePatch {
  columns: number;
  rows: number;
  periodic: boolean;
  thickness: number;
  compliance: number;
  shapeCompliance: number;
  pinRows: number;
  open: Float64Array;
  folded: Float64Array;
  triangles: Uint32Array;
  edges: Uint32Array;
  contactEdges: Uint32Array;
}

/** A midsurface cage is independent of the visible high/ultra tessellation. */
export function createCagePatch({
  columns,
  rows,
  thickness,
  sample,
  periodic = false,
  compliance = 0.00008,
  shapeCompliance = compliance * 125,
  pinRows = 1,
}: {
  columns: number;
  rows: number;
  thickness: number;
  sample: (u: number, v: number, open: number) => Vec3;
  periodic?: boolean;
  compliance?: number;
  shapeCompliance?: number;
  pinRows?: number;
}): CagePatch {
  const stride = periodic ? columns : columns + 1;
  const count = stride * (rows + 1);
  const open = new Float64Array(count * 3),
    folded = new Float64Array(count * 3);
  const triangles: number[] = [],
    edges: number[] = [],
    contactEdges: number[] = [];
  const link = (a: number, b: number) => edges.push(a, b);
  for (let j = 0; j <= rows; j++)
    for (let i = 0; i < stride; i++) {
      const k = j * stride + i;
      open.set(sample(i / columns, j / rows, 1), k * 3);
      folded.set(sample(i / columns, j / rows, 0), k * 3);
      if (j < rows) {
        link(k, k + stride);
        contactEdges.push(k, k + stride);
      }
      if (periodic || i < columns) {
        const next = j * stride + ((i + 1) % stride);
        link(k, next);
        contactEdges.push(k, next);
      }
      if (j + 2 <= rows) link(k, k + stride * 2);
      if (j < rows && (periodic || i < columns)) {
        const b = j * stride + ((i + 1) % stride),
          c = k + stride,
          d = b + stride;
        triangles.push(k, b, d, k, d, c);
        link(k, d);
        link(b, c);
      }
    }
  return {
    columns,
    rows,
    periodic,
    thickness,
    compliance,
    shapeCompliance,
    pinRows,
    open,
    folded,
    triangles: Uint32Array.from(triangles),
    edges: Uint32Array.from(edges),
    contactEdges: Uint32Array.from(contactEdges),
  };
}

export interface SurfaceForces {
  wind: number;
  time: number;
  pulse: number;
  x: number;
  y: number;
  z: number;
  proximity: number;
}
const STILL: SurfaceForces = {
  wind: 0,
  time: 0,
  pulse: 0,
  x: 0,
  y: 0,
  z: 0,
  proximity: 0,
};

/** Allocation-free XPBD stretch/bend/rest constraints in flower-local space. */
export class PetalDynamics {
  readonly positions: Float64Array;
  readonly previous: Float64Array;
  readonly rest: Float64Array;
  readonly normals: Float64Array;
  readonly restNormals: Float64Array;
  readonly velocity: Float64Array;
  readonly inverseMass: Float64Array;
  readonly thickness: Float64Array;
  readonly surface: Uint16Array;
  readonly offsets: number[] = [];
  readonly triangles: Uint32Array;
  readonly edges: Uint32Array;
  readonly lambdas: Float64Array;
  readonly patchOfEdge: Uint16Array;
  readonly stepSize: number;
  readonly iterations: number;
  contactCount = 0;
  private accumulated = 0;
  private readonly contacts: PetalContacts;

  constructor(
    readonly patches: CagePatch[],
    readonly constrained = false,
  ) {
    let count = 0;
    for (const p of patches) {
      this.offsets.push(count);
      count += p.open.length / 3;
    }
    const ceiling = constrained ? 512 : 2048;
    if (count > ceiling)
      throw new Error(`Petal cage exceeds ${ceiling} node budget`);
    this.positions = new Float64Array(count * 3);
    this.previous = new Float64Array(count * 3);
    this.rest = new Float64Array(count * 3);
    this.velocity = new Float64Array(count * 3);
    this.normals = new Float64Array(count * 3);
    this.restNormals = new Float64Array(count * 3);
    this.inverseMass = new Float64Array(count);
    this.thickness = new Float64Array(count);
    this.surface = new Uint16Array(count);
    const triangles: number[] = [],
      edges: number[] = [],
      patchOfEdge: number[] = [];
    for (let s = 0; s < patches.length; s++) {
      const p = patches[s],
        offset = this.offsets[s],
        stride = p.periodic ? p.columns : p.columns + 1;
      for (let i = 0; i < p.open.length / 3; i++) {
        this.inverseMass[offset + i] = i < stride * p.pinRows ? 0 : 1;
        this.thickness[offset + i] = p.thickness;
        this.surface[offset + i] = s;
      }
      for (const i of p.triangles) triangles.push(i + offset);
      for (let i = 0; i < p.edges.length; i += 2) {
        edges.push(p.edges[i] + offset, p.edges[i + 1] + offset);
        patchOfEdge.push(s);
      }
      this.setRest(s, 1);
    }
    this.triangles = Uint32Array.from(triangles);
    this.edges = Uint32Array.from(edges);
    this.patchOfEdge = Uint16Array.from(patchOfEdge);
    this.lambdas = new Float64Array(edges.length / 2);
    this.stepSize = constrained ? 1 / 60 : 1 / 120;
    this.iterations = constrained ? 4 : 6;
    // Contact uses the material cage's warp/weft edges, not artificial diagonals.
    const collisionEdges: number[] = [];
    patches.forEach((p, i) => {
      for (const node of p.contactEdges)
        collisionEdges.push(node + this.offsets[i]);
    });
    this.contacts = new PetalContacts(
      this.triangles,
      Uint32Array.from(collisionEdges),
      this.surface,
      this.thickness,
      this.inverseMass,
      patches.map((p) => (p.periodic ? p.columns : p.columns + 1)),
    );
    this.reset();
  }

  setRest(surface: number, openness: number, matrix?: ArrayLike<number>) {
    const p = this.patches[surface],
      offset = this.offsets[surface] * 3;
    const open = Math.max(0, Math.min(1, openness));
    for (let i = 0; i < p.open.length; i += 3) {
      const x = p.folded[i] + (p.open[i] - p.folded[i]) * open;
      const y = p.folded[i + 1] + (p.open[i + 1] - p.folded[i + 1]) * open;
      const z = p.folded[i + 2] + (p.open[i + 2] - p.folded[i + 2]) * open;
      this.rest[offset + i] = matrix
        ? matrix[0] * x + matrix[4] * y + matrix[8] * z + matrix[12]
        : x;
      this.rest[offset + i + 1] = matrix
        ? matrix[1] * x + matrix[5] * y + matrix[9] * z + matrix[13]
        : y;
      this.rest[offset + i + 2] = matrix
        ? matrix[2] * x + matrix[6] * y + matrix[10] * z + matrix[14]
        : z;
    }
  }

  reset() {
    this.positions.set(this.rest);
    this.previous.set(this.rest);
    this.velocity.fill(0);
    this.accumulated = 0;
    this.contactCount = 0;
    if (this.triangles) {
      this.computeNormals(this.positions, this.normals);
      this.restNormals.set(this.normals);
    }
  }

  step(dt: number, force: SurfaceForces = STILL) {
    if (!(dt > 0)) return;
    this.accumulated += Math.min(dt, 0.05);
    const max = this.constrained ? 2 : 4;
    let steps = 0;
    this.contactCount = 0;
    while (this.accumulated + 1e-10 >= this.stepSize && steps++ < max) {
      this.integrate(this.stepSize, force);
      this.accumulated -= this.stepSize;
    }
    if (this.accumulated >= this.stepSize) this.accumulated %= this.stepSize;
    this.computeNormals(this.positions, this.normals);
    this.computeNormals(this.rest, this.restNormals);
  }

  private integrate(h: number, force: SurfaceForces) {
    const p = this.positions,
      r = this.rest,
      v = this.velocity;
    this.previous.set(p);
    this.lambdas.fill(0);
    const drag = Math.exp(-h * 8);
    const wind = Number.isFinite(force.wind)
      ? Math.max(-4, Math.min(4, force.wind))
      : 0;
    const pulse = Number.isFinite(force.pulse)
      ? Math.max(-2, Math.min(2, force.pulse))
      : 0;
    const proximity = Number.isFinite(force.proximity)
      ? Math.max(0, Math.min(1, force.proximity))
      : 0;
    for (let i = 0; i < this.inverseMass.length; i++) {
      const k = i * 3;
      if (!this.inverseMass[i]) {
        p[k] = r[k];
        p[k + 1] = r[k + 1];
        p[k + 2] = r[k + 2];
        continue;
      }
      const distance = Math.hypot(
        r[k] - force.x,
        r[k + 1] - force.y,
        r[k + 2] - force.z,
      );
      const near =
        (Number.isFinite(distance) ? Math.max(0, 1 - distance / 0.55) : 0) *
        proximity;
      const air =
        wind *
        (Math.sin(
          (Number.isFinite(force.time) ? force.time : 0) * 1.7 + i * 0.41,
        ) *
          0.2 +
          0.3);
      v[k] = v[k] * drag + h * (air + near * 2);
      v[k + 1] = v[k + 1] * drag + h * (pulse * 0.35 - near * 0.9);
      v[k + 2] = v[k + 2] * drag + h * (air * 0.6 + near * 0.7);
      p[k] += v[k] * h;
      p[k + 1] += v[k + 1] * h;
      p[k + 2] += v[k + 2] * h;
    }
    for (let iteration = 0; iteration < this.iterations; iteration++) {
      for (let e = 0; e < this.edges.length; e += 2) {
        const a = this.edges[e],
          b = this.edges[e + 1],
          ka = a * 3,
          kb = b * 3;
        const w = this.inverseMass[a] + this.inverseMass[b];
        if (!w) continue;
        const dx = p[ka] - p[kb],
          dy = p[ka + 1] - p[kb + 1],
          dz = p[ka + 2] - p[kb + 2];
        const length = Math.hypot(dx, dy, dz);
        if (length < 1e-12) continue;
        const target = Math.hypot(
          r[ka] - r[kb],
          r[ka + 1] - r[kb + 1],
          r[ka + 2] - r[kb + 2],
        );
        const alpha =
          this.patches[this.patchOfEdge[e / 2]].compliance / (h * h);
        const lambda =
          (-(length - target) - alpha * this.lambdas[e / 2]) / (w + alpha);
        this.lambdas[e / 2] += lambda;
        const change = lambda / length;
        for (let c = 0; c < 3; c++) {
          const d = c === 0 ? dx : c === 1 ? dy : dz;
          p[ka + c] += d * change * this.inverseMass[a];
          p[kb + c] -= d * change * this.inverseMass[b];
        }
      }
      // Weak rest-shape constraints preserve botanical curvature, not a flat cloth.
      for (let i = 0; i < this.inverseMass.length; i++) {
        if (!this.inverseMass[i]) continue;
        const compliance = this.patches[this.surface[i]].shapeCompliance;
        const gain = (h * h) / (compliance + h * h);
        for (let c = 0; c < 3; c++)
          p[i * 3 + c] += (r[i * 3 + c] - p[i * 3 + c]) * gain;
      }
      if (iteration === this.iterations - 1) this.solveContacts();
    }
    for (let i = 0; i < v.length; i++) {
      // Keep pathological bloom overlap or pointer input inside a local envelope.
      p[i] = Math.max(r[i] - 0.18, Math.min(r[i] + 0.18, p[i]));
      v[i] = Math.max(-2, Math.min(2, (p[i] - this.previous[i]) / h));
    }
  }

  protected solveContacts() {
    this.contactCount += this.contacts.solve(this.positions, this.previous);
  }

  computeNormals(points: Float64Array, result: Float64Array) {
    result.fill(0);
    for (let t = 0; t < this.triangles.length; t += 3) {
      const a = this.triangles[t] * 3,
        b = this.triangles[t + 1] * 3,
        c = this.triangles[t + 2] * 3;
      const ux = points[b] - points[a],
        uy = points[b + 1] - points[a + 1],
        uz = points[b + 2] - points[a + 2];
      const vx = points[c] - points[a],
        vy = points[c + 1] - points[a + 1],
        vz = points[c + 2] - points[a + 2];
      const nx = uy * vz - uz * vy,
        ny = uz * vx - ux * vz,
        nz = ux * vy - uy * vx;
      for (let corner = 0; corner < 3; corner++) {
        const k = corner === 0 ? a : corner === 1 ? b : c;
        result[k] += nx;
        result[k + 1] += ny;
        result[k + 2] += nz;
      }
    }
    for (let k = 0; k < result.length; k += 3) {
      const length = Math.hypot(result[k], result[k + 1], result[k + 2]);
      if (length > 1e-12) {
        result[k] /= length;
        result[k + 1] /= length;
        result[k + 2] /= length;
      } else result[k + 2] = 1;
    }
  }
}
