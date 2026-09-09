import { useEffect, useMemo, useRef, type RefObject } from "react";
import { useActiveFrame as useFrame } from "@/hooks/useActiveFrame";
import { Group, type BufferGeometry } from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import type { Quality, Vec3 } from "@/lib/flowers/types";
import { createOrganicTube } from "@/lib/three/organicTube";
import { GOLDEN_ANGLE, seededRandom } from "@/lib/three/noise";

type StamenSpecies = "lily" | "tulip" | "hibiscus";

/** Curved filaments, paired pollen chambers, and a separate style/stigma. */
export function createStamenHeart(type: StamenSpecies, quality: Quality) {
  const filaments: BufferGeometry[] = [],
    anthers: BufferGeometry[] = [],
    pistils: BufferGeometry[] = [],
    stigmas: BufferGeometry[] = [];
  const random = seededRandom(624),
    detail = quality === "ultra" ? 40 : 26;
  const tube = (
    points: Vec3[],
    radius: number,
    color: string,
    tipColor = color,
  ) =>
    createOrganicTube({
      points,
      radius,
      endRadius: radius * 0.72,
      color,
      tipColor,
      segments: detail,
      sides: 14,
    });
  if (type === "hibiscus") {
    pistils.push(
      tube(
        [
          [0, 0, 0],
          [0.012, 0.42, 0.032],
          [0.035, 0.94, 0.1],
        ],
        0.033,
        "#d86972",
        "#f1b4a2",
      ),
    );
    for (let i = 0; i < 65; i++) {
      const a = i * GOLDEN_ANGLE,
        y = 0.38 + (i / 65) * 0.44,
        r = 0.065 + random() * 0.035;
      const base: Vec3 = [y * 0.035, y, y * 0.1];
      const tip: Vec3 = [
        base[0] + Math.cos(a) * r,
        y + 0.025,
        base[2] + Math.sin(a) * r,
      ];
      filaments.push(
        tube(
          [
            base,
            [(base[0] + tip[0]) / 2, y + 0.01, (base[2] + tip[2]) / 2],
            tip,
          ],
          0.004,
          "#e3a682",
          "#ebd39b",
        ),
      );
      anthers.push(
        createOrganicTube({
          points: [
            [tip[0] - 0.01, tip[1], tip[2]],
            tip,
            [tip[0] + 0.01, tip[1] + 0.006, tip[2]],
          ],
          radius: 0.011,
          endRadius: 0.009,
          color: "#e0aa24",
          tipColor: "#f6cd51",
          grain: 0.13,
          segments: 16,
          sides: 12,
        }),
      );
    }
    for (let i = 0; i < 5; i++) {
      const a = (i * Math.PI * 2) / 5,
        x = 0.035 + Math.cos(a) * 0.055,
        z = 0.1 + Math.sin(a) * 0.055;
      pistils.push(
        tube(
          [
            [0.032, 0.88, 0.092],
            [(x + 0.035) / 2, 0.95, (z + 0.1) / 2],
            [x, 1.015, z],
          ],
          0.009,
          "#ebaca1",
          "#d68083",
        ),
      );
      stigmas.push(
        createOrganicTube({
          points: [
            [x, 1.005, z],
            [x, 1.028, z],
            [x, 1.044, z],
          ],
          radius: 0.024,
          endRadius: 0.024,
          color: "#b3264b",
          tipColor: "#d94a67",
          grain: 0.07,
          segments: 16,
          sides: 16,
        }),
      );
    }
  } else {
    const lily = type === "lily";
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2 + 0.3,
        y = lily ? 0.74 + random() * 0.12 : 0.29 + random() * 0.035,
        z = lily ? 0.29 + random() * 0.035 : 0.14;
      const filament = tube(
        [
          [0, 0, 0],
          [0, y * 0.5, z * 0.37],
          [0, y, z],
        ],
        lily ? 0.011 : 0.007,
        "#b9c68d",
        "#e7dfb2",
      );
      filament.rotateY(a);
      filaments.push(filament);
      for (const sign of [-1, 1]) {
        const points: Vec3[] = lily
          ? [
              [-0.09, y - 0.012, z + sign * 0.014],
              [0, y + 0.006, z + sign * 0.019],
              [0.092, y + 0.016, z + sign * 0.014],
            ]
          : [
              [sign * 0.011, y - 0.035, z],
              [sign * 0.015, y + 0.04, z + 0.006],
              [sign * 0.009, y + 0.115, z],
            ];
        const anther = createOrganicTube({
          points,
          radius: lily ? 0.021 : 0.014,
          endRadius: lily ? 0.017 : 0.012,
          color: lily ? "#925428" : "#302634",
          tipColor: lily ? "#bf863b" : "#584157",
          grain: 0.12,
          flatten: 0.75,
          segments: detail,
          sides: 16,
        });
        anther.rotateY(a);
        anthers.push(anther);
      }
    }
    const height = lily ? 0.97 : 0.4;
    pistils.push(
      tube(
        [
          [0, 0, 0],
          [0.012, height * 0.5, 0.015],
          [0.024, height, 0.03],
        ],
        lily ? 0.016 : 0.027,
        "#91aa64",
        "#bac995",
      ),
    );
    for (let i = 0; i < 3; i++) {
      const a = (i * Math.PI * 2) / 3,
        x = 0.024 + Math.cos(a) * 0.019,
        z = 0.03 + Math.sin(a) * 0.019;
      stigmas.push(
        createOrganicTube({
          points: [
            [0.024, height - 0.009, 0.03],
            [x, height + 0.012, z],
            [x, height + 0.027, z],
          ],
          radius: lily ? 0.029 : 0.023,
          endRadius: lily ? 0.028 : 0.022,
          color: "#9bab6c",
          tipColor: "#c5cf92",
          segments: 16,
          sides: 16,
        }),
      );
    }
  }
  const merge = (parts: BufferGeometry[]) => {
    const result = mergeGeometries(parts);
    parts.forEach((g) => g.dispose());
    return result;
  };
  return {
    filaments: merge(filaments),
    anthers: merge(anthers),
    pistil: merge(pistils),
    stigmas: merge(stigmas),
  };
}

export function StamenHeart({
  type,
  quality,
  bloom,
}: {
  type: StamenSpecies;
  quality: Quality;
  bloom: RefObject<number>;
}) {
  const root = useRef<Group>(null);
  const parts = useMemo(
    () => createStamenHeart(type, quality),
    [type, quality],
  );
  useEffect(
    () => () => Object.values(parts).forEach((g) => g.dispose()),
    [parts],
  );
  useFrame(() => {
    if (root.current)
      root.current.scale.set(
        0.18 + 0.82 * bloom.current,
        0.35 + 0.65 * bloom.current,
        0.18 + 0.82 * bloom.current,
      );
  });
  return (
    <group ref={root}>
      <mesh geometry={parts.filaments} castShadow>
        <meshPhysicalMaterial vertexColors roughness={0.67} />
      </mesh>
      <mesh geometry={parts.anthers} castShadow receiveShadow>
        <meshPhysicalMaterial vertexColors roughness={0.86} />
      </mesh>
      <mesh geometry={parts.pistil} castShadow>
        <meshPhysicalMaterial vertexColors roughness={0.64} />
      </mesh>
      <mesh geometry={parts.stigmas} castShadow>
        <meshPhysicalMaterial vertexColors roughness={0.76} />
      </mesh>
    </group>
  );
}
