import test from "node:test";
import assert from "node:assert/strict";
import {
  DoubleSide,
  Mesh,
  MeshBasicMaterial,
  Raycaster,
  Vector3,
  type BufferGeometry,
} from "three";
import {
  TORENIA_MODEL,
  toreniaCorolla,
} from "../components/flowers/torenia/toreniaGeometry";
import {
  specimenGeometry,
  specimenOrganParts,
} from "../lib/three/specimenModel";

const corolla = TORENIA_MODEL.surfaces.find(
  (surface) => surface.cluster === 0 && surface.role === "tube",
)!;

function posedMesh(
  geometry: BufferGeometry,
  material: MeshBasicMaterial,
  open: number,
) {
  const mesh = new Mesh(geometry, material);
  mesh.updateMorphTargets();
  if (mesh.morphTargetInfluences) mesh.morphTargetInfluences[0] = 1 - open;
  mesh.updateMatrixWorld(true);
  return mesh;
}

function assertEnclosedTissue(
  wall: Mesh,
  geometry: BufferGeometry,
  material: MeshBasicMaterial,
  open: number,
  name: string,
  minimumZ: number,
) {
  const mesh = posedMesh(geometry, material, open),
    count = geometry.getAttribute("position").count,
    stride = Math.max(1, Math.floor(count / 24)),
    probes = new Set([0, count - 1]),
    ray = new Raycaster(),
    point = new Vector3(),
    direction = new Vector3();
  for (let i = 0; i < count; i += stride) probes.add(i);
  let checked = 0,
    worst = -Infinity,
    worstPoint = "";
  for (const i of probes) {
    mesh.getVertexPosition(i, point);
    // Only basal insertions are exempt; the frontmost tip remains in the probe set.
    if (point.z < minimumZ) continue;
    direction.set(point.x, point.y, 0);
    const radius = direction.length();
    if (radius < 0.00001) continue;
    ray.set(new Vector3(0, 0, point.z), direction.normalize());
    const hits = ray.intersectObject(wall, false);
    assert.ok(
      hits.length,
      `${name} has no enclosing wall at ${point.toArray()}`,
    );
    const excess = radius - hits.at(-1)!.distance;
    if (excess > worst) {
      worst = excess;
      worstPoint = point.toArray().join(", ");
    }
    checked++;
  }
  assert.ok(checked > 0, `${name} has no sampled included tissue`);
  assert.ok(
    worst <= 0.0015,
    `${name} at ${worstPoint} pierces the outer wall by ${worst.toFixed(5)}`,
  );
}

test("torenia: the open fused limb has one wall thickness without overlaid lip shells", () => {
  const material = new MeshBasicMaterial({ side: DoubleSide }),
    meshes = TORENIA_MODEL.surfaces
      .filter(
        (surface) =>
          surface.cluster === 0 &&
          (surface.role === "tube" ||
            (surface.role === "petal" && surface.tissue !== "inner")),
      )
      .map((surface) =>
        posedMesh(specimenGeometry(surface, "high"), material, 1),
      ),
    ray = new Raycaster(),
    direction = new Vector3();
  try {
    // Avoid exact grid seams: an edge-coincident ray can miss one shared face.
    for (const u of [0.181, 0.251, 0.601, 0.751, 0.901])
      for (const v of [0.9, 0.96]) {
        const [x, y, z] = toreniaCorolla(u, v, 1);
        direction.set(x, y, 0).normalize();
        ray.set(new Vector3(0, 0, z), direction);
        const crossings: number[] = [];
        for (const hit of ray.intersectObjects(meshes, false))
          if (
            !crossings.length ||
            Math.abs(hit.distance - crossings.at(-1)!) > 0.00001
          )
            crossings.push(hit.distance);
        assert.equal(
          crossings.length,
          2,
          `limb cross-section at u=${u}, v=${v} crosses ${crossings.length} faces: ${crossings.join(", ")}`,
        );
      }
  } finally {
    meshes.forEach((mesh) => mesh.geometry.dispose());
    material.dispose();
  }
});

for (const kind of ["filament", "anther"])
  for (const open of [0.5, 1])
    test(`torenia: actual ${kind} tissue stays beneath the roof at ${open} bloom`, () => {
      const material = new MeshBasicMaterial({ side: DoubleSide }),
        wall = posedMesh(specimenGeometry(corolla, "high"), material, open),
        allParts = specimenOrganParts(TORENIA_MODEL, 0, "high", true),
        parts = allParts.filter(({ organ }) => organ.name.includes(kind));
      try {
        assert.ok(parts.length > 0, "generated reproductive tissue is missing");
        for (const { organ, geometry } of parts)
          assertEnclosedTissue(wall, geometry, material, open, organ.name, 0.2);
      } finally {
        wall.geometry.dispose();
        allParts.forEach(({ geometry }) => geometry.dispose());
        material.dispose();
      }
    });

for (const { cluster, open, label } of [
  { cluster: 0, open: 0, label: "closed flowering bud" },
  { cluster: 3, open: 1, label: "persistent young bud" },
])
  for (const kind of ["filament", "anther", "style", "stigma"])
    test(`torenia: ${label} encloses its actual ${kind} tissue`, () => {
      const material = new MeshBasicMaterial({ side: DoubleSide }),
        surface = TORENIA_MODEL.surfaces.find(
          (part) => part.cluster === cluster && part.role === "tube",
        )!,
        wall = posedMesh(specimenGeometry(surface, "high"), material, open),
        allParts = specimenOrganParts(TORENIA_MODEL, cluster, "high", true),
        tissue =
          kind === "stigma"
            ? TORENIA_MODEL.surfaces
                .filter(
                  (part) => part.cluster === cluster && part.tissue === "inner",
                )
                .map((part) => ({
                  name: part.name,
                  geometry: specimenGeometry(part, "high"),
                }))
            : allParts
                .filter(({ organ }) => organ.name.includes(kind))
                .map(({ organ, geometry }) => ({ name: organ.name, geometry }));
      try {
        assert.ok(tissue.length > 0, `${label} has no ${kind} tissue`);
        for (const { name, geometry } of tissue)
          assertEnclosedTissue(wall, geometry, material, open, name, 0.12);
      } finally {
        wall.geometry.dispose();
        allParts.forEach(({ geometry }) => geometry.dispose());
        if (kind === "stigma")
          tissue.forEach(({ geometry }) => geometry.dispose());
        material.dispose();
      }
    });

test("torenia: generated anther endpoints remain connivent in corresponding pairs", () => {
  const material = new MeshBasicMaterial(),
    point = new Vector3();
  try {
    for (const { cluster, open } of [
      { cluster: 0, open: 1 },
      { cluster: 0, open: 0 },
      { cluster: 3, open: 1 },
    ]) {
      const parts = specimenOrganParts(TORENIA_MODEL, cluster, "high", true);
      try {
        const ends = parts
            .filter(({ organ }) => organ.name.includes("anther"))
            .map(({ geometry }) => {
              const mesh = posedMesh(geometry, material, open);
              const count = geometry.getAttribute("position").count;
              mesh.getVertexPosition(count - 2, point);
              const root = point.clone();
              mesh.getVertexPosition(count - 1, point);
              return { root, tip: point.clone() };
            }),
          left = ends.filter((end) => end.root.x < 0),
          right = ends.filter((end) => end.root.x > 0);
        assert.equal(
          left.length,
          4,
          "each stamen pair needs two left anther chambers",
        );
        assert.equal(
          right.length,
          4,
          "each stamen pair needs two right anther chambers",
        );
        for (const { tip } of left) {
          const partner = right.find(
            (candidate) =>
              Math.abs(candidate.tip.y - tip.y) < 0.001 &&
              Math.abs(candidate.tip.z - tip.z) < 0.001,
          );
          assert.ok(
            partner,
            `anther chamber at ${tip.toArray()} has no opposite partner`,
          );
          assert.ok(
            tip.distanceTo(partner.tip) < 0.015,
            "paired anthers must meet beneath the roof",
          );
        }
      } finally {
        parts.forEach(({ geometry }) => geometry.dispose());
      }
    }
  } finally {
    material.dispose();
  }
});

for (const quality of ["low", "medium"] as const)
  test(`torenia: ${quality} corolla buffers retain rounded lobes without angular silhouette cuts`, () => {
    const geometry = specimenGeometry(corolla, quality),
      position = geometry.getAttribute("position"),
      uv = geometry.getAttribute("uv"),
      half = position.count / 2,
      rim: { u: number; point: Vector3 }[] = [];
    try {
      for (let i = 0; i < half; i++)
        if (uv.getY(i) === 1)
          rim.push({
            u: uv.getX(i),
            point: new Vector3(
              (position.getX(i) + position.getX(i + half)) / 2,
              (position.getY(i) + position.getY(i + half)) / 2,
              (position.getZ(i) + position.getZ(i + half)) / 2,
            ),
          });
      rim.sort((a, b) => a.u - b.u);
      assert.ok(rim.length > 2, "the generated rim is missing");
      let worst = 0;
      const interpolated = new Vector3();
      for (let i = 0; i < rim.length; i++) {
        const a = rim[i],
          b = rim[(i + 1) % rim.length],
          nextU = b.u + (i === rim.length - 1 ? 1 : 0);
        for (let step = 1; step < 12; step++) {
          const fraction = step / 12,
            u = a.u + (nextU - a.u) * fraction,
            expected = new Vector3(...toreniaCorolla(u, 1, 1));
          interpolated.lerpVectors(a.point, b.point, fraction);
          worst = Math.max(worst, interpolated.distanceTo(expected));
        }
      }
      assert.ok(
        worst < 0.014,
        `${quality} rim cuts ${worst.toFixed(5)} from its rounded lobe profile`,
      );
    } finally {
      geometry.dispose();
    }
  });

test("torenia: the mature upper lip opens into a broad bilateral fan", () => {
  for (const angle of [0.32, Math.PI - 0.32]) {
    const [x] = toreniaCorolla(angle / (Math.PI * 2), 1, 1);
    assert.ok(
      Math.abs(x) > 0.23,
      `the upper-lip shoulder is too narrow at ${angle}: x=${x.toFixed(5)}`,
    );
  }
});

test("torenia: the lower landing tongue projects forward beyond the upper roof", () => {
  const upper = toreniaCorolla(0.25, 1, 1),
    lower = toreniaCorolla(0.75, 1, 1);
  assert.ok(
    lower[2] > upper[2] + 0.08,
    `the lower tongue projects only ${(lower[2] - upper[2]).toFixed(5)} beyond the roof`,
  );
});
