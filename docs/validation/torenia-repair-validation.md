# Wishbone Flower repair — October 18, 2026

This focused repair starts from merged main `f613aef` on
`codex/torenia-wishbone-realism`. It changes Torenia's geometry, pigments and
inspection coverage. The growing catalog and its taxonomy are unchanged.

## Observed defects and research

The original seven-view browser scenario passed while actual screenshots showed
a star-shaped rim, doubled bright lip edges and reproductive tissue crossing the
roof. Independent generated-mesh checks reproduced four wall intersections
instead of two, roof penetration, and large low/medium rim approximation errors.
Additional bud checks found stigma skins outside the closed corolla.
The individual-blossom study subsequently exposed calyx tissue intruding into
the throat and a thin pigment streak across the periodic UV seam. These defects
were not detectable from the generic rendered-pixel/readiness predicate.

The [updated botanical dossier](../research/torenia.md) separates flora and
specimen evidence from authored geometry and mechanics. Flora of China and the
TU Dresden Botanical Garden photograph guide the broad emarginate upper fan,
three rounded lower lobes, connivent anther pairs and differentiated pigments.
The photograph represents one color form, not a universal cultivar standard.

## Repair and regression scope

- One sealed continuous bilateral corolla replaces five radial bulges and five
  overlapping lip overlays. A finite bud tip preserves positive tissue thickness.
- Four unequal stamens retain paired anther chambers inside the throat. Folded
  style and stigma tissue stays inside flowering and persistent young buds.
- Smooth stigma margins and thinner tissue prevent skin normals reversing during
  interpolated bloom and independent touch closure.
- Opt-in minimum shell sampling preserves Torenia's rounded lobes, calyx wings
  and repeated leaf teeth across quality tiers. Other surfaces keep their existing
  sampling unless they opt in.
- The five-winged calyx follows the corolla neck with positive tissue clearance
  through bloom. Fifteen actual-mesh regressions compare its inner skin with the
  corolla's outer skin across all quality tiers and flowering/young states.
- Pale lilac roof tissue, dark violet lateral blotches, a bounded elongated yellow
  guide and a violet lower border replace the uniform purple treatment. The cream
  stigma and public custom-color path remain separate.
- Circular sine/cosine coordinates preserve pigment continuity across the sealed
  tube's periodic seam. A native-resolution bud-pixel regression reproduced 45
  stray yellow pixels on the old mapping; its dorsal crop excludes the real guide.
- Development-only single-blossom studies expose the throat and closed bud. A
  palette control supports actual rendered-pixel custom-tint and recovery checks.

The five corolla cages retain 640 desktop and 240 constrained nodes. No WGSL,
renderer, atlas, route, catalog or dependency changes are part of this repair.
Opening trajectories, dimensions, RGB values, thickness and all mechanical
parameters remain authored.

## Verification record

Implementation `7e49375` passes 742 unit tests (168.987 seconds), including 56
Torenia cases. Full TypeScript and repository ESLint checks pass. The regressions
were observed failing on the defective geometry or material before their fixes.
Independent source review found and resolved custom-tint replacement,
stigma-normal reversals and the periodic pigment seam.

The geometry-complete revision `93360de` passed 12 inspection cases in
`isolated-inspection-1792299154281`: seven standard views at specimen/overview
detail on desktop Chromium and mobile WebKit, individual-blossom full/bud studies,
garden-overview views and custom-tint recovery. The four standard boards and the
enlarged blossom/bud views were visually reviewed against the botanical reference.
This run predates the final pigment-coordinate correction; geometry is unchanged.

After that correction, `isolated-inspection-1792299655043` passes all six targeted
blossom/tint cases on the final implementation, with no skips, flaky results,
runtime/shader errors or context losses. Enlarged full/bud views were reviewed
again. All four native 773 × 620 bud captures have zero stray yellow pixels in
the dorsal seam crop; tissue coverage is 70.6–73.1%. Both custom-color cases
change actual upper-fan RGB and recover the botanical palette on the same canvas.
These targeted studies exercise ultra, medium and overview geometry; the CPU
surface/containment tests cover all five tiers.

The production build passes with Next.js 16.3.4, build ID
`tcMZt64v-ViBxMcz4Ilcd`. All four targeted production cases pass in
`isolated-production-1792300133569` (two desktop Chromium, two mobile WebKit),
with no errors, context losses, skips or flaky results. They exercise actual
flower pixels, canonical routing, reverse bloom, macro canvas retention,
keyboard pulse, pause/resume, reduced motion, all themes, search and selected
garden interaction with optional WebGPU disabled.

The complete historical 218-case production sweep was not repeated for this
species-only repair. Physical phones were not tested. WGSL, taxonomy and catalog
sources are unchanged, so their separate generation/device checks were not rerun.
The earlier results remain tied to their recorded source revisions.

Earlier screenshots and measurements in
[the batch validation record](cymes-and-spikes-validation.md) belong to the
earlier source revisions. They are not fresh evidence for this repair.

## Fresh CPU observations

The [raw repair samples](data/torenia-repair-dynamics-measurements.json) record two
sequential budgets on Node 24.19.0 and this desktop CPU. Each fresh solver warms
for 30 calls and records 60 calls at full bloom with production transforms and
pins. An independent audit recomputed all five summary statistics for both
metrics, confirmed 240 valid raw values and matched all 23 source hashes.

| Budget      | Nodes | Solver median / p95 (ms) | CPU texture packing median / p95 (ms) |
| ----------- | ----: | -----------------------: | ------------------------------------: |
| Desktop     |   640 |            6.645 / 7.475 |                         0.049 / 0.081 |
| Constrained |   240 |            0.779 / 1.083 |                         0.019 / 0.027 |

These are short CPU observations on the same computer. They exclude browser
cadence, GPU upload/drawing, shader work, independent stigma animation and moving
carrier/rest preparation. They do not establish physical-phone performance or a
frame-rate guarantee. Later GLSL changes are outside this CPU source set.

## Production rendering observations

The [raw rendering observations](data/torenia-repair-rendering-measurements.json)
record four sequential windows on the production build. Independent audit
confirmed all 94 source hashes, unchanged sources during measurement, unique
observed shell tiers at both native endpoints, node budgets and zero recorded
page/shader errors or context losses.

| View                     | Observed tier / nodes | Advances per second | Live solver / packing (ms) | Mean main-scene draws / submitted inputs |
| ------------------------ | --------------------- | ------------------: | -------------------------: | ---------------------------------------: |
| Desktop specimen         | high / 640            |               47.46 |                9.03 / 0.06 |                             45 / 605,082 |
| Desktop macro            | ultra / 640           |               47.43 |               12.16 / 0.08 |                             45 / 906,330 |
| Emulated mobile specimen | low / 240             |                9.73 |               14.77 / 0.46 |                             44 / 214,440 |
| Emulated mobile macro    | medium / 240          |               23.67 |                1.99 / 0.05 |                             44 / 455,508 |

Desktop Chromium reports an NVIDIA RTX 3050 through ANGLE/D3D11 and draws a
3098 × 1936 buffer; Windows WebKit uses iPhone emulation with a 390 × 440 buffer.
These are different engine/buffer observations on one host. The slow mobile
specimen observation is retained; this repair does not establish a performance
improvement or a 60 FPS result.

Advance cadence uses fresh 120-advance wall-time windows and is not presented
frame rate. Live CPU counters are rolling means that carry across views, rather
than isolated per-view medians. Native draw/input counts use a separate window;
their main-scene render boundaries are not complete R3F advances. Instrumentation,
background applications and startup/warmup effects limit comparisons. WebGPU was
disabled; no bake timings were measured. This driver records page errors and
selected shader console errors, not console warning counts. It cannot establish
zero warnings or resolution of the historical `glGetProgramiv` warnings.
