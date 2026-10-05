import { performance } from "node:perf_hooks";
import { Matrix4, Quaternion, Euler, Vector3 } from "three";
import { PetalDynamics } from "../lib/three/petalDynamics";
import { specimenCages } from "../lib/three/specimenModel";
import { CARNATION_MODEL } from "../components/flowers/carnation/carnationGeometry";
import { PLUMERIA_MODEL } from "../components/flowers/plumeria/plumeriaGeometry";
import { FOXGLOVE_MODEL } from "../components/flowers/foxglove/foxgloveGeometry";
import { SWEET_PEA_MODEL } from "../components/flowers/sweet-pea/sweetPeaGeometry";
import { BOUGAINVILLEA_MODEL } from "../components/flowers/bougainvillea/bougainvilleaGeometry";
const results = [];
for (const [name, model] of Object.entries({
  carnation: CARNATION_MODEL,
  plumeria: PLUMERIA_MODEL,
  foxglove: FOXGLOVE_MODEL,
  "sweet-pea": SWEET_PEA_MODEL,
  bougainvillea: BOUGAINVILLEA_MODEL,
}))
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
