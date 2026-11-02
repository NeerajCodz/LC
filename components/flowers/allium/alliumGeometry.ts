import { Euler, Quaternion, Vector3 } from "three";
import type { Vec3 } from "@/lib/flowers/types";
import { floralStamens } from "@/lib/three/floralStamens";
import type {
  SpecimenInstanceGroup,
  SpecimenInstancePose,
  SpecimenModel,
  SpecimenOrgan,
  SpecimenSurface,
} from "@/lib/three/specimenModel";

export const ALLIUM_HEAD_CENTER: Vec3 = [0, 0.2, 0];
export const ALLIUM_INSERTION: Vec3 = [0, 0.08, 0];
/** Authored display density, not a species-wide floret count. */
export const ALLIUM_FLORET_COUNT = 180;

/** Six genuinely separate tepals; no continuous wall spans their clefts. */
export function alliumTepal(
  index: number,
  u: number,
  v: number,
  open: number,
): Vec3 {
  const angle = (index * Math.PI) / 3,
    across = 2 * u - 1,
    width = across * (0.0015 + 0.038 * Math.sin(Math.PI * v) ** 0.72),
    radius =
      0.013 + 0.151 * v * open + 0.011 * Math.sin(Math.PI * v) * (1 - open),
    y =
      0.16 * v * (1 - open) +
      (0.025 * v -
        0.04 * v * v +
        0.012 * across * across * Math.sin(Math.PI * v)) *
        open;
  return [
    Math.sin(angle) * radius + Math.cos(angle) * width,
    y,
    Math.cos(angle) * radius - Math.sin(angle) * width,
  ];
}

const surfaces: SpecimenSurface[] = Array.from({ length: 6 }, (_, i) => ({
  name: "separate pointed allium tepal",
  cluster: 0,
  role: "petal",
  thickness: 0.0035,
  overviewColumns: 2,
  overviewRows: 3,
  sample: (u, v, o) => alliumTepal(i, u, v, o),
}));
const stamens = floralStamens({
  count: 6,
  cluster: 0,
  radius: 0.048,
  height: 0.115,
  base: 0.012,
  foldedHeight: 0.126,
  filamentRadius: 0.0024,
  antherLength: 0.018,
  filament: "#d8c8ee",
  anther: "#af7fc7",
  overviewSides: 3,
});
for (const o of stamens)
  o.foldedPoints = o.foldedPoints!.map(
    (p) => [p[0] * 0.6, p[1], p[2] * 0.6] as Vec3,
  );
const organs: SpecimenOrgan[] = [
  ...stamens,
  {
    name: "superior ovary",
    cluster: 0,
    points: [
      [0, -0.008, 0],
      [0, 0.018, 0],
      [0, 0.042, 0],
    ],
    radius: 0.016,
    endRadius: 0.01,
    color: "#84966b",
    overviewSides: 4,
  },
  {
    name: "central style",
    cluster: 0,
    points: [
      [0, 0.037, 0],
      [0.002, 0.087, 0],
      [0.004, 0.138, 0],
    ],
    foldedPoints: [
      [0, 0.037, 0],
      [0, 0.079, 0],
      [0, 0.132, 0],
    ],
    radius: 0.0028,
    endRadius: 0.0022,
    color: "#dbd0ec",
    overviewSides: 3,
  },
  {
    name: "small terminal stigma",
    cluster: 0,
    points: [
      [0.004, 0.138, 0],
      [0.004, 0.143, 0],
      [0.004, 0.146, 0],
    ],
    foldedPoints: [
      [0, 0.132, 0],
      [0, 0.137, 0],
      [0, 0.14, 0],
    ],
    radius: 0.004,
    endRadius: 0.0027,
    color: "#c2b4d8",
    overviewSides: 3,
  },
];
export const ALLIUM_FLORET: SpecimenInstanceGroup = {
  name: "complete six-tepalled allium flowers",
  cluster: 0,
  surfaces,
  organs,
  poses: [],
};

function pose(i: number): SpecimenInstancePose {
  const y = 1 - (2 * (i + 0.5)) / ALLIUM_FLORET_COUNT,
    a = i * 2.399963229728653,
    r = Math.sqrt(1 - y * y),
    direction = new Vector3(Math.sin(a) * r, y, Math.cos(a) * r),
    euler = new Euler().setFromQuaternion(
      new Quaternion().setFromUnitVectors(new Vector3(0, 1, 0), direction),
    ),
    radius = 0.78 + 0.018 * Math.sin(i * 1.71);
  return {
    position: [
      direction.x * radius,
      ALLIUM_HEAD_CENTER[1] + direction.y * radius,
      direction.z * radius,
    ],
    rotation: [euler.x, euler.y, euler.z],
    scale: 0.94 + (i % 5) * 0.025,
    delay: 0.025 + (i % 7) * 0.01,
    phase: i * 0.71,
  };
}
// Distribute the twelve contact flowers over the globe rather than one contiguous cap.
const allPoses = Array.from({ length: ALLIUM_FLORET_COUNT }, (_, i) => pose(i)),
  selected = new Set(Array.from({ length: 12 }, (_, i) => i * 15 + 7)),
  main = allPoses.filter((_, i) => selected.has(i)),
  micro = allPoses.filter((_, i) => !selected.has(i)),
  ordered = [...main, ...micro];
export const ALLIUM_PEDICELS: SpecimenOrgan[] = ordered.map((p, i) => {
  const d = new Vector3(0, 1, 0).applyEuler(new Euler(...p.rotation));
  return {
    name: "real radial umbel pedicel",
    cluster: 0,
    points: [
      ALLIUM_INSERTION,
      [
        p.position[0] * 0.44,
        0.08 + (p.position[1] - 0.08) * 0.44 + 0.015 * Math.sin(i),
        p.position[2] * 0.44,
      ],
      [
        p.position[0] - d.x * 0.08,
        p.position[1] - d.y * 0.08,
        p.position[2] - d.z * 0.08,
      ],
      p.position,
    ],
    radius: 0.0045,
    endRadius: 0.0032,
    color: "#9c91a3",
    tipColor: "#9b76af",
    overviewSides: 3,
  };
});
export const ALLIUM_STALKS: SpecimenOrgan[] = [
  {
    name: "scape to umbel insertion",
    cluster: 0,
    points: [[0, -0.08, 0], [0, 0.015, 0], ALLIUM_INSERTION],
    radius: 0.036,
    endRadius: 0.045,
    color: "#738857",
  },
];
export const ALLIUM_MODEL: SpecimenModel = {
  ambientSurfaceBatching: true,
  clusters: [
    { position: [0, 0, 0], rotation: [0, 0, 0], scale: 1, nod: 0 },
    ...main.map((p) => ({
      position: p.position,
      rotation: p.rotation,
      scale: p.scale,
      nod: 0.007,
    })),
  ],
  surfaces: [],
  organs: [...ALLIUM_PEDICELS],
  instances: [{ ...ALLIUM_FLORET, poses: micro }],
};
for (let c = 1; c <= main.length; c++) {
  ALLIUM_MODEL.surfaces.push(
    ...surfaces.map((s) => ({
      ...s,
      cluster: c,
      flexible: true,
      cage: [2, 3] as [number, number],
      mobileCage: [1, 2] as [number, number],
      delay: main[c - 1].delay,
      compliance: 0.00003,
      shapeCompliance: 0.0002,
    })),
  );
  ALLIUM_MODEL.organs.push(...organs.map((o) => ({ ...o, cluster: c })));
}
for (const side of [-1, 1])
  ALLIUM_MODEL.surfaces.push({
    name: "papery basal spathe remnant",
    cluster: 0,
    role: "bract",
    tissue: "disc",
    thickness: 0.007,
    overviewColumns: 3,
    overviewRows: 3,
    sample: (u, v) => {
      const across = 2 * u - 1,
        width = across * (0.003 + 0.052 * Math.sin(v * Math.PI));
      return [
        side * (0.035 + 0.065 * Math.sin(v * Math.PI)) + width,
        0.06 - 0.28 * v,
        side * 0.025 + 0.05 * across * across - 0.06 * v,
      ];
    },
  });
