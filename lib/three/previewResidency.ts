import type { BufferGeometry, Mesh, Object3D } from "three";

/** The stage spans the whole gallery; only viewport intersections need buffers. */
export function previewIntersectsViewport(
  rect: { left: number; top: number; width: number; height: number },
  width: number,
  height: number,
) {
  return (
    rect.width > 0 &&
    rect.height > 0 &&
    rect.left < width &&
    rect.top < height &&
    rect.left + rect.width > 0 &&
    rect.top + rect.height > 0
  );
}

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
