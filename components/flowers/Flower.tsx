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
import { CallaLily } from "./calla-lily/CallaLily";
import { Anthurium } from "./anthurium/Anthurium";
import { Columbine } from "./columbine/Columbine";
import { BleedingHeart } from "./bleeding-heart/BleedingHeart";
import { BirdOfParadise } from "./bird-of-paradise/BirdOfParadise";
import { Passionflower } from "./passionflower/Passionflower";
import { MorningGlory } from "./morning-glory/MorningGlory";
import { Fuchsia } from "./fuchsia/Fuchsia";
import { Carnation } from "./carnation/Carnation";
import { Plumeria } from "./plumeria/Plumeria";
import { Foxglove } from "./foxglove/Foxglove";
import { SweetPea } from "./sweet-pea/SweetPea";
import { Bougainvillea } from "./bougainvillea/Bougainvillea";
import { Cyclamen } from "./cyclamen/Cyclamen";
import { Snapdragon } from "./snapdragon/Snapdragon";
import { HardyBegonia } from "./hardy-begonia/HardyBegonia";
import { Hydrangea } from "./hydrangea/Hydrangea";
import { KingProtea } from "./king-protea/KingProtea";
import { Hellebore } from "./hellebore/Hellebore";
import { Primrose } from "./primrose/Primrose";
import { Petunia } from "./petunia/Petunia";
import { LilyOfTheValley } from "./lily-of-the-valley/LilyOfTheValley";
import { Snowdrop } from "./snowdrop/Snowdrop";
import { Gladiolus } from "./gladiolus/Gladiolus";
import { Delphinium } from "./delphinium/Delphinium";
import { Alstroemeria } from "./alstroemeria/Alstroemeria";
import { Gerbera } from "./gerbera/Gerbera";
import { Zinnia } from "./zinnia/Zinnia";
import { Ranunculus } from "./ranunculus/Ranunculus";
import { Anemone } from "./anemone/Anemone";
const SPECIES = {
  anemone: Anemone,
  ranunculus: Ranunculus,
  zinnia: Zinnia,
  gerbera: Gerbera,
  alstroemeria: Alstroemeria,
  delphinium: Delphinium,
  gladiolus: Gladiolus,
  snowdrop: Snowdrop,
  "lily-of-the-valley": LilyOfTheValley,
  petunia: Petunia,
  primrose: Primrose,
  hellebore: Hellebore,
  "king-protea": KingProtea,
  hydrangea: Hydrangea,
  "hardy-begonia": HardyBegonia,
  snapdragon: Snapdragon,
  cyclamen: Cyclamen,
  bougainvillea: Bougainvillea,
  "sweet-pea": SweetPea,
  foxglove: Foxglove,
  plumeria: Plumeria,
  carnation: Carnation,
  fuchsia: Fuchsia,
  "morning-glory": MorningGlory,
  passionflower: Passionflower,
  "bird-of-paradise": BirdOfParadise,
  "bleeding-heart": BleedingHeart,
  columbine: Columbine,
  anthurium: Anthurium,
  "calla-lily": CallaLily,
  iris: Iris,
  daffodil: Daffodil,
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
