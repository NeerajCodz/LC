import test from "node:test";
import assert from "node:assert/strict";
import { Matrix4, Triangle, Vector3 } from "three";
import {
  LANTANA_MODEL,
  LANTANA_HEADS,
  LANTANA_STALKS,
  lantanaCorolla,
} from "../components/flowers/lantana/lantanaGeometry";
import {
  specimenOrganParts,
  specimenClusterPoint,
  specimenGeometry,
} from "../lib/three/specimenModel";
import { verifySpecimen } from "./specimen-checks";
import {
  LANTANA_LEAF_NODES,
  LANTANA_SHOOT_LENGTH,
} from "../components/flowers/lantana/lantanaLeaf";
import {
  writeStemNodeMatrix,
  writeHeadAttachmentVertex,
} from "../lib/three/plantAttachments";

test("lantana: axillary peduncle roots coincide with rendered leaf nodes through anchored motion", () => {
  for (const growth of [0.45, 1]) {
    const state = {
        stemLength: LANTANA_SHOOT_LENGTH,
        supportHeight: 0,
        growth,
        motion: { x: 0.2, z: -0.12, drop: 0.025 },
        head: new Matrix4().makeRotationX(0.13).setPosition(0.2, -0.025, -0.12),
      },
      nodePositions = LANTANA_LEAF_NODES.map((node) =>
        new Vector3().setFromMatrixPosition(
          writeStemNodeMatrix(new Matrix4(), node, state),
        ),
      );
    for (const stalk of LANTANA_STALKS.slice(0, LANTANA_HEADS.length)) {
      const root = new Vector3(...stalk.points[0]);
      writeHeadAttachmentVertex(
        root,
        new Vector3(0, 1, 0),
        stalk.points[0],
        stalk.points.at(-1)!,
        state,
      );
      assert.ok(
        nodePositions.some((node) => node.distanceTo(root) < 1e-8),
        `peduncle root misses every rendered leaf axil at growth ${growth}`,
      );
    }
  }
});

test("lantana: two rounded axillary heads retain distinct cohorts and six closed buds", () => {
  assert.equal(LANTANA_HEADS.length, 2);
  assert.equal(LANTANA_MODEL.clusters.length, 42);
  const corollas = LANTANA_MODEL.surfaces.filter((s) => s.role === "tube");
  assert.equal(corollas.length, 42);
  assert.equal(corollas.filter((s) => s.tissue === undefined).length, 20);
  assert.equal(corollas.filter((s) => s.tissue === "disc").length, 10);
  assert.equal(corollas.filter((s) => s.tissue === "guide").length, 12);
  for (let h = 0; h < 2; h++) {
    const stalk = LANTANA_STALKS[h];
    assert.ok(stalk.points[0][1] < -0.25);
    assert.deepEqual(stalk.points.at(-1), LANTANA_HEADS[h]);
    assert.ok(Math.abs(stalk.points[0][0]) < stalk.radius);
  }
});
test("lantana: one continuous curved corolla has four unequal rounded lobes", () => {
  const radii = Array.from({ length: 4 }, (_, i) => {
    const p = lantanaCorolla(i / 4, 1, 1),
      q = lantanaCorolla((i + 0.5) / 4, 1, 1);
    assert.ok(
      Math.hypot(p[0] - 0.014, p[2]) > Math.hypot(q[0] - 0.014, q[2]) + 0.035,
    );
    return Math.hypot(p[0] - 0.014, p[2]);
  });
  assert.ok(Math.max(...radii) - Math.min(...radii) > 0.015);
  for (const v of [0, 0.3, 0.7, 1]) {
    const a = lantanaCorolla(0, v, 0.5),
      b = lantanaCorolla(1, v, 0.5);
    assert.ok(Math.hypot(...a.map((n, i) => n - b[i])) < 1e-9);
  }
  const full = lantanaCorolla(0, 1, 1),
    bud = lantanaCorolla(0, 1, 1, true);
  assert.ok(
    Math.hypot(full[0] - 0.014, full[2]) >
      Math.hypot(bud[0] - 0.014, bud[2]) * 3,
  );
  assert.ok(bud[1] > 0.4);
  assert.equal(
    LANTANA_MODEL.surfaces.filter((s) => s.name.includes("terminal lobe"))
      .length,
    0,
  );
});
test("lantana: four didynamous included stamens, oblique stigma and superior ovary fit actual corolla buffers", () => {
  for (let c = 0; c < LANTANA_MODEL.clusters.length; c++) {
    const organs = LANTANA_MODEL.organs.filter((o) => o.cluster === c);
    const filaments = organs.filter(
      (o) => o.name === "included lantana stamen filament",
    );
    assert.equal(filaments.length, 4);
    assert.equal(new Set(filaments.map((o) => o.points.at(-1)![1])).size, 2);
    assert.equal(
      organs.filter((o) => o.name === "included lantana anther chamber").length,
      8,
    );
    assert.equal(
      organs.filter((o) => o.name === "oblique subcapitate lantana stigma")
        .length,
      1,
    );
    assert.equal(
      organs.filter((o) => o.name === "superior lantana ovary").length,
      1,
    );
    for (const quality of ["overview", "low"] as const) {
      const parts = specimenOrganParts(LANTANA_MODEL, c, quality, true);
      try {
        assert.equal(parts.length, 14);
        for (const { geometry } of parts)
          for (const a of [
            geometry.getAttribute("position"),
            geometry.morphAttributes.position![0],
          ])
            for (let i = 0; i < a.count; i++) {
              assert.ok(a.getY(i) < 0.36);
              assert.ok(
                Math.hypot(
                  a.getX(i) - 0.014 * (a.getY(i) / 0.43) ** 2,
                  a.getZ(i),
                ) < 0.027,
              );
            }
      } finally {
        parts.forEach((p) => p.geometry.dispose());
      }
    }
    const base = specimenClusterPoint(LANTANA_MODEL.clusters[c], [0, 0, 0]);
    const h = LANTANA_HEADS[Math.floor(c / 21)];
    assert.ok(Math.hypot(base[0] - h[0], base[2] - h[2]) < 0.43);
  }
});
verifySpecimen("lantana", LANTANA_MODEL);
test("lantana: floral bases converge beneath a dense continuous crown", () => {
  for (const quality of ["overview", "low", "high"] as const)
    for (let h = 0; h < LANTANA_HEADS.length; h++) {
      const center = LANTANA_HEADS[h],
        limbs: number[][][] = [];
      let baseRadius = 0,
        crownRadius = 0;
      for (let j = 0; j < 18; j++) {
        const c = h * 21 + j,
          cluster = LANTANA_MODEL.clusters[c],
          surface = LANTANA_MODEL.surfaces.find(
            (s) => s.cluster === c && s.role === "tube",
          )!,
          geometry = specimenGeometry(surface, quality),
          positions = geometry.getAttribute("position"),
          uv = geometry.getAttribute("uv"),
          limb: number[][] = [];
        try {
          baseRadius = Math.max(
            baseRadius,
            Math.hypot(
              cluster.position[0] - center[0],
              cluster.position[2] - center[2],
            ),
          );
          // Use the generated outer mouth, including finite tissue thickness.
          for (let i = 0; i < positions.count / 2; i++) {
            if (uv.getY(i) < 0.999) continue;
            const p = specimenClusterPoint(cluster, [
                positions.getX(i),
                positions.getY(i),
                positions.getZ(i),
              ]),
              x = p[0] - center[0],
              z = p[2] - center[2];
            crownRadius = Math.max(crownRadius, Math.hypot(x, z));
            limb.push([x, z]);
          }
          limbs.push(limb);
        } finally {
          geometry.dispose();
        }
      }
      assert.ok(
        baseRadius < crownRadius * 0.5,
        `head ${h}: bases spread ${baseRadius} across crown ${crownRadius}`,
      );
      const contains = (polygon: number[][], x: number, z: number) => {
        let inside = false;
        for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
          const a = polygon[i],
            b = polygon[j];
          if (
            a[1] > z !== b[1] > z &&
            x < ((b[0] - a[0]) * (z - a[1])) / (b[1] - a[1]) + a[0]
          )
            inside = !inside;
        }
        return inside;
      };
      let sampled = 0,
        covered = 0;
      for (let x = -32; x <= 32; x++)
        for (let z = -32; z <= 32; z++) {
          if (Math.hypot(x, z) > 32) continue;
          sampled++;
          if (
            limbs.some((limb) =>
              contains(
                limb,
                (x / 32) * crownRadius * 0.77,
                (z / 32) * crownRadius * 0.77,
              ),
            )
          )
            covered++;
        }
      assert.ok(
        covered / sampled > 0.78,
        `head ${h} ${quality}: only ${covered / sampled} of the inner crown has corolla limb coverage`,
      );
    }
});

test("lantana: sealed receptacle meshes meet every sessile flower and persistent bud base", () => {
  const receptacles = LANTANA_MODEL.surfaces.filter(
    (s) => s.role === "receptacle",
  );
  assert.equal(receptacles.length, 2);
  assert.ok(receptacles.every((surface) => surface.tissue === "leaf"));
  const triangle = new Triangle(),
    nearest = new Vector3();
  for (const quality of ["overview", "low", "high"] as const)
    for (let h = 0; h < LANTANA_HEADS.length; h++) {
      const surface = receptacles[h],
        geometry = specimenGeometry(surface, quality),
        positions = geometry.getAttribute("position"),
        indices = geometry.index!.array;
      try {
        const vertices = Array.from(
          { length: positions.count },
          (_, i) =>
            new Vector3(
              ...specimenClusterPoint(LANTANA_MODEL.clusters[surface.cluster], [
                positions.getX(i),
                positions.getY(i),
                positions.getZ(i),
              ]),
            ),
        );
        for (let j = 0; j < 21; j++) {
          const flower = LANTANA_MODEL.clusters[h * 21 + j],
            base = new Vector3(...flower.position);
          assert.equal(flower.nod, 0);
          let distance = Infinity;
          for (let i = 0; i < indices.length; i += 3) {
            triangle.set(
              vertices[indices[i]],
              vertices[indices[i + 1]],
              vertices[indices[i + 2]],
            );
            triangle.closestPointToPoint(base, nearest);
            distance = Math.min(distance, nearest.distanceTo(base));
          }
          assert.ok(
            distance < 0.009,
            `head ${h}, flower ${j}, ${quality}: unsupported gap ${distance}`,
          );
        }
      } finally {
        geometry.dispose();
      }
    }
});
