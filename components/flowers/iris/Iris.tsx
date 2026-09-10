import { useMemo } from "react";
import type { FlowerProps, FlowerStructure, Vec3 } from "@/lib/flowers/types";
import { BASE_STRUCTURE, whorl } from "@/lib/flowers/structure";
import { FlowerPlant } from "../FlowerPlant";
import { OrganAssembly, type FlowerOrgansProps } from "../FloralParts";
import { joinOrgans, organTube } from "@/lib/three/floralOrgans";
export const irisStructure: FlowerStructure = {
  ...BASE_STRUCTURE,
  headTilt: 0.15,
  headCenter: [0, 0.35, 0],
  headRadius: 1.5,
  leafCount: 4,
  roughness: 0.65,
  layers: [
    whorl(
      3,
      0.05,
      0,
      1.22,
      {
        length: 1.4,
        width: 0.85,
        cup: 0.03,
        curl: 0.68,
        edge: 0.1,
        ripple: 0.045,
        roundness: 0.2,
        thickness: 0.014,
      },
      { offset: 0, variation: 0.04 },
    ),
    whorl(
      3,
      0.04,
      0.08,
      0.12,
      {
        length: 1.35,
        width: 0.8,
        cup: 0.18,
        curl: -0.05,
        edge: 0.13,
        ripple: 0.04,
        roundness: 0.2,
        thickness: 0.018,
      },
      { offset: Math.PI / 3, delay: 0.13, variation: 0.06 },
    ),
  ],
};
function IrisBeards({ quality, bloom }: FlowerOrgansProps) {
  const geometry = useMemo(() => {
    const parts = [];
    for (let k = 0; k < 3; k++) {
      const a = (k * Math.PI * 2) / 3;
      const pose = (x: number, y: number, z: number): Vec3 => [
        Math.cos(a) * x + Math.sin(a) * z,
        y,
        -Math.sin(a) * x + Math.cos(a) * z,
      ];
      for (let i = 0; i < 60; i++) {
        const t = 0.19 + (i / 60) * 0.29,
          u = Math.sin(i * 2.4) * 0.055,
          py = 1.4 * t,
          pz = 1.4 * (0.03 * t * t + 0.68 * t ** 5);
        const y = py * Math.cos(1.22) - pz * Math.sin(1.22),
          z = py * Math.sin(1.22) + pz * Math.cos(1.22) + 0.05;
        parts.push(
          organTube(
            [
              pose(u, y, z),
              pose(u, y + 0.028, z + 0.009),
              pose(u + 0.003, y + 0.045, z + 0.015),
            ],
            0.0035,
            "#e8bb45",
            quality,
            0.0008,
          ),
        );
      }
    }
    return joinOrgans(parts);
  }, [quality]);
  return <OrganAssembly geometry={geometry} bloom={bloom} />;
}
export function Iris(props: Omit<FlowerProps, "type">) {
  return (
    <FlowerPlant
      {...props}
      type="iris"
      structure={irisStructure}
      Organs={IrisBeards}
    />
  );
}
