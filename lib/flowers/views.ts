export const FLOWER_VIEWS = [
  {
    id: "front",
    label: "Front",
    detail: "The complete silhouette",
    number: "01",
  },
  {
    id: "three-quarter",
    label: "45°",
    detail: "Layers, light, and depth",
    number: "02",
  },
  {
    id: "side",
    label: "Side",
    detail: "A different kind of symmetry",
    number: "03",
  },
  {
    id: "macro",
    label: "Macro",
    detail: "Inside the smallest details",
    number: "04",
  },
] as const;
export type FlowerView = (typeof FLOWER_VIEWS)[number]["id"];
