import test from "node:test";
import assert from "node:assert/strict";
import { Vector3, type BufferAttribute } from "three";
import { createToreniaStigmaGeometry } from "../components/flowers/torenia/toreniaStigmaGeometry";

test("torenia: actual stigma skin normals follow triangle orientation throughout bloom and touch closure", () => {
  const a = new Vector3(),
    b = new Vector3(),
    c = new Vector3(),
    edge = new Vector3(),
    face = new Vector3(),
    normal = new Vector3(),
    vertexNormal = new Vector3();
  for (const quality of ["overview", "low", "medium", "high", "ultra"] as const)
    for (const cluster of [0, 3])
      for (const lobe of [0, 1] as const) {
        const geometry = createToreniaStigmaGeometry(cluster, lobe, quality),
          position = geometry.getAttribute("position") as BufferAttribute,
          normals = geometry.getAttribute("normal") as BufferAttribute,
          half = position.count / 2,
          index = geometry.index!;
        try {
          for (const open of [0, 0.25, 0.5, 0.75, 1])
            for (const closure of [0, 0.5, 1]) {
              const foldedWeight = 1 - open,
                closureWeight = closure * open,
                baseWeight = 1 - foldedWeight - closureWeight,
                pose = (
                  attribute: BufferAttribute,
                  targets: typeof geometry.morphAttributes.position,
                  i: number,
                  result: Vector3,
                ) => {
                  result
                    .fromBufferAttribute(attribute, i)
                    .multiplyScalar(baseWeight);
                  vertexNormal.fromBufferAttribute(targets![0], i);
                  result.addScaledVector(vertexNormal, foldedWeight);
                  vertexNormal.fromBufferAttribute(targets![1], i);
                  result.addScaledVector(vertexNormal, closureWeight);
                };
              for (let t = 0; t < index.count; t += 3) {
                const ia = index.getX(t),
                  ib = index.getX(t + 1),
                  ic = index.getX(t + 2);
                // Cut walls average adjacent skin normals and have a distinct perimeter role.
                if (ia < half !== ib < half || ia < half !== ic < half)
                  continue;
                pose(position, geometry.morphAttributes.position, ia, a);
                pose(position, geometry.morphAttributes.position, ib, b);
                pose(position, geometry.morphAttributes.position, ic, c);
                face.subVectors(b, a).cross(edge.subVectors(c, a));
                normal.set(0, 0, 0);
                for (const i of [ia, ib, ic]) {
                  // Keep the interpolation identical to Three's two morph-target weights.
                  a.fromBufferAttribute(normals, i).multiplyScalar(baseWeight);
                  b.fromBufferAttribute(geometry.morphAttributes.normal![0], i);
                  a.addScaledVector(b, foldedWeight);
                  b.fromBufferAttribute(geometry.morphAttributes.normal![1], i);
                  normal.add(a.addScaledVector(b, closureWeight));
                }
                assert.ok(
                  face.dot(normal) > 0,
                  `${quality}, cluster ${cluster}, lobe ${lobe}, bloom ${open}, closure ${closure}: skin triangle ${t / 3} reverses its interpolated normal`,
                );
              }
            }
        } finally {
          geometry.dispose();
        }
      }
});
