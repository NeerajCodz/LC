import { Vector3 } from "three";
import type { Quality, Vec3 } from "@/lib/flowers/types";
import type { SpecimenOrgan } from "@/lib/three/specimenModel";
import { seededRandom } from "@/lib/three/noise";
import { createHollyhockLeaf } from "./hollyhockLeaf";

/** Five-armed stellate trichomes, attached to actual abaxial vertices in both poses. */
export function hollyhockLeafHairs(quality: Quality): SpecimenOrgan[] {
  const leaf = createHollyhockLeaf(quality),
    random = seededRandom(7319),
    count = { overview: 1, low: 3, medium: 5, high: 8, ultra: 12 }[quality],
    positions = leaf.getAttribute("position"),
    normals = leaf.getAttribute("normal"),
    folded = leaf.morphAttributes.position![0],
    foldedNormals = leaf.morphAttributes.normal![0],
    uv = leaf.getAttribute("uv"),
    eligible: number[] = [],
    organs: SpecimenOrgan[] = [];
  try {
    for (let i = positions.count / 2; i < positions.count; i++)
      if (
        uv.getX(i) > 0.15 &&
        uv.getX(i) < 0.85 &&
        uv.getY(i) > 0.16 &&
        uv.getY(i) < 0.84
      )
        eligible.push(i);
    for (let star = 0; star < count; star++) {
      const index = eligible[Math.floor(random() * eligible.length)],
        angle = random() * Math.PI * 2,
        length = 0.014 + random() * 0.007;
      const pose = (closed: boolean) => {
        const normal = new Vector3()
            .fromBufferAttribute(closed ? foldedNormals : normals, index)
            .normalize(),
          root = new Vector3()
            .fromBufferAttribute(closed ? folded : positions, index)
            .addScaledVector(normal, -0.00015),
          hub = root.clone().addScaledVector(normal, 0.003),
          tangent = new Vector3(1, 0, 0)
            .addScaledVector(normal, -normal.x)
            .normalize(),
          cross = new Vector3().crossVectors(normal, tangent).normalize();
        const arms = Array.from({ length: 5 }, (_, arm) => {
          const a = angle + (arm * Math.PI * 2) / 5,
            direction = tangent
              .clone()
              .multiplyScalar(Math.cos(a))
              .addScaledVector(cross, Math.sin(a));
          return [
            hub.toArray(),
            hub
              .clone()
              .addScaledVector(direction, length * 0.55)
              .addScaledVector(normal, 0.001)
              .toArray(),
            hub
              .clone()
              .addScaledVector(direction, length)
              .addScaledVector(normal, 0.0005)
              .toArray(),
          ] as Vec3[];
        });
        return [[root.toArray(), hub.toArray()] as Vec3[], ...arms];
      };
      const full = pose(false),
        closed = pose(true);
      for (let part = 0; part < full.length; part++)
        organs.push({
          name:
            part === 0 ? "stellate trichome stalk" : "stellate trichome arm",
          cluster: 0,
          points: full[part],
          foldedPoints: closed[part],
          radius: part === 0 ? 0.00085 : 0.0007,
          endRadius: part === 0 ? 0.0007 : 0.0002,
          overviewSides: 3,
          color: "#bac4a2",
        });
    }
    return organs;
  } finally {
    leaf.dispose();
  }
}
