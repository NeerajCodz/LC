import { GAZANIA_MODEL } from "../components/flowers/gazania/gazaniaGeometry";
import { SALVIA_MODEL } from "../components/flowers/salvia/salviaGeometry";
import { NICOTIANA_MODEL } from "../components/flowers/nicotiana/nicotianaGeometry";
import { LANTANA_MODEL } from "../components/flowers/lantana/lantanaGeometry";
import { ECHINACEA_MODEL } from "../components/flowers/echinacea/echinaceaGeometry";
import { performance } from "node:perf_hooks";
import os from "node:os";
import { Matrix4, Quaternion, Euler, Vector3 } from "three";
import { PetalDynamics } from "../lib/three/petalDynamics";
import { applySpecimenPins, specimenCages } from "../lib/three/specimenModel";
import { PANSY_MODEL } from "../components/flowers/pansy/pansyGeometry";
import { AFRICAN_VIOLET_MODEL } from "../components/flowers/african-violet/africanVioletGeometry";
import { BLUEBELL_MODEL } from "../components/flowers/bluebell/bluebellGeometry";
import { HYACINTH_MODEL } from "../components/flowers/hyacinth/hyacinthGeometry";
import { AMARYLLIS_MODEL } from "../components/flowers/amaryllis/amaryllisGeometry";
import { CANNA_MODEL } from "../components/flowers/canna/cannaGeometry";
import { AGAPANTHUS_MODEL } from "../components/flowers/agapanthus/agapanthusGeometry";
import { WISTERIA_MODEL } from "../components/flowers/wisteria/wisteriaGeometry";
import { BOTTLEBRUSH_MODEL } from "../components/flowers/bottlebrush/bottlebrushGeometry";
import { SCABIOSA_MODEL } from "../components/flowers/scabiosa/scabiosaGeometry";
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
const startedAt = new Date().toISOString();
const environment = {
  platform: process.platform,
  arch: process.arch,
  osRelease: os.release(),
  cpu: os.cpus()[0]?.model,
  logicalProcessors: os.cpus().length,
  totalMemoryGiB: os.totalmem() / 2 ** 30,
  availableMemoryMiBAtStart: os.freemem() / 2 ** 20,
};
for (const [name, model] of Object.entries({
  gazania: GAZANIA_MODEL,
  salvia: SALVIA_MODEL,
  nicotiana: NICOTIANA_MODEL,
  lantana: LANTANA_MODEL,
  echinacea: ECHINACEA_MODEL,

  pansy: PANSY_MODEL,
  "african-violet": AFRICAN_VIOLET_MODEL,
  bluebell: BLUEBELL_MODEL,
  hyacinth: HYACINTH_MODEL,
  amaryllis: AMARYLLIS_MODEL,
  canna: CANNA_MODEL,
  agapanthus: AGAPANTHUS_MODEL,
  wisteria: WISTERIA_MODEL,
  bottlebrush: BOTTLEBRUSH_MODEL,
  scabiosa: SCABIOSA_MODEL,
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
    }
    applySpecimenPins(sim, model, indices);
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
    const sorted = [...samples].sort((a, b) => a - b);
    results.push({
      name,
      device: constrained ? "constrained" : "desktop",
      nodes: sim.inverseMass.length,
      medianMs: +((sorted[29] + sorted[30]) / 2).toFixed(3),
      p95Ms: +sorted[56].toFixed(3),
      meanMs: +(
        samples.reduce((sum, value) => sum + value, 0) / samples.length
      ).toFixed(3),
      samplesMs: samples,
    });
  }
console.log(
  JSON.stringify(
    {
      runtime: process.version,
      startedAt,
      finishedAt: new Date().toISOString(),
      environment,
      warmupFrames: 30,
      framesPerSample: 60,
      step: "1/60 input; 1/120 desktop or 1/60 constrained integration",
      scope: "CPU solver only, after 30 warmup frames; no draw/upload cost",
      rest: "full bloom with authored cluster transforms and shared production pin initialization",
      forces: { wind: 0.7, pulse: 0, x: 0, y: 0.4, z: 0.2, proximity: 0.8 },
      percentile:
        "median averages samples29/30; p95 nearest rank uses sample56 after sorting sixty samples (zero-indexed)",
      limits:
        "both cage tiers run on this same CPU; excludes per-frame rest/articulation preparation, deformation transfer, instanced tissue, browser/GPU cost and render cadence; no physical-phone/FPS claim",
      results,
    },
    null,
    2,
  ),
);
