import { FLOWER_TYPES, type FlowerType } from "./types";

export interface FlowerInfo {
  type: FlowerType;
  name: string;
  latin: string;
  color: string;
  family: string;
  description: string;
  detail: string;
}

export const FLOWERS: FlowerInfo[] = [
  {
    type: "rose",
    name: "Rose",
    latin: "Rosa × hybrida",
    color: "#b8435c",
    family: "Rosaceae",
    description: "A quiet unfolding.\nA thousand little curves.",
    detail: "Soft, overlapping petals spiral around a tightly furled heart.",
  },
  {
    type: "lotus",
    name: "Lotus",
    latin: "Nelumbo nucifera",
    color: "#f0a8b5",
    family: "Nelumbonaceae",
    description: "From still water,\nsomething extraordinary.",
    detail: "Waxy, tapered petals cradle a distinctive golden seed pod.",
  },
  {
    type: "marigold",
    name: "Marigold",
    latin: "Tagetes erecta",
    color: "#f5a025",
    family: "Asteraceae",
    description: "Sunlight, gathered\ninto a single bloom.",
    detail: "Hundreds of ruffled florets make a dense, warmly colored crown.",
  },
  {
    type: "sunflower",
    name: "Sunflower",
    latin: "Helianthus annuus",
    color: "#f8c43c",
    family: "Asteraceae",
    description: "Always turning\ntoward the light.",
    detail:
      "Golden rays surround a disk of seeds arranged in interlacing spirals.",
  },
  {
    type: "tulip",
    name: "Tulip",
    latin: "Tulipa gesneriana",
    color: "#f58a76",
    family: "Liliaceae",
    description: "The simplest form.\nAn elegant beginning.",
    detail: "Six smooth tepals rise into an upright, gently opening cup.",
  },
  {
    type: "lily",
    name: "Lily",
    latin: "Lilium orientalis",
    color: "#f2ddd0",
    family: "Liliaceae",
    description: "A graceful arc.\nAn open invitation.",
    detail:
      "Six recurved, freckled tepals reveal long filaments and copper anthers.",
  },
  {
    type: "jasmine",
    name: "Jasmine",
    latin: "Jasminum officinale",
    color: "#f9f2da",
    family: "Oleaceae",
    description: "Small stars,\nsoftly gathered.",
    detail: "Delicate five-pointed blossoms open together on slender branches.",
  },
  {
    type: "orchid",
    name: "Orchid",
    latin: "Phalaenopsis amabilis",
    color: "#ddb0db",
    family: "Orchidaceae",
    description: "An unexpected form.\nPerfectly its own.",
    detail: "Broad lateral petals, three sepals, and a sculptural central lip.",
  },
  {
    type: "hibiscus",
    name: "Hibiscus",
    latin: "Hibiscus rosa-sinensis",
    color: "#ed645e",
    family: "Malvaceae",
    description: "A little wild.\nEntirely alive.",
    detail:
      "Five rippling petals open around a long, pollen-tipped staminal column.",
  },
  {
    type: "dahlia",
    name: "Dahlia",
    latin: "Dahlia pinnata",
    color: "#d87898",
    family: "Asteraceae",
    description: "Order and wonder,\npetal after petal.",
    detail:
      "Concentric whorls of cupped petals form an intricate geometric bloom.",
  },
  {
    type: "peony",
    name: "Peony",
    latin: "Paeonia lactiflora",
    color: "#ecb7c3",
    family: "Paeoniaceae",
    description: "Softness,\nwithout an edge.",
    detail:
      "Broad outer petals surround an abundant, irregularly folded heart.",
  },
  {
    type: "lavender",
    name: "Lavender",
    latin: "Lavandula angustifolia",
    color: "#a58bd4",
    family: "Lamiaceae",
    description: "A slower rhythm.\nA gentler kind of purple.",
    detail:
      "Tiny tubular flowers cluster in tiers along slender aromatic spikes.",
  },
  {
    type: "chrysanthemum",
    name: "Chrysanthemum",
    latin: "Chrysanthemum morifolium",
    color: "#f0d7a4",
    family: "Asteraceae",
    description: "A hundred gestures.\nOne delicate whole.",
    detail: "Narrow curling florets radiate from a dense, rounded center.",
  },
  {
    type: "daisy",
    name: "Daisy",
    latin: "Leucanthemum vulgare",
    color: "#f4f0df",
    family: "Asteraceae",
    description: "An everyday\nlittle wonder.",
    detail: "Slender ivory ray florets encircle a raised golden central disk.",
  },
  {
    type: "cherry-blossom",
    name: "Cherry Blossom",
    latin: "Prunus serrulata",
    color: "#f2c7d2",
    family: "Rosaceae",
    description: "Here for a moment.\nRemembered for longer.",
    detail:
      "Five softly notched petals open around a delicate spray of stamens.",
  },
];

export function getFlower(type: FlowerType): FlowerInfo {
  return FLOWERS.find((flower) => flower.type === type)!;
}

export function isFlowerType(value: unknown): value is FlowerType {
  return (
    typeof value === "string" && FLOWER_TYPES.includes(value as FlowerType)
  );
}
