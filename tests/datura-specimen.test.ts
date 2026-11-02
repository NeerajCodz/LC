import test from "node:test";
import assert from "node:assert/strict";
import {
  DATURA_MODEL,
  daturaCorolla,
} from "../components/flowers/datura/daturaGeometry";
import {
  specimenCages,
  specimenGeometry,
  specimenOrganGeometry,
} from "../lib/three/specimenModel";
import { PetalDynamics } from "../lib/three/petalDynamics";
import { verifySpecimen } from "./specimen-checks";

verifySpecimen("datura", DATURA_MODEL);
test("datura: one upright continuous plicate trumpet has five pointed teeth and a tubular five-toothed calyx", () => {
  const tubes = DATURA_MODEL.surfaces.filter((s) => s.role === "tube"),
    calyces = DATURA_MODEL.surfaces.filter((s) => s.role === "calyx");
  assert.equal(tubes.length, 1);
  assert.equal(calyces.length, 1);
  assert.ok(tubes[0].periodic && tubes[0].flexible && calyces[0].periodic);
  const radius = (u: number, stage = 1) => {
    const p = daturaCorolla(u, 1, stage);
    return Math.hypot(p[0], p[2]);
  };
  let peaks = 0;
  for (let i = 0; i < 100; i++)
    if (
      radius(i / 100) > radius((i - 0.5) / 100) &&
      radius(i / 100) > radius((i + 0.5) / 100)
    )
      peaks++;
  assert.equal(peaks, 5);
  assert.ok(
    radius(0) > radius(0.1) * 1.15,
    "long projecting corolla teeth lost",
  );
  assert.ok(radius(0) / radius(0, 0) > 7, "furled bud no longer unfolds");
  assert.ok(daturaCorolla(0, 1, 1)[1] > 1.4);
  let calyxPeaks = 0;
  for (let i = 0; i < 100; i++)
    if (
      calyces[0].sample(i / 100, 1, 1)[1] >
        calyces[0].sample((i - 0.5) / 100, 1, 1)[1] &&
      calyces[0].sample(i / 100, 1, 1)[1] >
        calyces[0].sample((i + 0.5) / 100, 1, 1)[1]
    )
      calyxPeaks++;
  assert.equal(calyxPeaks, 5);
});
test("datura: real included anthers and stigma fit the actual interpolated tube cavity at bud, half and full bloom", () => {
  assert.equal(
    DATURA_MODEL.organs.filter((o) => o.name === "included datura filament")
      .length,
    5,
  );
  assert.equal(
    DATURA_MODEL.organs.filter((o) => o.name === "included datura anther")
      .length,
    5,
  );
  const tube = DATURA_MODEL.surfaces.find((s) => s.role === "tube")!,
    shell = specimenGeometry(tube, "high"),
    sp = shell.getAttribute("position"),
    sf = shell.morphAttributes.position![0],
    uv = shell.getAttribute("uv");
  try {
    for (const organ of DATURA_MODEL.organs.filter((o) => o.bloomMorph)) {
      const g = specimenOrganGeometry(organ, "high"),
        p = g.getAttribute("position"),
        f = g.morphAttributes.position![0];
      try {
        for (const open of [0, 0.5, 1])
          for (let i = 0; i < p.count; i++) {
            const x = p.getX(i) * open + f.getX(i) * (1 - open),
              y = p.getY(i) * open + f.getY(i) * (1 - open),
              z = p.getZ(i) * open + f.getZ(i) * (1 - open);
            let below = 0,
              above = Infinity,
              rb = 0,
              ra = 0;
            for (let row = 0; row <= 32; row++) {
              const points = Array.from(
                { length: 32 },
                (_, col) => row * 32 + col,
              ).filter((j) => uv.getY(j) <= 0.82);
              if (!points.length) continue;
              const j = points[0],
                yy = sp.getY(j) * open + sf.getY(j) * (1 - open),
                r = Math.min(
                  ...points.map((k) =>
                    Math.hypot(
                      sp.getX(k) * open + sf.getX(k) * (1 - open),
                      sp.getZ(k) * open + sf.getZ(k) * (1 - open),
                    ),
                  ),
                );
              if (yy <= y && yy >= below) {
                below = yy;
                rb = r;
              }
              if (yy >= y && yy < above) {
                above = yy;
                ra = r;
              }
            }
            const cavity = rb + ((ra - rb) * (y - below)) / (above - below);
            const insertionY =
                organ.points[0][1] * open +
                (organ.foldedPoints?.[0][1] ?? organ.points[0][1]) * (1 - open),
              attachedBase =
                organ.name === "included datura filament" &&
                y < insertionY + 0.12;
            // Only the basal filament strip joins the wall. Distal filaments,
            // anthers, style and stigma retain the original strict clearance.
            const clearance = attachedBase
              ? -tube.thickness * 0.25
              : tube.thickness;
            assert.ok(
              Number.isFinite(cavity) && Math.hypot(x, z) < cavity - clearance,
              `${organ.name} exits cavity at bloom=${open}, y=${y}`,
            );
          }
      } finally {
        g.dispose();
      }
    }
  } finally {
    shell.dispose();
  }
});
test("datura: real trumpet wall remains thick and its root ring stays pinned at every bloom", () => {
  const { patches } = specimenCages(DATURA_MODEL, false),
    sim = new PetalDynamics(patches, false);
  for (let p = 0; p < patches.length; p++)
    for (let i = 0; i < patches[p].columns; i++)
      assert.equal(sim.inverseMass[sim.offsets[p] + i], 0);
  const surface = DATURA_MODEL.surfaces.find((s) => s.role === "tube")!,
    g = specimenGeometry(surface, "ultra"),
    p = g.getAttribute("position"),
    f = g.morphAttributes.position![0],
    half = p.count / 2;
  for (const open of [0, 0.5, 1])
    for (let i = 0; i < half; i++) {
      const wall = [0, 1, 2].map(
        (k) =>
          (p.array[i * 3 + k] - p.array[(i + half) * 3 + k]) * open +
          (f.array[i * 3 + k] - f.array[(i + half) * 3 + k]) * (1 - open),
      );
      assert.ok(Math.hypot(...wall) > surface.thickness * 0.35);
    }
  g.dispose();
});
