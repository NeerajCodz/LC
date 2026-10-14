import test from "node:test";
import assert from "node:assert/strict";
import {
  DoubleSide,
  Group,
  Mesh,
  MeshBasicMaterial,
  Ray,
  Vector3,
} from "three";
import {
  createToreniaStigmaGeometry,
  TORENIA_RENDER_MODEL,
} from "../components/flowers/torenia/toreniaStigmaGeometry";
import {
  createToreniaStigmaProbeScratch,
  probeToreniaStigmaRay,
} from "../components/flowers/torenia/toreniaStigmaProbe";
import { toreniaStigma } from "../components/flowers/torenia/toreniaGeometry";
import {
  specimenGeometry,
  specimenOrganParts,
} from "../lib/three/specimenModel";
test("an exposed inner lamella is actually reachable through the complete generated Torenia mouth", () => {
  const material = new MeshBasicMaterial({ side: DoubleSide }),
    root = new Group(),
    geometry = TORENIA_RENDER_MODEL.surfaces
      .filter((s) => s.cluster === 0)
      .map((s) => specimenGeometry(s, "low"));
  for (const included of [false, true])
    for (const part of specimenOrganParts(
      TORENIA_RENDER_MODEL,
      0,
      "low",
      included,
    ))
      geometry.push(part.geometry);
  for (const g of geometry) {
    const mesh = new Mesh(g, material);
    mesh.updateMorphTargets();
    root.add(mesh);
  }
  const stigma = ([0, 1] as const).map((l) => {
    const g = createToreniaStigmaGeometry(0, l, "low");
    geometry.push(g);
    const mesh = new Mesh(g, material);
    mesh.updateMorphTargets();
    root.add(mesh);
    return mesh;
  });
  root.updateMatrixWorld(true);
  const center = new Vector3(...toreniaStigma(0.5, 0.6, 1, 0)),
    ray = new Ray(
      center.clone().add(new Vector3(0, 0, 0.4)),
      new Vector3(0, 0, -1),
    );
  const scratch = createToreniaStigmaProbeScratch();
  try {
    assert.equal(probeToreniaStigmaRay(ray, stigma, 1, root, scratch), true);
    assert.equal(scratch.result.lobe, 0);
  } finally {
    for (const g of geometry) g.dispose();
    material.dispose();
  }
});
