import { performance } from "node:perf_hooks";
import { Matrix4, Quaternion, Euler, Vector3 } from "three";
import { PetalDynamics } from "../lib/three/petalDynamics";
import { specimenCages } from "../lib/three/specimenModel";
import { CARNATION_MODEL } from "../components/flowers/carnation/carnationGeometry";
import { PLUMERIA_MODEL } from "../components/flowers/plumeria/plumeriaGeometry";
import { FOXGLOVE_MODEL } from "../components/flowers/foxglove/foxgloveGeometry";
import { SWEET_PEA_MODEL } from "../components/flowers/sweet-pea/sweetPeaGeometry";
import { BOUGAINVILLEA_MODEL } from "../components/flowers/bougainvillea/bougainvilleaGeometry";
import { CYCLAMEN_MODEL } from "../components/flowers/cyclamen/cyclamenGeometry";
import { SNAPDRAGON_MODEL } from "../components/flowers/snapdragon/snapdragonGeometry";
import { BEGONIA_MODEL } from "../components/flowers/hardy-begonia/begoniaGeometry";
import { HYDRANGEA_MODEL } from "../components/flowers/hydrangea/hydrangeaGeometry";
import { PROTEA_MODEL } from "../components/flowers/king-protea/proteaGeometry";
import { HELLEBORE_MODEL } from "../components/flowers/hellebore/helleboreGeometry";
import { PRIMROSE_MODEL } from "../components/flowers/primrose/primroseGeometry";
import { PETUNIA_MODEL } from "../components/flowers/petunia/petuniaGeometry";
import { LILY_OF_THE_VALLEY_MODEL } from "../components/flowers/lily-of-the-valley/lilyOfTheValleyGeometry";
import { SNOWDROP_MODEL } from "../components/flowers/snowdrop/snowdropGeometry";
import { GLADIOLUS_MODEL } from "../components/flowers/gladiolus/gladiolusGeometry";
import { DELPHINIUM_MODEL } from "../components/flowers/delphinium/delphiniumGeometry";
import { ALSTROEMERIA_MODEL } from "../components/flowers/alstroemeria/alstroemeriaGeometry";
import { GERBERA_MODEL } from "../components/flowers/gerbera/gerberaGeometry";
import { ZINNIA_MODEL } from "../components/flowers/zinnia/zinniaGeometry";
import { RANUNCULUS_MODEL } from "../components/flowers/ranunculus/ranunculusGeometry";
import { ANEMONE_MODEL } from "../components/flowers/anemone/anemoneGeometry";
import { CROCUS_MODEL } from "../components/flowers/crocus/crocusGeometry";
import { FREESIA_MODEL } from "../components/flowers/freesia/freesiaGeometry";
import { LISIANTHUS_MODEL } from "../components/flowers/lisianthus/lisianthusGeometry";
import { CAMELLIA_MODEL } from "../components/flowers/camellia/camelliaGeometry";
import { MAGNOLIA_MODEL } from "../components/flowers/magnolia/magnoliaGeometry";
import { GARDENIA_MODEL } from "../components/flowers/gardenia/gardeniaGeometry";
import { NASTURTIUM_MODEL } from "../components/flowers/nasturtium/nasturtiumGeometry";
import { COSMOS_MODEL } from "../components/flowers/cosmos/cosmosGeometry";
const results = [];
for (const [name, model] of Object.entries({
  ranunculus: RANUNCULUS_MODEL,
  anemone: ANEMONE_MODEL,
  crocus: CROCUS_MODEL,
  freesia: FREESIA_MODEL,
  lisianthus: LISIANTHUS_MODEL,
  camellia: CAMELLIA_MODEL,
  magnolia: MAGNOLIA_MODEL,
  gardenia: GARDENIA_MODEL,
  nasturtium: NASTURTIUM_MODEL,
  cosmos: COSMOS_MODEL,
  hellebore: HELLEBORE_MODEL,
  primrose: PRIMROSE_MODEL,
  petunia: PETUNIA_MODEL,
  "lily-of-the-valley": LILY_OF_THE_VALLEY_MODEL,
  snowdrop: SNOWDROP_MODEL,
  gladiolus: GLADIOLUS_MODEL,
  delphinium: DELPHINIUM_MODEL,
  alstroemeria: ALSTROEMERIA_MODEL,
  gerbera: GERBERA_MODEL,
  zinnia: ZINNIA_MODEL,
  carnation: CARNATION_MODEL,
  plumeria: PLUMERIA_MODEL,
  foxglove: FOXGLOVE_MODEL,
  "sweet-pea": SWEET_PEA_MODEL,
  bougainvillea: BOUGAINVILLEA_MODEL,
  cyclamen: CYCLAMEN_MODEL,
  snapdragon: SNAPDRAGON_MODEL,
  "hardy-begonia": BEGONIA_MODEL,
  hydrangea: HYDRANGEA_MODEL,
  "king-protea": PROTEA_MODEL,
}).filter(
  ([name]) => !process.argv[2] || process.argv[2].split(",").includes(name),
))
  for (const constrained of [false, true]) {
    const { indices, patches } = specimenCages(model, constrained),
      sim = new PetalDynamics(patches, constrained);
    const matrices = indices.map((i) => {
      const c = model.clusters[model.surfaces[i].cluster];
      return new Matrix4().compose(
        new Vector3(...c.position),
        new Quaternion().setFromEuler(new Euler(...c.rotation)),
        new Vector3(c.scale, c.scale, c.scale),
      );
    });
    for (let i = 0; i < indices.length; i++) {
      sim.setRest(i, 1, matrices[i].elements);
      if (model.surfaces[indices[i]].pinMidrib) {
        const p = patches[i],
          stride = p.columns + 1;
        for (let row = 0; row <= p.rows; row++)
          sim.inverseMass[
            sim.offsets[i] + row * stride + Math.floor(stride / 2)
          ] = 0;
      }
    }
    sim.reset();
    const forces = {
      wind: 0.7,
      time: 0,
      pulse: 0,
      x: 0,
      y: 0.4,
      z: 0.2,
      proximity: 0.8,
    };
    const samples: number[] = [];
    for (let frame = 0; frame < 90; frame++) {
      forces.time = frame / 60;
      const start = performance.now();
      sim.step(1 / 60, forces);
      if (frame >= 30) samples.push(performance.now() - start);
    }
    samples.sort((a, b) => a - b);
    results.push({
      name,
      device: constrained ? "constrained" : "desktop",
      nodes: sim.inverseMass.length,
      medianMs: +samples[30].toFixed(3),
      p95Ms: +samples[57].toFixed(3),
    });
  }
console.log(
  JSON.stringify(
    {
      runtime: process.version,
      framesPerSample: 60,
      step: "1/60 input; 1/120 desktop or 1/60 constrained integration",
      scope: "CPU solver only, after 30 warmup frames; no draw/upload cost",
      results,
    },
    null,
    2,
  ),
);
