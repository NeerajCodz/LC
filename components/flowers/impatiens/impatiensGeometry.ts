import type { Vec3 } from "@/lib/flowers/types";
import type { SpecimenModel, SpecimenOrgan } from "@/lib/three/specimenModel";

/** One continuous sepal wall: broad shallow boat, narrow recurved nectar spur. */
export function impatiensSpurredSepal(
  u: number,
  v: number,
  stage: number,
): Vec3 {
  const a = u * Math.PI * 2,
    boat = Math.max(0, 1 - v / 0.29),
    radius = 0.009 + 0.02 * (1 - v) + 0.18 * boat ** 1.5,
    x = Math.cos(a) * radius * (0.6 + 0.4 * stage),
    y = 0.14 - 0.98 * v,
    curve = -0.055 - 0.22 * Math.sin(Math.PI * v) + 0.045 * v ** 4;
  return [x, y, curve + Math.sin(a) * radius * (0.48 + 0.2 * boat)];
}

export const IMPATIENS_MODEL: SpecimenModel = {
  clusters: [
    {
      position: [-0.44, 0.15, 0.03],
      rotation: [1.22, -0.28, -0.17],
      scale: 0.82,
      nod: 0.041,
    },
    {
      position: [0.42, 0.47, -0.05],
      rotation: [1.1, 0.34, 0.12],
      scale: 0.78,
      nod: 0.036,
    },
    {
      position: [-0.06, 0.79, -0.08],
      rotation: [1.03, -0.1, -0.06],
      scale: 0.72,
      nod: 0.033,
    },
    {
      position: [0.26, 0.94, -0.12],
      rotation: [0.6, 0.38, 0.18],
      scale: 0.41,
      nod: 0.017,
    },
    {
      position: [-0.24, 1.06, -0.07],
      rotation: [0.48, -0.33, -0.18],
      scale: 0.32,
      nod: 0.014,
    },
  ],
  surfaces: [],
  organs: [],
};

export const IMPATIENS_STALKS: SpecimenOrgan[] = [
  {
    name: "succulent branching upper shoot",
    cluster: 0,
    points: [
      [0, -0.21, 0],
      [0.018, 0.34, 0],
      [0, 0.83, -0.08],
      [0.012, 1.09, -0.06],
    ],
    radius: 0.041,
    endRadius: 0.019,
    color: "#8d8e66",
  },
  ...IMPATIENS_MODEL.clusters.map((c): SpecimenOrgan => ({
    name: "axillary flower pedicel",
    cluster: 0,
    points: [
      [0, c.position[1] - 0.18, -0.04],
      [c.position[0] * 0.55, c.position[1] - 0.07, c.position[2] * 0.55],
      c.position,
    ],
    radius: 0.016,
    endRadius: 0.01,
    color: "#aa9e79",
  })),
];

for (let cluster = 0; cluster < 5; cluster++) {
  const young = cluster >= 3,
    maturity = (stage: number) => stage * (young ? 0.08 : 1);
  IMPATIENS_MODEL.surfaces.push({
    name: "dorsal crested petal",
    cluster,
    role: "petal",
    thickness: 0.011,
    flexible: true,
    cage: [4, 7],
    mobileCage: [3, 4],
    delay: cluster * 0.04,
    sample: (u, v, stage) => {
      const w = 2 * u - 1,
        open = maturity(stage),
        width = 0.009 + 0.34 * Math.sin(Math.PI * v) ** 0.68,
        notch = 1 - 0.1 * Math.exp(-w * w * 34) * v ** 5;
      return [
        w * width * (0.2 + 0.8 * open),
        0.16 +
          0.39 * v * (1 - open) +
          0.085 * w * w +
          0.022 * Math.sin(v * Math.PI),
        // The carrier faces +Z: local -Z places the dorsal blade above its throat.
        // Keep the same v=0 insertion instead of turning the sepal and spur over.
        0.035 - 0.67 * v * notch * (0.13 + 0.87 * open),
      ];
    },
  });
  for (const side of [-1, 1]) {
    IMPATIENS_MODEL.surfaces.push(
      {
        name: "joined deeply bilobed lateral pair",
        cluster,
        role: "petal",
        thickness: 0.011,
        // Keep each rounded apex: six columns skip u=.25/.75 entirely.
        overviewColumns: 12,
        flexible: true,
        cage: [6, 6],
        mobileCage: [4, 4],
        delay: cluster * 0.04 + 0.04,
        sample: (u, v, stage) => {
          const w = 2 * u - 1,
            open = maturity(stage),
            // Each continuous half broadens into a rounded, obovate limb.
            // The small finite radius retains the cleft and a sealed basal rim.
            angle = w * 1.35,
            shoulder =
              ((Math.sin(Math.PI * w) ** 2 + 0.025) ** 0.3 - 0.025 ** 0.3) /
              (1.025 ** 0.3 - 0.025 ** 0.3),
            radius = 0.13 + 0.5 * shoulder,
            length = radius * Math.cos(angle),
            radial = length * v * (0.7 + 0.3 * open),
            z =
              (0.018 + 0.004 * (1 - v) ** 2) * w * (0.17 + 0.83 * open) +
              radius * Math.sin(angle) * v * (0.28 + 0.72 * open),
            foldAngle = Math.atan2(0.41, 0.065) * (1 - open),
            arch = 0.1 * (radial * radial + z * z) * open;
          return [
            side *
              (0.028 * (0.17 + 0.83 * open) +
                radial * Math.cos(foldAngle) -
                arch * Math.sin(foldAngle)),
            // The closed paired blade lies in a gently inclined plane; a tight
            // transverse U-fold at this narrow root would invert its inner skin.
            0.145 + radial * Math.sin(foldAngle) + arch * Math.cos(foldAngle),
            0.02 + z,
          ];
        },
      },
      {
        name: "small lateral sepal",
        cluster,
        role: "calyx",
        thickness: 0.009,
        sample: (u, v, stage) => {
          const w = 2 * u - 1,
            open = maturity(stage);
          return [
            side * (0.095 + 0.085 * v) +
              w * (0.003 + 0.027 * Math.sin(Math.PI * v)),
            0.045 + 0.12 * v * (1 - open),
            -0.015 - 0.1 * v,
          ];
        },
      },
    );
  }
  IMPATIENS_MODEL.surfaces.push({
    name: "boat sepal and continuous hollow spur",
    cluster,
    role: "tube",
    tissue: "inner",
    periodic: true,
    thickness: 0.013,
    overviewColumns: 12,
    overviewRows: 9,
    sample: (u, v, stage) => impatiensSpurredSepal(u, v, maturity(stage)),
  });
  IMPATIENS_MODEL.organs.push(
    {
      name: "superior ovary",
      cluster,
      points: [
        [0, 0.047, 0],
        [0, 0.105, 0],
        [0, 0.159, 0],
      ],
      foldedPoints: [
        [0, 0.043, 0],
        [0, 0.097, 0],
        [0, 0.149, 0],
      ],
      radius: 0.026,
      endRadius: 0.02,
      color: "#b5ad76",
    },
    {
      name: "short stigma within cap",
      cluster,
      points: [
        [0, 0.145, 0],
        [0, 0.157, 0],
        [0, 0.168, 0],
      ],
      foldedPoints: [
        [0, 0.137, 0],
        [0, 0.149, 0],
        [0, 0.156, 0],
      ],
      radius: 0.009,
      endRadius: 0.011,
      color: "#c5b784",
    },
  );
  for (let i = 0; i < 5; i++) {
    const a = (i * Math.PI * 2) / 5;
    IMPATIENS_MODEL.organs.push({
      name: "connate anther cap segment",
      cluster,
      points: [
        [Math.cos(a) * 0.031, 0.09, Math.sin(a) * 0.031],
        [Math.cos(a) * 0.028, 0.146, Math.sin(a) * 0.028],
        [Math.cos(a) * 0.008, 0.178, Math.sin(a) * 0.008],
      ],
      foldedPoints: [
        [Math.cos(a) * 0.028, 0.082, Math.sin(a) * 0.028],
        [Math.cos(a) * 0.025, 0.136, Math.sin(a) * 0.025],
        [Math.cos(a) * 0.007, 0.164, Math.sin(a) * 0.007],
      ],
      radius: 0.015,
      endRadius: 0.009,
      color: "#d2b17b",
      flatten: 0.63,
    });
  }
}
