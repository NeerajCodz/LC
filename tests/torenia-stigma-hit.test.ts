import test from "node:test";
import assert from "node:assert/strict";
import { DoubleSide, Mesh, MeshBasicMaterial, Raycaster, Vector3 } from "three";
import {
  createToreniaStigmaGeometry,
  isInnerToreniaStigmaHit,
  TORENIA_RENDER_MODEL,
} from "../components/flowers/torenia/toreniaStigmaGeometry";
import {
  TORENIA_MODEL,
  toreniaStigma,
} from "../components/flowers/torenia/toreniaGeometry";
test("only real generated inner stigma faces qualify, with no duplicate lamellae in shared assembly", () => {
  assert.ok(
    TORENIA_RENDER_MODEL.surfaces.every(
      (s) => s.name !== "bilamellate torenia stigma",
    ),
  );
  for (const lobe of [0, 1] as const) {
    const g = createToreniaStigmaGeometry(0, lobe, "low"),
      mat = new MeshBasicMaterial({ side: DoubleSide }),
      mesh = new Mesh(g, mat);
    mesh.updateMorphTargets();
    mesh.updateMatrixWorld(true);
    const center = new Vector3(...toreniaStigma(0.5, 0.6, 1, lobe)),
      inner = new Vector3(0, lobe ? -1 : 1, 0);
    for (const inside of [true, false]) {
      const direction = inner.clone().multiplyScalar(inside ? -1 : 1),
        origin = center.clone().addScaledVector(direction, -0.15),
        hits = new Raycaster(origin, direction).intersectObject(mesh);
      assert.ok(hits.length > 0);
      const hit = hits[0];
      assert.equal(
        isInnerToreniaStigmaHit(
          g,
          lobe,
          hit.faceIndex!,
          hit.point,
          hit.face!.normal,
        ),
        inside,
      );
    }
    g.dispose();
    mat.dispose();
  }
});
test("independent closure retains sealed thickness and both matched bloom/contact normal targets", () => {
  const thickness = TORENIA_MODEL.surfaces.find(
    (surface) => surface.name === "bilamellate torenia stigma",
  )!.thickness;
  for (const lobe of [0, 1] as const) {
    const geometry = createToreniaStigmaGeometry(0, lobe, "low"),
      position = geometry.getAttribute("position"),
      half = position.count / 2;
    try {
      assert.equal(geometry.morphAttributes.position!.length, 2);
      assert.equal(geometry.morphAttributes.normal!.length, 2);
      for (const normal of [
        geometry.getAttribute("normal"),
        ...geometry.morphAttributes.normal!,
      ]) {
        assert.equal(normal.count, position.count);
        for (let i = 0; i < normal.count; i++)
          assert.ok(
            Math.abs(
              Math.hypot(normal.getX(i), normal.getY(i), normal.getZ(i)) - 1,
            ) < 0.002,
          );
      }
      for (const target of [position, ...geometry.morphAttributes.position!])
        for (let i = 0; i < half; i++)
          assert.ok(
            Math.hypot(
              target.getX(i) - target.getX(i + half),
              target.getY(i) - target.getY(i + half),
              target.getZ(i) - target.getZ(i + half),
            ) >
              thickness * 0.79,
          );
    } finally {
      geometry.dispose();
    }
  }
});
