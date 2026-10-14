import test from "node:test";
import assert from "node:assert/strict";
import {
  PENTAS_MODEL,
  PENTAS_STALKS,
  pentasCorolla,
} from "../components/flowers/pentas/pentasGeometry";
import { verifySpecimen } from "./specimen-checks";
import { DoubleSide, Mesh, MeshBasicMaterial, Raycaster, Vector3 } from "three";
import {
  specimenGeometry,
  specimenOrganGeometry,
  specimenOrganParts,
} from "../lib/three/specimenModel";

test("pentas: five-pointed fused corollas have included anthers, hairy throats and long bifid styles", () => {
  assert.equal(PENTAS_MODEL.clusters.length, 22);
  for (let c = 0; c < 22; c++) {
    const organs = PENTAS_MODEL.organs.filter((o) => o.cluster === c);
    const anthers = organs.filter(
      (o) => o.name === "included pentas anther chamber",
    );
    assert.equal(anthers.length, 10);
    assert.ok(
      anthers.every((o) => o.points.at(-1)![1] < pentasCorolla(0, 1, 1)[1]),
    );
    assert.equal(
      organs.filter((o) => o.name === "exserted pentas style").length,
      1,
    );
    assert.equal(
      organs.filter((o) => o.name === "bifid pentas stigma").length,
      2,
    );
    assert.ok(organs.filter((o) => o.name === "throat hair").length >= 10);
    assert.equal(
      PENTAS_MODEL.surfaces.filter(
        (s) => s.cluster === c && s.name === "valvate terminal lobe tissue",
      ).length,
      5,
    );
  }
  for (let i = 0; i < 5; i++) {
    const p = pentasCorolla(i / 5, 1, 1),
      q = pentasCorolla((i + 0.5) / 5, 1, 1);
    assert.ok(Math.hypot(p[0], p[2]) > Math.hypot(q[0], q[2]) + 0.14);
  }
  assert.ok(
    Math.hypot(...[pentasCorolla(0, 0.7, 1)[0], pentasCorolla(0, 0.7, 1)[2]]) >
      0.035,
  );
});
test("pentas: unequal calyx lobes and cyme branches remain complete at overview", () => {
  const branches = PENTAS_STALKS.filter(
    (o) => o.name === "pentas cyme terminal branch",
  );
  assert.equal(branches.length, 22);
  branches.forEach((o, i) =>
    assert.deepEqual(o.points.at(-1), PENTAS_MODEL.clusters[i].position),
  );
  const calyx = PENTAS_MODEL.surfaces.find((s) => s.role === "calyx")!;
  assert.ok(
    Math.abs(calyx.sample(0, 1, 1)[1] - calyx.sample(0.2, 1, 1)[1]) > 0.05,
  );
  let indices = 0;
  for (const s of PENTAS_MODEL.surfaces) {
    const g = specimenGeometry(s, "overview");
    indices += g.index!.count;
    g.dispose();
  }
  assert.ok(indices < 100000, String(indices));
});
verifySpecimen("pentas", PENTAS_MODEL);
test("pentas: complete pistils retain actual inferior ovaries in the fixed renderer partition", () => {
  for (let c = 0; c < 22; c++) {
    const parts = specimenOrganParts(PENTAS_MODEL, c, "overview", false);
    try {
      assert.equal(
        parts.filter((p) => p.organ.name === "inferior pentas ovary").length,
        1,
      );
    } finally {
      parts.forEach((p) => p.geometry.dispose());
    }
  }
});
test("pentas: actual closed terminal tissue blocks a radial ray between adjacent valvate sectors", () => {
  for (const quality of ["overview", "low", "high"] as const) {
    const material = new MeshBasicMaterial({ side: DoubleSide }),
      ray = new Raycaster(
        new Vector3(0, 0.781, 0),
        new Vector3(Math.sin(Math.PI / 5), 0, Math.cos(Math.PI / 5)),
      );
    const geometries = PENTAS_MODEL.surfaces
      .filter((s) => s.cluster === 0)
      .map((s) => specimenGeometry(s, quality));
    try {
      const meshes = geometries.map((g) => {
        const m = new Mesh(g, material);
        m.updateMorphTargets();
        m.morphTargetInfluences![0] = 1;
        m.updateMatrixWorld(true);
        return m;
      });
      assert.ok(
        ray.intersectObjects(meshes).length > 0,
        quality + ": closed side gap",
      );
    } finally {
      geometries.forEach((g) => g.dispose());
      material.dispose();
    }
  }
});
test("pentas: actual included buffers remain enclosed in each persistent young bud", () => {
  for (const c of [19, 20, 21])
    for (const quality of ["overview", "low"] as const) {
      const parts = specimenOrganParts(PENTAS_MODEL, c, quality, true);
      try {
        assert.equal(
          parts.filter((p) => /filament|anther|style|stigma/.test(p.organ.name))
            .length,
          18,
        );
        for (const { geometry } of parts) {
          const p = geometry.getAttribute("position");
          for (let i = 0; i < p.count; i++) assert.ok(p.getY(i) < 0.82);
        }
      } finally {
        parts.forEach(({ geometry }) => geometry.dispose());
      }
    }
});
test("pentas: complete overview reproductive organs and branches fit the head budget", () => {
  let indices = 0;
  for (const s of PENTAS_MODEL.surfaces) {
    const g = specimenGeometry(s, "overview");
    indices += g.index!.count;
    g.dispose();
  }
  for (let c = 0; c < 22; c++)
    for (const included of [false, true])
      for (const { geometry: g } of specimenOrganParts(
        PENTAS_MODEL,
        c,
        "overview",
        included,
      )) {
        indices += g.index!.count;
        g.dispose();
      }
  for (const o of PENTAS_STALKS) {
    const g = specimenOrganGeometry(o, "overview");
    indices += g.index!.count;
    g.dispose();
  }
  assert.ok(indices <= 100000, String(indices));
});
