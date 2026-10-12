import test from "node:test";
import assert from "node:assert/strict";
import { FLOWERS } from "../lib/flowers/catalog";
import { FLOWER_TYPES } from "../lib/flowers/types";
test("wisteria: typed catalog preserves its scientific study", () => {
  assert.ok((FLOWER_TYPES as readonly string[]).includes("wisteria"));
  assert.equal(
    FLOWERS.find((f) => (f.type as string) === "wisteria")?.latin,
    "Wisteria sinensis",
  );
});
import {
  WISTERIA_MODEL,
  WISTERIA_FLOWER_POSITIONS,
  WISTERIA_SHOOT_POINTS,
} from "../components/flowers/wisteria/wisteriaGeometry";
import {
  WISTERIA_LEAFLET,
  WISTERIA_LEAF_POSES,
  WISTERIA_LEAF_TILT,
  createWisteriaLeaflet,
} from "../components/flowers/wisteria/wisteriaLeaf";
import { Euler, Vector3 } from "three";
import {
  specimenCages,
  specimenClusterPoint,
} from "../lib/three/specimenModel";
import { verifySpecimen } from "./specimen-checks";
import { petalOpenness, stepSpring } from "../lib/three/easing";

verifySpecimen("wisteria", WISTERIA_MODEL);
verifySpecimen("wisteria leaflet", {
  clusters: WISTERIA_MODEL.clusters.slice(0, 1),
  surfaces: [WISTERIA_LEAFLET],
  organs: [],
});

test("wisteria: the green upper leaflet side faces upward after the compound leaf and shoot pitches", () => {
  const geometry = createWisteriaLeaflet("low"),
    side = geometry.getAttribute("tissueSide"),
    normal = geometry.getAttribute("normal"),
    position = geometry.getAttribute("position"),
    half = position.count / 2,
    upper = side.getX(110) > 0 ? 110 : 110 + half,
    lower = upper < half ? upper + half : upper - half;
  for (const pose of WISTERIA_LEAF_POSES) {
    const blade = new Euler(...pose.rotation),
      shoot = new Euler(WISTERIA_LEAF_TILT, 0.7, 0.1, "YXZ"),
      n = new Vector3()
        .fromBufferAttribute(normal, upper)
        .applyEuler(blade)
        .applyEuler(shoot),
      p = new Vector3()
        .fromBufferAttribute(position, upper)
        .applyEuler(blade)
        .applyEuler(shoot),
      below = new Vector3()
        .fromBufferAttribute(position, lower)
        .applyEuler(blade)
        .applyEuler(shoot);
    assert.ok(n.y > 0.7, "the upper pigment faces the sky, not the ground");
    assert.ok(p.y > below.y, "upper tissue sits above the matching underside");
  }
  geometry.dispose();
});

test("wisteria: sixteen pendant flowers each retain one banner, paired wings, paired keel and ten stamens", () => {
  assert.equal(WISTERIA_MODEL.clusters.length, 16);
  for (let cluster = 0; cluster < 16; cluster++) {
    const surfaces = WISTERIA_MODEL.surfaces.filter(
      (s) => s.cluster === cluster,
    );
    assert.equal(
      surfaces.filter((s) => s.name === "standard banner").length,
      1,
    );
    assert.equal(surfaces.filter((s) => s.role === "wing").length, 2);
    assert.equal(surfaces.filter((s) => s.role === "keel").length, 2);
    const stamens = WISTERIA_MODEL.organs.filter(
      (o) =>
        o.cluster === cluster &&
        /^(united stamen|free tenth stamen)$/.test(o.name),
    );
    assert.equal(stamens.length, 10);
    assert.equal(
      stamens.filter((o) => o.name === "free tenth stamen").length,
      1,
    );
    assert.equal(
      WISTERIA_MODEL.organs.filter(
        (o) => o.cluster === cluster && o.name === "included curved style",
      ).length,
      1,
    );
    assert.ok(
      stamens.every(
        (o) => o.points.at(-1)![2] < 0.46 && o.points.at(-1)![1] < -0.04,
      ),
    );
    assert.equal(surfaces.filter((s) => s.flexible).length, 5);
  }
  const banners = WISTERIA_MODEL.surfaces.filter((s) => s.role === "banner");
  assert.equal(
    new Set(
      banners.map((s) =>
        petalOpenness(
          0.5,
          s.delay!,
          WISTERIA_MODEL.surfaces.indexOf(s) * 0.31,
        ).toFixed(10),
      ),
    ).size,
    1,
    "Chinese wisteria opens together",
  );
  assert.ok(WISTERIA_FLOWER_POSITIONS[15][1] < -1.7);
});

test("wisteria: each pedicel meets its flower insertion and the rachis spans the pendant head", () => {
  const pedicels = WISTERIA_MODEL.organs.filter(
    (o) => o.name === "raceme flower pedicel",
  );
  assert.equal(pedicels.length, 16);
  pedicels.forEach((pedicel, i) => {
    const p = specimenClusterPoint(
      WISTERIA_MODEL.clusters[0],
      pedicel.points.at(-1)!,
    );
    p.forEach((value, axis) =>
      assert.ok(Math.abs(value - WISTERIA_FLOWER_POSITIONS[i][axis]) < 1e-10),
    );
  });
  const rachis = WISTERIA_MODEL.organs.find(
    (o) => o.name === "pendant raceme rachis",
  )!;
  assert.ok(
    specimenClusterPoint(WISTERIA_MODEL.clusters[0], rachis.points.at(-1)!)[1] <
      -1.8,
  );
});

test("wisteria: the long raceme carrier keeps every flower insertion attached during actual wind and contact frame rotations", () => {
  const pedicels = WISTERIA_MODEL.organs.filter(
    (o) => o.name === "raceme flower pedicel",
  );
  for (const time of [0.4, 1.5, 4.3])
    for (const wind of [0, 1])
      for (const contact of [0, 0.4]) {
        const frameCluster = (index: number) => {
          const c = WISTERIA_MODEL.clusters[index];
          return {
            ...c,
            rotation: [
              c.rotation[0] +
                Math.sin(time * 1.3 + index * 0.9) * c.nod * 0.4 * wind,
              c.rotation[1],
              c.rotation[2] +
                Math.sin(time * 1.6 + index * 1.7) * c.nod * wind +
                contact * c.nod,
            ] as [number, number, number],
          };
        };
        pedicels.forEach((pedicel, i) => {
          const endpoint = new Vector3(
              ...specimenClusterPoint(frameCluster(0), pedicel.points.at(-1)!),
            ),
            insertion = new Vector3(
              ...specimenClusterPoint(frameCluster(i), [0, 0, 0]),
            );
          assert.ok(
            endpoint.distanceTo(insertion) < 1e-10,
            `flower ${i} detached under wind ${wind} / contact ${contact}`,
          );
        });
      }
  assert.ok(
    WISTERIA_MODEL.clusters.slice(1).every((c) => c.nod > 0),
    "individual blossoms retain nodding about their fixed insertions",
  );
});

test("wisteria: its actual paired wings and keels depress under the shared articulation spring and recover elastically", () => {
  const spring = { value: 0, velocity: 0 };
  for (let frame = 0; frame < 120; frame++)
    stepSpring(spring, 0.24, 1 / 120, 65);
  assert.ok(spring.value > 0.23 && spring.value < 0.25);
  const articulated = WISTERIA_MODEL.surfaces.filter(
    (s) => s.role === "wing" || s.role === "keel",
  );
  assert.equal(articulated.length, 64);
  for (const surface of articulated) {
    const tip = new Vector3(...surface.sample(0.5, 0.95, 1)),
      depressed = tip.clone().applyEuler(new Euler(spring.value, 0, 0));
    assert.ok(
      depressed.y < tip.y - 0.1,
      "positive articulation depresses the actual forward-projecting petal",
    );
  }
  for (let frame = 0; frame < 300; frame++) stepSpring(spring, 0, 1 / 120, 65);
  assert.ok(Math.abs(spring.value) < 1e-6);
  assert.ok(Math.abs(spring.velocity) < 1e-5);
  for (const surface of articulated) {
    const tip = new Vector3(...surface.sample(0.5, 0.95, 1)),
      recovered = tip.clone().applyEuler(new Euler(spring.value, 0, 0));
    assert.ok(recovered.distanceTo(tip) < 1e-6);
  }
});

test("wisteria: supported woody shoot winds counter-clockwise, ends on the head and bears eleven pinnate leaflets", () => {
  assert.deepEqual(WISTERIA_SHOOT_POINTS[0], [0, -3.4, 0]);
  assert.ok(
    WISTERIA_SHOOT_POINTS.at(-1)!.every((value) => Math.abs(value) < 1e-10),
  );
  const a = WISTERIA_SHOOT_POINTS[8],
    b = WISTERIA_SHOOT_POINTS[9];
  assert.ok(b[1] > a[1]);
  assert.ok(
    (a[0] + 0.12) * (b[2] - 0.015) - (a[2] - 0.015) * (b[0] + 0.12) < 0,
  );
  assert.equal(WISTERIA_LEAF_POSES.length, 11);
  for (let i = 0; i < 10; i += 2) {
    assert.equal(
      WISTERIA_LEAF_POSES[i].position[1],
      WISTERIA_LEAF_POSES[i + 1].position[1],
    );
    assert.ok(
      WISTERIA_LEAF_POSES[i].rotation[2] *
        WISTERIA_LEAF_POSES[i + 1].rotation[2] <
        0,
    );
  }
  const desktop = specimenCages(WISTERIA_MODEL, false).patches.reduce(
    (sum, p) => sum + p.open.length / 3,
    0,
  );
  const mobile = specimenCages(WISTERIA_MODEL, true).patches.reduce(
    (sum, p) => sum + p.open.length / 3,
    0,
  );
  assert.equal(desktop, 1680);
  assert.equal(mobile, 480);
});
