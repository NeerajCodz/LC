import type { Vec3 } from "@/lib/flowers/types";
import type { SpecimenModel, SpecimenOrgan } from "@/lib/three/specimenModel";

/** Authored continuous shallow star, with papillose inner corolla tissue. */
export function hoyaCorolla(
  u: number,
  v: number,
  stage: number,
  young = false,
): Vec3 {
  const open = stage * (young ? 0.06 : 1),
    a = u * Math.PI * 2,
    lobe = (0.5 + 0.5 * Math.cos(a * 5)) ** 1.35,
    limb = Math.max(0, (v - 0.22) / 0.78),
    mature = 0.042 + 0.13 * v + 0.18 * lobe * limb ** 1.3,
    closed = 0.04 + 0.082 * Math.sin(Math.PI * v) + 0.007 * v,
    r = mature * open + closed * (1 - open),
    twist = (1 - open) * v * 0.24;
  return [
    Math.cos(a + twist) * r,
    0.09 * v - 0.08 * limb ** 2 * lobe * open + 0.24 * v * (1 - open),
    Math.sin(a + twist) * r,
  ];
}

export const HOYA_MODEL: SpecimenModel = {
  clusters: Array.from({ length: 22 }, (_, i) => {
    const young = i >= 19,
      a = i * 2.399963229728653,
      radius = young ? 0.77 : 0.69 * Math.sqrt(i / 18),
      y = young ? -0.02 : 0.15 - radius * radius * 0.5;
    return {
      position: [Math.sin(a) * radius, y, Math.cos(a) * radius] as Vec3,
      rotation: [
        Math.cos(a) * radius * 0.52,
        0,
        -Math.sin(a) * radius * 0.52,
      ] as Vec3,
      scale: young ? 0.44 - (i - 19) * 0.035 : 0.65,
      nod: young ? 0.014 : 0.028,
    };
  }),
  surfaces: [],
  organs: [],
};

export const HOYA_STALKS: SpecimenOrgan[] = [
  {
    name: "persistent umbel peduncle",
    cluster: 0,
    points: [
      [0, -0.65, 0],
      [0.025, -0.38, 0],
      [0, -0.18, 0],
    ],
    radius: 0.03,
    endRadius: 0.026,
    color: "#8a9268",
  },
  ...HOYA_MODEL.clusters.map((c): SpecimenOrgan => ({
    name: "umbel pedicel",
    cluster: 0,
    points: [
      [0, -0.18, 0],
      [c.position[0] * 0.55, c.position[1] - 0.095, c.position[2] * 0.55],
      c.position,
    ],
    radius: 0.012,
    endRadius: 0.009,
    color: "#b7a298",
  })),
];

for (let cluster = 0; cluster < 22; cluster++) {
  const young = cluster >= 19;
  HOYA_MODEL.surfaces.push({
    name: "papillose five-lobed corolla",
    cluster,
    role: "tube",
    periodic: true,
    overviewColumns: 20,
    overviewRows: 3,
    thickness: 0.017,
    flexible: true,
    cage: [10, 4],
    mobileCage: [10, 1],
    delay: (cluster % 5) * 0.025,
    compliance: 0.000022,
    shapeCompliance: 0.00018,
    sample: (u, v, open) => hoyaCorolla(u, v, open, young),
  });
  for (let lobe = 0; lobe < 5; lobe++) {
    const a = (lobe * Math.PI * 2) / 5;
    HOYA_MODEL.surfaces.push(
      {
        name: "ridged waxy corona limb",
        cluster,
        role: "petal",
        tissue: "inner",
        thickness: 0.024,
        overviewRows: 2,
        sample: (u, v, stage) => {
          const w = 2 * u - 1,
            open = stage * (young ? 0.08 : 1),
            r = 0.029 + 0.112 * v * (0.38 + 0.62 * open),
            width = w * (0.004 + 0.048 * Math.sin(Math.PI * v) ** 0.85),
            ridge = 0.055 + 0.044 * (1 - w * w) * Math.sin(Math.PI * v),
            y = ridge + 0.19 * v * (1 - open);
          return [
            Math.cos(a) * r - Math.sin(a) * width,
            y,
            Math.sin(a) * r + Math.cos(a) * width,
          ];
        },
      },
      {
        name: "small calyx lobe",
        cluster,
        role: "calyx",
        thickness: 0.008,
        overviewColumns: 4,
        overviewRows: 1,
        sample: (u, v, stage) => {
          const w = 2 * u - 1,
            r = 0.035 + 0.054 * v,
            width = w * (0.003 + 0.012 * Math.sin(Math.PI * v)),
            y = -0.025 - 0.042 * v + 0.065 * v * (1 - stage);
          return [
            Math.cos(a) * r - Math.sin(a) * width,
            y,
            Math.sin(a) * r + Math.cos(a) * width,
          ];
        },
      },
    );
    // Pollinia stay tucked beside the connate anther/stigma complex.
    for (const side of [-1, 1]) {
      const p: Vec3 = [
        Math.cos(a) * 0.019 - Math.sin(a) * side * 0.005,
        0.074,
        Math.sin(a) * 0.019 + Math.cos(a) * side * 0.005,
      ];
      HOYA_MODEL.organs.push({
        name: "paired pollinium",
        cluster,
        bloomMorph: true,
        points: [p, [p[0], 0.083, p[2]], [p[0] * 0.9, 0.089, p[2] * 0.9]],
        foldedPoints: [
          [p[0] * 0.7, 0.061, p[2] * 0.7],
          [p[0] * 0.7, 0.07, p[2] * 0.7],
          [p[0] * 0.65, 0.076, p[2] * 0.65],
        ],
        radius: 0.004,
        endRadius: 0.003,
        color: "#d6b678",
      });
    }
    HOYA_MODEL.organs.push({
      name: "appressed anther membrane",
      cluster,
      points: [
        [Math.cos(a) * 0.024, 0.052, Math.sin(a) * 0.024],
        [Math.cos(a) * 0.022, 0.074, Math.sin(a) * 0.022],
        [Math.cos(a) * 0.009, 0.085, Math.sin(a) * 0.009],
      ],
      foldedPoints: [
        [Math.cos(a) * 0.019, 0.043, Math.sin(a) * 0.019],
        [Math.cos(a) * 0.016, 0.062, Math.sin(a) * 0.016],
        [Math.cos(a) * 0.007, 0.071, Math.sin(a) * 0.007],
      ],
      radius: 0.009,
      endRadius: 0.003,
      flatten: 0.4,
      color: "#a3354c",
    });
  }
  HOYA_MODEL.organs.push({
    name: "gynostegium",
    cluster,
    bloomMorph: true,
    points: [
      [0, 0.005, 0],
      [0, 0.042, 0],
      [0, 0.082, 0],
    ],
    foldedPoints: [
      [0, 0.003, 0],
      [0, 0.035, 0],
      [0, 0.068, 0],
    ],
    radius: 0.024,
    endRadius: 0.026,
    color: "#b9445d",
  });
}

// Append the terminal tissue so existing corolla/corona phase indices stay intact.
// Each sector starts inside the corolla wall at v=.5 and unfurls onto its star limb.
for (let cluster = 0; cluster < HOYA_MODEL.clusters.length; cluster++) {
  const young = cluster >= 19,
    carrierIndex = HOYA_MODEL.surfaces.findIndex(
      (surface) => surface.cluster === cluster && surface.flexible,
    ),
    carrier = HOYA_MODEL.surfaces[carrierIndex];
  for (let lobe = 0; lobe < 5; lobe++) {
    const direction = (lobe * Math.PI * 2) / 5,
      index = HOYA_MODEL.surfaces.length;
    HOYA_MODEL.surfaces.push({
      name: "contorted hoya terminal lobe tissue",
      cluster,
      role: "tube",
      thickness: 0.014,
      overviewColumns: 2,
      overviewRows: 2,
      cageAttachment: {
        surface: carrier,
        uv: (u, v) => [
          (direction + (u * 2 - 1) * 0.7) / (Math.PI * 2),
          0.5 + 0.5 * v,
        ],
      },
      // The shared renderer adds index*.31*.004 to delay for every shell.
      delay: (carrier.delay ?? 0) + (carrierIndex - index) * 0.31 * 0.004,
      sample: (u, v, stage) => {
        const open = stage * (young ? 0.06 : 1),
          w = u * 2 - 1,
          angle = direction + w * 0.7,
          root = hoyaCorolla(angle / (Math.PI * 2), 0.5, 0),
          turn = direction + 0.3 + 0.22 * v,
          width = w * (0.012 + 0.018 * Math.sin(Math.PI * v)),
          tipX = -0.03 * Math.cos(turn) - width * Math.sin(turn),
          tipZ = -0.03 * Math.sin(turn) + width * Math.cos(turn),
          full = hoyaCorolla(angle / (Math.PI * 2), 0.5 + 0.5 * v, 1);
        const closed: Vec3 = [
          root[0] * (1 - v) + tipX * v,
          root[1] * (1 - v) +
            (0.358 + lobe * 0.0015) * v +
            0.05 * Math.sin(Math.PI * v),
          root[2] * (1 - v) + tipZ * v,
        ];
        return [
          closed[0] * (1 - open) +
            (full[0] + Math.cos(angle) * 0.012 * v) * open,
          closed[1] * (1 - open) +
            (full[1] + 0.007 * Math.sin(Math.PI * v)) * open,
          closed[2] * (1 - open) +
            (full[2] + Math.sin(angle) * 0.012 * v) * open,
        ];
      },
    });
  }
}
