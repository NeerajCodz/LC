import test from "node:test";
import assert from "node:assert/strict";
import type { ReactElement } from "react";
import { Matrix4, Mesh, MeshBasicMaterial, Triangle, Vector3 } from "three";
import { Allium, alliumStructure } from "../components/flowers/allium/Allium";
import { ALLIUM_STALKS } from "../components/flowers/allium/alliumGeometry";
import { DATURA_MODEL } from "../components/flowers/datura/daturaGeometry";
import type { StemProps } from "../components/flowers/Stem";
import type { StemAnatomy } from "../components/flowers/BotanicalStem";
import {
  specimenGeometry,
  specimenOrganGeometry,
  specimenCages,
} from "../lib/three/specimenModel";
import { PetalDynamics } from "../lib/three/petalDynamics";
import {
  bindCageGeometry,
  bindCageRaycast,
  CageDeformation,
} from "../lib/three/petalDeformation";

test("Datura root clearance includes the real texture displacement and changing skin normals", () => {
  const surface = DATURA_MODEL.surfaces.find((s) => s.role === "tube")!,
    triangle = new Triangle(),
    point = new Vector3(),
    closest = new Vector3();
  for (const constrained of [false, true]) {
    const { patches } = specimenCages(DATURA_MODEL, constrained),
      sim = new PetalDynamics(patches, constrained),
      deformation = new CageDeformation(sim),
      geometry = specimenGeometry(surface, "low"),
      material = new MeshBasicMaterial(),
      wall = new Mesh(geometry, material),
      inverses = patches.map(() => new Matrix4()),
      half = geometry.getAttribute("position").count / 2,
      ix = geometry.index!.array;
    bindCageGeometry(geometry, patches[0], 0);
    const release = bindCageRaycast(wall, deformation);
    deformation.setEnabled(true);
    try {
      for (const open of [1, 0.5, 0, 0.5, 1]) {
        sim.setRest(0, open, inverses[0].elements);
        sim.reset();
        for (let frame = 0; frame < 30; frame++)
          sim.step(1 / 60, {
            wind: 2.4,
            pulse: 1,
            time: frame / 60,
            x: 0,
            y: 0.4,
            z: 0.05,
            proximity: 1,
          });
        deformation.update(inverses);
        wall.morphTargetInfluences![0] = 1 - open;
        for (const organ of DATURA_MODEL.organs.filter(
          (o) => o.name === "included datura filament",
        )) {
          const a = organ.points[0],
            b = organ.foldedPoints![0];
          point.set(
            a[0] * open + b[0] * (1 - open),
            a[1] * open + b[1] * (1 - open),
            a[2] * open + b[2] * (1 - open),
          );
          let distance = Infinity;
          for (let i = 0; i < ix.length; i += 3) {
            if (ix[i] < half || ix[i + 1] < half || ix[i + 2] < half) continue;
            wall.getVertexPosition(ix[i], triangle.a);
            wall.getVertexPosition(ix[i + 1], triangle.b);
            wall.getVertexPosition(ix[i + 2], triangle.c);
            distance = Math.min(
              distance,
              triangle.closestPointToPoint(point, closest).distanceTo(point),
            );
          }
          assert.ok(
            distance < 0.002,
            `${constrained}/${open}: rendered skin leaves root by ${distance}`,
          );
        }
      }
    } finally {
      release();
      geometry.dispose();
      material.dispose();
      deformation.dispose();
    }
  }
});

test("Datura supports its filament insertions during detailed deformation while the upper corolla stays free", () => {
  for (const constrained of [false, true]) {
    const { patches } = specimenCages(DATURA_MODEL, constrained),
      sim = new PetalDynamics(patches, constrained),
      patch = patches[0];
    for (let frame = 0; frame < 30; frame++)
      sim.step(1 / 60, {
        wind: 2.4,
        pulse: 1,
        time: frame / 60,
        x: 0,
        y: 0.4,
        z: 0.05,
        proximity: 1,
      });
    for (let flower = 0; flower < 5; flower++) {
      const u = (flower + 0.5) / 5,
        v = 0.25;
      for (const row of [Math.floor(v * patch.rows), Math.ceil(v * patch.rows)])
        for (const column of [
          Math.floor(u * patch.columns),
          Math.ceil(u * patch.columns),
        ]) {
          const node = row * patch.columns + column;
          assert.equal(
            sim.inverseMass[node],
            0,
            "filament root interpolation must stay on supported tissue",
          );
          for (let axis = 0; axis < 3; axis++)
            assert.equal(
              sim.positions[node * 3 + axis],
              sim.rest[node * 3 + axis],
            );
        }
    }
    assert.ok(
      sim.positions.some(
        (value, i) =>
          sim.inverseMass[Math.floor(i / 3)] > 0 &&
          Math.abs(value - sim.rest[i]) > 1e-6,
      ),
      "upper tube must retain a real free response",
    );
  }
});

test("Allium mounts its actual supporting neck on the head attachment path", () => {
  const plant = Allium({}),
    Stem = plant.props.StemComponent as (
      props: StemProps,
    ) => ReactElement<{ anatomy: StemAnatomy }>,
    rendered = Stem({
      type: "allium",
      structure: alliumStructure,
      quality: "low",
      growth: { current: 1 },
      time: { current: 0 },
      wind: 0,
      motion: {
        current: { x: 0, z: 0, drop: 0, contact: 0, contactAngle: 0, air: 0 },
      },
      leaves: true,
    });
  assert.equal(rendered.props.anatomy.headExtras, ALLIUM_STALKS);
  assert.ok(ALLIUM_STALKS[0].points[0][1] < 0);
  assert.ok(ALLIUM_STALKS[0].points.at(-1)![1] > 0);
});

test("Datura filament root caps meet the real inner corolla skin through reverse bloom at every tier", () => {
  const surface = DATURA_MODEL.surfaces.find((s) => s.role === "tube")!,
    filaments = DATURA_MODEL.organs.filter(
      (o) => o.name === "included datura filament",
    ),
    triangle = new Triangle(),
    point = new Vector3(),
    closest = new Vector3();
  for (const quality of [
    "overview",
    "low",
    "medium",
    "high",
    "ultra",
  ] as const) {
    const wall = specimenGeometry(surface, quality),
      p = wall.getAttribute("position"),
      f = wall.morphAttributes.position![0],
      ix = wall.index!.array,
      half = p.count / 2;
    try {
      for (const filament of filaments) {
        const organ = specimenOrganGeometry(filament, quality),
          op = organ.getAttribute("position"),
          of = organ.morphAttributes.position![0],
          cap = op.count - 2;
        try {
          for (const open of [1, 0.5, 0, 0.5, 1]) {
            point.set(
              op.getX(cap) * open + of.getX(cap) * (1 - open),
              op.getY(cap) * open + of.getY(cap) * (1 - open),
              op.getZ(cap) * open + of.getZ(cap) * (1 - open),
            );
            const at = (out: Vector3, i: number) =>
              out.set(
                p.getX(i) * open + f.getX(i) * (1 - open),
                p.getY(i) * open + f.getY(i) * (1 - open),
                p.getZ(i) * open + f.getZ(i) * (1 - open),
              );
            let distance = Infinity;
            for (let k = 0; k < ix.length; k += 3) {
              if (ix[k] < half || ix[k + 1] < half || ix[k + 2] < half)
                continue;
              at(triangle.a, ix[k]);
              at(triangle.b, ix[k + 1]);
              at(triangle.c, ix[k + 2]);
              distance = Math.min(
                distance,
                triangle.closestPointToPoint(point, closest).distanceTo(point),
              );
            }
            assert.ok(
              distance < 0.002,
              `${quality}/${open}: filament insertion is ${distance} from the inner skin`,
            );
          }
        } finally {
          organ.dispose();
        }
      }
    } finally {
      wall.dispose();
    }
  }
});
