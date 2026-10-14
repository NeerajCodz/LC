import test from "node:test";
import assert from "node:assert/strict";
import {
  IMPATIENS_MODEL,
  IMPATIENS_STALKS,
  impatiensSpurredSepal,
} from "../components/flowers/impatiens/impatiensGeometry";
import { verifySpecimen } from "./specimen-checks";
import { IMPATIENS_LEAF } from "../components/flowers/impatiens/impatiensLeaf";
import {
  DoubleSide,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  Object3D,
  Raycaster,
  Triangle,
  Vector3,
} from "three";
import {
  specimenCages,
  specimenGeometry,
  specimenOrganCarrier,
  specimenOrganParts,
} from "../lib/three/specimenModel";
import { petalOpenness } from "../lib/three/easing";
import {
  createSurfaceBatch,
  surfaceBatchGroups,
  type SurfaceBatchUniforms,
} from "../lib/three/surfaceBatch";
import {
  createSurfaceBatchPoses,
  writeSurfaceBatchPose,
  surfaceBatchVertex,
} from "../lib/three/surfaceBatchPose";

const pairedLimbs = IMPATIENS_MODEL.surfaces.filter(
  (surface) => surface.name === "joined deeply bilobed lateral pair",
);
const allQualities = ["overview", "low", "medium", "high", "ultra"] as const;
type ContourPoint = [number, number];
function limbHull(points: ContourPoint[]) {
  const cross = (a: ContourPoint, b: ContourPoint, c: ContourPoint) =>
    (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);
  points.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const lower: ContourPoint[] = [],
    upper: ContourPoint[] = [];
  for (const point of points) {
    while (lower.length > 1 && cross(lower.at(-2)!, lower.at(-1)!, point) <= 0)
      lower.pop();
    lower.push(point);
  }
  for (const point of points.slice().reverse()) {
    while (upper.length > 1 && cross(upper.at(-2)!, upper.at(-1)!, point) <= 0)
      upper.pop();
    upper.push(point);
  }
  lower.pop();
  upper.pop();
  return lower.concat(upper);
}
function contourWidth(hull: ContourPoint[], at: number) {
  const crossings: number[] = [];
  for (let i = 0; i < hull.length; i++) {
    const a = hull[i],
      b = hull[(i + 1) % hull.length];
    if (
      a[0] !== b[0] &&
      at >= Math.min(a[0], b[0]) &&
      at <= Math.max(a[0], b[0])
    )
      crossings.push(a[1] + ((b[1] - a[1]) * (at - a[0])) / (b[0] - a[0]));
  }
  assert.ok(crossings.length >= 2);
  return Math.max(...crossings) - Math.min(...crossings);
}
function contourFront(hull: ContourPoint[], across: number) {
  const crossings: number[] = [];
  for (let i = 0; i < hull.length; i++) {
    const a = hull[i],
      b = hull[(i + 1) % hull.length];
    if (
      a[1] !== b[1] &&
      across >= Math.min(a[1], b[1]) &&
      across <= Math.max(a[1], b[1])
    )
      crossings.push(a[0] + ((b[0] - a[0]) * (across - a[1])) / (b[1] - a[1]));
  }
  assert.ok(crossings.length >= 2);
  return Math.max(...crossings);
}

test("impatiens: actual lateral shells have broad rounded paired lobes rather than acute fins", () => {
  for (const quality of allQualities)
    for (const surface of pairedLimbs.filter((s) => s.cluster < 3)) {
      const geometry = specimenGeometry(surface, quality),
        position = geometry.getAttribute("position"),
        uv = geometry.getAttribute("uv"),
        side = Math.sign(surface.sample(0.5, 0, 1)[0]);
      try {
        for (const lobe of [-1, 1]) {
          const angle = lobe * 0.675,
            points: ContourPoint[] = [];
          // Both real skins and all cap endpoints contribute; never cancel
          // shell extrusion by averaging faces or hull the two lobes together.
          for (let i = 0; i < position.count; i++) {
            if ((uv.getX(i) - 0.5) * lobe < 0) continue;
            const x = side * position.getX(i) - 0.028,
              z = position.getZ(i) - 0.02;
            points.push([
              x * Math.cos(angle) + z * Math.sin(angle),
              -x * Math.sin(angle) + z * Math.cos(angle),
            ]);
          }
          const hull = limbHull(points),
            min = Math.min(...points.map((p) => p[0])),
            max = Math.max(...points.map((p) => p[0])),
            length = max - min,
            shoulder = contourWidth(hull, min + length * 0.88),
            tipAngle = 2 * Math.atan(shoulder / (0.24 * length));
          // Authored proportional acceptance for the flora's rounded/subtruncate
          // ends: a broad distal shoulder, not a triangular terminal point.
          assert.ok(
            tipAngle > (100 * Math.PI) / 180,
            `${quality}/cluster${surface.cluster}/lobe${lobe}: shell tip angle ${(tipAngle * 180) / Math.PI} is an acute fin`,
          );
          assert.ok(
            contourWidth(hull, min + length * 0.65) >
              contourWidth(hull, min + length * 0.2) * 1.25,
            `${quality}: obovate limb must broaden beyond its insertion`,
          );
        }
        const terminal = Array.from(
            { length: position.count },
            (_, i) => i,
          ).filter((i) => uv.getY(i) === 1),
          notch = Math.max(
            ...terminal
              .filter((i) => uv.getX(i) === 0.5)
              .map((i) => side * position.getX(i)),
          ),
          lobes = [-1, 1].map((sign) =>
            Math.max(
              ...terminal
                .filter((i) => (uv.getX(i) - 0.5) * sign > 0)
                .map((i) => side * position.getX(i)),
            ),
          );
        assert.ok(
          notch < Math.min(...lobes) * 0.72,
          `${quality}: actual terminal cleft must remain deep`,
        );
      } finally {
        geometry.dispose();
      }
    }
});

test("impatiens: actual overview batch retains rounded distal curvature instead of a rectangular terminal cut", () => {
  const poses = createSurfaceBatchPoses(IMPATIENS_MODEL.clusters),
    matrix = new Matrix4(),
    inverse = new Matrix4(),
    point = new Vector3(),
    uniforms: SurfaceBatchUniforms = {
      uBatchBloom: { value: 1 },
      uBatchPressure: { value: 0 },
      uBatchPoses: { value: poses.texture },
      uBatchPoseRows: { value: IMPATIENS_MODEL.clusters.length },
      uBatchHinge: { value: 0 },
    };
  try {
    for (const group of surfaceBatchGroups(IMPATIENS_MODEL, true)) {
      const geometry = createSurfaceBatch(
          group.entries,
          IMPATIENS_MODEL.clusters,
        ),
        uv = geometry.getAttribute("uv");
      let offset = 0;
      try {
        for (const { surface } of group.entries) {
          const part = specimenGeometry(surface, "overview"),
            count = part.getAttribute("position").count;
          part.dispose();
          if (
            surface.name === "joined deeply bilobed lateral pair" &&
            surface.cluster < 3
          ) {
            inverse.fromArray(poses.data, surface.cluster * 32).invert();
            const side = Math.sign(surface.sample(0.5, 0, 1)[0]);
            for (const lobe of [-1, 1]) {
              const angle = lobe * 0.675,
                points: ContourPoint[] = [];
              for (let i = offset; i < offset + count; i++) {
                if (uv.getY(i) !== 1 || (uv.getX(i) - 0.5) * lobe < 0) continue;
                surfaceBatchVertex(
                  geometry,
                  i,
                  uniforms,
                  point,
                  matrix,
                ).applyMatrix4(inverse);
                const x = side * point.x - 0.028,
                  z = point.z - 0.02;
                points.push([
                  x * Math.cos(angle) + z * Math.sin(angle),
                  -x * Math.sin(angle) + z * Math.cos(angle),
                ]);
              }
              const hull = limbHull(points),
                width =
                  Math.max(...points.map((p) => p[1])) -
                  Math.min(...points.map((p) => p[1])),
                center =
                  (Math.max(...points.map((p) => p[1])) +
                    Math.min(...points.map((p) => p[1]))) /
                  2,
                length =
                  Math.max(...points.map((p) => p[0])) -
                  Math.min(...points.map((p) => p[0])),
                bulge =
                  contourFront(hull, center) -
                  (contourFront(hull, center - width * 0.25) +
                    contourFront(hull, center + width * 0.25)) /
                    2;
              // A blunt rectangle can satisfy the broad-tip test. Require actual
              // rendered curvature across its distal middle, including both skins.
              assert.ok(
                bulge > length * 0.04,
                `cluster${surface.cluster}/lobe${lobe}: overview distal bulge ${bulge} must retain rounded contour`,
              );
            }
          }
          offset += count;
        }
      } finally {
        geometry.dispose();
      }
    }
  } finally {
    poses.texture.dispose();
  }
});

test("impatiens: paired limbs retain sealed positive tissue and opposing skins through seven folds", () => {
  const triangle = new Triangle(),
    opposite = new Triangle(),
    normal = new Vector3(),
    backNormal = new Vector3(),
    a = new Vector3(),
    b = new Vector3();
  for (const quality of allQualities)
    for (const surface of pairedLimbs) {
      const geometry = specimenGeometry(surface, quality),
        p = geometry.getAttribute("position"),
        f = geometry.morphAttributes.position![0],
        uv = geometry.getAttribute("uv"),
        index = geometry.index!,
        half = p.count / 2,
        stride = Array.from({ length: half }, (_, i) => i).find(
          (i) => uv.getY(i) > 0,
        )!,
        sideIndices = (stride - 1) * (half / stride - 1) * 6;
      try {
        for (const normals of [
          geometry.getAttribute("normal"),
          geometry.morphAttributes.normal![0],
        ])
          for (let i = 0; i < normals.count; i++)
            assert.ok(
              Math.abs(
                Math.hypot(normals.getX(i), normals.getY(i), normals.getZ(i)) -
                  1,
              ) < 0.002,
            );
        const edges = new Map<string, number>();
        for (let i = 0; i < index.count; i += 3)
          for (let j = 0; j < 3; j++) {
            const x = index.getX(i + j),
              y = index.getX(i + ((j + 1) % 3)),
              key = x < y ? `${x}:${y}` : `${y}:${x}`;
            edges.set(key, (edges.get(key) ?? 0) + 1);
          }
        assert.ok([...edges.values()].every((count) => count === 2));
        for (const bloom of [0, 0.1, 0.25, 0.5, 0.75, 0.9, 1]) {
          const vertex = (i: number, target: Vector3) =>
            target.set(
              p.getX(i) * bloom + f.getX(i) * (1 - bloom),
              p.getY(i) * bloom + f.getY(i) * (1 - bloom),
              p.getZ(i) * bloom + f.getZ(i) * (1 - bloom),
            );
          for (let i = 0; i < half; i++)
            assert.ok(
              vertex(i, a).distanceTo(vertex(i + half, b)) >
                surface.thickness * 0.45,
              `${quality}/${surface.cluster}/${bloom}: positive interpolated skin thickness`,
            );
          let volume = 0;
          for (let i = 0; i < index.count; i += 3) {
            vertex(index.getX(i), triangle.a);
            vertex(index.getX(i + 1), triangle.b);
            vertex(index.getX(i + 2), triangle.c);
            assert.ok(
              triangle.getArea() > 5e-13,
              `${quality}/${surface.cluster}/${bloom}: nondegenerate triangle`,
            );
            volume +=
              triangle.a.dot(normal.crossVectors(triangle.b, triangle.c)) / 6;
            if (i < sideIndices) {
              vertex(index.getX(i + sideIndices), opposite.a);
              vertex(index.getX(i + sideIndices + 1), opposite.b);
              vertex(index.getX(i + sideIndices + 2), opposite.c);
              assert.ok(
                triangle.getNormal(normal).dot(opposite.getNormal(backNormal)) <
                  0,
                `${quality}/${surface.cluster}/${bloom}: skin orientation`,
              );
            }
          }
          assert.ok(
            volume > 1e-7,
            `${quality}/${surface.cluster}/${bloom}: signed volume ${volume}`,
          );
        }
      } finally {
        geometry.dispose();
      }
    }
  for (const constrained of [false, true]) {
    const { patches } = specimenCages(IMPATIENS_MODEL, constrained);
    assert.equal(
      patches.reduce((sum, patch) => sum + patch.open.length / 3, 0),
      constrained ? 350 : 690,
    );
  }
});

test("impatiens: real paired-limb root caps overlap retained throat tissue in every quality and bloom", () => {
  const material = new MeshBasicMaterial({ side: DoubleSide }),
    ray = new Raycaster(),
    direction = new Vector3(0.341, 0.729, 0.594).normalize(),
    start = new Vector3(),
    end = new Vector3(),
    delta = new Vector3();
  try {
    for (const quality of allQualities)
      for (
        let cluster = 0;
        cluster < IMPATIENS_MODEL.clusters.length;
        cluster++
      ) {
        const parts = [false, true].flatMap((included) =>
            specimenOrganParts(IMPATIENS_MODEL, cluster, quality, included).map(
              (part) => ({ ...part, included }),
            ),
          ),
          carrier = specimenOrganCarrier(IMPATIENS_MODEL, cluster),
          retained = IMPATIENS_MODEL.surfaces.filter(
            (s) =>
              s.cluster === cluster &&
              s.name !== "joined deeply bilobed lateral pair",
          ),
          insertion = [
            ...parts.map(({ geometry, included }) => ({
              mesh: new Mesh(geometry, material),
              included,
              delay: carrier.delay,
              phase: carrier.phase,
            })),
            ...retained.map((surface) => ({
              mesh: new Mesh(specimenGeometry(surface, quality), material),
              included: true,
              delay: surface.delay ?? 0,
              phase: IMPATIENS_MODEL.surfaces.indexOf(surface) * 0.31,
            })),
          ],
          limbs = pairedLimbs
            .filter((s) => s.cluster === cluster)
            .map((surface) => ({
              surface,
              mesh: new Mesh(specimenGeometry(surface, quality), material),
            }));
        try {
          for (const bloom of [0, 0.1, 0.25, 0.5, 0.75, 0.9, 1]) {
            for (const { mesh, included, delay, phase } of insertion)
              if (included && mesh.morphTargetInfluences?.length)
                mesh.morphTargetInfluences[0] =
                  1 - petalOpenness(bloom, delay, phase);
            for (const { surface, mesh } of limbs) {
              mesh.morphTargetInfluences![0] =
                1 -
                petalOpenness(
                  bloom,
                  surface.delay ?? 0,
                  IMPATIENS_MODEL.surfaces.indexOf(surface) * 0.31,
                );
              const index = mesh.geometry.index!,
                uv = mesh.geometry.getAttribute("uv");
              let intersects = false;
              for (let i = 0; i < index.count && !intersects; i += 3) {
                const ids = [
                  index.getX(i),
                  index.getX(i + 1),
                  index.getX(i + 2),
                ];
                if (ids.some((j) => uv.getY(j) !== 0)) continue;
                for (let j = 0; j < 3 && !intersects; j++) {
                  mesh.getVertexPosition(ids[j], start);
                  mesh.getVertexPosition(ids[(j + 1) % 3], end);
                  delta.copy(end).sub(start);
                  ray.set(start, delta.clone().normalize());
                  ray.near = 1e-9;
                  ray.far = delta.length();
                  intersects =
                    ray.intersectObjects(
                      insertion.map(({ mesh: target }) => target),
                    ).length > 0;
                  for (const { mesh: target } of insertion) {
                    ray.set(start, direction);
                    ray.near = 1e-8;
                    ray.far = 2;
                    const hits = ray.intersectObject(target),
                      unique = hits.filter(
                        (hit, n) =>
                          !n ||
                          Math.abs(hit.distance - hits[n - 1].distance) > 1e-7,
                      );
                    if (unique.length % 2) intersects = true;
                  }
                }
              }
              assert.ok(
                intersects,
                `${quality}/cluster${cluster}/bloom${bloom}: actual lateral root cap must overlap retained throat tissue`,
              );
            }
          }
        } finally {
          insertion.forEach(({ mesh }) => mesh.geometry.dispose());
          limbs.forEach(({ mesh }) => mesh.geometry.dispose());
        }
      }
  } finally {
    material.dispose();
  }
});

for (const quality of ["overview", "low", "medium", "high", "ultra"] as const)
  test(`impatiens: the ${quality} dorsal petal rises above its spurred lower sepal after assembly`, () => {
    const parent = new Object3D(),
      carrier = new Object3D(),
      poses = createSurfaceBatchPoses(IMPATIENS_MODEL.clusters),
      scratchMatrix = new Matrix4();
    parent.position.set(-0.31, 0.24, 0.18);
    parent.rotation.set(0.17, 0.43, -0.11);
    parent.scale.set(1.1, 0.91, 1.17);
    parent.updateMatrix();
    const up = new Vector3(0, 1, 0).transformDirection(parent.matrix);
    try {
      for (let cluster = 0; cluster < 3; cluster++) {
        const parts = [
          "dorsal crested petal",
          "boat sepal and continuous hollow spur",
        ].map((name) => {
          const index = IMPATIENS_MODEL.surfaces.findIndex(
            (surface) => surface.cluster === cluster && surface.name === name,
          );
          assert.ok(index >= 0);
          const surface = IMPATIENS_MODEL.surfaces[index];
          return {
            surface,
            index,
            geometry:
              quality === "overview"
                ? createSurfaceBatch(
                    [{ surface, index }],
                    IMPATIENS_MODEL.clusters,
                  )
                : specimenGeometry(surface, quality),
          };
        });
        const pose = IMPATIENS_MODEL.clusters[cluster];
        carrier.position.set(...pose.position);
        carrier.rotation.set(...pose.rotation);
        carrier.scale.setScalar(pose.scale);
        carrier.updateMatrix();
        const world = new Matrix4().multiplyMatrices(
            parent.matrix,
            carrier.matrix,
          ),
          uniforms: SurfaceBatchUniforms = {
            uBatchBloom: { value: 1 },
            uBatchPressure: { value: 0 },
            uBatchPoses: { value: poses.texture },
            uBatchPoseRows: { value: IMPATIENS_MODEL.clusters.length },
            uBatchHinge: { value: 0 },
          };
        try {
          for (const bloom of [0.5, 1]) {
            uniforms.uBatchBloom.value = bloom;
            const centroid = (
              part: (typeof parts)[number],
              select: (u: number, v: number) => boolean,
            ) => {
              const { geometry, surface, index } = part,
                uv = geometry.getAttribute("uv"),
                position = geometry.getAttribute("position"),
                folded = geometry.morphAttributes.position?.[0],
                open = petalOpenness(bloom, surface.delay ?? 0, index * 0.31),
                mean = new Vector3(),
                point = new Vector3();
              let count = 0;
              // Average both real shell faces, so thickness cannot fake orientation.
              for (let vertex = 0; vertex < position.count; vertex++) {
                if (!select(uv.getX(vertex), uv.getY(vertex))) continue;
                if (quality === "overview") {
                  surfaceBatchVertex(
                    geometry,
                    vertex,
                    uniforms,
                    point,
                    scratchMatrix,
                  ).applyMatrix4(parent.matrix);
                } else {
                  point.fromBufferAttribute(position, vertex);
                  point.lerp(
                    new Vector3().fromBufferAttribute(folded!, vertex),
                    1 - open,
                  );
                  point.applyMatrix4(world);
                }
                mean.add(point);
                count++;
              }
              assert.ok(count > 0);
              return mean.divideScalar(count);
            };
            const dorsal = centroid(
                parts[0],
                (u, v) => u >= 0.25 && u <= 0.75 && v >= 0.6,
              ),
              mouth = centroid(parts[1], (_u, v) => v === 0),
              tip = centroid(parts[1], (_u, v) => v === 1),
              height = dorsal.clone().sub(mouth).dot(up);
            assert.ok(
              height > 0.1,
              `cluster ${cluster}, bloom ${bloom}: dorsal height ${height} must be above the lower sepal`,
            );
            assert.ok(
              tip.sub(mouth).dot(up) < -0.12,
              "the existing long spur remains below its mouth after assembly",
            );
          }
          // Correcting the dorsal direction must retain the authored insertion.
          for (const bloom of [0, 0.5, 1])
            assert.deepEqual(
              parts[0].surface.sample(0.5, 0, bloom),
              [0, 0.16, 0.035],
            );
        } finally {
          parts.forEach(({ geometry }) => geometry.dispose());
        }
      }
    } finally {
      poses.texture.dispose();
    }
  });

test("impatiens: a pulse preserves each joined lateral pair insertion in the actual overview vertex path", () => {
  const poses = createSurfaceBatchPoses(IMPATIENS_MODEL.clusters),
    matrix = new Matrix4();
  try {
    for (const group of surfaceBatchGroups(IMPATIENS_MODEL))
      for (const entry of group.entries.filter(
        (e) => e.surface.name === "joined deeply bilobed lateral pair",
      )) {
        const geometry = createSurfaceBatch([entry], IMPATIENS_MODEL.clusters),
          uniforms: SurfaceBatchUniforms = {
            uBatchBloom: { value: 1 },
            uBatchPressure: { value: 0 },
            uBatchPoses: { value: poses.texture },
            uBatchPoseRows: { value: IMPATIENS_MODEL.clusters.length },
            uBatchHinge: {
              value: group.role === "wing" || group.role === "keel" ? 1 : 0,
            },
          };
        try {
          assert.ok(
            entry.surface.flexible,
            "the lateral pair still has a pinned contact cage",
          );
          for (const bloom of [0, 0.5, 1]) {
            uniforms.uBatchBloom.value = bloom;
            writeSurfaceBatchPose(poses, entry.surface.cluster, matrix, 0);
            const resting = surfaceBatchVertex(
              geometry,
              0,
              uniforms,
              new Vector3(),
              matrix,
            );
            writeSurfaceBatchPose(poses, entry.surface.cluster, matrix, 0.3);
            const pulsed = surfaceBatchVertex(
              geometry,
              0,
              uniforms,
              new Vector3(),
              matrix,
            );
            assert.ok(
              resting.distanceTo(pulsed) < 1e-9,
              `cluster ${entry.surface.cluster}, bloom ${bloom}: lateral root moved under pulse`,
            );
          }
        } finally {
          geometry.dispose();
        }
      }
  } finally {
    poses.texture.dispose();
  }
});

verifySpecimen("impatiens", IMPATIENS_MODEL);
verifySpecimen("impatiens foliage", {
  clusters: [{ position: [0, 0, 0], rotation: [0, 0, 0], scale: 1, nod: 0 }],
  surfaces: [IMPATIENS_LEAF],
  organs: [],
});
test("impatiens: toothed simple leaf preserves a continuous midrib", () => {
  const widths = [0.4, 0.45, 0.5].map((v) => IMPATIENS_LEAF.sample(1, v, 1)[0]);
  assert.ok(Math.max(...widths) - Math.min(...widths) > 0.01);
  for (const v of [0, 0.25, 0.5, 0.75, 1])
    assert.ok(Math.abs(IMPATIENS_LEAF.sample(0.5, v, 1)[0]) < 1e-10);
});
test("impatiens: joined lateral pairs and sepal spur retain the bilateral flower", () => {
  assert.equal(IMPATIENS_MODEL.clusters.length, 5);
  for (let c = 0; c < 5; c++) {
    const surfaces = IMPATIENS_MODEL.surfaces.filter((s) => s.cluster === c);
    assert.equal(
      surfaces.filter((s) => s.name === "dorsal crested petal").length,
      1,
    );
    assert.equal(
      surfaces.filter((s) => s.name === "joined deeply bilobed lateral pair")
        .length,
      2,
    );
    assert.equal(
      surfaces.filter((s) => s.name === "boat sepal and continuous hollow spur")
        .length,
      1,
    );
    assert.equal(
      surfaces.filter((s) => s.name === "small lateral sepal").length,
      2,
    );
    const organs = IMPATIENS_MODEL.organs.filter((o) => o.cluster === c);
    assert.equal(
      organs.filter((o) => o.name === "connate anther cap segment").length,
      5,
    );
    assert.equal(organs.filter((o) => o.name === "superior ovary").length, 1);
    assert.ok(
      organs
        .filter((o) => o.name === "connate anther cap segment")
        .every((o) => Math.max(...o.points.map((p) => p[1])) < 0.24),
    );
    for (const pair of surfaces.filter(
      (s) => s.name === "joined deeply bilobed lateral pair",
    )) {
      const notch = pair.sample(0.5, 1, 1),
        upper = pair.sample(0.15, 1, 1),
        lower = pair.sample(0.85, 1, 1);
      assert.ok(Math.abs(notch[0]) < Math.abs(upper[0]) * 0.78);
      assert.ok(upper[2] * lower[2] < 0);
      assert.ok(pair.sample(0.5, 0.15, 1).every(Number.isFinite));
    }
  }
});
test("impatiens: hollow sepal lumen extends into a long recurved spur", () => {
  const mouth = impatiensSpurredSepal(0, 0, 1),
    back = impatiensSpurredSepal(0, 0.7, 1),
    tip = impatiensSpurredSepal(0, 1, 1);
  assert.ok(mouth[0] > 0.1);
  assert.ok(tip[1] < -0.6);
  assert.ok(back[2] < -0.12);
  assert.ok(tip[2] > back[2]);
  const stalks = IMPATIENS_STALKS.filter(
    (s) => s.name === "axillary flower pedicel",
  );
  assert.equal(stalks.length, 5);
  stalks.forEach((s, i) =>
    assert.deepEqual(s.points.at(-1), IMPATIENS_MODEL.clusters[i].position),
  );
});

test("impatiens is complete throughout the typed botanical catalog", async () => {
  const { FLOWER_TYPES } = await import("../lib/flowers/types"),
    { getFlower } = await import("../lib/flowers/catalog"),
    { FLOWER_STRUCTURES } = await import("../lib/flowers/structures"),
    { WIND_PROFILES } = await import("../lib/flowers/wind");
  const type = FLOWER_TYPES.find((t) => String(t) === "impatiens");
  assert.ok(type, "impatiens catalog integration is missing");
  assert.equal(getFlower(type).latin, "Impatiens walleriana");
  assert.equal(FLOWER_STRUCTURES[type].layers.length, 0);
  assert.equal(FLOWER_STRUCTURES[type].simulatedSurfaces, true);
  assert.equal(FLOWER_STRUCTURES[type].airbornePollen, false);
  assert.ok(WIND_PROFILES[type].compliance > 0);
});
