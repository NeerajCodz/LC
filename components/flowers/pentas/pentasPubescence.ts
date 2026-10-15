import { Vector3 } from "three";
import type { Quality, Vec3 } from "@/lib/flowers/types";
import type { SpecimenOrgan, SpecimenSurface } from "@/lib/three/specimenModel";
import { createOrganicTube } from "@/lib/three/organicTube";
import { seededRandom } from "@/lib/three/noise";

/** Basal rim and distal lobe hairs use landmarks retained at every axial tessellation. */
export function pentasCalyxHairs(
  cluster: number,
  sample: SpecimenSurface["sample"],
): SpecimenOrgan[] {
  const random = seededRandom(5149 + cluster);
  return Array.from({ length: 3 }, (_, i) => {
    const distal = i === 2,
      u = distal ? 0 : (i + 1) / 3,
      a = u * Math.PI * 2,
      root = sample(u, distal ? 1 : 0, 1),
      length = 0.011 + random() * 0.007;
    return {
      name: "pentas calyx hair",
      cluster,
      fine: !distal,
      bloomMorph: false,
      points: [
        root,
        [
          root[0] + Math.sin(a) * length,
          root[1] + 0.005,
          root[2] + Math.cos(a) * length,
        ],
      ],
      radius: 0.0008,
      endRadius: 0.0002,
      overviewSides: 3,
      color: "#c2cba7",
    };
  });
}

/** Real shoot vertices supply the roots; BotanicalStem merges and deforms these extras. */
export function pentasYoungStemHairs(
  quality: Quality,
  length: number,
  radius: number,
): SpecimenOrgan[] {
  const low = quality === "overview" || quality === "low",
    segments = low ? 40 : 80,
    sides = low ? 10 : 18,
    stem = createOrganicTube({
      points: [
        [0, -length, 0],
        [0.025, -length * 0.55, 0],
        [0, 0, 0],
      ],
      radius: radius * 1.2,
      endRadius: radius,
      segments,
      sides,
      grain: 0.05,
    }),
    random = seededRandom(7341),
    count = { overview: 4, low: 8, medium: 12, high: 18, ultra: 24 }[quality],
    positions = stem.getAttribute("position"),
    normals = stem.getAttribute("normal");
  try {
    return Array.from({ length: count }, () => {
      const ring = Math.floor(segments * (0.66 + random() * 0.29)),
        vertex = ring * sides + Math.floor(random() * sides),
        root = new Vector3().fromBufferAttribute(positions, vertex),
        normal = new Vector3().fromBufferAttribute(normals, vertex).normalize(),
        tip = root.clone().addScaledVector(normal, 0.013 + random() * 0.008);
      tip.y += 0.003;
      return {
        name: "pentas young stem hair",
        cluster: 0,
        points: [root.toArray(), tip.toArray()] as Vec3[],
        radius: 0.0008,
        endRadius: 0.0002,
        color: "#bdc8a3",
      };
    });
  } finally {
    stem.dispose();
  }
}
