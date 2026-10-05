/** Closest point and barycentric coordinates, using caller-owned scratch storage. */
export function closestTriangle(
  p: Float64Array,
  a: number,
  b: number,
  c: number,
  x: number,
  y: number,
  z: number,
  out: Float64Array,
) {
  a *= 3;
  b *= 3;
  c *= 3;
  const abx = p[b] - p[a],
    aby = p[b + 1] - p[a + 1],
    abz = p[b + 2] - p[a + 2];
  const acx = p[c] - p[a],
    acy = p[c + 1] - p[a + 1],
    acz = p[c + 2] - p[a + 2];
  const apx = x - p[a],
    apy = y - p[a + 1],
    apz = z - p[a + 2];
  const d1 = abx * apx + aby * apy + abz * apz,
    d2 = acx * apx + acy * apy + acz * apz;
  let wa = 0,
    wb = 0,
    wc = 0;
  if (d1 <= 0 && d2 <= 0) wa = 1;
  else {
    const bpx = x - p[b],
      bpy = y - p[b + 1],
      bpz = z - p[b + 2];
    const d3 = abx * bpx + aby * bpy + abz * bpz,
      d4 = acx * bpx + acy * bpy + acz * bpz;
    if (d3 >= 0 && d4 <= d3) wb = 1;
    else {
      const vc = d1 * d4 - d3 * d2;
      if (vc <= 0 && d1 >= 0 && d3 <= 0) {
        wb = d1 / Math.max(1e-20, d1 - d3);
        wa = 1 - wb;
      } else {
        const cpx = x - p[c],
          cpy = y - p[c + 1],
          cpz = z - p[c + 2];
        const d5 = abx * cpx + aby * cpy + abz * cpz,
          d6 = acx * cpx + acy * cpy + acz * cpz;
        if (d6 >= 0 && d5 <= d6) wc = 1;
        else {
          const vb = d5 * d2 - d1 * d6;
          if (vb <= 0 && d2 >= 0 && d6 <= 0) {
            wc = d2 / Math.max(1e-20, d2 - d6);
            wa = 1 - wc;
          } else {
            const va = d3 * d6 - d5 * d4;
            if (va <= 0 && d4 - d3 >= 0 && d5 - d6 >= 0) {
              wc = (d4 - d3) / Math.max(1e-20, d4 - d3 + d5 - d6);
              wb = 1 - wc;
            } else {
              const total = va + vb + vc;
              if (Math.abs(total) < 1e-20) wa = 1;
              else {
                wb = vb / total;
                wc = vc / total;
                wa = 1 - wb - wc;
              }
            }
          }
        }
      }
    }
  }
  out[0] = p[a] * wa + p[b] * wb + p[c] * wc;
  out[1] = p[a + 1] * wa + p[b + 1] * wb + p[c + 1] * wc;
  out[2] = p[a + 2] * wa + p[b + 2] * wb + p[c + 2] * wc;
  out[3] = wa;
  out[4] = wb;
  out[5] = wc;
  const nx = aby * acz - abz * acy,
    ny = abz * acx - abx * acz,
    nz = abx * acy - aby * acx;
  const length = Math.hypot(nx, ny, nz) || 1;
  out[6] = nx / length;
  out[7] = ny / length;
  out[8] = nz / length;
}

/** Closest edge separation plus the two interpolation coordinates. */
export function closestSegments(
  p: Float64Array,
  a: number,
  b: number,
  c: number,
  d: number,
  out: Float64Array,
) {
  a *= 3;
  b *= 3;
  c *= 3;
  d *= 3;
  const ux = p[b] - p[a],
    uy = p[b + 1] - p[a + 1],
    uz = p[b + 2] - p[a + 2];
  const vx = p[d] - p[c],
    vy = p[d + 1] - p[c + 1],
    vz = p[d + 2] - p[c + 2];
  const rx = p[a] - p[c],
    ry = p[a + 1] - p[c + 1],
    rz = p[a + 2] - p[c + 2];
  const aa = ux * ux + uy * uy + uz * uz,
    bb = ux * vx + uy * vy + uz * vz;
  const cc = vx * vx + vy * vy + vz * vz,
    dd = ux * rx + uy * ry + uz * rz,
    ee = vx * rx + vy * ry + vz * rz;
  const denominator = aa * cc - bb * bb;
  let s =
    denominator > 1e-20
      ? Math.max(0, Math.min(1, (bb * ee - cc * dd) / denominator))
      : 0;
  let t = cc > 1e-20 ? (bb * s + ee) / cc : 0;
  if (t < 0) {
    t = 0;
    s = aa > 1e-20 ? Math.max(0, Math.min(1, -dd / aa)) : 0;
  }
  if (t > 1) {
    t = 1;
    s = aa > 1e-20 ? Math.max(0, Math.min(1, (bb - dd) / aa)) : 0;
  }
  out[0] = rx + ux * s - vx * t;
  out[1] = ry + uy * s - vy * t;
  out[2] = rz + uz * s - vz * t;
  out[3] = s;
  out[4] = t;
  out[5] = Math.hypot(out[0], out[1], out[2]);
}

// Fixed hashed cells avoid a Map, arrays or vectors being allocated each frame.
class ContactGrid {
  private readonly heads = new Int32Array(8192);
  private readonly next: Int32Array;
  private readonly primitive: Int32Array;
  readonly overflow: Int32Array;
  overflowCount = 0;
  private used = 0;
  readonly cell = 0.12;
  constructor(count: number) {
    const capacity = Math.min(262144, Math.max(1024, count * 48));
    this.next = new Int32Array(capacity);
    this.primitive = new Int32Array(capacity);
    this.overflow = new Int32Array(count);
  }
  reset() {
    this.heads.fill(-1);
    this.used = 0;
    this.overflowCount = 0;
  }
  hash(x: number, y: number, z: number) {
    return ((x * 73856093) ^ (y * 19349663) ^ (z * 83492791)) & 8191;
  }
  insert(
    id: number,
    minX: number,
    minY: number,
    minZ: number,
    maxX: number,
    maxY: number,
    maxZ: number,
  ) {
    const x0 = Math.floor(minX / this.cell),
      y0 = Math.floor(minY / this.cell),
      z0 = Math.floor(minZ / this.cell);
    const x1 = Math.floor(maxX / this.cell),
      y1 = Math.floor(maxY / this.cell),
      z1 = Math.floor(maxZ / this.cell);
    const needed = (x1 - x0 + 1) * (y1 - y0 + 1) * (z1 - z0 + 1);
    if (needed > 128 || this.used + needed > this.next.length) {
      this.overflow[this.overflowCount++] = id;
      return;
    }
    for (let x = x0; x <= x1; x++)
      for (let y = y0; y <= y1; y++)
        for (let z = z0; z <= z1; z++) {
          const bucket = this.hash(x, y, z),
            entry = this.used++;
          this.primitive[entry] = id;
          this.next[entry] = this.heads[bucket];
          this.heads[bucket] = entry;
        }
  }
  first(x: number, y: number, z: number) {
    return this.heads[this.hash(x, y, z)];
  }
  nextEntry(entry: number) {
    return this.next[entry];
  }
  id(entry: number) {
    return this.primitive[entry];
  }
}

export class PetalContacts {
  private readonly trianglesGrid: ContactGrid;
  private readonly edgesGrid: ContactGrid;
  private readonly triangleStamp: Int32Array;
  private readonly edgeStamp: Int32Array;
  private readonly scratch = new Float64Array(9);
  private readonly edgeBounds: Float64Array;
  private readonly triangleBounds: Float64Array;
  private readonly remainingProjection: Float64Array;
  private query = 0;
  constructor(
    private readonly triangles: Uint32Array,
    private readonly edges: Uint32Array,
    private readonly surface: Uint16Array,
    private readonly thickness: Float64Array,
    private readonly inverseMass: Float64Array,
    private readonly strides: number[],
  ) {
    this.trianglesGrid = new ContactGrid(triangles.length / 3);
    this.edgesGrid = new ContactGrid(edges.length / 2);
    this.triangleStamp = new Int32Array(triangles.length / 3);
    this.edgeStamp = new Int32Array(edges.length / 2);
    this.edgeBounds = new Float64Array((edges.length / 2) * 6);
    this.triangleBounds = new Float64Array((triangles.length / 3) * 6);
    this.remainingProjection = new Float64Array(surface.length);
  }

  private adjacent(a: number, b: number) {
    if (this.surface[a] !== this.surface[b]) return false;
    // Same surface's immediate topological neighbors are structural constraints.
    const stride = this.strides[this.surface[a]];
    return (
      Math.abs(a - b) <= 1 ||
      Math.abs(a - b) === stride ||
      Math.abs(a - b) === stride + 1 ||
      Math.abs(a - b) === stride - 1
    );
  }

  solve(p: Float64Array, previous: Float64Array) {
    // Dense, redundant contacts must not sum to an unbounded correction at a
    // single node. Further separation can converge in the next fixed substep.
    this.remainingProjection.set(this.thickness);
    let contacts = 0;
    const tri = this.triangles,
      edge = this.edges,
      grid = this.trianglesGrid;
    grid.reset();
    for (let t = 0; t < tri.length; t += 3) {
      const a = tri[t] * 3,
        b = tri[t + 1] * 3,
        c = tri[t + 2] * 3,
        gap = this.thickness[tri[t]];
      const bounds = (t / 3) * 6;
      this.triangleBounds[bounds] = Math.min(p[a], p[b], p[c]) - gap;
      this.triangleBounds[bounds + 1] =
        Math.min(p[a + 1], p[b + 1], p[c + 1]) - gap;
      this.triangleBounds[bounds + 2] =
        Math.min(p[a + 2], p[b + 2], p[c + 2]) - gap;
      this.triangleBounds[bounds + 3] = Math.max(p[a], p[b], p[c]) + gap;
      this.triangleBounds[bounds + 4] =
        Math.max(p[a + 1], p[b + 1], p[c + 1]) + gap;
      this.triangleBounds[bounds + 5] =
        Math.max(p[a + 2], p[b + 2], p[c + 2]) + gap;
      grid.insert(
        t / 3,
        Math.min(p[a], p[b], p[c]) - gap,
        Math.min(p[a + 1], p[b + 1], p[c + 1]) - gap,
        Math.min(p[a + 2], p[b + 2], p[c + 2]) - gap,
        Math.max(p[a], p[b], p[c]) + gap,
        Math.max(p[a + 1], p[b + 1], p[c + 1]) + gap,
        Math.max(p[a + 2], p[b + 2], p[c + 2]) + gap,
      );
    }
    for (let node = 0; node < this.surface.length; node++) {
      if (!this.inverseMass[node]) continue;
      const k = node * 3,
        stamp = ++this.query;
      const x = Math.floor(p[k] / grid.cell),
        y = Math.floor(p[k + 1] / grid.cell),
        z = Math.floor(p[k + 2] / grid.cell);
      for (
        let entry = grid.first(x, y, z);
        entry >= 0;
        entry = grid.nextEntry(entry)
      ) {
        const id = grid.id(entry);
        if (this.triangleStamp[id] === stamp) continue;
        this.triangleStamp[id] = stamp;
        contacts += this.vertexContact(node, id, p, previous);
      }
      for (let o = 0; o < grid.overflowCount; o++)
        contacts += this.vertexContact(node, grid.overflow[o], p, previous);
    }
    const eg = this.edgesGrid;
    eg.reset();
    for (let e = 0; e < edge.length; e += 2) {
      const a = edge[e] * 3,
        b = edge[e + 1] * 3,
        gap = this.thickness[edge[e]],
        k = (e / 2) * 6;
      this.edgeBounds[k] = Math.min(p[a], p[b]) - gap;
      this.edgeBounds[k + 1] = Math.min(p[a + 1], p[b + 1]) - gap;
      this.edgeBounds[k + 2] = Math.min(p[a + 2], p[b + 2]) - gap;
      this.edgeBounds[k + 3] = Math.max(p[a], p[b]) + gap;
      this.edgeBounds[k + 4] = Math.max(p[a + 1], p[b + 1]) + gap;
      this.edgeBounds[k + 5] = Math.max(p[a + 2], p[b + 2]) + gap;
      eg.insert(
        e / 2,
        this.edgeBounds[k],
        this.edgeBounds[k + 1],
        this.edgeBounds[k + 2],
        this.edgeBounds[k + 3],
        this.edgeBounds[k + 4],
        this.edgeBounds[k + 5],
      );
    }
    for (let e = 0; e < edge.length / 2; e++) {
      const k = e * 6,
        stamp = ++this.query;
      const x0 = Math.floor(this.edgeBounds[k] / eg.cell),
        x1 = Math.floor(this.edgeBounds[k + 3] / eg.cell);
      const y0 = Math.floor(this.edgeBounds[k + 1] / eg.cell),
        y1 = Math.floor(this.edgeBounds[k + 4] / eg.cell);
      const z0 = Math.floor(this.edgeBounds[k + 2] / eg.cell),
        z1 = Math.floor(this.edgeBounds[k + 5] / eg.cell);
      for (let x = x0; x <= x1; x++)
        for (let y = y0; y <= y1; y++)
          for (let z = z0; z <= z1; z++) {
            for (
              let entry = eg.first(x, y, z);
              entry >= 0;
              entry = eg.nextEntry(entry)
            ) {
              const other = eg.id(entry);
              if (other <= e || this.edgeStamp[other] === stamp) continue;
              this.edgeStamp[other] = stamp;
              contacts += this.edgeContact(e, other, p, previous);
            }
          }
      for (let o = 0; o < eg.overflowCount; o++) {
        const other = eg.overflow[o];
        if (other > e && this.edgeStamp[other] !== stamp)
          contacts += this.edgeContact(e, other, p, previous);
      }
    }
    return contacts;
  }

  private vertexContact(
    node: number,
    id: number,
    p: Float64Array,
    previous: Float64Array,
  ) {
    const bounds = id * 6,
      pk = node * 3,
      tb = this.triangleBounds;
    if (
      p[pk] < tb[bounds] ||
      p[pk] > tb[bounds + 3] ||
      p[pk + 1] < tb[bounds + 1] ||
      p[pk + 1] > tb[bounds + 4] ||
      p[pk + 2] < tb[bounds + 2] ||
      p[pk + 2] > tb[bounds + 5]
    )
      return 0;
    const t = id * 3,
      a = this.triangles[t],
      b = this.triangles[t + 1],
      c = this.triangles[t + 2];
    if (
      this.adjacent(node, a) ||
      this.adjacent(node, b) ||
      this.adjacent(node, c)
    )
      return 0;
    const k = node * 3,
      out = this.scratch;
    closestTriangle(p, a, b, c, p[k], p[k + 1], p[k + 2], out);
    let dx = p[k] - out[0],
      dy = p[k + 1] - out[1],
      dz = p[k + 2] - out[2];
    let distance = Math.hypot(dx, dy, dz);
    const gap = (this.thickness[node] + this.thickness[a]) * 0.5;
    if (distance >= gap) return 0;
    if (distance < 1e-10) {
      const old =
        (previous[k] - out[0]) * out[6] +
        (previous[k + 1] - out[1]) * out[7] +
        (previous[k + 2] - out[2]) * out[8];
      const sign = old < 0 ? -1 : 1;
      dx = out[6] * sign;
      dy = out[7] * sign;
      dz = out[8] * sign;
      distance = 1;
    } else {
      dx /= distance;
      dy /= distance;
      dz /= distance;
    }
    const wa = out[3],
      wb = out[4],
      wc = out[5],
      weights = this.inverseMass;
    const sum =
      weights[node] +
      weights[a] * wa * wa +
      weights[b] * wb * wb +
      weights[c] * wc * wc;
    if (!sum) return 0;
    let amount = (gap - (distance === 1 ? 0 : distance)) / sum;
    amount = this.limitProjection(node, weights[node], amount);
    amount = this.limitProjection(a, weights[a] * wa, amount);
    amount = this.limitProjection(b, weights[b] * wb, amount);
    amount = this.limitProjection(c, weights[c] * wc, amount);
    this.remainingProjection[node] -= amount * weights[node];
    this.remainingProjection[a] -= amount * weights[a] * wa;
    this.remainingProjection[b] -= amount * weights[b] * wb;
    this.remainingProjection[c] -= amount * weights[c] * wc;
    for (let component = 0; component < 3; component++) {
      const n = component === 0 ? dx : component === 1 ? dy : dz;
      p[k + component] += amount * weights[node] * n;
      p[a * 3 + component] -= amount * weights[a] * wa * n;
      p[b * 3 + component] -= amount * weights[b] * wb * n;
      p[c * 3 + component] -= amount * weights[c] * wc * n;
    }
    return 1;
  }

  private edgeContact(
    first: number,
    second: number,
    p: Float64Array,
    previous: Float64Array,
  ) {
    const x = first * 6,
      y = second * 6,
      bounds = this.edgeBounds;
    if (
      bounds[x] > bounds[y + 3] ||
      bounds[x + 3] < bounds[y] ||
      bounds[x + 1] > bounds[y + 4] ||
      bounds[x + 4] < bounds[y + 1] ||
      bounds[x + 2] > bounds[y + 5] ||
      bounds[x + 5] < bounds[y + 2]
    )
      return 0;
    const a = this.edges[first * 2],
      b = this.edges[first * 2 + 1],
      c = this.edges[second * 2],
      d = this.edges[second * 2 + 1];
    if (
      this.adjacent(a, c) ||
      this.adjacent(a, d) ||
      this.adjacent(b, c) ||
      this.adjacent(b, d)
    )
      return 0;
    const out = this.scratch;
    closestSegments(p, a, b, c, d, out);
    const gap = (this.thickness[a] + this.thickness[c]) * 0.5,
      distance = out[5];
    if (distance >= gap) return 0;
    const s = out[3],
      t = out[4];
    let nx = out[0],
      ny = out[1],
      nz = out[2];
    let length = distance;
    if (length < 1e-10) {
      nx =
        previous[a * 3] * (1 - s) +
        previous[b * 3] * s -
        previous[c * 3] * (1 - t) -
        previous[d * 3] * t;
      ny =
        previous[a * 3 + 1] * (1 - s) +
        previous[b * 3 + 1] * s -
        previous[c * 3 + 1] * (1 - t) -
        previous[d * 3 + 1] * t;
      nz =
        previous[a * 3 + 2] * (1 - s) +
        previous[b * 3 + 2] * s -
        previous[c * 3 + 2] * (1 - t) -
        previous[d * 3 + 2] * t;
      length = Math.hypot(nx, ny, nz);
      if (length < 1e-10) {
        nz = 1;
        length = 1;
      }
    }
    nx /= length;
    ny /= length;
    nz /= length;
    const weights = this.inverseMass,
      wa = 1 - s,
      wb = s,
      wc = 1 - t,
      wd = t;
    const sum =
      weights[a] * wa * wa +
      weights[b] * wb * wb +
      weights[c] * wc * wc +
      weights[d] * wd * wd;
    if (!sum) return 0;
    // A contact arbitrarily close to a pinned endpoint has vanishing effective
    // mass. Dividing by it can move the remote free endpoint by metres. Bound
    // each projection to one tissue thickness while retaining weighted motion.
    let amount = (gap - distance) / sum;
    amount = this.limitProjection(a, weights[a] * wa, amount);
    amount = this.limitProjection(b, weights[b] * wb, amount);
    amount = this.limitProjection(c, weights[c] * wc, amount);
    amount = this.limitProjection(d, weights[d] * wd, amount);
    this.remainingProjection[a] -= amount * weights[a] * wa;
    this.remainingProjection[b] -= amount * weights[b] * wb;
    this.remainingProjection[c] -= amount * weights[c] * wc;
    this.remainingProjection[d] -= amount * weights[d] * wd;
    for (let component = 0; component < 3; component++) {
      const n = component === 0 ? nx : component === 1 ? ny : nz;
      p[a * 3 + component] += amount * weights[a] * wa * n;
      p[b * 3 + component] += amount * weights[b] * wb * n;
      p[c * 3 + component] -= amount * weights[c] * wc * n;
      p[d * 3 + component] -= amount * weights[d] * wd * n;
    }
    return 1;
  }

  private limitProjection(node: number, weight: number, amount: number) {
    return weight > 0
      ? Math.min(amount, Math.max(0, this.remainingProjection[node]) / weight)
      : amount;
  }
}
