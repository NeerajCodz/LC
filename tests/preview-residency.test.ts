import test from "node:test";
import assert from "node:assert/strict";
import {
  Group,
  Mesh,
  MeshStandardMaterial,
  Scene,
  SphereGeometry,
} from "three";

test("preview residency follows the visible viewport, including partial views", async () => {
  const residency = await import("../lib/three/previewResidency");
  assert.equal(typeof residency.previewIntersectsViewport, "function");
  const visible = residency.previewIntersectsViewport;
  const viewport = { width: 1280, height: 720 };
  assert.equal(
    visible(
      { left: 10, top: 20, width: 300, height: 400 },
      viewport.width,
      viewport.height,
    ),
    true,
  );
  assert.equal(
    visible(
      { left: 10, top: -399, width: 300, height: 400 },
      viewport.width,
      viewport.height,
    ),
    true,
  );
  assert.equal(
    visible(
      { left: 10, top: -400, width: 300, height: 400 },
      viewport.width,
      viewport.height,
    ),
    false,
  );
  assert.equal(
    visible(
      { left: 10, top: 720, width: 300, height: 400 },
      viewport.width,
      viewport.height,
    ),
    false,
  );
  assert.equal(
    visible(
      { left: 1280, top: 20, width: 300, height: 400 },
      viewport.width,
      viewport.height,
    ),
    false,
  );
  assert.equal(
    visible(
      { left: -300, top: 20, width: 300, height: 400 },
      viewport.width,
      viewport.height,
    ),
    false,
  );
  assert.equal(
    visible(
      { left: 10, top: 20, width: 0, height: 400 },
      viewport.width,
      viewport.height,
    ),
    false,
  );
});

test("GPU eviction keeps retained meshes, folded attributes and shared materials intact", async () => {
  const modulePath = "../lib/three/previewResidency";
  const residency = (await import(modulePath).catch(() => null)) as {
    releaseSceneGeometry?: (scene: Scene) => void;
  } | null;
  assert.equal(
    typeof residency?.releaseSceneGeometry,
    "function",
    "retained preview GPU eviction is missing",
  );
  const scene = new Scene(),
    group = new Group(),
    material = new MeshStandardMaterial();
  const geometry = new SphereGeometry(1, 8, 6),
    second = new SphereGeometry(0.2, 6, 4);
  geometry.morphAttributes.position = [
    geometry.getAttribute("position").clone(),
  ];
  geometry.morphAttributes.normal = [geometry.getAttribute("normal").clone()];
  const position = geometry.getAttribute("position"),
    folded = geometry.morphAttributes.position[0],
    normal = geometry.morphAttributes.normal[0];
  const first = new Mesh(geometry, material),
    duplicate = new Mesh(geometry, material),
    other = new Mesh(second, material);
  first.morphTargetInfluences![0] = 0.37;
  group.add(first, duplicate, other);
  scene.add(group);
  const identity = scene.uuid;
  let releases = 0,
    secondaryReleases = 0,
    materialReleases = 0;
  geometry.addEventListener("dispose", () => releases++);
  second.addEventListener("dispose", () => secondaryReleases++);
  material.addEventListener("dispose", () => materialReleases++);
  residency!.releaseSceneGeometry!(scene);
  assert.equal(releases, 1, "shared geometry must release native buffers once");
  assert.equal(secondaryReleases, 1);
  assert.equal(
    materialReleases,
    0,
    "GPU eviction must retain shared shader programs",
  );
  assert.equal(scene.uuid, identity);
  assert.equal(group.children.length, 3);
  assert.equal(first.geometry, geometry);
  assert.equal(geometry.getAttribute("position"), position);
  assert.equal(geometry.morphAttributes.position[0], folded);
  assert.equal(geometry.morphAttributes.normal[0], normal);
  assert.equal(first.morphTargetInfluences![0], 0.37);
  geometry.dispose();
  second.dispose();
  material.dispose();
});
