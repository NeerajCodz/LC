import test from "node:test";
import assert from "node:assert/strict";
import {
  DoubleSide,
  Mesh,
  MeshBasicMaterial,
  Raycaster,
  Triangle,
  Vector3,
} from "three";
import { HOYA_MODEL } from "../components/flowers/hoya/hoyaGeometry";
import { specimenGeometry } from "../lib/three/specimenModel";

const qualities = ["overview", "low", "medium", "high", "ultra"] as const;

test("hoya: the actual closed apex has meeting valvate tissue without raised pinwheel lips", () => {
  const material = new MeshBasicMaterial({ side: DoubleSide });
  try {
    for (const quality of qualities) {
      const meshes = HOYA_MODEL.surfaces
        .filter((surface) => surface.cluster === 0 && surface.role === "tube")
        .map((surface) => {
          const mesh = new Mesh(specimenGeometry(surface, quality), material);
          mesh.morphTargetInfluences![0] = 1;
          return mesh;
        });
      try {
        let centralHeight = 0;
        for (const radius of [0, 0.012, 0.025, 0.04]) {
          const heights = [];
          for (let azimuth = 0; azimuth < 40; azimuth++) {
            const angle = (azimuth * Math.PI * 2) / 40,
              hits = new Raycaster(
                new Vector3(
                  radius * Math.cos(angle),
                  0.4,
                  radius * Math.sin(angle),
                ),
                new Vector3(0, -1, 0),
                0,
                0.11,
              ).intersectObjects(meshes);
            assert.ok(
              hits.length > 0,
              `${quality}: closed apex at radius ${radius}, angle ${azimuth}`,
            );
            heights.push(hits[0].point.y);
          }
          if (!radius) centralHeight = heights[0];
          assert.ok(
            Math.max(...heights) - Math.min(...heights) < 0.003,
            `${quality} radius ${radius}: no raised angular terminal lip`,
          );
          assert.ok(
            Math.max(...heights) <= centralHeight + 0.002,
            `${quality} radius ${radius}: no pinwheel raised above the central bud apex`,
          );
        }
      } finally {
        meshes.forEach((mesh) => mesh.geometry.dispose());
      }
    }
  } finally {
    material.dispose();
  }
});

test("hoya: an open corolla limb has one real tissue shell without an overlaid terminal rim", () => {
  const material = new MeshBasicMaterial({ side: DoubleSide });
  try {
    for (const quality of qualities) {
      const meshes = HOYA_MODEL.surfaces
        .filter((surface) => surface.cluster === 0 && surface.role === "tube")
        .map(
          (surface) => new Mesh(specimenGeometry(surface, quality), material),
        );
      try {
        for (let lobe = 0; lobe < 5; lobe++) {
          const angle = (lobe * Math.PI * 2) / 5;
          for (const radius of [0.2, 0.25, 0.29]) {
            const hits = new Raycaster(
              new Vector3(
                radius * Math.cos(angle),
                0.5,
                radius * Math.sin(angle),
              ),
              new Vector3(0, -1, 0),
              0,
              1,
            ).intersectObjects(meshes);
            const unique = hits.filter(
              (hit, i) =>
                !i || Math.abs(hit.distance - hits[i - 1].distance) > 1e-6,
            );
            assert.equal(
              unique.length,
              2,
              `${quality} lobe ${lobe} radius ${radius}: one front and one back, no second corolla overlay`,
            );
          }
        }
      } finally {
        meshes.forEach((mesh) => mesh.geometry.dispose());
      }
    }
  } finally {
    material.dispose();
  }
});

test("hoya: actual corona buffers form acute ridged segments alternating with the corolla", () => {
  for (const quality of qualities) {
    const surfaces = HOYA_MODEL.surfaces.filter(
      (surface) =>
        surface.cluster === 0 && surface.name === "ridged waxy corona limb",
    );
    assert.equal(surfaces.length, 5);
    for (let lobe = 0; lobe < surfaces.length; lobe++) {
      const geometry = specimenGeometry(surfaces[lobe], quality),
        position = geometry.getAttribute("position"),
        uv = geometry.getAttribute("uv"),
        half = position.count / 2,
        samples = Array.from({ length: half }, (_, i) => ({
          u: uv.getX(i),
          v: uv.getY(i),
          p: new Vector3()
            .fromBufferAttribute(position, i)
            .add(new Vector3().fromBufferAttribute(position, i + half))
            .multiplyScalar(0.5),
        }));
      try {
        const row = (v: number) => {
            const closest = Math.min(...samples.map((s) => Math.abs(s.v - v)));
            return samples.filter(
              (s) => Math.abs(Math.abs(s.v - v) - closest) < 1e-7,
            );
          },
          base = row(0),
          tip = row(1),
          middle = row(0.5),
          tipCenter = tip
            .reduce((sum, s) => sum.add(s.p), new Vector3())
            .multiplyScalar(1 / tip.length),
          expectedAngle = ((lobe + 0.5) * Math.PI * 2) / 5,
          tangent = new Vector3(
            -Math.sin(expectedAngle),
            0,
            Math.cos(expectedAngle),
          ),
          width = (points: typeof samples) =>
            Math.max(...points.map((s) => s.p.dot(tangent))) -
            Math.min(...points.map((s) => s.p.dot(tangent)));
        assert.ok(
          Math.cos(Math.atan2(tipCenter.z, tipCenter.x) - expectedAngle) >
            0.999,
          `${quality}: corona must alternate with outer star`,
        );
        assert.ok(
          width(base) < width(middle) * 0.12 &&
            width(tip) < width(middle) * 0.12,
          `${quality}: both corona ends remain acute and finite`,
        );
        const center = middle.reduce((best, s) =>
            Math.abs(s.u - 0.5) < Math.abs(best.u - 0.5) ? s : best,
          ),
          left = middle[0],
          right = middle.at(-1)!;
        assert.ok(
          center.p.y - (left.p.y + right.p.y) / 2 > 0.025,
          `${quality}: actual median waxy ridge must project above both margins`,
        );
        if (quality !== "overview") {
          assert.ok(
            width(row(0.125)) < width(middle) * 0.5,
            `${quality}: inner taper must be acute, not a rounded cushion`,
          );
          assert.ok(
            width(row(0.875)) < width(middle) * 0.4,
            `${quality}: outer taper must be acute, not a rounded cushion`,
          );
        }
      } finally {
        geometry.dispose();
      }
    }
  }
});

test("hoya: corolla and corona skins keep opposite triangle orientations and positive volume through intermediate folds", () => {
  const triangle = new Triangle(),
    opposite = new Triangle(),
    normal = new Vector3(),
    backNormal = new Vector3();
  for (const quality of qualities)
    for (const name of ["valvate corolla lobe", "ridged waxy corona limb"]) {
      const surface = HOYA_MODEL.surfaces.find(
        (s) => s.cluster === 0 && s.name === name,
      );
      assert.ok(surface);
      const geometry = specimenGeometry(surface, quality),
        position = geometry.getAttribute("position"),
        folded = geometry.morphAttributes.position![0],
        index = geometry.index!,
        uv = geometry.getAttribute("uv"),
        half = position.count / 2,
        stride = Array.from({ length: half }, (_, i) => i).find(
          (i) => uv.getY(i) > 0,
        )!;
      const sideIndices = (stride - 1) * (half / stride - 1) * 6;
      try {
        for (const bloom of [0, 0.1, 0.25, 0.5, 0.75, 0.9, 1]) {
          const vertex = (i: number, target: Vector3) => {
            const n = index.getX(i);
            return target.set(
              position.getX(n) * bloom + folded.getX(n) * (1 - bloom),
              position.getY(n) * bloom + folded.getY(n) * (1 - bloom),
              position.getZ(n) * bloom + folded.getZ(n) * (1 - bloom),
            );
          };
          let volume = 0;
          for (let i = 0; i < index.count; i += 3) {
            vertex(i, triangle.a);
            vertex(i + 1, triangle.b);
            vertex(i + 2, triangle.c);
            assert.ok(
              triangle.getArea() > 5e-13,
              `${name}/${quality}/${bloom}: no collapsed tissue triangle`,
            );
            volume +=
              triangle.a.dot(normal.crossVectors(triangle.b, triangle.c)) / 6;
            if (i < sideIndices) {
              vertex(i + sideIndices, opposite.a);
              vertex(i + sideIndices + 1, opposite.b);
              vertex(i + sideIndices + 2, opposite.c);
              assert.ok(
                triangle.getNormal(normal).dot(opposite.getNormal(backNormal)) <
                  0,
                `${name}/${quality}/${bloom}: inner and outer triangles must not fold through one another`,
              );
            }
          }
          assert.ok(
            volume > 1e-6,
            `${name}/${quality}/${bloom}: retain a positive tissue volume`,
          );
        }
      } finally {
        geometry.dispose();
      }
    }
});
