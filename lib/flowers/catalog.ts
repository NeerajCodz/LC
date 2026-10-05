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
  {
    type: "fuchsia",
    name: "Hardy Fuchsia",
    latin: "Fuchsia magellanica",
    family: "Onagraceae",
    color: "#c42b59",
    description: "Crimson, suspended.\nViolet beneath the bell.",
    detail:
      "Pendant flowers hang from a fine woody shoot. Four crimson sepals spread around overlapping purple petals, with paired tiers of stamens and a long, rose-colored style.",
  },
  {
    type: "morning-glory",
    name: "Morning Glory",
    latin: "Ipomoea purpurea",
    family: "Convolvulaceae",
    color: "#7650af",
    description: "A trumpet for the morning.\nViolet folds, an ivory heart.",
    detail:
      "A continuous, pleated corolla opens above a twining shoot. Pale included stamens, dark midpetaline bands and heart-shaped leaves distinguish this morning glory.",
  },
  {
    type: "passionflower",
    name: "Blue Passionflower",
    latin: "Passiflora caerulea",
    family: "Passifloraceae",
    color: "#6262ba",
    description: "Fine threads of blue.\nA world within a flower.",
    detail:
      "A banded filament corona surrounds raised anthers and three spreading styles, above a climbing shoot with deeply lobed leaves.",
  },
  {
    type: "bird-of-paradise",
    name: "Bird of Paradise",
    latin: "Strelitzia reginae",
    family: "Strelitziaceae",
    color: "#e98720",
    description: "A bright crest.\nPoised for flight.",
    detail:
      "Orange sepals and blue petals emerge in sequence from a substantial boat-shaped bract.",
  },
  {
    type: "bleeding-heart",
    name: "Bleeding Heart",
    latin: "Lamprocapnos spectabilis",
    family: "Papaveraceae",
    color: "#d45380",
    description: "Small suspended hearts.\nAn arch of spring.",
    detail:
      "Pendant pink pouches and pale inner petals hang from an arching flower stalk.",
  },
  {
    type: "columbine",
    name: "Columbine",
    latin: "Aquilegia canadensis",
    family: "Ranunculaceae",
    color: "#c95143",
    description: "A downward glance.\nFive hidden wells.",
    detail:
      "Nodding red sepals frame yellow petal cups, long nectar spurs and projecting stamens.",
  },
  {
    type: "anthurium",
    name: "Anthurium",
    latin: "Anthurium andraeanum",
    family: "Araceae",
    color: "#b5273b",
    description: "A lacquered heart.\nQuietly luminous.",
    detail:
      "A waxy crimson spathe backs a gently tapered spadix, its tiny flowers individually modeled.",
  },
  {
    type: "calla-lily",
    name: "Calla Lily",
    latin: "Zantedeschia aethiopica",
    family: "Araceae",
    color: "#f5eee1",
    description: "Ivory, unfurling.\nOne continuous curve.",
    detail:
      "A rolled, thick-walled spathe opens around a yellow spadix of tiny flowers.",
  },
  {
    type: "iris",
    name: "Bearded Iris",
    latin: "Iris \u00d7 germanica",
    family: "Iridaceae",
    color: "#6f419b",
    description: "Three rise. Three fall.\nA violet architecture.",
    detail:
      "Upright standards shelter the center while broad falls curl beneath golden beards.",
  },
  {
    type: "daffodil",
    name: "Daffodil",
    latin: "Narcissus pseudonarcissus",
    family: "Amaryllidaceae",
    color: "#eed36f",
    description: "A trumpet of light.\nThe first warmth.",
    detail:
      "Six golden tepals frame a hollow, softly fluted corona and sheltered stamens.",
  },
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

FLOWERS.push({
  type: "carnation",
  name: "Carnation",
  latin: "Dianthus caryophyllus",
  family: "Caryophyllaceae",
  color: PETAL_PALETTES.carnation.body,
  description: "Fringes of pink.\nA thousand small folds.",
  detail:
    "A cultivated double bloom opens above a cylindrical calyx and opposite narrow leaves.",
});
FLOWERS.push({
  type: "plumeria",
  name: "Plumeria",
  latin: "Plumeria rubra",
  family: "Apocynaceae",
  color: PETAL_PALETTES.plumeria.body,
  description: "Ivory and warm gold.\nA quiet spiral.",
  detail:
    "Five waxy overlapping lobes unfurl above a fused throat on thick succulent branches.",
});
FLOWERS.push({
  type: "foxglove",
  name: "Foxglove",
  latin: "Digitalis purpurea",
  family: "Plantaginaceae",
  color: PETAL_PALETTES.foxglove.body,
  description: "A rising hush.\nBells facing the light.",
  detail:
    "A one-sided raceme opens from bottom to top, revealing spotted, softly hairy bell interiors.",
});
FLOWERS.push({
  type: "sweet-pea",
  name: "Sweet Pea",
  latin: "Lathyrus odoratus",
  family: "Fabaceae",
  color: PETAL_PALETTES["sweet-pea"].body,
  description: "Wings in violet.\nHeld by a climbing thread.",
  detail:
    "Three bilateral flowers lift broad banners above paired wings and an enclosing keel; tendrils brace the winged shoot.",
});
FLOWERS.push({
  type: "bougainvillea",
  name: "Bougainvillea",
  latin: "Bougainvillea glabra",
  family: "Nyctaginaceae",
  color: PETAL_PALETTES.bougainvillea.body,
  description: "Paper-thin magenta.\nTiny flowers held within.",
  detail:
    "Three-bract cymes surround small cream-mouthed floral tubes on a thorny woody shoot.",
});
FLOWERS.push({
  name: "Cyclamen",
  latin: "Cyclamen persicum",
  family: "Primulaceae",
  description: "A pale twist.\nSilver leaves beneath.",
  detail:
    "Five swept-back corolla lobes surround a darker nodding mouth. Separate curved stalks rise from a basal crown above fleshy, silver-zoned leaves.",
  type: "cyclamen",
  color: "#f1d9df",
});
FLOWERS.push({
  name: "Snapdragon",
  latin: "Antirrhinum majus",
  family: "Plantaginaceae",
  description: "A closed mouth.\nA soft invitation.",
  detail:
    "Bilateral corollas open in sequence along a narrow-leaved shoot. Pointer contact or the pulse control depresses the lower palate, which returns when released.",
  type: "snapdragon",
  color: "#dd737e",
});
FLOWERS.push({
  name: "Hardy Begonia",
  latin: "Begonia grandis",
  family: "Begoniaceae",
  description: "Unequal leaves.\nTwo kinds of bloom.",
  detail:
    "Forked pendant cymes carry four-tepalled male flowers with golden stamens and three-tepalled female flowers with unequal ovary wings. Asymmetric leaves reveal reddish undersides and veins.",
  type: "hardy-begonia",
  color: "#e8a2b4",
});
FLOWERS.sort(
  (a, b) => FLOWER_TYPES.indexOf(a.type) - FLOWER_TYPES.indexOf(b.type),
);

export function getFlower(type: FlowerType): FlowerInfo {
  return FLOWERS.find((flower) => flower.type === type)!;
}

export function isFlowerType(value: unknown): value is FlowerType {
  return (
    typeof value === "string" && FLOWER_TYPES.includes(value as FlowerType)
  );
}
