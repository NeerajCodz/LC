import assert from "node:assert/strict";
import test from "node:test";
import {
  Group,
  Mesh,
  MeshDepthMaterial,
  MeshDistanceMaterial,
  ShaderMaterial,
  SphereGeometry,
  Texture,
} from "three";

test("hidden garden program eviction preserves material identities, uniforms and shared textures", async () => {
  const residency = await import("../lib/three/previewResidency");
  assert.equal(typeof residency.releaseSceneMaterialPrograms, "function");
  const atlas = new Texture(),
    material = new ShaderMaterial({ uniforms: { atlas: { value: atlas } } }),
    depth = new MeshDepthMaterial(),
    distance = new MeshDistanceMaterial(),
    geometry = new SphereGeometry(1, 8, 6),
    first = new Mesh(geometry, material),
    duplicate = new Mesh(geometry, [material, material]),
    root = new Group();
  first.customDepthMaterial = depth;
  first.customDistanceMaterial = distance;
  duplicate.customDepthMaterial = depth;
  root.add(first, duplicate);
  const uniforms = material.uniforms,
    compile = material.onBeforeCompile,
    identity = material.uuid,
    released = new Map<string, number>();
  for (const resource of [material, depth, distance, atlas, geometry])
    resource.addEventListener("dispose", () =>
      released.set(resource.uuid, (released.get(resource.uuid) ?? 0) + 1),
    );
  residency.releaseSceneMaterialPrograms(root);
  for (const value of [material, depth, distance])
    assert.equal(released.get(value.uuid), 1);
  assert.equal(released.has(atlas.uuid), false);
  assert.equal(released.has(geometry.uuid), false);
  assert.equal(first.material, material);
  assert.deepEqual(duplicate.material, [material, material]);
  assert.equal(material.uuid, identity);
  assert.equal(material.uniforms, uniforms);
  assert.equal(material.uniforms.atlas.value, atlas);
  assert.equal(material.onBeforeCompile, compile);
  assert.equal(first.customDepthMaterial, depth);
  assert.equal(first.customDistanceMaterial, distance);
  for (const value of [material, depth, distance, atlas, geometry])
    value.dispose();
});
