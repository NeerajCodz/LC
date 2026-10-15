import type { Vec3 } from "@/lib/flowers/types";
import type { SpecimenModel, SpecimenOrgan } from "@/lib/three/specimenModel";

/** The short fused corolla cup remains joined to all five valvate limbs. */
function hoyaCorollaCup(u: number, v: number): Vec3 {
  const angle = u * Math.PI * 2,
    radius = 0.035 + 0.022 * v;
  return [
    Math.cos(angle) * radius,
    -0.015 + 0.04 * v,
    Math.sin(angle) * radius,
  ];
}

/** A complete corolla limb, with meeting bud margins and no superimposed cap. */
function hoyaCorollaLobe(
  u: number,
  v: number,
  stage: number,
  lobe: number,
  young = false,
): Vec3 {
  const open = young ? 0 : stage,
    direction = (lobe * Math.PI * 2) / 5,
    w = 2 * u - 1,
    angle = (w * Math.PI) / 5,
    closedRadius = 0.057 * (1 - v) + 0.105 * Math.sin(Math.PI * v),
    closedX = closedRadius * Math.cos(angle),
    closedZ = closedRadius * Math.sin(angle) + 0.007 * w * v ** 8,
    fullX = 0.057 + 0.285 * v + 0.057 * (Math.cos(angle) - 1) * (1 - v) ** 2,
    fullZ =
      0.057 * Math.sin(angle) * (1 - v) +
      w * (0.007 * v + 0.085 * Math.sin(Math.PI * v)),
    x = closedX * (1 - open) + fullX * open,
    z = closedZ * (1 - open) + fullZ * open,
    closedY = 0.025 + 0.305 * v + 0.013 * Math.sin(Math.PI * v),
    fullY =
      0.025 +
      0.035 * Math.sin(Math.PI * v) +
      0.018 * w * w * Math.sin(Math.PI * v) ** 2 -
      0.015 * v;
  return [
    Math.cos(direction) * x - Math.sin(direction) * z,
    closedY * (1 - open) + fullY * open,
    Math.sin(direction) * x + Math.cos(direction) * z,
  ];
}

export const HOYA_MODEL: SpecimenModel = {
  ambientSurfaceBatching: true,
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
    overviewRows: 1,
    thickness: 0.017,
    delay: (cluster % 5) * 0.025,
    sample: hoyaCorollaCup,
  });
  for (let lobe = 0; lobe < 5; lobe++) {
    // The inner waxy star alternates with the five outer corolla limbs.
    const a = ((lobe + 0.5) * Math.PI * 2) / 5;
    HOYA_MODEL.surfaces.push(
      {
        name: "ridged waxy corona limb",
        cluster,
        role: "petal",
        tissue: "inner",
        thickness: 0.008,
        overviewRows: 4,
        sample: (u, v, stage) => {
          const w = 2 * u - 1,
            open = stage * (young ? 0.08 : 1),
            // The thin root cap enters the actual anther/gynostegium tissue;
            // the basal inset vanishes at the distal acute tip.
            r = 0.025 + 0.132 * v * (0.38 + 0.62 * open) - 0.002 * (1 - v) ** 2,
            taper = Math.sin(Math.PI * v) ** 1.25,
            width = w * (0.001 + 0.026 * taper),
            // A rounded tent keeps a median ridge without inflating the two
            // shoulders into cushions after the actual normal-offset thickness.
            ridgeSection =
              (Math.sqrt(1.16) - Math.sqrt(w * w + 0.16)) /
              (Math.sqrt(1.16) - 0.4),
            ridge =
              0.053 + 0.004 * taper + 0.028 * ridgeSection * taper * taper,
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

// Append the real distal lobes so existing reproductive-carrier phases stay intact.
// Five independent root-pinned patches replace the old periodic carrier's budget.
for (let cluster = 0; cluster < HOYA_MODEL.clusters.length; cluster++) {
  const young = cluster >= 19,
    carrierIndex = HOYA_MODEL.surfaces.findIndex(
      (surface) =>
        surface.cluster === cluster &&
        surface.name === "papillose five-lobed corolla",
    ),
    carrier = HOYA_MODEL.surfaces[carrierIndex];
  for (let lobe = 0; lobe < 5; lobe++) {
    const index = HOYA_MODEL.surfaces.length;
    HOYA_MODEL.surfaces.push({
      name: "valvate corolla lobe",
      cluster,
      role: "tube",
      thickness: 0.017,
      overviewColumns: 4,
      overviewRows: 4,
      flexible: true,
      cage: [1, 4],
      mobileCage: [1, 1],
      closedCohesion: { group: cluster, release: 0.25, persistent: young },
      compliance: 0.00004,
      shapeCompliance: 0.00018,
      // The shared renderer adds index*.31*.004 to delay for every shell.
      delay: (carrier.delay ?? 0) + (carrierIndex - index) * 0.31 * 0.004,
      sample: (u, v, stage) => hoyaCorollaLobe(u, v, stage, lobe, young),
    });
  }
}
