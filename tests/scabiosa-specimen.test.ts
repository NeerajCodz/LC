import test from "node:test";
import assert from "node:assert/strict";
import { FLOWERS } from "../lib/flowers/catalog";
import { FLOWER_TYPES } from "../lib/flowers/types";
test("scabiosa: typed catalog preserves its scientific study", () => {
  assert.ok((FLOWER_TYPES as readonly string[]).includes("scabiosa"));
  assert.equal(
    FLOWERS.find((f) => (f.type as string) === "scabiosa")?.latin,
    "Scabiosa columbaria",
  );
});
import {
  SCABIOSA_MODEL,
  scabiosaCorolla,
} from "../components/flowers/scabiosa/scabiosaGeometry";
import {
  SCABIOSA_UPPER_LEAF,
  SCABIOSA_BASAL_LEAF,
  SCABIOSA_LEAF_TILT,
  SCABIOSA_BASAL_LEAF_POSES,
  createScabiosaUpperLeaf,
  createScabiosaBasalLeaf,
} from "../components/flowers/scabiosa/scabiosaLeaf";
import { specimenCages, specimenGeometry } from "../lib/three/specimenModel";
import {
  specimenInstanceGeometry,
  updateFloretInstances,
} from "../lib/three/floretInstances";
import {
  InstancedMesh,
  Mesh,
  MeshStandardMaterial,
  Object3D,
  Euler,
  Vector3,
  Ray,
  Triangle,
  Matrix4,
} from "three";
import { verifySpecimen } from "./specimen-checks";
import { petalOpenness } from "../lib/three/easing";

verifySpecimen("scabiosa", SCABIOSA_MODEL);
verifySpecimen("scabiosa divided leaf", {
  clusters: SCABIOSA_MODEL.clusters,
  surfaces: [SCABIOSA_UPPER_LEAF, SCABIOSA_BASAL_LEAF],
  organs: [],
});
verifySpecimen("scabiosa inner floret", {
  clusters: SCABIOSA_MODEL.clusters,
  surfaces: SCABIOSA_MODEL.instances![1].surfaces,
  organs: [],
});

test("scabiosa: upper foliage and basal blades display the upper pigment above their underside", () => {
  const specimens = [
    {
      geometry: createScabiosaUpperLeaf("low"),
      rotations: [
        new Euler(SCABIOSA_LEAF_TILT, 0, 0.1, "YXZ"),
        new Euler(SCABIOSA_LEAF_TILT, Math.PI, 0.1, "YXZ"),
      ],
    },
    {
      geometry: createScabiosaBasalLeaf("low"),
      rotations: SCABIOSA_BASAL_LEAF_POSES.map(
        (pose) => new Euler(...pose.rotation),
      ),
    },
  ];
  for (const { geometry, rotations } of specimens) {
    const side = geometry.getAttribute("tissueSide"),
      normal = geometry.getAttribute("normal"),
      position = geometry.getAttribute("position"),
      half = position.count / 2,
      upper = side.getX(110) > 0 ? 110 : 110 + half,
      lower = upper < half ? upper + half : upper - half;
    for (const rotation of rotations) {
      const n = new Vector3()
          .fromBufferAttribute(normal, upper)
          .applyEuler(rotation),
        p = new Vector3()
          .fromBufferAttribute(position, upper)
          .applyEuler(rotation),
        below = new Vector3()
          .fromBufferAttribute(position, lower)
          .applyEuler(rotation);
      assert.ok(n.y > 0.7, "the upper pigment faces the sky, not the ground");
      assert.ok(p.y > below.y);
    }
    geometry.dispose();
  }
});

test("scabiosa: sixteen enlarged marginal flowers surround twenty-five real four-stamen inner florets", () => {
  assert.equal(SCABIOSA_MODEL.clusters.length, 1);
  assert.equal(
    SCABIOSA_MODEL.surfaces.filter((s) => s.name === "enlarged marginal floret")
      .length,
    16,
  );
  const marginal = SCABIOSA_MODEL.instances![0],
    inner = SCABIOSA_MODEL.instances![1];
  assert.equal(marginal.poses.length, 16);
  assert.equal(inner.poses.length, 25);
  assert.ok(inner.poses.every((p) => p.scale < 0.63));
  for (const group of [marginal, inner]) {
    assert.equal(
      group.organs.filter((o) => o.name === "stamen filament").length,
      4,
    );
    assert.equal(
      group.organs.filter((o) => o.name === "stamen anther chamber").length,
      8,
    );
    assert.equal(
      group.organs.filter((o) => o.name === "calyx bristle").length,
      5,
    );
    assert.equal(
      group.organs.filter((o) => o.name === "inferior floret ovary").length,
      1,
    );
    assert.equal(
      group.organs.filter((o) => o.name === "single protruding style").length,
      1,
    );
    assert.equal(
      group.organs.filter((o) => o.name === "lobed style tip").length,
      2,
    );
  }
  assert.equal(
    SCABIOSA_MODEL.surfaces.filter((s) => s.name === "green involucral bract")
      .length,
    10,
  );
});

test("scabiosa: fused corolla stays continuous around five unequal lobes rather than becoming a ray petal", () => {
  for (const bloom of [0, 0.5, 1]) {
    const a = scabiosaCorolla(0, 1, bloom),
      b = scabiosaCorolla(1, 1, bloom);
    a.forEach((value, i) => assert.ok(Math.abs(value - b[i]) < 1e-10));
  }
  const radial = (u: number) => {
    const p = scabiosaCorolla(u, 1, 1);
    return Math.hypot(p[0], p[2]);
  };
  const peaks: number[] = [];
  for (let i = 0; i < 1000; i++)
    if (
      radial(i / 1000) > radial((i - 1) / 1000) &&
      radial(i / 1000) > radial((i + 1) / 1000)
    )
      peaks.push(i);
  assert.equal(peaks.length, 5);
  assert.ok(radial(0) > radial(0.4) * 1.7);
  assert.ok(Math.abs(radial(0.2) - radial(0.8)) < 1e-10);
  const desktop = specimenCages(SCABIOSA_MODEL, false).patches.reduce(
    (sum, p) => sum + p.open.length / 3,
    0,
  );
  const mobile = specimenCages(SCABIOSA_MODEL, true).patches.reduce(
    (sum, p) => sum + p.open.length / 3,
    0,
  );
  assert.equal(desktop, 1384);
  assert.equal(mobile, 462);
});

test("scabiosa: marginal reproductive organs follow the moving corolla insertion through reversed bloom", () => {
  const group = SCABIOSA_MODEL.instances![0];
  group.poses.forEach((pose, i) => {
    assert.equal(
      petalOpenness(0.5, pose.delay, pose.phase),
      petalOpenness(0.5, SCABIOSA_MODEL.surfaces[i].delay!, i * 0.31),
      "organ and enclosing corolla opening must match",
    );
    for (const open of [0, 0.5, 1]) {
      const surface = SCABIOSA_MODEL.surfaces[i],
        p = surface.sample(0, 0, open),
        origin = pose.foldedPosition!.map(
          (value, axis) => value + (pose.position[axis] - value) * open,
        );
      assert.ok(Math.abs(p[1] - origin[1]) < 1e-10);
      assert.ok(
        Math.abs(Math.hypot(p[0] - origin[0], p[2] - origin[2]) - 0.017) <
          1e-10,
      );
    }
  });
  for (const group of SCABIOSA_MODEL.instances!) {
    const parts = specimenInstanceGeometry(group, "overview");
    assert.equal(parts.organs.length, 21);
    for (const geometry of [...parts.surfaces, ...parts.organs]) {
      assert.equal(
        geometry.morphAttributes.normal![0].count,
        geometry.getAttribute("normal").count,
      );
      assert.ok(
        Array.from(geometry.morphAttributes.position![0].array).every(
          Number.isFinite,
        ),
      );
    }
    const material = new MeshStandardMaterial(),
      geometry = parts.organs[0],
      mesh = new InstancedMesh(geometry, material, group.poses.length),
      target = new Mesh(geometry, material),
      scratch = new Object3D();
    updateFloretInstances(mesh, target, group.poses, 0, 0, 0, true, scratch);
    const texture = mesh.morphTexture!;
    for (const bloom of [1, 0.5, 0]) {
      updateFloretInstances(
        mesh,
        target,
        group.poses,
        bloom,
        7,
        1,
        true,
        scratch,
      );
      assert.equal(mesh.morphTexture, texture);
    }
    assert.equal(texture.image.height, group.poses.length);
    texture.dispose();
    mesh.dispose();
    material.dispose();
    [...parts.surfaces, ...parts.organs].forEach((g) => g.dispose());
  }
});

test("scabiosa: actual finite-width terminal tissue occludes each closed floret apex rather than leaving a pipe mouth", () => {
  for (const quality of ["overview", "low", "high"] as const) {
    const outer = specimenInstanceGeometry(
        SCABIOSA_MODEL.instances![0],
        quality,
      ),
      inner = specimenInstanceGeometry(SCABIOSA_MODEL.instances![1], quality),
      outerTube = specimenGeometry(SCABIOSA_MODEL.surfaces[0], quality),
      outerOrigin = new Vector3(
        ...SCABIOSA_MODEL.instances![0].poses[0].foldedPosition!,
      ),
      fixtures = [
        [
          ...outer.surfaces.map((geometry) => ({
            geometry,
            origin: new Vector3(),
          })),
          { geometry: outerTube, origin: outerOrigin },
        ],
        inner.surfaces.map((geometry) => ({ geometry, origin: new Vector3() })),
      ];
    for (const fixture of fixtures)
      for (const x of [-0.036, -0.024, -0.012, 0, 0.012, 0.024, 0.036])
        for (const z of [-0.036, -0.024, -0.012, 0, 0.012, 0.024, 0.036]) {
          if (Math.hypot(x, z) > 0.039) continue;
          const ray = new Ray(new Vector3(x, 0.4, z), new Vector3(0, -1, 0)),
            triangle = new Triangle(),
            hit = new Vector3();
          let covered = false;
          for (const { geometry, origin } of fixture) {
            const folded = geometry.morphAttributes.position![0],
              index = geometry.index!.array;
            for (let i = 0; i < index.length && !covered; i += 3) {
              triangle.a.fromBufferAttribute(folded, index[i]).sub(origin);
              triangle.b.fromBufferAttribute(folded, index[i + 1]).sub(origin);
              triangle.c.fromBufferAttribute(folded, index[i + 2]).sub(origin);
              if (
                ray.intersectTriangle(
                  triangle.a,
                  triangle.b,
                  triangle.c,
                  false,
                  hit,
                ) &&
                hit.y > 0.22
              )
                covered = true;
            }
          }
          assert.ok(
            covered,
            `${quality}: closed mouth remains open at ${x},${z}`,
          );
        }
    [
      ...outer.surfaces,
      ...outer.organs,
      ...inner.surfaces,
      ...inner.organs,
      outerTube,
    ].forEach((g) => g.dispose());
  }
});

test("scabiosa: all five terminal sheets stay finite, sealed and nondegenerate in actual low-cost prototypes", () => {
  for (const quality of ["overview", "low", "high"] as const)
    for (const group of SCABIOSA_MODEL.instances!) {
      assert.equal(
        group.surfaces.filter(
          (s) => s.name === "imbricated terminal corolla tissue",
        ).length,
        5,
      );
      const parts = specimenInstanceGeometry(group, quality);
      for (let k = 0; k < group.surfaces.length; k++) {
        if (group.surfaces[k].name !== "imbricated terminal corolla tissue")
          continue;
        const geometry = parts.surfaces[k],
          p = geometry.getAttribute("position"),
          folded = geometry.morphAttributes.position![0],
          index = geometry.index!.array,
          triangle = new Triangle(),
          temp = new Vector3(),
          edges = new Map<string, number>();
        for (const normal of [
          geometry.getAttribute("normal"),
          geometry.morphAttributes.normal![0],
        ])
          for (let i = 0; i < normal.count; i++)
            assert.ok(
              Math.abs(
                Math.hypot(normal.getX(i), normal.getY(i), normal.getZ(i)) - 1,
              ) < 0.002,
            );
        for (let i = 0; i < index.length; i += 3)
          for (let j = 0; j < 3; j++) {
            const a = index[i + j],
              b = index[i + ((j + 1) % 3)],
              key = a < b ? `${a}:${b}` : `${b}:${a}`;
            edges.set(key, (edges.get(key) ?? 0) + 1);
          }
        assert.ok([...edges.values()].every((count) => count === 2));
        for (const open of [0, 0.5, 1]) {
          const vertex = (i: number, output: Vector3) =>
            output
              .fromBufferAttribute(folded, i)
              .lerp(temp.fromBufferAttribute(p, i), open);
          for (let i = 0; i < index.length; i += 3) {
            vertex(index[i], triangle.a);
            vertex(index[i + 1], triangle.b);
            vertex(index[i + 2], triangle.c);
            assert.ok(
              triangle.getArea() > 5e-12,
              `terminal sheet degenerates at bloom ${open}`,
            );
          }
        }
      }
      [...parts.surfaces, ...parts.organs].forEach((g) => g.dispose());
    }
});

test("scabiosa: every instanced tip root stays with its enclosing floret through reverse bloom and ambient bend", () => {
  for (
    let groupIndex = 0;
    groupIndex < SCABIOSA_MODEL.instances!.length;
    groupIndex++
  ) {
    const group = SCABIOSA_MODEL.instances![groupIndex],
      parts = specimenInstanceGeometry(group, "low"),
      material = new MeshStandardMaterial();
    for (let k = 0; k < group.surfaces.length; k++) {
      if (group.surfaces[k].name !== "imbricated terminal corolla tissue")
        continue;
      const tip = groupIndex === 0 ? k : k - 1,
        geometry = parts.surfaces[k],
        p = geometry.getAttribute("position"),
        folded = geometry.morphAttributes.position![0],
        half = p.count / 2,
        mesh = new InstancedMesh(geometry, material, group.poses.length),
        target = new Mesh(geometry, material),
        dummy = new Object3D(),
        matrix = new Matrix4();
      for (const bloom of [0, 0.5, 1, 0.5, 0])
        for (const wind of [0, 1]) {
          updateFloretInstances(
            mesh,
            target,
            group.poses,
            bloom,
            7,
            wind,
            wind === 0,
            dummy,
          );
          group.poses.forEach((pose, i) => {
            mesh.getMatrixAt(i, matrix);
            mesh.getMorphAt(i, target);
            const weight = target.morphTargetInfluences![0],
              open = petalOpenness(bloom, pose.delay, pose.phase),
              root = new Vector3()
                .fromBufferAttribute(p, 3)
                .add(new Vector3().fromBufferAttribute(p, 3 + half))
                .multiplyScalar(0.5),
              closed = new Vector3()
                .fromBufferAttribute(folded, 3)
                .add(new Vector3().fromBufferAttribute(folded, 3 + half))
                .multiplyScalar(0.5);
            root.lerp(closed, weight).applyMatrix4(matrix);
            const expected =
              groupIndex === 0
                ? new Vector3(
                    ...SCABIOSA_MODEL.surfaces[i].sample(tip / 5, 1, open),
                  )
                : new Vector3(
                    ...scabiosaCorolla(tip / 5, 1, open),
                  ).applyMatrix4(matrix);
            assert.ok(
              root.distanceTo(expected) <
                (groupIndex === 0 && wind ? 0.0035 : 1e-6),
              `tip ${tip}, floret ${i}, bloom ${bloom} drifts from its carrier`,
            );
          });
        }
      mesh.morphTexture?.dispose();
      mesh.dispose();
    }
    material.dispose();
    [...parts.surfaces, ...parts.organs].forEach((g) => g.dispose());
  }
});
