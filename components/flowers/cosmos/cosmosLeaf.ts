import { Float32BufferAttribute } from "three";
import type { Quality, Vec3 } from "@/lib/flowers/types";
import { createOrganicTube } from "@/lib/three/organicTube";
import { joinOrgans } from "@/lib/three/floralOrgans";
/** One merged, sealed bipinnate leaf preserves all fine divisions at every quality. */
export function createCosmosLeaf(quality: Quality) {
  const segments = quality === "low" ? 6 : 12,
    sides = quality === "low" ? 5 : 8;
  const tube = (
    points: Vec3[],
    radius: number,
    endRadius: number,
    flatten = 1,
  ) =>
    createOrganicTube({
      points,
      radius,
      endRadius,
      flatten,
      color: "#ffffff",
      segments,
      sides,
      grain: 0.035,
    });
  const parts = [
    tube(
      [
        [0, 0, 0],
        [0, 0.4, 0.01],
        [0, 0.84, 0.035],
      ],
      0.01,
      0.003,
    ),
  ];
  for (const t of [0.18, 0.34, 0.5, 0.66])
    for (const side of [-1, 1]) {
      const len = 0.29 * (1 - t * 0.4);
      parts.push(
        tube(
          [
            [0, t, 0.01],
            [side * len * 0.5, t + 0.075, 0.028],
            [side * len, t + 0.15, 0.04],
          ],
          0.007,
          0.002,
        ),
      );
      for (const f of [0.25, 0.5, 0.75])
        for (const branch of [-1, 1]) {
          const x = side * len * f,
            y = t + 0.15 * f,
            z = 0.01 + 0.03 * f;
          parts.push(
            tube(
              [
                [x, y, z],
                [x + side * 0.033, y + branch * 0.052, z + 0.005],
                [x + side * 0.059, y + branch * 0.1, z + 0.012],
              ],
              0.006,
              0.0012,
              0.4,
            ),
          );
        }
    }
  const g = joinOrgans(parts),
    p = g.getAttribute("position"),
    n = g.getAttribute("normal"),
    side = new Float32Array(p.count);
  for (let i = 0; i < p.count; i++) side[i] = n.getZ(i) >= 0 ? 1 : -1;
  g.setAttribute("tissueSide", new Float32BufferAttribute(side, 1));
  g.setAttribute(
    "color",
    new Float32BufferAttribute(new Float32Array(p.count * 3).fill(1), 3),
  );
  const folded = g.clone(),
    fp = folded.getAttribute("position");
  for (let i = 0; i < fp.count; i++) {
    const x = fp.getX(i);
    fp.setXYZ(i, x * 0.26, fp.getY(i) * 0.96, fp.getZ(i) + Math.abs(x) * 0.22);
  }
  folded.computeVertexNormals();
  g.morphAttributes.position = [fp];
  g.morphAttributes.normal = [folded.getAttribute("normal")];
  folded.dispose();
  g.computeBoundingSphere();
  return g;
}
