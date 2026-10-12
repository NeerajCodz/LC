import test from "node:test";
import assert from "node:assert/strict";
import { Euler, Triangle, Vector3 } from "three";
import { verifySpecimen } from "./specimen-checks";
import { PANSY_MODEL } from "../components/flowers/pansy/pansyGeometry";
import { FLOWERS } from "../lib/flowers/catalog";
import { FLOWER_TYPES } from "../lib/flowers/types";
import {
  PANSY_LEAF,
  PANSY_STIPULE,
  PANSY_LEAF_FACE_ROTATION,
  PANSY_LEAF_TILT,
} from "../components/flowers/pansy/pansyLeaf";
import { specimenGeometry } from "../lib/three/specimenModel";
verifySpecimen("pansy foliage", {
  clusters: [],
  surfaces: [PANSY_LEAF, PANSY_STIPULE],
  organs: [],
});
verifySpecimen("pansy", PANSY_MODEL);
test("pansy appears throughout the typed catalog", () => {
  assert.ok((FLOWER_TYPES as readonly string[]).includes("pansy"));
  assert.ok(
    FLOWERS.some(
      (f) => (f.type as string) === "pansy" && f.latin === "Viola tricolor",
    ),
  );
});
test("pansy differentiates its paired upper blades and lower spurred blade", () => {
  for (let cluster = 0; cluster < 4; cluster++) {
    const petals = PANSY_MODEL.surfaces.filter(
      (s) => s.cluster === cluster && s.role === "petal",
    );
    assert.equal(petals.filter((s) => s.tissue === "inner").length, 2);
    assert.equal(petals.filter((s) => s.tissue === "guide").length, 1);
    const spur = PANSY_MODEL.surfaces.find(
      (s) => s.cluster === cluster && s.name === "lower petal nectar spur",
    )!;
    assert.ok(spur.periodic && spur.contactObstacle);
    assert.ok(spur.sample(0.5, 1, 1)[1] < -0.3);
    assert.equal(
      PANSY_MODEL.organs.filter(
        (o) => o.cluster === cluster && o.name === "stamen filament",
      ).length,
      5,
    );
  }
});

test("pansy: dedicated anatomy preserves its defining floral arrangement", async () => {
  const anatomy =
    await import("../components/flowers/pansy/pansyGeometry").catch(() => null);
  assert.ok(anatomy, "pansy anatomy is missing");
  const model = anatomy.PANSY_MODEL;
  assert.equal(model.clusters.length, 4);
  assert.equal(
    model.surfaces.filter((s) => s.name === "unequal petal").length,
    20,
  );
});

test("pansy: green upper leaf normals face upward after the authored shoot pitch", () => {
  const geometry = specimenGeometry(PANSY_LEAF, "low"),
    normal = geometry.getAttribute("normal"),
    local = new Vector3(normal.getX(110), normal.getY(110), normal.getZ(110)),
    rotation = PANSY_LEAF_FACE_ROTATION,
    tilt = PANSY_LEAF_TILT;
  local
    .applyEuler(new Euler(...rotation))
    .applyEuler(new Euler(tilt, 0, 0.1, "YXZ"));
  assert.ok(
    local.y > 0.65,
    "the upper pigment is on the upward-facing leaf surface",
  );
  const axis = new Vector3(0, 1, 0).applyEuler(new Euler(...rotation));
  assert.ok(axis.distanceTo(new Vector3(0, 1, 0)) < 1e-10);
  geometry.dispose();
});

test("pansy: the nectar spur grows directly from the lower petal backing throughout bloom", () => {
  for (const stage of [0, 0.5, 1]) {
    const petal = PANSY_MODEL.surfaces.find(
        (s) => s.cluster === 0 && s.tissue === "guide" && s.role === "petal",
      )!,
      spur = PANSY_MODEL.surfaces.find(
        (s) => s.cluster === 0 && s.name === "lower petal nectar spur",
      )!,
      geometry = specimenGeometry(petal, "high"),
      p =
        stage === 0
          ? geometry.morphAttributes.position![0]
          : geometry.getAttribute("position"),
      folded = geometry.morphAttributes.position![0],
      ix = geometry.index!.array,
      tri = new Triangle(),
      point = new Vector3(),
      nearest = new Vector3(),
      foldedVertex = new Vector3();
    const vertex = (index: number, target: Vector3) => {
      target.fromBufferAttribute(p, index);
      if (stage === 0.5)
        target.lerp(foldedVertex.fromBufferAttribute(folded, index), 0.5);
    };
    for (let j = 0; j < 16; j++) {
      point.set(...spur.sample(j / 16, 0, stage));
      let distance = Infinity;
      for (let i = 0; i < ix.length; i += 3) {
        vertex(ix[i], tri.a);
        vertex(ix[i + 1], tri.b);
        vertex(ix[i + 2], tri.c);
        tri.closestPointToPoint(point, nearest);
        distance = Math.min(distance, point.distanceTo(nearest));
      }
      assert.ok(
        distance < 0.01,
        `bloom ${stage}: spur root meets the lower petal rather than floating ${distance} away`,
      );
    }
    geometry.dispose();
  }
});
