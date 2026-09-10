"use client";
import type { FlowerProps } from "@/lib/flowers/types";
import { Rose } from "./rose/Rose";
import { Lotus } from "./lotus/Lotus";
import { Tulip } from "./tulip/Tulip";
import { Sunflower } from "./sunflower/Sunflower";
import { Marigold } from "./marigold/Marigold";
import { Lily } from "./lily/Lily";
import { Jasmine } from "./jasmine/Jasmine";
import { Orchid } from "./orchid/Orchid";
import { Hibiscus } from "./hibiscus/Hibiscus";
import { Dahlia } from "./dahlia/Dahlia";
import { Peony } from "./peony/Peony";
import { Lavender } from "./lavender/Lavender";
import { Chrysanthemum } from "./chrysanthemum/Chrysanthemum";
import { Daisy } from "./daisy/Daisy";
import { CherryBlossom } from "./cherry-blossom/CherryBlossom";
import { Poppy } from "./poppy/Poppy";
import { Daffodil } from "./daffodil/Daffodil";
import { Iris } from "./iris/Iris";
const SPECIES = {
  "iris": Iris,
  "daffodil": Daffodil,
  poppy: Poppy,
  rose: Rose,
  lotus: Lotus,
  tulip: Tulip,
  sunflower: Sunflower,
  marigold: Marigold,
  lily: Lily,
  jasmine: Jasmine,
  orchid: Orchid,
  hibiscus: Hibiscus,
  dahlia: Dahlia,
  peony: Peony,
  lavender: Lavender,
  chrysanthemum: Chrysanthemum,
  daisy: Daisy,
  "cherry-blossom": CherryBlossom,
};
export function Flower({ type, ...props }: FlowerProps) {
  const Species = SPECIES[type];
  return <Species {...props} />;
}
