import { fuchsiaStructure } from "../../components/flowers/fuchsia/Fuchsia";
import { carnationStructure } from "../../components/flowers/carnation/Carnation";
import { plumeriaStructure } from "../../components/flowers/plumeria/Plumeria";
import { foxgloveStructure } from "../../components/flowers/foxglove/Foxglove";
import { sweetPeaStructure } from "../../components/flowers/sweet-pea/SweetPea";
import { bougainvilleaStructure } from "../../components/flowers/bougainvillea/Bougainvillea";
import { birdOfParadiseStructure } from "../../components/flowers/bird-of-paradise/BirdOfParadise";
import { bleedingHeartStructure } from "../../components/flowers/bleeding-heart/BleedingHeart";
import { columbineStructure } from "../../components/flowers/columbine/Columbine";
import { anthuriumStructure } from "../../components/flowers/anthurium/Anthurium";
import { callaLilyStructure } from "../../components/flowers/calla-lily/CallaLily";
import { irisStructure } from "../../components/flowers/iris/Iris";
import { daffodilStructure } from "../../components/flowers/daffodil/Daffodil";
import { poppyStructure } from "../../components/flowers/poppy/Poppy";
import { roseStructure } from "../../components/flowers/rose/roseStructure";
import { lotusStructure } from "../../components/flowers/lotus/Lotus";
import { marigoldStructure } from "../../components/flowers/marigold/Marigold";
import { sunflowerStructure } from "../../components/flowers/sunflower/Sunflower";
import { tulipStructure } from "../../components/flowers/tulip/Tulip";
import { lilyStructure } from "../../components/flowers/lily/Lily";
import { jasmineStructure } from "../../components/flowers/jasmine/Jasmine";
import { orchidStructure } from "../../components/flowers/orchid/Orchid";
import { hibiscusStructure } from "../../components/flowers/hibiscus/Hibiscus";
import { dahliaStructure } from "../../components/flowers/dahlia/Dahlia";
import { peonyStructure } from "../../components/flowers/peony/Peony";
import { lavenderStructure } from "../../components/flowers/lavender/Lavender";
import { chrysanthemumStructure } from "../../components/flowers/chrysanthemum/Chrysanthemum";
import { daisyStructure } from "../../components/flowers/daisy/Daisy";
import { cherryBlossomStructure } from "../../components/flowers/cherry-blossom/CherryBlossom";
import type { FlowerStructure, FlowerType } from "./types";
import { passionflowerStructure } from "../../components/flowers/passionflower/Passionflower";
import { morningGloryStructure } from "../../components/flowers/morning-glory/MorningGlory";

import { cyclamenStructure } from "../../components/flowers/cyclamen/Cyclamen";

import { snapdragonStructure } from "../../components/flowers/snapdragon/Snapdragon";

import { hardyBegoniaStructure } from "../../components/flowers/hardy-begonia/HardyBegonia";

/** Authored anatomy shared by planting layout and geometry verification. */
export const FLOWER_STRUCTURES: Record<FlowerType, FlowerStructure> = {
  "hardy-begonia": hardyBegoniaStructure,
  snapdragon: snapdragonStructure,
  cyclamen: cyclamenStructure,
  bougainvillea: bougainvilleaStructure,
  "sweet-pea": sweetPeaStructure,
  foxglove: foxgloveStructure,
  plumeria: plumeriaStructure,
  carnation: carnationStructure,
  fuchsia: fuchsiaStructure,
  "morning-glory": morningGloryStructure,
  passionflower: passionflowerStructure,
  "bird-of-paradise": birdOfParadiseStructure,
  "bleeding-heart": bleedingHeartStructure,
  columbine: columbineStructure,
  anthurium: anthuriumStructure,
  "calla-lily": callaLilyStructure,
  iris: irisStructure,
  daffodil: daffodilStructure,
  poppy: poppyStructure,
  rose: roseStructure,
  lotus: lotusStructure,
  marigold: marigoldStructure,
  sunflower: sunflowerStructure,
  tulip: tulipStructure,
  lily: lilyStructure,
  jasmine: jasmineStructure,
  orchid: orchidStructure,
  hibiscus: hibiscusStructure,
  dahlia: dahliaStructure,
  peony: peonyStructure,
  lavender: lavenderStructure,
  chrysanthemum: chrysanthemumStructure,
  daisy: daisyStructure,
  "cherry-blossom": cherryBlossomStructure,
};
