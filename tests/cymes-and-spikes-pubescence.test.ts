import test from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { Matrix4, Vector3, type BufferGeometry } from "three";
import type { Quality } from "../lib/flowers/types";
import { PENTAS_MODEL } from "../components/flowers/pentas/pentasGeometry";
import { createHollyhockLeaf } from "../components/flowers/hollyhock/hollyhockLeaf";
import {
  specimenOrganGeometry,
  specimenOrganParts,
} from "../lib/three/specimenModel";
import { createOrganicTube } from "../lib/three/organicTube";
import { writeStemVertex } from "../lib/three/plantAttachments";

const QUALITIES: Quality[] = ["overview", "low", "medium", "high", "ultra"];
async function hollyhock() {
  assert.ok(
    existsSync(
      new URL(
        "../components/flowers/hollyhock/hollyhockPubescence.ts",
        import.meta.url,
      ),
    ),
    "Hollyhock requires actual stellate hair geometry",
  );
  return import("../components/flowers/hollyhock/hollyhockPubescence");
}
async function pentas() {
  assert.ok(
    existsSync(
      new URL(
        "../components/flowers/pentas/pentasPubescence.ts",
        import.meta.url,
      ),
    ),
    "Pentas requires actual young-shoot pubescence",
  );
  return import("../components/flowers/pentas/pentasPubescence");
}
function sealedHair(geometry: BufferGeometry) {
  const positions = geometry.getAttribute("position"),
    folded = geometry.morphAttributes.position?.[0] ?? positions,
    indices = geometry.index!.array,
    edges = new Map<string, number>();
  for (let i = 0; i < indices.length; i += 3)
    for (let edge = 0; edge < 3; edge++) {
      const a = indices[i + edge],
        b = indices[i + ((edge + 1) % 3)],
        key = a < b ? `${a}:${b}` : `${b}:${a}`;
      edges.set(key, (edges.get(key) ?? 0) + 1);
    }
  assert.ok(
    [...edges.values()].every((count) => count === 2),
    "hairs are sealed indexed solids",
  );
  for (const normals of [
    geometry.getAttribute("normal"),
    geometry.morphAttributes.normal?.[0] ?? geometry.getAttribute("normal"),
  ])
    for (let i = 0; i < normals.count; i++)
      assert.ok(
        Math.abs(
          Math.hypot(normals.getX(i), normals.getY(i), normals.getZ(i)) - 1,
        ) < 0.002,
      );
  for (const open of [0, 0.5, 1]) {
    let volume = 0;
    const a = new Vector3(),
      b = new Vector3(),
      c = new Vector3();
    const vertex = (target: Vector3, index: number) =>
      target.set(
        positions.getX(index) * open + folded.getX(index) * (1 - open),
        positions.getY(index) * open + folded.getY(index) * (1 - open),
        positions.getZ(index) * open + folded.getZ(index) * (1 - open),
      );
    for (let i = 0; i < indices.length; i += 3) {
      vertex(a, indices[i]);
      vertex(b, indices[i + 1]);
      vertex(c, indices[i + 2]);
      volume += a.dot(b.clone().cross(c)) / 6;
      assert.ok(
        b.sub(a).cross(c.sub(a)).length() > 1e-12,
        `nondegenerate hair at bloom ${open}`,
      );
    }
    assert.ok(volume > 0, "hair tissue has positive volume");
  }
}

test("hollyhock: deterministic branched stellate hairs remain rooted on both actual leaf poses at every quality", async () => {
  const { hollyhockLeafHairs } = await hollyhock();
  let previous = 0;
  for (const quality of QUALITIES) {
    const hairs = hollyhockLeafHairs(quality),
      leaf = createHollyhockLeaf(quality);
    try {
      assert.deepEqual(hairs, hollyhockLeafHairs(quality));
      assert.ok(hairs.length > previous);
      previous = hairs.length;
      assert.equal(
        hairs.length % 6,
        0,
        "each stellate trichome has one stalk and five radiating arms",
      );
      for (let start = 0; start < hairs.length; start += 6) {
        const stalk = hairs[start],
          arms = hairs.slice(start + 1, start + 6);
        for (const points of ["points", "foldedPoints"] as const) {
          const root = new Vector3(...stalk[points]![0]),
            hub = stalk[points]!.at(-1)!,
            surface =
              points === "points"
                ? leaf.getAttribute("position")
                : leaf.morphAttributes.position![0],
            probe = new Vector3();
          let nearest = Infinity;
          for (let i = surface.count / 2; i < surface.count; i++)
            nearest = Math.min(
              nearest,
              root.distanceTo(probe.fromBufferAttribute(surface, i)),
            );
          assert.ok(
            nearest < 0.0004,
            "stellate stalk originates on the real underside",
          );
          assert.ok(root.distanceTo(new Vector3(...hub)) > 0.001);
          for (const arm of arms) assert.deepEqual(arm[points]![0], hub);
          const direction = arms.map((arm) =>
            new Vector3(...arm[points]!.at(-1)!)
              .sub(new Vector3(...hub))
              .normalize(),
          );
          assert.ok(
            direction[0].dot(direction[2]) < 0,
            "arms radiate in different directions rather than forming parallel bristles",
          );
        }
      }
      for (const hair of hairs) {
        const g = specimenOrganGeometry(
          hair,
          quality === "high" || quality === "ultra" ? "low" : "overview",
        );
        try {
          sealedHair(g);
        } finally {
          g.dispose();
        }
      }
    } finally {
      leaf.dispose();
    }
  }
});

test("pentas: genuine calyx hairs remain attached to every young and mature calyx in the fixed quality-scaled partition", () => {
  for (let cluster = 0; cluster < PENTAS_MODEL.clusters.length; cluster++) {
    const calyx = PENTAS_MODEL.surfaces.find(
      (surface) => surface.cluster === cluster && surface.role === "calyx",
    )!;
    let low = 0,
      high = 0;
    for (const quality of QUALITIES) {
      const parts = specimenOrganParts(PENTAS_MODEL, cluster, quality, false),
        hairs = parts.filter((part) => part.organ.name === "pentas calyx hair");
      try {
        assert.ok(
          hairs.length > 0,
          `${quality}: calyx ${cluster} has actual hairs`,
        );
        assert.ok(
          hairs.some(({ organ }) => organ.points[0][1] > 0.1),
          "distal calyx-lobe pubescence remains present at every tier",
        );
        if (quality === "overview") low = hairs.length;
        if (quality === "high") high = hairs.length;
        for (const { organ, geometry } of hairs) {
          assert.equal(
            organ.bloomMorph,
            false,
            "calyx hairs follow the fixed calyx, not the corolla's bloom",
          );
          const root = organ.points[0],
            u = (Math.atan2(root[0], root[2]) / (Math.PI * 2) + 1) % 1,
            v = (Math.hypot(root[0], root[2]) - 0.034) / 0.012;
          assert.ok(
            new Vector3(...root).distanceTo(
              new Vector3(...calyx.sample(u, v, 1)),
            ) < 1e-10,
          );
          assert.ok(
            Math.hypot(
              ...organ.points.at(-1)!.map((value, i) => value - root[i]),
            ) > 0.008,
          );
          sealedHair(geometry);
        }
      } finally {
        parts.forEach((part) => part.geometry.dispose());
      }
    }
    assert.ok(high > low, "small calyx organs scale down without disappearing");
  }
});

test("pentas: young-stem hairs are rooted on the real sealed shoot and follow its growth/contact deformation", async () => {
  const { pentasYoungStemHairs } = await pentas();
  let previous = 0;
  for (const quality of QUALITIES) {
    const hairs = pentasYoungStemHairs(quality, 1.98, 0.029),
      low = quality === "low" || quality === "overview",
      stem = createOrganicTube({
        points: [
          [0, -1.98, 0],
          [0.025, -1.98 * 0.55, 0],
          [0, 0, 0],
        ],
        radius: 0.029 * 1.2,
        endRadius: 0.029,
        segments: low ? 40 : 80,
        sides: low ? 10 : 18,
        grain: 0.05,
      });
    try {
      assert.deepEqual(hairs, pentasYoungStemHairs(quality, 1.98, 0.029));
      assert.ok(hairs.length > previous);
      previous = hairs.length;
      for (const hair of hairs) {
        const root = new Vector3(...hair.points[0]),
          positions = stem.getAttribute("position"),
          normals = stem.getAttribute("normal"),
          probe = new Vector3();
        let nearest = Infinity,
          vertex = -1;
        for (let i = 0; i < positions.count; i++) {
          const distance = root.distanceTo(
            probe.fromBufferAttribute(positions, i),
          );
          if (distance < nearest) {
            nearest = distance;
            vertex = i;
          }
        }
        assert.ok(
          nearest < 1e-8,
          "hair root is an actual rendered young-shoot vertex",
        );
        assert.ok(root.y > -1.98 * 0.4 && root.y < -0.02);
        for (const growth of [0.03, 0.5, 1]) {
          const state = {
              stemLength: 1.98,
              supportHeight: 0,
              growth,
              motion: { x: 0.13, z: -0.09, drop: 0.018 },
              head: new Matrix4(),
            },
            a = root.clone(),
            b = new Vector3().fromBufferAttribute(positions, vertex);
          writeStemVertex(
            a,
            new Vector3().fromBufferAttribute(normals, vertex),
            state,
          );
          writeStemVertex(
            b,
            new Vector3().fromBufferAttribute(normals, vertex),
            state,
          );
          assert.ok(a.distanceTo(b) < 1e-12);
        }
        const g = createOrganicTube({
          ...hair,
          segments: low ? 22 : 44,
          sides: low ? 6 : 10,
          grain: 0.06,
        });
        try {
          sealedHair(g);
        } finally {
          g.dispose();
        }
      }
    } finally {
      stem.dispose();
    }
  }
});

test("pubescence: sparse complete overview detail adds fewer than fifteen thousand indexed inputs", async (t) => {
  const { hollyhockLeafHairs } = await hollyhock(),
    { pentasYoungStemHairs } = await pentas();
  let inputs = 0;
  // Five body leaves plus the seven actual axillary leaves share the same hair builder.
  for (const hair of hollyhockLeafHairs("overview")) {
    const g = specimenOrganGeometry(hair, "overview");
    inputs += g.index!.count * 12;
    g.dispose();
  }
  for (let c = 0; c < PENTAS_MODEL.clusters.length; c++) {
    const parts = specimenOrganParts(PENTAS_MODEL, c, "overview", false);
    for (const part of parts) {
      if (part.organ.name === "pentas calyx hair")
        inputs += part.geometry.index!.count;
      part.geometry.dispose();
    }
  }
  for (const hair of pentasYoungStemHairs("overview", 1.98, 0.029)) {
    const g = createOrganicTube({
      ...hair,
      segments: 22,
      sides: 6,
      grain: 0.06,
    });
    inputs += g.index!.count;
    g.dispose();
  }
  assert.ok(
    inputs > 0 && inputs <= 15000,
    `new overview pubescence inputs: ${inputs}`,
  );
  t.diagnostic(
    `new overview pubescence: ${inputs} indexed inputs; twelve additional merged leaf draws`,
  );
});
