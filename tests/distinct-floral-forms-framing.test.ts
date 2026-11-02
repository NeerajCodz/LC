import test from "node:test";
import assert from "node:assert/strict";
import {
  Box3,
  DoubleSide,
  Euler,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  Raycaster,
  Vector3,
} from "three";
import type { FlowerType, FlowerStructure, Vec3 } from "../lib/flowers/types";
import { FLOWER_STRUCTURES } from "../lib/flowers/structures";
import {
  specimenGeometry,
  type SpecimenSurface,
} from "../lib/three/specimenModel";
import * as trillium from "../components/flowers/trillium/trilliumLeaf";
import * as datura from "../components/flowers/datura/daturaLeaf";
import * as allium from "../components/flowers/allium/alliumLeaf";
import * as grevillea from "../components/flowers/grevillea/grevilleaLeaf";
import * as calceolaria from "../components/flowers/calceolaria/calceolariaLeaf";
import { DATURA_MODEL } from "../components/flowers/datura/daturaGeometry";
import { flowerCameraPose } from "../lib/flowers/framing";

test("Datura macro rays reach its included anthers and stigma through the actual trumpet mouth", () => {
  const structure = FLOWER_STRUCTURES.datura,
    camera = new Vector3(
      ...flowerCameraPose(structure, structure.headCenter!, 3).position,
    ),
    ray = new Raycaster(),
    target = new Vector3(),
    direction = new Vector3();
  for (const quality of ["overview", "low", "high"] as const) {
    const geometry = specimenGeometry(DATURA_MODEL.surfaces[0], quality),
      material = new MeshBasicMaterial({ side: DoubleSide }),
      wall = new Mesh(geometry, material);
    wall.updateMatrixWorld(true);
    try {
      for (const organ of DATURA_MODEL.organs.filter((o) =>
        /anther|stigma/.test(o.name),
      )) {
        target.set(...organ.points[1]);
        direction.subVectors(target, camera);
        ray.set(camera, direction.normalize());
        ray.far = camera.distanceTo(target) - 0.01;
        assert.equal(
          ray.intersectObject(wall, false).length,
          0,
          `${quality}/${organ.name}: near wall hides included organs`,
        );
      }
    } finally {
      geometry.dispose();
      material.dispose();
    }
  }
});
const studies: {
  slug: FlowerType;
  leaf: SpecimenSurface;
  nodes: { t: number; angle: number; scale?: number; offset?: Vec3 }[];
  tilt: number;
}[] = [
  {
    slug: "trillium",
    leaf: trillium.TRILLIUM_LEAF,
    nodes: trillium.TRILLIUM_FOLIAGE_NODES,
    tilt: trillium.TRILLIUM_LEAF_TILT,
  },
  {
    slug: "datura",
    leaf: datura.DATURA_LEAF,
    nodes: datura.DATURA_FOLIAGE_NODES,
    tilt: datura.DATURA_LEAF_TILT,
  },
  {
    slug: "allium",
    leaf: allium.ALLIUM_LEAF,
    nodes: allium.ALLIUM_FOLIAGE_NODES,
    tilt: allium.ALLIUM_LEAF_TILT,
  },
  {
    slug: "grevillea",
    leaf: grevillea.GREVILLEA_LEAF,
    nodes: grevillea.GREVILLEA_FOLIAGE_NODES,
    tilt: grevillea.GREVILLEA_LEAF_TILT,
  },
  {
    slug: "calceolaria",
    leaf: calceolaria.CALCEOLARIA_LEAF,
    nodes: calceolaria.CALCEOLARIA_LEAF_NODES,
    tilt: calceolaria.CALCEOLARIA_LEAF_TILT,
  },
];
for (const study of studies)
  test(`${study.slug}: actual leaf skins fit the portrait and independent planting clearance`, () => {
    const structure = FLOWER_STRUCTURES[study.slug] as FlowerStructure & {
        plantingRadius?: number;
      },
      declared = structure.portraitBounds!,
      bounds = new Box3(
        new Vector3(...declared.min),
        new Vector3(...declared.max),
      ),
      point = new Vector3();
    let radius = 0;
    for (const quality of ["overview", "low", "high"] as const) {
      const geometry = specimenGeometry(study.leaf, quality);
      try {
        for (const node of study.nodes) {
          const scale = node.scale ?? 1,
            matrix = new Matrix4()
              .makeRotationFromEuler(
                new Euler(study.tilt, node.angle, 0.1, "YXZ"),
              )
              .scale(new Vector3(scale, scale, scale))
              .setPosition(
                0.025 * Math.sin(node.t * Math.PI) + (node.offset?.[0] ?? 0),
                -structure.stemLength * (1 - node.t) + (node.offset?.[1] ?? 0),
                node.offset?.[2] ?? 0,
              )
              .multiply(new Matrix4().makeRotationY(Math.PI));
          for (const attr of [
            geometry.getAttribute("position"),
            geometry.morphAttributes.position![0],
          ])
            for (let i = 0; i < attr.count; i++) {
              point.fromBufferAttribute(attr, i).applyMatrix4(matrix);
              assert.ok(
                bounds.containsPoint(point),
                `${study.slug}: leaf outside portrait ${point.toArray()}`,
              );
              radius = Math.max(radius, Math.hypot(point.x, point.z));
            }
        }
      } finally {
        geometry.dispose();
      }
    }
    assert.ok(
      (structure.plantingRadius ?? 0) > radius,
      `${study.slug}: planting radius must cover actual foliage radius ${radius}`,
    );
  });
