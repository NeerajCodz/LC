import test from "node:test";
import assert from "node:assert/strict";
import {
  HOYA_MODEL,
  HOYA_STALKS,
} from "../components/flowers/hoya/hoyaGeometry";
import { verifySpecimen } from "./specimen-checks";
import { HOYA_LEAF } from "../components/flowers/hoya/hoyaLeaf";

test("hoya is complete throughout the typed botanical catalog", async () => {
  const { FLOWER_TYPES } = await import("../lib/flowers/types"),
    { getFlower } = await import("../lib/flowers/catalog"),
    { FLOWER_STRUCTURES } = await import("../lib/flowers/structures"),
    { WIND_PROFILES } = await import("../lib/flowers/wind");
  const type = FLOWER_TYPES.find((t) => String(t) === "hoya");
  assert.ok(type, "Hoya catalog integration is missing");
  assert.equal(getFlower(type).latin, "Hoya carnosa");
  assert.equal(FLOWER_STRUCTURES[type].layers.length, 0);
  assert.equal(FLOWER_STRUCTURES[type].simulatedSurfaces, true);
  assert.equal(FLOWER_STRUCTURES[type].airbornePollen, false);
  assert.ok(FLOWER_STRUCTURES[type].supportHeight! > 0);
  assert.ok(WIND_PROFILES[type].compliance > 0);
});
import {
  specimenGeometry,
  specimenOrganParts,
  specimenOrganCarrier,
} from "../lib/three/specimenModel";
import { petalOpenness } from "../lib/three/easing";
import {
  DoubleSide,
  Mesh,
  MeshBasicMaterial,
  Raycaster,
  Triangle,
  Vector3,
} from "three";

test("hoya: actual folded corolla tissue closes the apex instead of leaving a circular mouth", () => {
  const material = new MeshBasicMaterial({ side: DoubleSide });
  try {
    for (const quality of ["overview", "low", "high"] as const)
      for (const cluster of [0, 19]) {
        const entries = HOYA_MODEL.surfaces.flatMap((surface, index) =>
          surface.cluster === cluster && surface.role === "tube"
            ? [{ surface, index }]
            : [],
        );
        const meshes = entries.map(({ surface }) => {
          const mesh = new Mesh(specimenGeometry(surface, quality), material);
          mesh.updateMorphTargets();
          mesh.updateMatrixWorld(true);
          return mesh;
        });
        try {
          // Persistent young buds must stay enclosed even at the full UI setting.
          for (const bloom of cluster >= 19 ? [0, 0.5, 1] : [0]) {
            meshes.forEach((mesh, i) => {
              const { surface, index } = entries[i];
              mesh.morphTargetInfluences![0] =
                1 - petalOpenness(bloom, surface.delay ?? 0, index * 0.31);
            });
            for (const radius of [0, 0.012, 0.025, 0.04])
              for (let azimuth = 0; azimuth < 20; azimuth++) {
                const angle = (azimuth * Math.PI * 2) / 20,
                  ray = new Raycaster(
                    new Vector3(
                      radius * Math.cos(angle),
                      0.4,
                      radius * Math.sin(angle),
                    ),
                    new Vector3(0, -1, 0),
                    0,
                    0.11,
                  );
                assert.ok(
                  ray.intersectObjects(meshes).length > 0,
                  `${quality} cluster ${cluster}, bloom ${bloom}: open apex at radius ${radius}, azimuth ${azimuth}`,
                );
              }
          }
        } finally {
          meshes.forEach((mesh) => mesh.geometry.dispose());
        }
      }
  } finally {
    material.dispose();
  }
});

test("hoya: valvate lobe roots remain in the actual basal cup through bloom and quality changes", () => {
  const material = new MeshBasicMaterial({ side: DoubleSide }),
    triangle = new Triangle(),
    point = new Vector3(),
    back = new Vector3(),
    closest = new Vector3(),
    direction = new Vector3(0.341, 0.729, 0.594).normalize();
  try {
    for (const quality of ["overview", "low", "high"] as const)
      for (const cluster of [0, 19]) {
        const entries = HOYA_MODEL.surfaces.flatMap((surface, index) =>
          surface.cluster === cluster && surface.role === "tube"
            ? [{ surface, index }]
            : [],
        );
        const meshes = entries.map(
          ({ surface }) =>
            new Mesh(specimenGeometry(surface, quality), material),
        );
        try {
          assert.equal(
            meshes.length,
            6,
            "one short fused cup and its five complete valvate lobes",
          );
          const corolla = meshes[0],
            indices = corolla.geometry.index!;
          for (const bloom of [0, 0.5, 1]) {
            meshes.forEach((mesh, i) => {
              const { surface, index } = entries[i];
              mesh.morphTargetInfluences![0] =
                1 - petalOpenness(bloom, surface.delay ?? 0, index * 0.31);
            });
            for (const mesh of meshes.slice(1)) {
              const uv = mesh.geometry.getAttribute("uv"),
                half = uv.count / 2;
              for (let i = 0; i < half && uv.getY(i) === 0; i++) {
                mesh.getVertexPosition(i, point);
                mesh.getVertexPosition(i + half, back);
                point.add(back).multiplyScalar(0.5);
                let distance = Infinity;
                for (let j = 0; j < indices.count; j += 3) {
                  corolla.getVertexPosition(indices.getX(j), triangle.a);
                  corolla.getVertexPosition(indices.getX(j + 1), triangle.b);
                  corolla.getVertexPosition(indices.getX(j + 2), triangle.c);
                  triangle.closestPointToPoint(point, closest);
                  distance = Math.min(distance, closest.distanceTo(point));
                }
                const hits = new Raycaster(
                    point,
                    direction,
                    1e-8,
                    10,
                  ).intersectObject(corolla),
                  unique = hits.filter(
                    (hit, j) =>
                      !j ||
                      Math.abs(hit.distance - hits[j - 1].distance) > 1e-6,
                  ),
                  inside = unique.length % 2 === 1;
                assert.ok(
                  inside || distance <= 0.007 + 1e-7,
                  `${quality} cluster ${cluster} bloom ${bloom}: detached valvate lobe root ${distance}`,
                );
              }
              const index = mesh.geometry.index!;
              for (let j = 0; j < index.count; j += 3) {
                mesh.getVertexPosition(index.getX(j), triangle.a);
                mesh.getVertexPosition(index.getX(j + 1), triangle.b);
                mesh.getVertexPosition(index.getX(j + 2), triangle.c);
                assert.ok(
                  triangle.getArea() > 5e-13,
                  `${quality} bloom ${bloom}: degenerate corolla lobe triangle`,
                );
              }
              for (const normal of [
                mesh.geometry.getAttribute("normal"),
                mesh.geometry.morphAttributes.normal![0],
              ])
                for (let i = 0; i < normal.count; i++)
                  assert.ok(
                    Math.abs(
                      Math.hypot(
                        normal.getX(i),
                        normal.getY(i),
                        normal.getZ(i),
                      ) - 1,
                    ) < 0.002,
                  );
            }
          }
        } finally {
          meshes.forEach((mesh) => mesh.geometry.dispose());
        }
      }
  } finally {
    material.dispose();
  }
});

test("hoya: all ten anatomical pollinia survive the actual renderer partition at overview and low quality", () => {
  for (const quality of ["overview", "low"] as const)
    for (let cluster = 0; cluster < HOYA_MODEL.clusters.length; cluster++) {
      const parts = [
        ...specimenOrganParts(HOYA_MODEL, cluster, quality, true),
        ...specimenOrganParts(HOYA_MODEL, cluster, quality, false),
      ];
      try {
        assert.equal(
          parts.filter((p) => p.organ.name === "paired pollinium").length,
          10,
          `${quality} cluster ${cluster}`,
        );
      } finally {
        parts.forEach((p) => p.geometry.dispose());
      }
    }
});

test("hoya: actual pollinium and gynostegium cap coordinates follow the enclosing corolla through reverse bloom", () => {
  for (const quality of ["overview", "low"] as const)
    for (let cluster = 0; cluster < HOYA_MODEL.clusters.length; cluster++) {
      const parts = specimenOrganParts(HOYA_MODEL, cluster, quality, true),
        carrier = specimenOrganCarrier(HOYA_MODEL, cluster),
        reproductive = parts.filter((p) =>
          /pollinium|gynostegium/.test(p.organ.name),
        );
      try {
        assert.equal(reproductive.length, 11);
        for (const part of reproductive) {
          const position = part.geometry.getAttribute("position"),
            folded = part.geometry.morphAttributes.position![0],
            index = position.count - 1;
          assert.equal(
            part.geometry.morphAttributes.normal![0].count,
            position.count,
          );
          for (const bloom of [1, 0.5, 0, 0.5, 1]) {
            const open = petalOpenness(bloom, carrier.delay, carrier.phase),
              actual = new Vector3()
                .fromBufferAttribute(position, index)
                .lerp(
                  new Vector3().fromBufferAttribute(folded, index),
                  1 - open,
                ),
              fullTip = part.organ.points.at(-1)!,
              budTip = part.organ.foldedPoints!.at(-1)!,
              expected = new Vector3(...budTip).lerp(
                new Vector3(...fullTip),
                open,
              );
            assert.ok(
              actual.distanceTo(expected) < 1e-7,
              `${part.organ.name}: ${quality} bloom ${bloom}`,
            );
          }
        }
      } finally {
        parts.forEach((p) => p.geometry.dispose());
      }
    }
});

verifySpecimen("hoya", HOYA_MODEL);
verifySpecimen("hoya foliage", {
  clusters: [{ position: [0, 0, 0], rotation: [0, 0, 0], scale: 1, nod: 0 }],
  surfaces: [HOYA_LEAF],
  organs: [],
});
test("hoya: fleshy entire leaf has a broad center and finite tapered insertion", () => {
  const base = HOYA_LEAF.sample(1, 0, 1),
    center = HOYA_LEAF.sample(1, 0.5, 1),
    tip = HOYA_LEAF.sample(1, 1, 1);
  assert.ok(center[0] > 0.2);
  assert.ok(base[0] < 0.02 && tip[0] < 0.02);
  assert.ok(HOYA_LEAF.thickness >= 0.02);
});

test("hoya: complete five-part corollas and coronas surround enclosed gynostegia", () => {
  assert.equal(HOYA_MODEL.clusters.length, 22);
  for (let c = 0; c < 22; c++) {
    const surfaces = HOYA_MODEL.surfaces.filter((s) => s.cluster === c);
    assert.equal(
      surfaces.filter((s) => s.name === "papillose five-lobed corolla").length,
      1,
    );
    assert.equal(
      surfaces.filter((s) => s.name === "valvate corolla lobe").length,
      5,
    );
    assert.equal(
      surfaces.filter((s) => s.name === "ridged waxy corona limb").length,
      5,
    );
    assert.equal(
      surfaces.filter((s) => s.name === "small calyx lobe").length,
      5,
    );
    const organs = HOYA_MODEL.organs.filter((o) => o.cluster === c);
    assert.equal(
      organs.filter((o) => o.name === "paired pollinium").length,
      10,
    );
    assert.equal(organs.filter((o) => o.name === "gynostegium").length, 1);
    assert.equal(
      organs.filter((o) => o.name === "appressed anther membrane").length,
      5,
    );
    for (const o of organs)
      for (const p of o.points) assert.ok(Math.hypot(p[0], p[2]) < 0.16);
  }
});

test("hoya: five genuine limb peaks persist and all pedicels converge at one umbel", () => {
  for (let i = 0; i < 5; i++) {
    const lobe = HOYA_MODEL.surfaces.filter(
        (s) => s.cluster === 0 && s.name === "valvate corolla lobe",
      )[i],
      peak = lobe.sample(0.5, 1, 1),
      root = lobe.sample(0.5, 0, 1),
      expectedAngle = (i * Math.PI * 2) / 5;
    assert.ok(Math.hypot(peak[0], peak[2]) > Math.hypot(root[0], root[2]) * 5);
    assert.ok(Math.cos(Math.atan2(peak[2], peak[0]) - expectedAngle) > 0.999);
  }
  const stalks = HOYA_STALKS.filter((s) => s.name === "umbel pedicel");
  assert.equal(stalks.length, 22);
  for (let i = 0; i < stalks.length; i++) {
    assert.deepEqual(stalks[i].points[0], [0, -0.18, 0]);
    assert.deepEqual(stalks[i].points.at(-1), HOYA_MODEL.clusters[i].position);
  }
  const radii = HOYA_MODEL.clusters
    .slice(0, 19)
    .map((c) => Math.hypot(c.position[0], c.position[2]));
  assert.ok(Math.max(...radii) - Math.min(...radii) > 0.4);
  assert.ok(HOYA_MODEL.clusters.some((c) => c.position[1] > 0.1));
});

type OutlinePoint = [number, number];
function coronaOutline(points: OutlinePoint[]) {
  const cross = (a: OutlinePoint, b: OutlinePoint, c: OutlinePoint) =>
    (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);
  points.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const lower: OutlinePoint[] = [],
    upper: OutlinePoint[] = [];
  for (const point of points) {
    while (lower.length > 1 && cross(lower.at(-2)!, lower.at(-1)!, point) <= 0)
      lower.pop();
    lower.push(point);
  }
  for (let i = points.length - 1; i >= 0; i--) {
    const point = points[i];
    while (upper.length > 1 && cross(upper.at(-2)!, upper.at(-1)!, point) <= 0)
      upper.pop();
    upper.push(point);
  }
  lower.pop();
  upper.pop();
  return lower.concat(upper);
}

test("hoya: complete sealed corona outlines retain acute tips instead of inflated cushions", () => {
  for (const quality of ["overview", "low", "medium", "high", "ultra"] as const)
    for (const surface of HOYA_MODEL.surfaces.filter(
      (s) => s.cluster === 0 && s.name === "ridged waxy corona limb",
    )) {
      const geometry = specimenGeometry(surface, quality);
      try {
        const positions = geometry.getAttribute("position"),
          tip = surface.sample(0.5, 1, 1),
          angle = Math.atan2(tip[2], tip[0]),
          points: OutlinePoint[] = Array.from(
            { length: positions.count },
            (_, i) => [
              positions.getX(i) * Math.cos(angle) +
                positions.getZ(i) * Math.sin(angle),
              -positions.getX(i) * Math.sin(angle) +
                positions.getZ(i) * Math.cos(angle),
            ],
          ),
          outline = coronaOutline(points),
          min = Math.min(...points.map((point) => point[0])),
          max = Math.max(...points.map((point) => point[0])),
          length = max - min,
          width =
            Math.max(...points.map((point) => point[1])) -
            Math.min(...points.map((point) => point[1]));
        // These proportional bounds are authored interpretation of acute waxy
        // segments, tested against every real skin/cap vertex, not the midsurface.
        for (const fraction of [0.1, 0.125, 0.875, 0.9]) {
          const radial = min + length * fraction,
            intersections: number[] = [];
          for (let i = 0; i < outline.length; i++) {
            const a = outline[i],
              b = outline[(i + 1) % outline.length];
            if (
              a[0] !== b[0] &&
              radial >= Math.min(a[0], b[0]) &&
              radial <= Math.max(a[0], b[0])
            )
              intersections.push(
                a[1] + ((b[1] - a[1]) * (radial - a[0])) / (b[0] - a[0]),
              );
          }
          assert.ok(intersections.length >= 2);
          const span = Math.max(...intersections) - Math.min(...intersections),
            tipDistance = length * Math.min(fraction, 1 - fraction),
            includedAngle = 2 * Math.atan(span / (2 * tipDistance));
          assert.ok(
            includedAngle < Math.PI / 2,
            `${quality}: actual shell tip angle ${(includedAngle * 180) / Math.PI} at ${fraction} must be acute`,
          );
        }
        assert.ok(
          width / length < 0.6,
          `${quality}: complete corona width/length ${width / length} is too inflated`,
        );
        const uv = geometry.getAttribute("uv"),
          normals = geometry.getAttribute("normal"),
          half = positions.count / 2;
        const shoulder = (left: boolean) => {
          let nearest = 0,
            error = Infinity;
          for (let i = 0; i < half; i++) {
            const candidate =
              Math.abs(uv.getX(i) - (left ? 0.25 : 0.75)) +
              Math.abs(uv.getY(i) - 0.5);
            if (candidate < error) {
              nearest = i;
              error = candidate;
            }
          }
          return (
            -normals.getX(nearest) * Math.sin(angle) +
            normals.getZ(nearest) * Math.cos(angle)
          );
        };
        assert.ok(
          shoulder(true) < -0.35 && shoulder(false) > 0.35,
          `${quality}: actual ridge shoulders must face opposite sides of the median crest`,
        );
      } finally {
        geometry.dispose();
      }
    }
});

test("hoya: restrained corona tissue stays thick and oriented through adult and young morphs", () => {
  const triangle = new Triangle(),
    back = new Triangle(),
    normal = new Vector3(),
    backNormal = new Vector3(),
    frontPoint = new Vector3(),
    backPoint = new Vector3();
  for (const quality of ["overview", "low", "medium", "high", "ultra"] as const)
    for (const cluster of [0, 19]) {
      const surface = HOYA_MODEL.surfaces.find(
          (s) => s.cluster === cluster && s.name === "ridged waxy corona limb",
        )!,
        geometry = specimenGeometry(surface, quality),
        position = geometry.getAttribute("position"),
        folded = geometry.morphAttributes.position![0],
        uv = geometry.getAttribute("uv"),
        index = geometry.index!,
        half = position.count / 2,
        stride = Array.from({ length: half }, (_, i) => i).find(
          (i) => uv.getY(i) > 0,
        )!,
        sideIndices = (stride - 1) * (half / stride - 1) * 6;
      try {
        for (const attribute of [
          geometry.getAttribute("normal"),
          geometry.morphAttributes.normal![0],
        ])
          for (let i = 0; i < attribute.count; i++)
            assert.ok(
              Math.abs(
                Math.hypot(
                  attribute.getX(i),
                  attribute.getY(i),
                  attribute.getZ(i),
                ) - 1,
              ) < 1e-5,
            );
        for (const bloom of [0, 0.1, 0.25, 0.5, 0.75, 0.9, 1]) {
          const vertex = (n: number, target: Vector3) =>
            target.set(
              position.getX(n) * bloom + folded.getX(n) * (1 - bloom),
              position.getY(n) * bloom + folded.getY(n) * (1 - bloom),
              position.getZ(n) * bloom + folded.getZ(n) * (1 - bloom),
            );
          for (let i = 0; i < half; i++) {
            vertex(i, frontPoint);
            vertex(i + half, backPoint);
            assert.ok(
              frontPoint.distanceTo(backPoint) > 0.004,
              "actual skins retain finite fleshy thickness",
            );
          }
          let volume = 0;
          for (let i = 0; i < index.count; i += 3) {
            vertex(index.getX(i), triangle.a);
            vertex(index.getX(i + 1), triangle.b);
            vertex(index.getX(i + 2), triangle.c);
            assert.ok(
              triangle.getArea() > 5e-13,
              `${quality}/${cluster}/${bloom}: nondegenerate corona`,
            );
            volume +=
              triangle.a.dot(normal.crossVectors(triangle.b, triangle.c)) / 6;
            if (i < sideIndices) {
              vertex(index.getX(i + sideIndices), back.a);
              vertex(index.getX(i + sideIndices + 1), back.b);
              vertex(index.getX(i + sideIndices + 2), back.c);
              assert.ok(
                triangle.getNormal(normal).dot(back.getNormal(backNormal)) < 0,
                `${quality}/${cluster}/${bloom}: skins cannot fold through one another`,
              );
            }
          }
          assert.ok(
            volume > 1e-6,
            `${quality}/${cluster}/${bloom}: positive corona volume`,
          );
        }
      } finally {
        geometry.dispose();
      }
    }
});

test("hoya: actual corona root caps intersect their reproductive insertion at every tier and bloom", () => {
  const material = new MeshBasicMaterial({ side: DoubleSide }),
    ray = new Raycaster(),
    direction = new Vector3(0.341, 0.729, 0.594).normalize(),
    start = new Vector3(),
    end = new Vector3(),
    delta = new Vector3();
  try {
    for (const quality of [
      "overview",
      "low",
      "medium",
      "high",
      "ultra",
    ] as const)
      for (const cluster of [0, 19]) {
        const parts = specimenOrganParts(HOYA_MODEL, cluster, quality, true),
          insertion = parts
            .filter(({ organ }) =>
              /gynostegium|anther membrane/.test(organ.name),
            )
            .map(({ geometry }) => new Mesh(geometry, material)),
          carrier = specimenOrganCarrier(HOYA_MODEL, cluster),
          surfaces = HOYA_MODEL.surfaces.filter(
            (surface) =>
              surface.cluster === cluster &&
              surface.name === "ridged waxy corona limb",
          ),
          coronal = surfaces.map(
            (surface) => new Mesh(specimenGeometry(surface, quality), material),
          );
        try {
          assert.equal(insertion.length, 6);
          for (const bloom of [0, 0.5, 1]) {
            insertion.forEach((mesh) => {
              mesh.morphTargetInfluences![0] =
                1 - petalOpenness(bloom, carrier.delay, carrier.phase);
            });
            for (let lobe = 0; lobe < surfaces.length; lobe++) {
              const surface = surfaces[lobe],
                mesh = coronal[lobe],
                index = mesh.geometry.index!,
                uv = mesh.geometry.getAttribute("uv");
              mesh.morphTargetInfluences![0] =
                1 -
                petalOpenness(
                  bloom,
                  surface.delay ?? 0,
                  HOYA_MODEL.surfaces.indexOf(surface) * 0.31,
                );
              let intersects = false;
              for (
                let triangle = 0;
                triangle < index.count && !intersects;
                triangle += 3
              ) {
                const a = index.getX(triangle),
                  b = index.getX(triangle + 1),
                  c = index.getX(triangle + 2);
                if (uv.getY(a) !== 0 || uv.getY(b) !== 0 || uv.getY(c) !== 0)
                  continue;
                for (let corner = 0; corner < 3 && !intersects; corner++) {
                  mesh.getVertexPosition(
                    corner === 0 ? a : corner === 1 ? b : c,
                    start,
                  );
                  mesh.getVertexPosition(
                    corner === 0 ? b : corner === 1 ? c : a,
                    end,
                  );
                  delta.copy(end).sub(start);
                  ray.set(start, delta.clone().normalize());
                  ray.near = 1e-9;
                  ray.far = delta.length();
                  intersects = ray.intersectObjects(insertion).length > 0;
                  for (const target of insertion) {
                    ray.set(start, direction);
                    ray.near = 1e-8;
                    ray.far = 2;
                    const hits = ray.intersectObject(target),
                      unique = hits.filter(
                        (hit, i) =>
                          !i ||
                          Math.abs(hit.distance - hits[i - 1].distance) > 1e-7,
                      );
                    if (unique.length % 2) intersects = true;
                  }
                }
              }
              assert.ok(
                intersects,
                `${quality}/cluster${cluster}/bloom${bloom}/lobe${lobe}: real root cap must overlap anther or gynostegium tissue`,
              );
            }
          }
        } finally {
          parts.forEach(({ geometry }) => geometry.dispose());
          coronal.forEach((mesh) => mesh.geometry.dispose());
        }
      }
  } finally {
    material.dispose();
  }
});
