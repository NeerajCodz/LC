export const FLOWER_TYPES = [
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
export type Quality = "low" | "medium" | "high";
export type Vec3 = [number, number, number];

export interface FlowerProps {
  type: FlowerType;
  color?: string;
  bloom?: number;
  growth?: number;
  scale?: number;
  position?: Vec3;
  rotation?: Vec3;
  interactive?: boolean;
  animationSpeed?: number;
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
  center: "none" | "seeds" | "pod" | "stamens" | "column" | "florets";
  centerRadius: number;
  centerHeight: number;
  stemLength: number;
  stemRadius: number;
  leafShape: "serrated" | "broad" | "lance" | "round" | "needle";
  leafCount: number;
  headTilt: number;
  roughness: number;
  sheen: number;
  blossoms?: { position: Vec3; rotation: Vec3; scale: number }[];
}
