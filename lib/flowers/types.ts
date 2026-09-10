export const FLOWER_TYPES = [
  "iris",
  "daffodil",
  "poppy",
  "rose",
  "lotus",
  "marigold",
  "sunflower",
  "tulip",
  "lily",
  "jasmine",
  "orchid",
  "hibiscus",
  "dahlia",
  "peony",
  "lavender",
  "chrysanthemum",
  "daisy",
  "cherry-blossom",
] as const;

export type FlowerType = (typeof FLOWER_TYPES)[number];
export type Quality = "low" | "medium" | "high" | "ultra";
export type Vec3 = [number, number, number];

export interface FlowerProps {
  type: FlowerType;
  color?: string;
  bloom?: number;
  growth?: number;
  scale?: number;
  position?: Vec3;
  /** Interpret position as the fixed planting point instead of the flower head. */
  rooted?: boolean;
  rotation?: Vec3;
  interactive?: boolean;
  animationSpeed?: number;
  animateEntrance?: boolean;
  windStrength?: number;
  cursorStrength?: number;
  hovered?: boolean;
  stem?: boolean;
  leaves?: boolean;
  quality?: Quality;
  reducedMotion?: boolean;
  paused?: boolean;
  pulse?: number;
  onHover?: (hovered: boolean) => void;
  onClick?: () => void;
}

export interface PetalProfile {
  length: number;
  width: number;
  cup: number;
  curl: number;
  edge: number;
  ripple: number;
  twist: number;
  taper: number;
  thickness: number;
  notch?: number;
  spots?: number;
  roundness?: number;
  wrapAngle?: number;
  crinkle?: number;
  marginTeeth?: number;
  marginDepth?: number;
  lobes?: number;
}

export interface PetalLayer {
  count: number;
  radius: number;
  height: number;
  angle: number;
  offset?: number;
  delay?: number;
  variation?: number;
  color?: string;
  profile: PetalProfile;
}

export interface FlowerStructure {
  layers: PetalLayer[];
  /** Conservative head bounds for non-radial organs. */
  headRadius?: number;
  center: "none" | "seeds" | "pod" | "stamens" | "column" | "florets";
  centerRadius: number;
  centerHeight: number;
  stamenCount?: number;
  stamenLength?: number;
  antherColor?: string;
  stemLength: number;
  stemRadius: number;
  leafShape: "serrated" | "broad" | "lance" | "round" | "needle";
  leafCount: number;
  headTilt: number;
  roughness: number;
  sheen: number;
  blossoms?: { position: Vec3; rotation: Vec3; scale: number }[];
}
