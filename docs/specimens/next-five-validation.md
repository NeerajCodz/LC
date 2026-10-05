# Next five specimens — validation record

Reviewed October 6, 2026, from updated main at `536bad1`. This batch adds
Cyclamen, Snapdragon, Hardy Begonia, Lacecap Hydrangea and King Protea. Each
[research dossier](../botanical-references.md) separates source-backed anatomy
from authored counts, dimensions, colors and mechanical parameters. These are
procedural botanical art studies; tissue mechanics and optical coefficients are
not calibrated measurements.

## Anatomy and surfaces

| Specimen          | Authored composition and distinguishing geometry                                                                                                                                                                                                                                          |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Cyclamen          | Three mature flowers and two younger buds, five reflexed twisted lobes per flower, a continuous downward corolla cup, included stamens/style, separate curved basal stalks, and six continuous cordate silver-zoned leaves.                                                               |
| Snapdragon        | Eight hollow bilateral flowers and four terminal buds, five calyx teeth and four unequal included stamens per flower, a lower palate that depresses under pressure, and lower opposite / upper alternate leaves.                                                                          |
| Hardy Begonia     | Two male, two female flowers and two buds on a forked cyme; male flowers have four tepals and forty authored stamens, female flowers three tepals, three paired stigma arms and three unequal ovary wings. Continuous asymmetric serrate leaves retain red veins and undersides.          |
| Lacecap Hydrangea | Ten marginal flowers with four showy sepals each, forty-eight true central fertile florets with five petals, ten stamens and three styles each, connected pedicels and opposite serrate leaves on a woody axis.                                                                           |
| King Protea       | Thirty-two thick overlapping bracts surrounding 128 true florets with perianth bases/limbs, included anthers and pollen-presenting styles; firm woody support and leathery leaves. Fine striation and silver sheen are authored surface treatments, not measured species hair dimensions. |

Render shells have positive thickness, closed rims, deterministic open/folded
positions and matching normals. Quality changes reduce tessellation without
removing authored florets or Begonia's sex-specific organs. Repeated florets use
real sealed instanced geometry, initialized transforms and morph textures before
the first draw, and Three's matching normal/depth/distance-shadow morph paths.
Their shared materials and geometry are disposed explicitly.

The seven-view development fixture was inspected beside Rose against the linked
botanical references: front, side, 45 degrees, macro, bud, half bloom and full
bloom. Review found split folded bud tips, downward-facing custom leaf surfaces
and a low Protea floret core. Corrections gathered bud tips, composed custom leaf
pitch before shoot yaw, connected petioles and raised the Protea receptacle.
Production macro captures were reviewed after the final leaf correction.
Screenshots remain in ignored validation outputs rather than application assets.

## Mechanics and lifecycle

The existing XPBD solver supplies pinned attachments, stretch/bend/rest
constraints, damping and thickness-aware vertex/triangle and edge contact.
Whole-plant cages stay below 2,048 desktop and 512 constrained nodes, with bounded
1/120- and 1/60-second fixed substeps. Hydrangea sepals and Protea bracts yield
around pinned midribs. Dense central florets follow anchored carriers and bloom
morphs; they do not each receive a collision cage. Sub-cage features and swept
crossings cannot be guaranteed collision-free, and tearing/crushing are outside
the model.

Snapdragon pressure changes both visible position/normal morphs and cage rest.
It leaves the insertion fixed, cannot open a folded bud, and returns through the
retained articulation spring. Pointer contact and keyboard pulse controls share
this response. All five retain cages across macro tessellation changes; paused
simulation freezes without catch-up, offscreen frame work stops, and reduced
motion settles directly to rest. Quality/device-budget transitions retain the
authored anatomy, while a changed device budget rebuilds the cage at current bloom.

## Verification

- TypeScript checking and full repository lint pass.
- All **83 unit tests** pass, including sealed geometry, positive thickness,
  deterministic samples, valid open/folded normals, intermediate/reverse bloom,
  authored organ arrangements, floret initialization/retention, pressure and
  pinned transformed cage stress at both budgets. Existing solver tests cover
  contact separation, recovery, frame-rate variation, extreme inputs and clocks.
- All **six taxonomy tests** pass. Inventory generation and audit pass; all five
  new taxa match accepted WFO entries. The inventory contains 36 authored studies,
  34 matched taxa and an explicit `exactBiologicalSimulationVerified: false`.
  Inventory membership does not establish implementation or scientific validation.
- The production build passes and generates the catalog's canonical routes;
  `/`, `/gallery/` and `/garden/` remain usable on port **1607**.
- The seven-view inspection fixture passed for Rose and all five additions;
  corrected specimens were recaptured. The production browser suite covers new
  and previous specimens, rendered pixels, bloom, themes, Latin-name search,
  both garden layouts, touch/keyboard interaction, macro retention, pause/resume,
  reduced motion, retained previews, scrolling, WebGPU absence and renderer retry.
- The combined run passed **53 of 54 browser scenarios**: all 27 desktop cases
  and 26 mobile cases. One mobile null-WebGL case passed every DOM assertion but
  reported WebKit access-control errors on Next route-prefetch requests during
  navigation. Its unmodified five-case fallback suite then passed **15/15** over
  three repetitions, including all three repetitions of the failed case. No
  errors were filtered or product code changed for that recheck; the transient
  navigation error was not reproduced.
- No WGSL changed, so no new WGSL hardware validation was required. Actual
  specimen shader rendering was exercised in hardware Chromium and Windows
  mobile-WebKit emulation. Physical-phone validation remains outstanding.

## Measured CPU solver cost

Local Windows, Intel Core i7-13650HX, Node v24.19.0; 30 warm-up frames followed by
60 measured frames per cage. Each advances 1/60 second, with desktop integrating
1/120-second substeps and constrained cages 1/60. Full-open transformed clusters
include pinned obstacles/midribs, wind and local pointer loading. These samples
exclude texture preparation/upload and drawing. The constrained measurements
use the same desktop CPU, not a phone.

| Specimen          | Desktop nodes | Median / p95 ms | Constrained nodes | Median / p95 ms |
| ----------------- | ------------: | --------------: | ----------------: | --------------: |
| Cyclamen          |           600 |   3.501 / 4.570 |               300 |   0.626 / 0.911 |
| Snapdragon        |           768 |   4.753 / 5.344 |               240 |   0.463 / 0.590 |
| Hardy Begonia     |           336 |   1.306 / 1.761 |               168 |   0.218 / 0.326 |
| Lacecap Hydrangea |           600 |   2.360 / 2.832 |               480 |   0.751 / 1.173 |
| King Protea       |           768 |   6.204 / 7.488 |               384 |   1.328 / 1.630 |

Reproduce with
`npx tsx scripts/benchmark-petal-physics.ts cyclamen,snapdragon,hardy-begonia,hydrangea,king-protea`.

## Rendering measurements

Production server on port 1607; one browser/page measured at a time, with optional
WebGPU disabled. All twenty samples reported WebGL tissue and lighting fallbacks,
no page errors and no lost contexts. Desktop Chromium used a 1600 × 1000 viewport
and a 3098 × 1936 backing buffer on ANGLE / NVIDIA GeForce RTX 3050 6GB Laptop GPU /
D3D11. WebKit used Playwright's iPhone 13 profile with a 390 × 440 canvas buffer.
Its reported “Apple GPU” is a Windows emulation result, not an iPhone measurement.

Each page warmed for at least sixty drawn frames. Measurement starts at a fresh
30-frame counter boundary and counts 120 newly drawn frames using wall time,
first in normal view and then macro, with full bloom and default motion. This
includes solver work, texture preparation/upload, lighting and drawing; it does
not isolate GPU time. CPU telemetry is a running mean reported by the live cage.
Actual frame delays can integrate more fixed substeps than the CPU-only benchmark.

| Specimen          | Desktop normal / macro FPS | Emulated WebKit normal / macro FPS |
| ----------------- | -------------------------: | ---------------------------------: |
| Cyclamen          |                48.5 / 48.4 |                        19.0 / 17.1 |
| Snapdragon        |                48.1 / 48.2 |                        21.2 / 21.3 |
| Hardy Begonia     |                48.5 / 47.2 |                        20.1 / 20.5 |
| Lacecap Hydrangea |                47.2 / 48.5 |                        20.5 / 17.9 |
| King Protea       |                47.9 / 47.8 |                        22.7 / 15.6 |

| Specimen          | Desktop solver normal / macro ms | Desktop transfer normal / macro ms | WebKit solver normal / macro ms | WebKit transfer normal / macro ms |
| ----------------- | -------------------------------: | ---------------------------------: | ------------------------------: | --------------------------------: |
| Cyclamen          |                      4.91 / 4.75 |                        0.04 / 0.04 |                     4.86 / 5.73 |                       0.25 / 0.22 |
| Snapdragon        |                      6.63 / 6.31 |                        0.04 / 0.04 |                     0.98 / 2.57 |                       0.00 / 0.04 |
| Hardy Begonia     |                      1.98 / 1.93 |                        0.02 / 0.03 |                     0.54 / 0.44 |                       0.02 / 0.01 |
| Lacecap Hydrangea |                      3.21 / 3.18 |                        0.02 / 0.02 |                     1.54 / 6.15 |                       0.04 / 0.35 |
| King Protea       |                      8.90 / 7.85 |                        0.05 / 0.05 |                     2.70 / 8.11 |                       0.03 / 0.26 |

“Transfer” measures CPU preparation of displacement/normal texture data; actual
GPU upload is included in overall frame wall time. The rounded 0.00 ms cell is
below the telemetry's two-decimal resolution, not zero work. Isolated upload/draw
GPU timer queries and isolated cold shader compilation were not measured.

| Specimen          | Desktop / emulated WebKit startup to thirty frames, seconds |
| ----------------- | ----------------------------------------------------------: |
| Cyclamen          |                                                 4.21 / 4.59 |
| Snapdragon        |                                                 2.77 / 4.19 |
| Hardy Begonia     |                                                 3.30 / 4.46 |
| Lacecap Hydrangea |                                                 2.97 / 4.10 |
| King Protea       |                                                 2.55 / 4.17 |

Startup includes navigation, resources, renderer/material initialization and
thirty frames of drawing on a fresh page; it is not a cold-cache shader-only
benchmark. The initial branch baseline, sampled with the same warm frame method,
observed Rose at 48.6 / 28.6 desktop normal/macro FPS and 22.9 / 19.1 in emulated
WebKit. Baseline Carnation and Foxglove desktop views ranged from 47.0–48.3 FPS.
The new rows show no obvious desktop cadence loss relative to these local
references, but short sequential samples do not establish a universal regression
bound, sustained thermal behavior, 60 FPS, or photographic equivalence.
Emulated WebKit is visibly slower, especially dense macro views; physical-device
performance and isolated GPU profiling remain open verification gaps.

Reproduce with
`npx tsx scripts/benchmark-specimen-rendering.ts cyclamen,snapdragon,hardy-begonia,hydrangea,king-protea desktop,mobile`
against the production server. Raw JSON, logs and screenshots are kept in ignored
`dist/next-specimens/`; the tables above preserve the measured results in Git.
