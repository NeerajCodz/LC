import test from "node:test";
import assert from "node:assert/strict";
import { Box3, Matrix4, Object3D, PerspectiveCamera, Vector3 } from "three";
import { FLOWER_TYPES } from "../lib/flowers/types";
import { FLOWER_STRUCTURES } from "../lib/flowers/structures";
import { flowerPortraitPose } from "../lib/flowers/framing";
import {
  specimenGeometry,
  specimenOrganGeometry,
  type SpecimenModel,
} from "../lib/three/specimenModel";
import { specimenInstanceGeometry } from "../lib/three/floretInstances";
import { PANSY_MODEL } from "../components/flowers/pansy/pansyGeometry";
import { AFRICAN_VIOLET_MODEL } from "../components/flowers/african-violet/africanVioletGeometry";
import { BLUEBELL_MODEL } from "../components/flowers/bluebell/bluebellGeometry";
import { HYACINTH_MODEL } from "../components/flowers/hyacinth/hyacinthGeometry";
import { AMARYLLIS_MODEL } from "../components/flowers/amaryllis/amaryllisGeometry";
import { CANNA_MODEL } from "../components/flowers/canna/cannaGeometry";
import { AGAPANTHUS_MODEL } from "../components/flowers/agapanthus/agapanthusGeometry";
import { WISTERIA_MODEL } from "../components/flowers/wisteria/wisteriaGeometry";
import { BOTTLEBRUSH_MODEL } from "../components/flowers/bottlebrush/bottlebrushGeometry";
import { SCABIOSA_MODEL } from "../components/flowers/scabiosa/scabiosaGeometry";
import { HOYA_MODEL } from "../components/flowers/hoya/hoyaGeometry";

import { IMPATIENS_MODEL } from "../components/flowers/impatiens/impatiensGeometry";

import { LUPINE_MODEL } from "../components/flowers/lupine/lupineGeometry";

import { HOLLYHOCK_MODEL } from "../components/flowers/hollyhock/hollyhockGeometry";

import { FRITILLARIA_MODEL } from "../components/flowers/fritillaria/fritillariaGeometry";

import { TUBEROSE_MODEL } from "../components/flowers/tuberose/tuberoseGeometry";

import { IXORA_MODEL } from "../components/flowers/ixora/ixoraGeometry";

const models: Record<string, SpecimenModel> = {
  ixora: IXORA_MODEL,
  tuberose: TUBEROSE_MODEL,
  fritillaria: FRITILLARIA_MODEL,
  hollyhock: HOLLYHOCK_MODEL,
  lupine: LUPINE_MODEL,
  impatiens: IMPATIENS_MODEL,
  hoya: HOYA_MODEL,
  pansy: PANSY_MODEL,
  "african-violet": AFRICAN_VIOLET_MODEL,
  bluebell: BLUEBELL_MODEL,
  hyacinth: HYACINTH_MODEL,
  amaryllis: AMARYLLIS_MODEL,
  canna: CANNA_MODEL,
  agapanthus: AGAPANTHUS_MODEL,
  wisteria: WISTERIA_MODEL,
  bottlebrush: BOTTLEBRUSH_MODEL,
  scabiosa: SCABIOSA_MODEL,
};

test("every catalog portrait with explicit bounds contains its real open and folded floral geometry through all camera presets", () => {
  const dummy = new Object3D();
  for (const type of FLOWER_TYPES) {
    const structure = FLOWER_STRUCTURES[type];
    if (!structure.portraitBounds) continue;
    const model = models[type];
    assert.ok(model, `${type} needs actual anatomy coverage`);
    const actual = new Box3(),
      head = new Matrix4().makeRotationX(structure.headTilt);
    const transform = (
      pose: Pick<
        SpecimenModel["clusters"][number],
        "position" | "rotation" | "scale"
      >,
    ) => {
      dummy.position.set(...pose.position);
      dummy.rotation.set(...pose.rotation);
      dummy.scale.setScalar(pose.scale);
      dummy.updateMatrix();
      return dummy.matrix.clone();
    };
    const clusters = model.clusters.map((c) => transform(c).premultiply(head));
    const include = (
      g: ReturnType<typeof specimenGeometry>,
      matrix: Matrix4,
    ) => {
      g.computeBoundingBox();
      actual.union(g.boundingBox!.clone().applyMatrix4(matrix));
    };
    for (const s of model.surfaces) {
      const g = specimenGeometry(s, "high");
      include(g, clusters[s.cluster]);
      g.dispose();
    }
    for (const o of model.organs) {
      const g = specimenOrganGeometry(o, "high");
      include(g, clusters[o.cluster]);
      g.dispose();
    }
    for (const group of model.instances ?? []) {
      const parts = specimenInstanceGeometry(group, "high");
      for (const g of [...parts.surfaces, ...parts.organs]) {
        for (const pose of group.poses)
          include(
            g,
            new Matrix4().multiplyMatrices(
              clusters[group.cluster],
              transform(pose),
            ),
          );
        g.dispose();
      }
    }
    actual.expandByPoint(new Vector3(0, -structure.stemLength, 0));
    const declared = new Box3(
      new Vector3(...structure.portraitBounds.min),
      new Vector3(...structure.portraitBounds.max),
    );
    assert.ok(
      declared.containsBox(actual),
      `${type}: declared portrait excludes actual anatomy ${JSON.stringify({ min: actual.min.toArray(), max: actual.max.toArray() })}`,
    );
    actual.translate(new Vector3(0, structure.stemLength - 1.78, 0));
    for (const [width, height] of [
      [1280, 800],
      [390, 844],
      [844, 390],
      [320, 1000],
    ])
      for (const angle of [0, Math.PI / 4, Math.PI / 2]) {
        const pose = flowerPortraitPose(
          structure,
          [0, -1.78, 0],
          width / height,
          38,
          angle,
          width >= 700,
        )!;
        const camera = new PerspectiveCamera(38, width / height, 0.1, 45);
        camera.position.set(...pose.position);
        camera.lookAt(...pose.target);
        camera.updateMatrixWorld();
        for (let i = 0; i < 8; i++) {
          const p = new Vector3(
            i & 1 ? actual.max.x : actual.min.x,
            i & 2 ? actual.max.y : actual.min.y,
            i & 4 ? actual.max.z : actual.min.z,
          ).project(camera);
          assert.ok(
            Math.abs(p.x) < 0.79 && Math.abs(p.y) < 0.79 && p.z > -1 && p.z < 1,
            `${type}: preset excludes corner ${p.toArray()}`,
          );
        }
      }
  }
});
