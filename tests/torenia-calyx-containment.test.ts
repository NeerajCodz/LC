import test from "node:test";
import assert from "node:assert/strict";
import { DoubleSide, Mesh, MeshBasicMaterial, Raycaster, Vector3 } from "three";
import { TORENIA_MODEL } from "../components/flowers/torenia/toreniaGeometry";
import { specimenGeometry } from "../lib/three/specimenModel";

for (const quality of ["overview", "low", "medium", "high", "ultra"] as const)
  for (const open of [0, 0.5, 1])
    test(`torenia: ${quality} calyx inner skin stays outside the corolla at ${open} bloom`, () => {
      const material = new MeshBasicMaterial({ side: DoubleSide }),
        ray = new Raycaster(),
        origin = new Vector3(),
        direction = new Vector3();
      try {
        // Include one persistent young bud as well as the flowering corolla.
        for (const cluster of [0, 3]) {
          const tube = TORENIA_MODEL.surfaces.find(
              (surface) =>
                surface.cluster === cluster && surface.role === "tube",
            )!,
            calyx = TORENIA_MODEL.surfaces.find(
              (surface) =>
                surface.cluster === cluster && surface.role === "calyx",
            )!,
            corollaMesh = new Mesh(specimenGeometry(tube, quality), material),
            calyxMesh = new Mesh(specimenGeometry(calyx, quality), material);
          for (const mesh of [corollaMesh, calyxMesh]) {
            mesh.updateMorphTargets();
            mesh.morphTargetInfluences![0] = 1 - open;
            mesh.updateMatrixWorld(true);
          }
          try {
            let checked = 0,
              smallestGap = Infinity,
              worstProbe = "";
            // Stay above the root insertion, checking both the body and distal rim.
            for (const z of [0.1, 0.12, 0.18, 0.24, 0.29, 0.32, 0.35, 0.36])
              for (let sector = 0; sector < 20; sector++) {
                // Off-grid rays avoid exact shared-edge intersection ambiguity.
                const angle = ((sector + 0.37) / 20) * Math.PI * 2;
                origin.set(0, 0, z);
                direction.set(Math.cos(angle), Math.sin(angle), 0);
                ray.set(origin, direction);
                const calyxHits = ray.intersectObject(calyxMesh, false);
                // The winged distal edge ends before this z in some directions.
                if (!calyxHits.length) continue;
                const corollaHits = ray.intersectObject(corollaMesh, false);
                assert.ok(
                  corollaHits.length,
                  "the calyx body must surround a real corolla wall",
                );
                const gap =
                  calyxHits[0].distance - corollaHits.at(-1)!.distance;
                if (gap < smallestGap) {
                  smallestGap = gap;
                  worstProbe = `cluster=${cluster}, z=${z}, angle=${angle.toFixed(4)}`;
                }
                checked++;
              }
            assert.ok(
              checked >= 60,
              "the generated calyx must retain substantial body coverage",
            );
            assert.ok(
              smallestGap > 0.0005,
              `calyx inner skin overlaps the outer corolla by ${(-smallestGap).toFixed(5)} at ${worstProbe}`,
            );
          } finally {
            corollaMesh.geometry.dispose();
            calyxMesh.geometry.dispose();
          }
        }
      } finally {
        material.dispose();
      }
    });
