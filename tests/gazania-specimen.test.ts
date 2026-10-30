import test from "node:test";
import assert from "node:assert/strict";
import {
  GAZANIA_MODEL,
  GAZANIA_HEAD_CENTER,
} from "../components/flowers/gazania/gazaniaGeometry";
import {
  specimenClusterPoint,
  specimenOrganGeometry,
  specimenGeometry,
} from "../lib/three/specimenModel";
import { Mesh, MeshBasicMaterial, DoubleSide, Raycaster, Vector3 } from "three";
import { verifySpecimen } from "./specimen-checks";
import {
  GAZANIA_LEAF,
  createGazaniaLeaf,
} from "../components/flowers/gazania/gazaniaLeaf";
verifySpecimen("gazania", GAZANIA_MODEL);
for (const group of GAZANIA_MODEL.instances!)
  verifySpecimen(`gazania ${group.name} prototype`, {
    clusters: [],
    surfaces: group.surfaces,
    organs: [],
  });
verifySpecimen("gazania white-backed pinnatifid leaf", {
  clusters: [],
  surfaces: [GAZANIA_LEAF],
  organs: [],
});
test("gazania disk bases insert into the actual sealed receptacle surface", () => {
  const receptacle = GAZANIA_MODEL.organs.find(
    (o) => o.name === "solid disk receptacle",
  )!;
  const geometry = specimenOrganGeometry(receptacle, "high");
  const material = new MeshBasicMaterial({ side: DoubleSide });
  const mesh = new Mesh(geometry, material);
  mesh.updateMatrixWorld();
  const ray = new Raycaster(),
    down = new Vector3(0, -1, 0);
  for (const pose of GAZANIA_MODEL.instances!.flatMap((group) => group.poses)) {
    ray.set(new Vector3(pose.position[0], 1, pose.position[2]), down);
    const hit = ray.intersectObject(mesh)[0];
    assert.ok(hit, "every true floret has real receptacular tissue below it");
    assert.ok(
      Math.abs(hit.point.y - pose.position[1]) < 0.045,
      "floret insertion meets real supporting tissue",
    );
  }
  geometry.dispose();
  material.dispose();
});
test("gazania foliage keeps real lobes, rolled margins and matching folded normals", () => {
  const widths = Array.from({ length: 61 }, (_, i) =>
    Math.abs(GAZANIA_LEAF.sample(1, 0.15 + i / 100, 1)[0]),
  );
  assert.ok(
    widths.some(
      (w, i) => i > 0 && i < 60 && w < widths[i - 1] && w < widths[i + 1],
    ),
  );
  const rim = GAZANIA_LEAF.sample(1, 0.5, 1),
    middle = GAZANIA_LEAF.sample(0.5, 0.5, 1);
  assert.ok(rim[2] < middle[2]);
  for (const q of ["overview", "low", "high"] as const) {
    const g = createGazaniaLeaf(q);
    assert.equal(
      g.morphAttributes.normal![0].count,
      g.getAttribute("normal").count,
    );
    assert.ok(g.getAttribute("tissueSide"));
    g.dispose();
  }
});
test("gazania keeps sterile rays, a fused involucre and true five-lobed disk florets", () => {
  assert.equal(
    GAZANIA_MODEL.surfaces.filter((s) => s.name === "sterile ray ligule")
      .length,
    20,
  );
  assert.equal(
    GAZANIA_MODEL.surfaces.filter((s) => s.name === "free phyllary apex")
      .length,
    24,
  );
  assert.equal(
    GAZANIA_MODEL.organs.filter((o) => /ray.*(style|stamen)/.test(o.name))
      .length,
    0,
  );
  const disk = GAZANIA_MODEL.instances![0];
  assert.equal(
    GAZANIA_MODEL.instances!.reduce(
      (sum, group) => sum + group.poses.length,
      0,
    ),
    96,
  );
  assert.equal(
    disk.organs.filter((o) => o.name === "stamen filament").length,
    5,
  );
  assert.equal(
    disk.organs.filter((o) => o.name === "stamen anther chamber").length,
    10,
  );
  assert.equal(
    disk.organs.filter((o) => o.name === "disk style arm").length,
    2,
  );
  const tube = disk.surfaces[0];
  for (let i = 0; i < 5; i++)
    assert.ok(
      tube.sample(i / 5, 1, 1)[1] > tube.sample((i + 0.5) / 5, 1, 1)[1] + 0.015,
    );
  const cup = GAZANIA_MODEL.surfaces.find(
    (s) => s.name === "connate involucral cup",
  )!;
  assert.ok(cup.periodic);
  assert.ok(
    Math.hypot(...[cup.sample(0, 0, 1)[0], cup.sample(0, 0, 1)[2]]) < 0.06,
  );
});
test("gazania disk keeps younger central buds distinct from open marginal florets", () => {
  const groups = GAZANIA_MODEL.instances!;
  assert.ok(
    groups.length >= 2,
    "disk retains more than one developmental cohort at full bloom",
  );
  const byRadius = groups
    .map((group) => ({
      group,
      radius:
        group.poses.reduce(
          (sum, pose) => sum + Math.hypot(pose.position[0], pose.position[2]),
          0,
        ) / group.poses.length,
    }))
    .sort((a, b) => a.radius - b.radius);
  const young = byRadius[0].group,
    mature = byRadius.at(-1)!.group;
  const youngRim = young.surfaces[0].sample(0, 1, 1);
  const matureRim = mature.surfaces[0].sample(0, 1, 1);
  assert.ok(
    Math.hypot(youngRim[0], youngRim[2]) <
      Math.hypot(matureRim[0], matureRim[2]) * 0.55,
  );
  assert.ok(youngRim[1] < matureRim[1] * 0.85);
  for (const organ of young.organs) {
    const geometry = specimenOrganGeometry(organ, "high");
    const positions = geometry.getAttribute("position");
    const folded = geometry.morphAttributes.position![0];
    for (const open of [0, 0.5, 1]) {
      const rimHeight = young.surfaces[0].sample(0.1, 1, open)[1];
      for (let i = 0; i < positions.count; i++) {
        const x = folded.getX(i) * (1 - open) + positions.getX(i) * open,
          y = folded.getY(i) * (1 - open) + positions.getY(i) * open,
          z = folded.getZ(i) * (1 - open) + positions.getZ(i) * open;
        assert.ok(
          y < rimHeight,
          "included reproductive tissue stays below the young corolla rim",
        );
        const wall = young.surfaces[0].sample(0.1, y / rimHeight, open);
        assert.ok(
          Math.hypot(x, z) < Math.hypot(wall[0], wall[2]),
          "included reproductive vertices stay inside the young corolla wall throughout opening",
        );
      }
    }
    geometry.dispose();
  }
});
test("gazania rays carry real longitudinal fluting in the overview geometry", () => {
  const ray = GAZANIA_MODEL.surfaces.find(
    (surface) => surface.name === "sterile ray ligule",
  )!;
  const cross = Array.from(
    { length: 7 },
    (_, i) => ray.sample(i / 6, 0.5, 1)[1],
  );
  // A smooth cup has constant second differences; fluted tissue alternates its curvature.
  const curvature = cross
    .slice(1, -1)
    .map((y, i) => cross[i] - 2 * y + cross[i + 2]);
  assert.ok(Math.max(...curvature) - Math.min(...curvature) > 0.012);
  const geometry = specimenGeometry(ray, "overview");
  assert.equal(
    geometry.getAttribute("position").count,
    98,
    "real relief uses the existing six-column overview grid",
  );
  geometry.dispose();
});
test("gazania rays close over the disk and head insertion remains rooted", () => {
  const ray = GAZANIA_MODEL.surfaces.find(
    (s) => s.name === "sterile ray ligule",
  )!;
  assert.deepEqual(ray.sample(0.5, 0, 0), ray.sample(0.5, 0, 1));
  const bud = ray.sample(0.5, 1, 0),
    full = ray.sample(0.5, 1, 1);
  assert.ok(Math.hypot(bud[0], bud[2]) < 0.015);
  assert.ok(Math.hypot(full[0], full[2]) > 1);
  const insertion = specimenClusterPoint(
    GAZANIA_MODEL.clusters[0],
    [0, -0.18, 0],
  );
  assert.ok(Math.hypot(insertion[0], insertion[1] + 0.18, insertion[2]) < 1e-9);
  assert.ok(GAZANIA_HEAD_CENTER.every(Number.isFinite));
  const rays = GAZANIA_MODEL.surfaces.filter(
    (surface) => surface.name === "sterile ray ligule",
  );
  const tubes = GAZANIA_MODEL.surfaces.filter(
    (surface) => surface.name === "sterile ray basal tube",
  );
  for (let i = 0; i < rays.length; i++) {
    const root = rays[i].sample(0.5, 0, 1),
      a = tubes[i].sample(0, 1, 1),
      b = tubes[i].sample(0.5, 1, 1);
    assert.ok(
      Math.hypot(
        ...root.map((value, axis) => value - (a[axis] + b[axis]) / 2),
      ) < 1e-8,
      "each irregular ray remains attached to its real basal tube",
    );
  }
});
