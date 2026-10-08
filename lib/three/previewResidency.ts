import type { BufferGeometry, Mesh, Object3D } from "three";

/** Release renderer allocations, retaining CPU attributes, morphs and mesh state. */
export function releaseSceneGeometry(scene: Object3D) {
  const geometries = new Set<BufferGeometry>();
  scene.traverse((object) => {
    const geometry = (object as Mesh).geometry;
    if (geometry) geometries.add(geometry);
  });
  // Three removes native buffers, VAOs and packed morph textures on dispose.
  // BufferGeometry's attribute data remains available for lazy re-upload.
  for (const geometry of geometries) geometry.dispose();
}
