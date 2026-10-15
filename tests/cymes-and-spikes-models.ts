import type { SpecimenModel, SpecimenOrgan } from "../lib/three/specimenModel";
import {
  LUPINE_MODEL,
  LUPINE_STALKS,
} from "../components/flowers/lupine/lupineGeometry";
import {
  HOLLYHOCK_MODEL,
  HOLLYHOCK_STALKS,
} from "../components/flowers/hollyhock/hollyhockGeometry";
import {
  FRITILLARIA_MODEL,
  FRITILLARIA_STALKS,
} from "../components/flowers/fritillaria/fritillariaGeometry";
import {
  TUBEROSE_MODEL,
  TUBEROSE_STALKS,
} from "../components/flowers/tuberose/tuberoseGeometry";
import {
  IXORA_MODEL,
  IXORA_STALKS,
} from "../components/flowers/ixora/ixoraGeometry";
import {
  PENTAS_MODEL,
  PENTAS_STALKS,
} from "../components/flowers/pentas/pentasGeometry";
import { TORENIA_STALKS } from "../components/flowers/torenia/toreniaGeometry";
import { TORENIA_RENDER_MODEL } from "../components/flowers/torenia/toreniaStigmaGeometry";
import {
  LOBELIA_MODEL,
  LOBELIA_STALKS,
} from "../components/flowers/lobelia/lobeliaGeometry";
import {
  HOYA_MODEL,
  HOYA_STALKS,
} from "../components/flowers/hoya/hoyaGeometry";
import {
  IMPATIENS_MODEL,
  IMPATIENS_STALKS,
} from "../components/flowers/impatiens/impatiensGeometry";

export const CYMES_MODELS: {
  slug: string;
  component: string;
  model: SpecimenModel;
  stalks: SpecimenOrgan[];
  firstFlowerCluster: number;
  attachment: "model" | "bridge";
}[] = [
  {
    slug: "lupine",
    component: "Lupine",
    model: LUPINE_MODEL,
    stalks: LUPINE_STALKS,
    firstFlowerCluster: 1,
    attachment: "model",
  },
  {
    slug: "hollyhock",
    component: "Hollyhock",
    model: HOLLYHOCK_MODEL,
    stalks: HOLLYHOCK_STALKS,
    firstFlowerCluster: 1,
    attachment: "model",
  },
  {
    slug: "fritillaria",
    component: "Fritillaria",
    model: FRITILLARIA_MODEL,
    stalks: FRITILLARIA_STALKS,
    firstFlowerCluster: 1,
    attachment: "model",
  },
  {
    slug: "tuberose",
    component: "Tuberose",
    model: TUBEROSE_MODEL,
    stalks: TUBEROSE_STALKS,
    firstFlowerCluster: 1,
    attachment: "model",
  },
  {
    slug: "ixora",
    component: "Ixora",
    model: IXORA_MODEL,
    stalks: IXORA_STALKS,
    firstFlowerCluster: 0,
    attachment: "bridge",
  },
  {
    slug: "pentas",
    component: "Pentas",
    model: PENTAS_MODEL,
    stalks: PENTAS_STALKS,
    firstFlowerCluster: 0,
    attachment: "bridge",
  },
  {
    slug: "torenia",
    component: "Torenia",
    model: TORENIA_RENDER_MODEL,
    stalks: TORENIA_STALKS,
    firstFlowerCluster: 0,
    attachment: "bridge",
  },
  {
    slug: "lobelia",
    component: "Lobelia",
    model: LOBELIA_MODEL,
    stalks: LOBELIA_STALKS,
    firstFlowerCluster: 0,
    attachment: "bridge",
  },
  {
    slug: "hoya",
    component: "Hoya",
    model: HOYA_MODEL,
    stalks: HOYA_STALKS,
    firstFlowerCluster: 0,
    attachment: "bridge",
  },
  {
    slug: "impatiens",
    component: "Impatiens",
    model: IMPATIENS_MODEL,
    stalks: IMPATIENS_STALKS,
    firstFlowerCluster: 0,
    attachment: "bridge",
  },
];
