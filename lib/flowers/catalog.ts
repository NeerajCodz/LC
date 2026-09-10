import { PETAL_PALETTES } from "./palettes";
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
{"type": "iris", "name": "Bearded Iris", "latin": "Iris \u00d7 germanica", "family": "Iridaceae", "color": "#6f419b", "description": "Three rise. Three fall.\nA violet architecture.", "detail": "Upright standards shelter the center while broad falls curl beneath golden beards."},
{"type": "daffodil", "name": "Daffodil", "latin": "Narcissus pseudonarcissus", "family": "Amaryllidaceae", "color": "#eed36f", "description": "A trumpet of light.\nThe first warmth.", "detail": "Six golden tepals frame a hollow, softly fluted corona and sheltered stamens."},
  {
    type: "poppy",
    name: "Red Poppy",
    latin: "Papaver rhoeas",
    family: "Papaveraceae",
    color: "#c93131",
    description: "Paper-thin folds.\nA vivid moment.",
    detail:
      "Four crinkled petals surround dark anthers and a radiating stigma disk.",
  },
  {
    type: "rose",
    name: "Rose",
    latin: "Rosa × hybrida",
    color: PETAL_PALETTES["rose"].body,
    family: "Rosaceae",
    description: "A quiet unfolding.\nA thousand little curves.",
    detail: "Soft, overlapping petals spiral around a tightly furled heart.",
  },
  {
    type: "lotus",
    name: "Lotus",
    latin: "Nelumbo nucifera",
    color: PETAL_PALETTES["lotus"].body,
    family: "Nelumbonaceae",
    description: "From still water,\nsomething extraordinary.",
    detail:
      "Waxy petals surround a golden-green heart and a halo of fine stamens.",
  },
  {
    type: "marigold",
    name: "Marigold",
    latin: "Tagetes erecta",
    color: PETAL_PALETTES["marigold"].body,
    family: "Asteraceae",
    description: "Sunlight, gathered\ninto a single bloom.",
    detail: "Hundreds of ruffled florets make a dense, warmly colored crown.",
  },
  {
    type: "sunflower",
    name: "Sunflower",
    latin: "Helianthus annuus",
    color: PETAL_PALETTES["sunflower"].body,
    family: "Asteraceae",
    description: "Always turning\ntoward the light.",
    detail:
      "Golden rays surround a disk of seeds arranged in interlacing spirals.",
  },
  {
    type: "tulip",
    name: "Tulip",
    latin: "Tulipa gesneriana",
    color: PETAL_PALETTES["tulip"].body,
    family: "Liliaceae",
    description: "The simplest form.\nAn elegant beginning.",
    detail: "Six smooth tepals rise into an upright, gently opening cup.",
  },
  {
    type: "lily",
    name: "Lily",
    latin: "Lilium orientalis",
    color: PETAL_PALETTES["lily"].body,
    family: "Liliaceae",
    description: "A graceful arc.\nAn open invitation.",
    detail:
      "Six recurved, freckled tepals reveal long filaments and copper anthers.",
  },
  {
    type: "jasmine",
    name: "Jasmine",
    latin: "Jasminum officinale",
    color: PETAL_PALETTES["jasmine"].body,
    family: "Oleaceae",
    description: "Small stars,\nsoftly gathered.",
    detail: "Delicate five-pointed blossoms open together on slender branches.",
  },
  {
    type: "orchid",
    name: "Orchid",
    latin: "Phalaenopsis amabilis",
    color: PETAL_PALETTES["orchid"].body,
    family: "Orchidaceae",
    description: "An unexpected form.\nPerfectly its own.",
    detail: "Broad lateral petals, three sepals, and a sculptural central lip.",
  },
  {
    type: "hibiscus",
    name: "Hibiscus",
    latin: "Hibiscus rosa-sinensis",
    color: PETAL_PALETTES["hibiscus"].body,
    family: "Malvaceae",
    description: "A little wild.\nEntirely alive.",
    detail:
      "Five rippling petals open around a long, pollen-tipped staminal column.",
  },
  {
    type: "dahlia",
    name: "Dahlia",
    latin: "Dahlia pinnata",
    color: PETAL_PALETTES["dahlia"].body,
    family: "Asteraceae",
    description: "Order and wonder,\npetal after petal.",
    detail:
      "Concentric whorls of cupped petals form an intricate geometric bloom.",
  },
  {
    type: "peony",
    name: "Peony",
    latin: "Paeonia lactiflora",
    color: PETAL_PALETTES["peony"].body,
    family: "Paeoniaceae",
    description: "Softness,\nwithout an edge.",
    detail:
      "Broad outer petals surround an abundant, irregularly folded heart.",
  },
  {
    type: "lavender",
    name: "Lavender",
    latin: "Lavandula angustifolia",
    color: PETAL_PALETTES["lavender"].body,
    family: "Lamiaceae",
    description: "A slower rhythm.\nA gentler kind of purple.",
    detail:
      "Tiny tubular flowers cluster in tiers along slender aromatic spikes.",
  },
  {
    type: "chrysanthemum",
    name: "Chrysanthemum",
    latin: "Chrysanthemum morifolium",
    color: PETAL_PALETTES["chrysanthemum"].body,
    family: "Asteraceae",
    description: "A hundred gestures.\nOne delicate whole.",
    detail: "Narrow curling florets radiate from a dense, rounded center.",
  },
  {
    type: "daisy",
    name: "Daisy",
    latin: "Leucanthemum vulgare",
    color: PETAL_PALETTES["daisy"].body,
    family: "Asteraceae",
    description: "An everyday\nlittle wonder.",
    detail: "Slender ivory ray florets encircle a raised golden central disk.",
  },
  {
    type: "cherry-blossom",
    name: "Cherry Blossom",
    latin: "Prunus serrulata",
    color: PETAL_PALETTES["cherry-blossom"].body,
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
