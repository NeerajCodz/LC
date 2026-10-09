import type { BufferGeometry, Material, Mesh, Object3D } from "three";

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

/** Evict hidden plants' program references without disposing their shared atlas. */
export function releaseSceneMaterialPrograms(scene: Object3D) {
  const materials = new Set<Material>();
  scene.traverse((object) => {
    const mesh = object as Mesh;
    for (const material of [
      ...(Array.isArray(mesh.material) ? mesh.material : [mesh.material]),
      mesh.customDepthMaterial,
      mesh.customDistanceMaterial,
    ])
      if (material) materials.add(material);
  });
  // Three drops each material's native program references. Uniforms, texture
  // objects and hooks remain intact for lazy recompilation on garden return.
  for (const material of materials) material.dispose();
}
