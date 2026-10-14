import assert from "node:assert/strict";
import test from "node:test";
import { createHash } from "node:crypto";
import type { BufferGeometry } from "three";
import {
  createFuchsiaBlade,
  createFuchsiaHypanthium,
  FUCHSIA_FLOWERS,
} from "../components/flowers/fuchsia/fuchsiaGeometry";
import {
  createFloralSurface,
  type FloralSurface,
} from "../lib/three/floralSurfaces";
import { createStamenHeart } from "../components/flowers/StamenHeart";

const kinds: FloralSurface[] = [
  "corona",
  "calla",
  "anthurium",
  "pouch",
  "spur",
  "boat",
];

function sealed(geometry: BufferGeometry) {
  const edges = new Map<string, number>();
  const index = geometry.index!.array;
  for (let i = 0; i < index.length; i += 3)
    for (let j = 0; j < 3; j++) {
      const a = index[i + j],
        b = index[i + ((j + 1) % 3)];
      const key = a < b ? `${a}:${b}` : `${b}:${a}`;
      edges.set(key, (edges.get(key) ?? 0) + 1);
    }
  assert.ok([...edges.values()].every((count) => count === 2));
  for (const attribute of [
    geometry.getAttribute("position"),
    geometry.getAttribute("normal"),
    ...Object.values(geometry.morphAttributes).flat(),
  ])
    assert.ok(Array.from(attribute.array).every(Number.isFinite));
}

function digest(geometries: BufferGeometry[]) {
  const hash = createHash("sha256");
  for (const geometry of geometries) {
    for (const [name, attribute] of Object.entries(geometry.attributes).sort(
      ([a], [b]) => a.localeCompare(b),
    )) {
      hash.update(name);
      hash.update(
        new Uint8Array(
          attribute.array.buffer,
          attribute.array.byteOffset,
          attribute.array.byteLength,
        ),
      );
    }
    const index = geometry.index!.array;
    hash.update(
      new Uint8Array(index.buffer, index.byteOffset, index.byteLength),
    );
    for (const [name, attributes] of Object.entries(
      geometry.morphAttributes,
    ).sort(([a], [b]) => a.localeCompare(b)))
      for (const attribute of attributes) {
        hash.update(name);
        hash.update(
          new Uint8Array(
            attribute.array.buffer,
            attribute.array.byteOffset,
            attribute.array.byteLength,
          ),
        );
      }
    geometry.dispose();
  }
  return hash.digest("hex");
}

test("legacy overview reduces tessellation while retaining sealed blades, smooth tubes and every reproductive part", () => {
  let fuchsiaInputs = 0;
  for (const kind of ["sepal", "petal"] as const)
    for (let i = 0; i < 4; i++) {
      const geometry = createFuchsiaBlade(kind, "overview", i);
      assert.equal(geometry.index!.count, 744);
      sealed(geometry);
      fuchsiaInputs += geometry.index!.count;
      geometry.dispose();
    }
  const tube = createFuchsiaHypanthium("overview");
  assert.equal(tube.index!.count, 2016);
  sealed(tube);
  fuchsiaInputs += tube.index!.count;
  tube.dispose();
  assert.equal(fuchsiaInputs * FUCHSIA_FLOWERS.length, 15936);
  for (const kind of kinds) {
    const geometry = createFloralSurface(kind, "overview");
    assert.equal(geometry.index!.count, kind === "corona" ? 2472 : 2328);
    sealed(geometry);
    if (kind === "corona") {
      const uv = geometry.getAttribute("uv"),
        p = geometry.getAttribute("position");
      const rim: number[] = [];
      for (let i = 0; i < p.count / 2; i++)
        if (uv.getY(i) === 1) rim.push(p.getY(i));
      assert.equal(
        rim.length,
        23,
        "the ten-scalloped rim retains its angular samples",
      );
    }
    geometry.dispose();
  }
  for (const [type, expected] of [
    ["hibiscus", [16380, 16380, 1512, 1680]],
    ["lily", [1512, 4032, 252, 1008]],
    ["tulip", [1512, 4032, 252, 1008]],
  ] as const) {
    const parts = createStamenHeart(type, "overview");
    Object.values(parts).forEach((geometry, i) => {
      assert.equal(geometry!.index!.count, expected[i]);
      sealed(geometry!);
      geometry!.dispose();
    });
  }
});

test("legacy overview frees 302748 indexed inputs across the actual two Fuchsia flowers and retained floral/reproductive counts", () => {
  const blade = createFuchsiaBlade("sepal", "overview", 0),
    tube = createFuchsiaHypanthium("overview");
  const fuchsia =
    FUCHSIA_FLOWERS.length * (8 * blade.index!.count + tube.index!.count);
  blade.dispose();
  tube.dispose();
  const smooth = createFloralSurface("spur", "overview"),
    corona = createFloralSurface("corona", "overview");
  // Five Columbine spurs, five Bleeding Heart pouches and three single spathes.
  const floral = 13 * smooth.index!.count + corona.index!.count;
  smooth.dispose();
  corona.dispose();
  const stamens = ["hibiscus", "lily", "tulip"].reduce((sum, type) => {
    const parts = createStamenHeart(
      type as "hibiscus" | "lily" | "tulip",
      "overview",
    );
    const inputs = Object.values(parts).reduce(
      (n, geometry) => n + geometry!.index!.count,
      0,
    );
    Object.values(parts).forEach((geometry) => geometry!.dispose());
    return sum + inputs;
  }, 0);
  assert.equal(400980 - (fuchsia + floral + stamens), 302748);
});

test("all focused legacy position, normal, pigment, UV, index and folded buffers match the pre-optimization baseline", () => {
  // Captured from the real unchanged factories before this overview-only slice.
  const baseline = {
    low: [
      "ae81b2017a85b0037b542c166ee487a5fc5dab1f0ac3bacac1ac2d6f0aaa373f",
      "2c890f5a33fe5a003a4f2e66ae69da8249684e23a9f15e8aca83fd8c016e3afb",
      "ce3c89ea80947e0c3cc61de236099fb8745267ed6e73402c73633fe9562f890a",
    ],
    medium: [
      "65aca78d432ff145b1220536751de36dc5589653ac27e99bfbe2c3213bfd564e",
      "bb40e2c2c83530c910837f63536659c024f326b7da3a041641f3f457861c0de5",
      "ce3c89ea80947e0c3cc61de236099fb8745267ed6e73402c73633fe9562f890a",
    ],
    high: [
      "cac45b2ba262f037a0e8ae8a4bde506fe809a1f3e0ab7ed17a7c2114583e3fa5",
      "3d1a2ae48b5150ef0bfacb226e03eccc5bd76a3414bc1f1dd4524e643fab111b",
      "ce3c89ea80947e0c3cc61de236099fb8745267ed6e73402c73633fe9562f890a",
    ],
    ultra: [
      "cac45b2ba262f037a0e8ae8a4bde506fe809a1f3e0ab7ed17a7c2114583e3fa5",
      "26a9cadb91bf202cd130cfc8ab69a3a1bd70852f6cac357060fee0a93cad1a54",
      "64c5715d439c39e89bb45b239d551611336edb58677afa7df4d7e4c625e40457",
    ],
  };
  for (const quality of ["low", "medium", "high", "ultra"] as const) {
    const fuchsia = ["sepal", "petal"].flatMap((kind) =>
      Array.from({ length: 4 }, (_, i) =>
        createFuchsiaBlade(kind as "sepal" | "petal", quality, i),
      ),
    );
    fuchsia.push(createFuchsiaHypanthium(quality));
    assert.equal(digest(fuchsia), baseline[quality][0]);
    assert.equal(
      digest(kinds.map((kind) => createFloralSurface(kind, quality))),
      baseline[quality][1],
    );
    assert.equal(
      digest(
        ["hibiscus", "lily", "tulip"].flatMap(
          (type) =>
            Object.values(
              createStamenHeart(type as "hibiscus" | "lily" | "tulip", quality),
            ) as BufferGeometry[],
        ),
      ),
      baseline[quality][2],
    );
  }
});
