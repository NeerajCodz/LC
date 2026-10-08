import test from "node:test";
import { Object3D, Vector3 } from "three";
import assert from "node:assert/strict";
import { MAGNOLIA_MODEL } from "../components/flowers/magnolia/magnoliaGeometry";
import { verifySpecimen } from "./specimen-checks";
verifySpecimen("magnolia", MAGNOLIA_MODEL);
import { MAGNOLIA_LEAF } from "../components/flowers/magnolia/magnoliaLeaf";
verifySpecimen("magnolia leathery foliage", {
  clusters: [],
  surfaces: [MAGNOLIA_LEAF],
  organs: [],
});
test("magnolia retains thick tepals and distinct spiral stamens and carpels", async () => {
  const a =
    await import("../components/flowers/magnolia/magnoliaGeometry").catch(
      () => null,
    );
  assert.ok(a, "magnolia anatomy is missing");
  const m = a.MAGNOLIA_MODEL;
  assert.equal(
    m.surfaces.filter((s) => s.name === "substantial tepal").length,
    9,
  );
  assert.equal(
    m.surfaces.filter((s) => s.name === "protective bud bract").length,
    2,
  );
  assert.equal(
    m.instances!.find((g) => g.name === "spiral stamens")!.poses.length,
    179,
  );
  assert.equal(
    m.instances!.find((g) => g.name === "spiral carpels")!.poses.length,
    60,
  );
});
test("magnolia anthers remain outside the floral torus and its column stays proportionate", () => {
  const body = MAGNOLIA_MODEL.surfaces.find(
      (s) => s.name === "elongate floral receptacle",
    )!,
    y0 = body.sample(0, 0, 1)[1],
    y1 = body.sample(0, 1, 1)[1],
    tep = MAGNOLIA_MODEL.surfaces
      .find((s) => s.name === "substantial tepal")!
      .sample(0.5, 1, 1);
  assert.ok(
    (y1 - y0) / (2 * Math.hypot(tep[0], tep[2])) < 0.27,
    "column resembles an oversized fruiting cone",
  );
  const group = MAGNOLIA_MODEL.instances!.find(
      (g) => g.name === "spiral stamens",
    )!,
    anther = group.organs.find((o) => o.name === "stamen anther chamber")!;
  for (const index of [0, 89, 178]) {
    const pose = group.poses[index],
      object = new Object3D();
    object.position.set(...pose.position);
    object.rotation.set(...pose.rotation);
    object.scale.setScalar(pose.scale);
    object.updateMatrix();
    const p = new Vector3(...anther.points[1]).applyMatrix4(object.matrix),
      v = Math.max(0, Math.min(1, (p.y - y0) / (y1 - y0))),
      skin = body.sample(0, v, 1);
    assert.ok(
      Math.hypot(p.x, p.z) >
        Math.hypot(skin[0], skin[2]) + body.thickness * 0.5 - 0.003,
      "anther is buried inside the receptacle",
    );
  }
});
test("magnolia ovaries stay visible on the outside of the carpel-bearing torus", () => {
  const body = MAGNOLIA_MODEL.surfaces.find(
      (s) => s.name === "elongate floral receptacle",
    )!,
    y0 = body.sample(0, 0, 1)[1],
    y1 = body.sample(0, 1, 1)[1],
    group = MAGNOLIA_MODEL.instances!.find((g) => g.name === "spiral carpels")!,
    ovary = group.organs.find((o) => o.name === "individual carpel ovary")!;
  for (const index of [0, 30, 59]) {
    const pose = group.poses[index],
      object = new Object3D();
    object.position.set(...pose.position);
    object.rotation.set(...pose.rotation);
    object.scale.setScalar(pose.scale);
    object.updateMatrix();
    const p = new Vector3(...ovary.points[1]).applyMatrix4(object.matrix),
      skin = body.sample(0, (p.y - y0) / (y1 - y0), 1);
    assert.ok(
      Math.hypot(p.x, p.z) >
        Math.hypot(skin[0], skin[2]) + body.thickness * 0.5 - 0.003,
      "carpel is buried in the torus",
    );
  }
});
