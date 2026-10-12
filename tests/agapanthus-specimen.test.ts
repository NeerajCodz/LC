import test from "node:test";
import assert from "node:assert/strict";
import {
  DoubleSide,
  Euler,
  Group,
  Mesh,
  MeshBasicMaterial,
  Raycaster,
  Vector3,
} from "three";
import {
  AGAPANTHUS_MODEL,
  AGAPANTHUS_PEDICELS,
  AGAPANTHUS_UMBEL_INSERTION,
  agapanthusFunnel,
} from "../components/flowers/agapanthus/agapanthusGeometry";
import {
  AGAPANTHUS_LEAF,
  AGAPANTHUS_LEAF_POSES,
  AGAPANTHUS_LEAF_TILT,
  createAgapanthusLeafGeometry,
} from "../components/flowers/agapanthus/agapanthusLeaf";
import {
  specimenClusterPoint,
  specimenOrganGeometry,
  specimenGeometry,
} from "../lib/three/specimenModel";
import { verifySpecimen } from "./specimen-checks";
import { specimenInstanceGeometry } from "../lib/three/floretInstances";

verifySpecimen("agapanthus", AGAPANTHUS_MODEL);
verifySpecimen("agapanthus basal strap blades", {
  clusters: [],
  surfaces: [AGAPANTHUS_LEAF],
  organs: [],
});

test("agapanthus: dedicated anatomy preserves its defining floral arrangement", () => {
  assert.equal(AGAPANTHUS_MODEL.clusters.length, 21);
  assert.equal(
    AGAPANTHUS_MODEL.surfaces.filter((s) => s.name === "umbel funnel").length,
    21,
  );
  assert.equal(
    AGAPANTHUS_MODEL.surfaces.filter(
      (s) => s.name === "split papery umbel spathe",
    ).length,
    2,
  );
  const stamens = AGAPANTHUS_MODEL.instances!.filter(
    (g) => g.name === "six retained stamens",
  );
  assert.equal(stamens.length, 21);
  for (const group of stamens) {
    assert.equal(group.poses.length, 6);
    assert.equal(
      group.organs.filter((o) => o.name === "stamen filament").length,
      1,
    );
    assert.equal(
      group.organs.filter((o) => o.name === "stamen anther chamber").length,
      2,
    );
  }
  for (const c of AGAPANTHUS_MODEL.clusters.keys()) {
    assert.equal(
      AGAPANTHUS_MODEL.organs.filter(
        (o) => o.cluster === c && o.name === "central exserted style",
      ).length,
      1,
    );
    assert.ok(
      AGAPANTHUS_MODEL.organs
        .find((o) => o.cluster === c && o.name === "superior ovary")!
        .points.every((p) => p[1] > 0),
    );
  }
});

test("agapanthus: curved pedicels converge at one umbel insertion and align every funnel", () => {
  assert.equal(AGAPANTHUS_PEDICELS.length, 21);
  AGAPANTHUS_PEDICELS.forEach((p, i) => {
    const cluster = AGAPANTHUS_MODEL.clusters[i],
      terminal = new Vector3(...p.points.at(-1)!)
        .sub(new Vector3(...p.points.at(-2)!))
        .normalize(),
      axis = new Vector3(0, 1, 0).applyEuler(new Euler(...cluster.rotation));
    assert.deepEqual(p.points[0], AGAPANTHUS_UMBEL_INSERTION);
    assert.deepEqual(p.points.at(-1), cluster.position);
    assert.ok(terminal.dot(axis) > 0.999999);
    const root = new Vector3(...p.points[0]),
      line = new Vector3(...p.points.at(-1)!).sub(root),
      middle = new Vector3(...p.points[1]).sub(root);
    assert.ok(
      middle.cross(line).length() > 0.001,
      "pedicel keeps its curved midsection",
    );
  });
});

test("agapanthus: a continuous periodic funnel has six deep rim clefts", () => {
  const corolla = AGAPANTHUS_MODEL.surfaces.find(
    (s) => s.name === "umbel funnel",
  )!;
  assert.ok(corolla.periodic);
  for (const stage of [0, 0.5, 1])
    for (const v of [0, 0.2, 0.5, 0.8, 1]) {
      const left = corolla.sample(0, v, stage),
        right = corolla.sample(1, v, stage);
      assert.ok(Math.hypot(...left.map((n, axis) => n - right[axis])) < 1e-10);
    }
  let peaks = 0;
  const count = 600,
    radii = Array.from({ length: count }, (_, i) => {
      const p = agapanthusFunnel(i / count, 1, 1);
      return Math.hypot(p[0], p[2]);
    });
  for (let i = 0; i < count; i++)
    if (
      radii[i] > radii[(i + count - 1) % count] &&
      radii[i] > radii[(i + 1) % count]
    )
      peaks++;
  assert.equal(peaks, 6);
  for (let i = 0; i < 6; i++) {
    const peak = corolla.sample(i / 6, 1, 1),
      cleft = corolla.sample((i + 0.5) / 6, 1, 1);
    assert.ok(peak[1] - cleft[1] > 0.25);
    assert.ok(
      Math.hypot(peak[0], peak[2]) > Math.hypot(cleft[0], cleft[2]) * 1.9,
    );
  }
});

test("agapanthus: all six stamens and styles stay included in closing funnels and buds", () => {
  for (const group of AGAPANTHUS_MODEL.instances!)
    for (const organ of group.organs) {
      assert.ok(organ.foldedPoints);
      for (const p of organ.foldedPoints!) {
        const envelope = agapanthusFunnel(0, p[1] / 0.73, 0);
        assert.ok(
          Math.hypot(p[0], p[2]) < Math.hypot(envelope[0], envelope[2]),
        );
      }
      if (group.cluster >= 18)
        for (const p of organ.points) {
          const envelope = agapanthusFunnel(0, p[1] / 0.73, 1, true);
          assert.ok(
            Math.hypot(p[0], p[2]) < Math.hypot(envelope[0], envelope[2]),
          );
        }
    }
  for (const organ of AGAPANTHUS_MODEL.organs.filter(
    (o) => o.name === "central exserted style",
  ))
    for (const p of organ.foldedPoints!) {
      const envelope = agapanthusFunnel(0, p[1] / 0.73, 0);
      assert.ok(Math.hypot(p[0], p[2]) < Math.hypot(envelope[0], envelope[2]));
    }
  for (const c of [18, 19, 20]) {
    const bud = AGAPANTHUS_MODEL.surfaces.find(
      (s) => s.cluster === c && s.name === "umbel funnel",
    )!;
    const p = bud.sample(0, 1, 1);
    assert.ok(Math.hypot(p[0], p[2]) < 0.05);
  }
});

test("agapanthus: both enclosing spathe remnants remain at the common insertion", () => {
  const spathes = AGAPANTHUS_MODEL.surfaces.filter(
    (s) => s.name === "split papery umbel spathe",
  );
  for (const s of spathes)
    for (const stage of [0, 0.5, 1]) {
      const tip = specimenClusterPoint(
          AGAPANTHUS_MODEL.clusters[s.cluster],
          s.sample(0.5, 1, stage),
        ),
        base = specimenClusterPoint(
          AGAPANTHUS_MODEL.clusters[s.cluster],
          s.sample(0.5, 0, stage),
        );
      assert.ok(
        Math.hypot(
          ...tip.map((n, axis) => n - AGAPANTHUS_UMBEL_INSERTION[axis]),
        ) < 0.12,
      );
      assert.ok(base[1] < AGAPANTHUS_UMBEL_INSERTION[1] - 0.25);
    }
});

test("agapanthus: fine reproductive organs retain sealed prototypes and folded normals at low quality", () => {
  for (const organ of [
    ...AGAPANTHUS_MODEL.organs,
    ...AGAPANTHUS_MODEL.instances!.flatMap((g) => g.organs),
  ]) {
    const geometry = specimenOrganGeometry(organ, "overview"),
      duplicate = specimenOrganGeometry(organ, "overview"),
      edges = new Map<string, number>(),
      ix = geometry.index!.array;
    assert.deepEqual(
      geometry.getAttribute("position").array,
      duplicate.getAttribute("position").array,
    );
    for (const a of [
      geometry.getAttribute("position"),
      geometry.getAttribute("normal"),
      ...(geometry.morphAttributes.position ?? []),
      ...(geometry.morphAttributes.normal ?? []),
    ])
      assert.ok(Array.from(a.array).every(Number.isFinite));
    for (let i = 0; i < ix.length; i += 3)
      for (let j = 0; j < 3; j++) {
        const a = ix[i + j],
          b = ix[i + ((j + 1) % 3)],
          key = a < b ? `${a}:${b}` : `${b}:${a}`;
        edges.set(key, (edges.get(key) ?? 0) + 1);
      }
    assert.ok([...edges.values()].every((n) => n === 2));
    if (organ.foldedPoints)
      assert.equal(geometry.morphAttributes.normal!.length, 1);
    geometry.dispose();
    duplicate.dispose();
  }
  assert.equal(
    AGAPANTHUS_MODEL.instances!.filter(
      (g) => g.name === "six retained stamens",
    ).reduce((sum, g) => sum + g.poses.length, 0),
    126,
  );
});

test("agapanthus: eight arching strap blades form a substantial basal clump", () => {
  assert.equal(AGAPANTHUS_LEAF_POSES.length, 8);
  assert.ok(AGAPANTHUS_LEAF.thickness > 0.018);
  assert.ok(AGAPANTHUS_LEAF_POSES.every((p) => p.position[1] === 0));
  const highest = AGAPANTHUS_LEAF.sample(0.5, 0.81, 1),
    tip = AGAPANTHUS_LEAF.sample(0.5, 1, 1);
  assert.ok(tip[1] < highest[1]);
  assert.ok(tip[2] > 0.95);
});

test("agapanthus: every posed arch exposes green upper tissue without reversing its bend or attachment", () => {
  const geometry = createAgapanthusLeafGeometry("low"),
    baseline = specimenGeometry(AGAPANTHUS_LEAF, "low"),
    normal = geometry.getAttribute("normal"),
    foldedNormal = geometry.morphAttributes.normal![0],
    sides = geometry.getAttribute("tissueSide"),
    half = normal.count / 2,
    tilt = AGAPANTHUS_LEAF_TILT;
  for (const pose of AGAPANTHUS_LEAF_POSES)
    for (const a of [normal, foldedNormal])
      for (const row of [8, 12]) {
        const original = row * 13 + 6,
          upper = sides.getX(original) > 0 ? original : original + half,
          n = new Vector3(a.getX(upper), a.getY(upper), a.getZ(upper))
            .applyEuler(new Euler(...pose.rotation))
            .applyEuler(new Euler(tilt, 0, 0.1, "YXZ"));
        assert.ok(
          n.y > 0.42,
          "green adaxial side faces upward in every basal leaf pose",
        );
      }
  for (const name of ["position", "normal", "uv"])
    assert.deepEqual(
      geometry.getAttribute(name).array,
      baseline.getAttribute(name).array,
      `${name}: the arch is not reflected or rotated`,
    );
  assert.deepEqual(
    geometry.morphAttributes.position![0].array,
    baseline.morphAttributes.position![0].array,
  );
  assert.deepEqual(
    geometry.morphAttributes.normal![0].array,
    baseline.morphAttributes.normal![0].array,
  );
  assert.deepEqual(geometry.index!.array, baseline.index!.array);
  geometry.dispose();
  baseline.dispose();
});

test("agapanthus: real imbricated tips close every folded apex and reopen adult funnels", () => {
  for (const cluster of AGAPANTHUS_MODEL.clusters.keys()) {
    const tips = AGAPANTHUS_MODEL.instances!.find(
      (g) => g.cluster === cluster && g.name === "six imbricated perianth tips",
    )!;
    assert.ok(tips, "six real tepal ends must finish every folded perianth");
    assert.equal(tips.poses.length, 6);
    for (const quality of [
      "overview",
      "low",
      "medium",
      "high",
      "ultra",
    ] as const) {
      const group = new Group(),
        material = new MeshBasicMaterial({ side: DoubleSide }),
        geometry = specimenInstanceGeometry(tips, quality).surfaces[0];
      checkApicalShell(geometry, tips.surfaces[0].thickness);
      tips.poses.forEach((pose, i) => {
        const mesh = new Mesh(geometry, material);
        mesh.name = `tepal-${i}`;
        mesh.position.set(...pose.position);
        mesh.rotation.set(...pose.rotation);
        mesh.scale.setScalar(pose.scale);
        mesh.updateMorphTargets();
        group.add(mesh);
      });
      group.updateMatrixWorld(true);
      for (const stage of [0, 0.5, 1]) {
        group.children.forEach((mesh) => {
          (mesh as Mesh).morphTargetInfluences![0] = 1 - stage;
        });
        for (const [x, z] of [
          [0, 0],
          [0.005, 0],
          [-0.005, 0],
          [0, 0.005],
          [0, -0.005],
        ]) {
          const ray = new Raycaster(
              new Vector3(x, 1.2, z),
              new Vector3(0, -1, 0),
              0,
              0.58,
            ),
            hits = ray.intersectObjects(group.children, false);
          if (cluster >= 18 || stage === 0) {
            assert.ok(
              hits.length > 0,
              `${cluster}, ${quality}, bloom ${stage}: actual tepal tissue closes the apical hole above y=.62`,
            );
            if (x === 0 && z === 0)
              assert.ok(
                new Set(hits.map((h) => h.object.name)).size >= 2,
                "finite tepal tips overlap across the axis",
              );
          } else if (stage === 1)
            assert.equal(
              hits.length,
              0,
              "adult tips fully unfold out of the funnel axis",
            );
        }
      }
      geometry.dispose();
      material.dispose();
    }
  }
  assert.equal(
    AGAPANTHUS_MODEL.surfaces.filter((s) => s.name === "umbel funnel").length,
    21,
  );
});

function checkApicalShell(
  g: import("three").BufferGeometry,
  thickness: number,
) {
  const p = g.getAttribute("position"),
    f = g.morphAttributes.position![0],
    n = g.getAttribute("normal"),
    fn = g.morphAttributes.normal![0],
    half = p.count / 2,
    ix = g.index!.array,
    edges = new Map<string, number>();
  for (const a of [p, f, n, fn])
    assert.ok(Array.from(a.array).every(Number.isFinite));
  for (const a of [n, fn])
    for (let i = 0; i < a.count; i++)
      assert.ok(
        Math.abs(Math.hypot(a.getX(i), a.getY(i), a.getZ(i)) - 1) < 0.002,
      );
  for (const a of [p, f])
    for (let i = 0; i < half; i++)
      assert.ok(
        Math.hypot(
          a.getX(i) - a.getX(i + half),
          a.getY(i) - a.getY(i + half),
          a.getZ(i) - a.getZ(i + half),
        ) >
          thickness * 0.79,
      );
  for (let i = 0; i < ix.length; i += 3)
    for (let j = 0; j < 3; j++) {
      const a = ix[i + j],
        b = ix[i + ((j + 1) % 3)],
        key = a < b ? `${a}:${b}` : `${b}:${a}`;
      edges.set(key, (edges.get(key) ?? 0) + 1);
    }
  assert.ok([...edges.values()].every((n) => n === 2));
  for (const stage of [0, 0.5, 1])
    for (let i = 0; i < ix.length; i += 3) {
      const a = ix[i] * 3,
        b = ix[i + 1] * 3,
        c = ix[i + 2] * 3,
        at = (k: number) => p.array[k] * stage + f.array[k] * (1 - stage),
        ux = at(b) - at(a),
        uy = at(b + 1) - at(a + 1),
        uz = at(b + 2) - at(a + 2),
        vx = at(c) - at(a),
        vy = at(c + 1) - at(a + 1),
        vz = at(c + 2) - at(a + 2);
      assert.ok(
        Math.hypot(uy * vz - uz * vy, uz * vx - ux * vz, ux * vy - uy * vx) >
          1e-12,
      );
    }
}
