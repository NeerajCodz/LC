import { Euler, Matrix4, Quaternion, Vector3 } from "three";
import type { Vec3 } from "@/lib/flowers/types";
import type {
  SpecimenCluster,
  SpecimenModel,
  SpecimenOrgan,
  SpecimenSurface,
} from "@/lib/three/specimenModel";
import { floralStamens } from "@/lib/three/floralStamens";

export const AGAPANTHUS_UMBEL_INSERTION: Vec3 = [0, 0.1, 0];

/** A single continuous perianth: a long tube opening into six deeply separated lobes. */
export function agapanthusFunnel(
  u: number,
  v: number,
  stage: number,
  young = false,
): Vec3 {
  const open = stage * (young ? 0.08 : 1),
    a = u * Math.PI * 2,
    lobe = (0.5 + 0.5 * Math.cos(a * 6)) ** 0.68,
    t = Math.max(0, (v - 0.43) / 0.57),
    closed = 0.014 + 0.047 * Math.sin(v * Math.PI) ** 0.78,
    full = 0.029 + 0.006 * v + (0.125 + 0.17 * lobe) * t ** 1.35,
    r = closed * (1 - open) + full * open,
    y =
      0.73 * v * (1 - open) +
      (0.68 * v - 0.22 * (1 - lobe) * t ** 5 + 0.038 * lobe * t ** 3) * open;
  return [Math.sin(a) * r, y, Math.cos(a) * r];
}

function umbelCluster(i: number): SpecimenCluster {
  const young = i >= 18,
    y = young ? [0.81, 0.93, 0.72][i - 18] : -0.43 + (1.39 * (i + 0.5)) / 18,
    a = young ? 0.48 + (i - 18) * 2.094395102 : i * 2.399963229728653 + 0.2,
    r = Math.sqrt(1 - y * y),
    direction = new Vector3(Math.sin(a) * r, y, Math.cos(a) * r),
    rotation = new Euler().setFromQuaternion(
      new Quaternion().setFromUnitVectors(new Vector3(0, 1, 0), direction),
    ),
    length = young ? 0.62 : 0.59 + 0.06 * Math.sin(i * 0.71) ** 2;
  return {
    position: [
      direction.x * length,
      AGAPANTHUS_UMBEL_INSERTION[1] + direction.y * length,
      direction.z * length,
    ],
    rotation: [rotation.x, rotation.y, rotation.z],
    scale: young ? 0.39 : 0.47 + (i % 3) * 0.016,
    nod: 0.012 + (i % 4) * 0.002,
  };
}

export const AGAPANTHUS_MODEL: SpecimenModel = {
  clusters: Array.from({ length: 21 }, (_, i) => umbelCluster(i)),
  surfaces: [],
  organs: [],
  instances: [],
};

export const AGAPANTHUS_PEDICELS: SpecimenOrgan[] =
  AGAPANTHUS_MODEL.clusters.map((c) => {
    const d = c.position.map(
        (p, axis) => p - AGAPANTHUS_UMBEL_INSERTION[axis],
      ) as Vec3,
      length = Math.hypot(...d),
      direction = d.map((p) => p / length) as Vec3;
    return {
      name: "individual curved umbel pedicel",
      cluster: 0,
      points: [
        AGAPANTHUS_UMBEL_INSERTION,
        [
          direction[0] * length * 0.38,
          AGAPANTHUS_UMBEL_INSERTION[1] + direction[1] * length * 0.38 + 0.055,
          direction[2] * length * 0.38,
        ],
        c.position.map((p, axis) => p - direction[axis] * 0.11) as Vec3,
        c.position,
      ],
      radius: 0.0095,
      endRadius: 0.0072,
      color: "#718a64",
    };
  });
export const AGAPANTHUS_STALKS: SpecimenOrgan[] = [
  {
    name: "scape umbel insertion",
    cluster: 0,
    points: [[0, 0, 0], [0, 0.052, 0], AGAPANTHUS_UMBEL_INSERTION],
    radius: 0.038,
    endRadius: 0.045,
    color: "#6d845a",
  },
  ...AGAPANTHUS_PEDICELS,
];

for (let c = 0; c < AGAPANTHUS_MODEL.clusters.length; c++) {
  const young = c >= 18,
    delay = c * 0.007;
  AGAPANTHUS_MODEL.surfaces.push({
    name: "umbel funnel",
    cluster: c,
    role: "tube",
    periodic: true,
    thickness: 0.012,
    flexible: true,
    cage: [8, 5],
    mobileCage: [6, 2],
    delay,
    compliance: 0.000037,
    shapeCompliance: 0.00031,
    sample: (u, v, stage) => agapanthusFunnel(u, v, stage, young),
  });
  const apicalTip: SpecimenSurface = {
    name: "imbricated tepal apex tissue",
    overviewColumns: 4,
    cluster: c,
    role: "petal",
    thickness: 0.012,
    delay,
    sample: (u, v, stage) => {
      const across = 2 * u - 1,
        angle = across * 0.61,
        rim = agapanthusFunnel(
          angle / (Math.PI * 2),
          1,
          young ? stage : 0,
          young,
        ),
        width = across * (0.006 + 0.008 * Math.sin(v * Math.PI));
      const folded: Vec3 = [
        rim[0] * (1 - v) + v * width,
        rim[1] + 0.035 * v,
        rim[2] * (1 - v) - 0.007 * v,
      ];
      if (young) return folded;
      // Adult lobe ends unfold along existing outer corolla tissue instead
      // of leaving an opaque cap in the mature funnel or changing its outline.
      const unfolded = agapanthusFunnel(
        angle / (Math.PI * 2),
        0.9 + 0.085 * v,
        1,
      );
      return folded.map(
        (p, axis) => p * (1 - stage) + unfolded[axis] * stage,
      ) as Vec3;
    },
  };
  AGAPANTHUS_MODEL.instances!.push({
    name: "six imbricated perianth tips",
    cluster: c,
    surfaces: [apicalTip],
    organs: [],
    poses: Array.from({ length: 6 }, (_, i) => ({
      position: [0, 0, 0],
      rotation: [0, (i * Math.PI) / 3, 0],
      scale: 1,
      delay,
      phase: c * 0.31,
    })),
  });
  const stamens = floralStamens({
    count: 1,
    overviewSides: 3,
    cluster: 0,
    radius: 0.18,
    height: 0.651,
    base: 0.19,
    foldedHeight: 0.56,
    filamentRadius: 0.0045,
    antherLength: 0.063,
    filament: "#c5c9eb",
    anther: "#d8bc76",
  });
  stamens[0].points[0] = [0, 0.19, 0.034];
  stamens[0].points[1] = [0, 0.43, 0.087];
  for (const organ of stamens) {
    organ.foldedPoints = organ.foldedPoints!.map(
      (p) => [p[0] * 0.28, p[1], p[2] * 0.28] as Vec3,
    );
    if (young)
      organ.points = organ.points.map(
        (p, i) =>
          p.map(
            (n, axis) =>
              organ.foldedPoints![i][axis] +
              (n - organ.foldedPoints![i][axis]) * 0.08,
          ) as Vec3,
      );
  }
  AGAPANTHUS_MODEL.instances!.push({
    name: "six retained stamens",
    cluster: c,
    surfaces: [],
    organs: stamens,
    poses: Array.from({ length: 6 }, (_, i) => ({
      position: [0, 0, 0],
      rotation: [0, (i * Math.PI) / 3, 0],
      scale: 1,
      delay,
      phase: c * 0.31,
    })),
  });
  const styleFull: Vec3[] = [
      [0, 0.08, 0],
      [0.003, 0.36, 0],
      [0.006, 0.64, 0.015],
      [0.008, 0.724, 0.022],
    ],
    styleFolded: Vec3[] = [
      [0, 0.08, 0],
      [0, 0.28, 0],
      [0.001, 0.49, 0.004],
      [0.002, 0.604, 0.007],
    ],
    style = young
      ? styleFull.map(
          (p, i) =>
            p.map(
              (n, axis) =>
                styleFolded[i][axis] + (n - styleFolded[i][axis]) * 0.08,
            ) as Vec3,
        )
      : styleFull,
    stigma = style.at(-1)!,
    foldedStigma = styleFolded.at(-1)!;
  AGAPANTHUS_MODEL.organs.push(
    {
      name: "superior ovary",
      cluster: c,
      points: [
        [0, 0.014, 0],
        [0, 0.057, 0],
        [0, 0.098, 0],
      ],
      radius: 0.021,
      endRadius: 0.014,
      color: "#8f9e71",
    },
    {
      name: "central exserted style",
      overviewSides: 3,
      cluster: c,
      points: style,
      foldedPoints: styleFolded,
      radius: 0.0048,
      endRadius: 0.0039,
      color: "#c8ccef",
    },
    {
      name: "small terminal stigma",
      overviewSides: 3,
      cluster: c,
      points: [
        stigma,
        [stigma[0], stigma[1] + 0.009, stigma[2]],
        [stigma[0], stigma[1] + 0.016, stigma[2]],
      ],
      foldedPoints: [
        foldedStigma,
        [foldedStigma[0], foldedStigma[1] + 0.009, foldedStigma[2]],
        [foldedStigma[0], foldedStigma[1] + 0.016, foldedStigma[2]],
      ],
      radius: 0.008,
      endRadius: 0.005,
      color: "#d5d8eb",
    },
  );
}

// The two remnants belong at the one umbel insertion, independent of flower poses.
// Convert their authored shoot coordinates once into the first cluster's local space.
const first = AGAPANTHUS_MODEL.clusters[0],
  inverse = new Matrix4()
    .makeRotationFromEuler(new Euler(...first.rotation))
    .scale(new Vector3(first.scale, first.scale, first.scale))
    .setPosition(...first.position)
    .invert().elements;
for (const side of [-1, 1])
  AGAPANTHUS_MODEL.surfaces.push({
    name: "split papery umbel spathe",
    cluster: 0,
    role: "bract",
    tissue: "disc",
    thickness: 0.012 / first.scale,
    sample: (u, v) => {
      const across = 2 * u - 1,
        w = across * (0.005 + 0.047 * Math.sin(v * Math.PI) ** 0.7),
        x = side * (0.037 + 0.06 * Math.sin(v * Math.PI)) + w,
        y = AGAPANTHUS_UMBEL_INSERTION[1] - 0.29 + 0.34 * v,
        z = side * 0.022 + 0.065 * across * across - 0.06 * v;
      return [
        inverse[0] * x + inverse[4] * y + inverse[8] * z + inverse[12],
        inverse[1] * x + inverse[5] * y + inverse[9] * z + inverse[13],
        inverse[2] * x + inverse[6] * y + inverse[10] * z + inverse[14],
      ];
    },
  });
