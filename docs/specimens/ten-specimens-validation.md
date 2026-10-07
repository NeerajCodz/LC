# Ten researched specimens — validation record

Implementation and review October 7–8, 2026, from updated main at `068456d`.
The [implementation plan](../plans/ten-realistic-specimens.md) and ten linked
[dossiers](../botanical-references.md) distinguish sourced anatomy from authored
counts, proportions, colors and mechanics. These are procedural botanical art
studies, not calibrated tissue or optical simulations.

## Geometry and anatomy

| Specimen           | Authored composition and preserved anatomy                                                                                                                                                                                   |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Hellebore          | Three flowers and one bud; five substantial sepals, ten tubular nectar petals, forty stamens and five carpels per flower, connected pedicels and seven-leaflet basal foliage.                                                |
| Primrose           | Five flowers and two buds on separate basal stalks; continuous five-lobed notched corollas, long pin-form style at the mouth, five anthers lower in the tube and a wrinkled rosette.                                         |
| Petunia            | Three flowers and two buds; continuous white corollas with long narrow tubes, five calyx lobes, unequal included stamens/stigma, a branched leafy shoot and authored glandular surface appearance.                           |
| Lily of the Valley | Eight hanging bells and three buds on an arching raceme; six rim teeth and included stamens, superior ovary/style, terminal bracts and two broad parallel-veined leaves.                                                     |
| Snowdrop           | Two mature solitary scapes and one bud scape; inferior ovaries, three outer/three shorter notched inner tepals, inner-only green marking, six stamens, spathes and two leaves per scape.                                     |
| Gladiolus          | Eight flowers and three buds; fused oblique tubes, six unequal tepals with guides on the outer three, unilateral stamens/three style arms, spathe valves and four sword blades.                                              |
| Delphinium         | Nine flowers and three buds; five sepals, hollow ascending dorsal spur with closed cap and two internal nectar-petal spurs, four inner petals, two lower beards, twenty stamens/three carpels and continuous palmate leaves. |
| Alstroemeria       | Three flowers and two buds; six unequal free tepals, markings on the two upper inner tepals, inferior ovaries, six stamens/three style arms and alternate resupinate leaves.                                                 |
| Gerbera            | Thirty-two female outer rays, twenty-four inner female rays and sixty-four bilateral bisexual disk florets, including anthers/styles, an involucre and pinnatifid basal foliage.                                             |
| Zinnia             | An authored semi-double head with twenty-eight female rays and thirty-two five-lobed bisexual disk florets, bicolored involucral bracts and opposite sessile clasping leaves.                                                |

Shells have positive thickness, closed rims, deterministic open/folded positions
and matching normals. Dense prototypes are real sealed geometry; all authored
instances persist at constrained quality. Bilateral Gerbera florets are distinct
from Zinnia's five-lobed disk corollas. Shared tissue/HDR resources retain their
WebGL fallbacks; no photographs, sprites, billboard flowers, blur or visual bloom
were introduced. WGSL was not changed.

## Visual review and corrections

All ten development fixtures were captured and inspected against their botanical
accounts and Rose: front, side, 45 degrees, macro, bud, half bloom and side bud.
The production specimen checks additionally capture full bloom and camera
interaction. Numeric tests complement these views; neither alone proves
photographic equivalence.

Review corrected narrow Hellebore/Primrose buds and shallow Hellebore cups.
Delphinium's dark palmate foliage exposed both inherited petal-root pigmentation
and a missing neutral vertex-color attribute; dedicated leaf pigment handling
and required attributes fixed the rendered result. Assembled upper/lower floral
frames were corrected for Gladiolus, Delphinium and Alstroemeria; Delphinium's
spur now uses an orthogonal tube section, matching cap/internal nectaries and
an ascending direction. Zinnia received a longer authored peduncle so its
opposite foliage stays below the mature head. Corrected fixtures were recaptured
and inspected without page or shader errors.

Counts, age caps, palettes, surface coefficients and dimensions remain authored.
Pubescence appearance uses tissue optics/geometry detail and quality-scaled
Delphinium beard hairs; it does not establish measured hair density for every
organ. Scent, nectar secretion, pollination success, fruiting, temperature-driven
opening and biological reopening are not modeled.

## Contact and lifecycle

The existing XPBD solver retains stretch/bend/rest constraints, damping,
thickness-aware vertex/triangle and edge contact and pinned attachments. All ten
models stay below 2,048 desktop / 512 constrained nodes, using bounded 1/120- and
1/60-second substeps. Tubes, ovaries and the Delphinium spur constrain the softer
blades/rays. Dense florets follow anchored carriers and bloom morphs without
individual collision cages. Fine sub-cage details, swept crossings and every
possible dense-layer intersection cannot be guaranteed separated; tearing and
crushing are outside the model.

Macro tessellation changes retain cages; paused/offscreen simulation freezes
without catch-up, and reduced motion settles directly to rest. Existing
solver/clock tests cover separation, recovery, extreme inputs, frame-rate
variation, shadows and lifecycle. New tests stress every transformed model at
both budgets through gusts, pointer pressure, reverse bloom, release and direct
settling while checking finite positions and exact fixed insertions.

## Verification

- TypeScript and full repository lint pass.
- **161 unit tests** pass, including all ten models, leaf topology/attributes,
  channel isolation, assembled dorsal orientation, spur joins/caps, peduncle
  clearance, true floret prototypes and contact stress.
- All **six taxonomy tests** pass. Inventory generation/checksum audit pass;
  46 authored studies have 42 unambiguous exact-name candidates. Gerbera and
  Zinnia each have duplicate candidates in the pinned WFO release, alongside the
  original ornamental Rose/Lily naming gaps. Scientific simulation verification
  remains explicitly false; inventory presence does not validate anatomy.
- The production build passes, generating the catalog's 46 canonical specimen
  routes plus the preserved home, gallery, garden and icon routes on port 1607.
- Seven-view development captures and corrected recaptures pass. Final
  shared-program macro captures for all ten were also inspected: separate
  species pigments, upper tepal markings, inner Snowdrop greens and true
  Gerbera/Zinnia florets remain visible.
- The final 44-case production sweep passed **43/44**: all 22 desktop cases and
  21/22 mobile cases. Mobile Zinnia rendered through every view/theme and garden
  selection but reported an RSC fetch access-control diagnostic during navigation.
  Its isolated recheck passed **1/1** without changing or filtering the test.
  Both projects passed the all-ten physics lifecycle, full catalog pagination/
  search, retained scenes, blocked/throwing renderer probes, startup rejection,
  context-loss retry and draw-loop failure checks. Earlier scroll/lifecycle
  scenarios also passed in the initial 60-case sweep, which had 57 passes and
  three mobile failures before the responsive paginator and artifact-location
  corrections.

### Open WebKit validation blocker

The traced mobile journey that visits every retained gallery preview and then
opens the full garden repeatedly loses its WebGL context in Windows Playwright
WebKit. SafeCanvas removes the failed canvas and keeps DOM browsing and explicit
retry available. That fallback does not satisfy the test's requirement for a live
drawn garden. A control build of main at `068456d` passed the same traced journey
with its earlier catalog; this batch therefore carries an unresolved regression
risk. An earlier untraced run of this batch passed, which does not supersede the
traced failures or establish physical-iPhone behavior.

Shader sharing reduced linked gallery programs from 104 to 63 in the same
instrumented full-gallery journey. The final instrumented garden linked 50
programs and submitted approximately 56.9 MB of buffer data before losing its
context. Those are cumulative upload observations rather than peak GPU memory
measurements. The loss was reported during native program-log inspection;
disabling diagnostic queries did not resolve it, so the root cause remains open.
Shader warmup, progressive startup and diagnostic suppression experiments were
discarded. The final implementation retains normal lifecycle and diagnostic
handling, plus the independently verified material-program reduction.

The PR remains a draft until this journey is resolved and rechecked. Do not mark
the browser suite universally passing or describe this batch as a mobile crash
fix. Logs and traces are kept in ignored `dist/ten-specimens/` and
`F:/codex-lc-validation/ten-specimens-2026-10-08/` on the validation host. Low-disk
trace failures in the initial run were moved to the F: artifact/temp location;
subsequent context-loss reproductions did not report ENOSPC.

## Measured costs

Sequential production and CPU measurements are recorded below with their device,
sampling and profiling limits. Physical-phone measurements and isolated GPU
upload/draw or cold shader-only timings are not available.

### CPU contact solver

Measured sequentially on Windows with an Intel Core i7-13650HX and Node
24.19.0, after thirty warm-up frames and over sixty measured 1/60-second inputs.
Desktop uses 1/120-second integration; constrained cages use 1/60-second
integration. Both configurations run on this same CPU, so the constrained column
is a budget comparison rather than a phone measurement. This excludes texture
preparation, upload and drawing.

| Specimen           | Desktop nodes | Median / p95 ms | Constrained nodes | Median / p95 ms |
| ------------------ | ------------: | --------------: | ----------------: | --------------: |
| Hellebore          |           576 |   3.468 / 4.298 |               288 |   0.585 / 0.803 |
| Primrose           |           672 |   5.751 / 7.678 |               280 |   0.664 / 1.356 |
| Petunia            |           480 |   3.598 / 4.252 |               230 |   0.507 / 0.703 |
| Lily of the Valley |           726 |   6.007 / 7.158 |               440 |   1.214 / 1.984 |
| Snowdrop           |           612 |   6.362 / 8.194 |               396 |   1.495 / 1.993 |
| Gladiolus          |          1650 | 12.923 / 20.894 |               484 |   0.876 / 1.062 |
| Delphinium         |          1488 |  8.865 / 10.376 |               504 |   0.775 / 1.199 |
| Alstroemeria       |           840 |   5.788 / 6.490 |               420 |   0.962 / 1.553 |
| Gerbera            |           816 |   4.505 / 5.504 |               408 |   0.928 / 1.472 |
| Zinnia             |           704 |   5.136 / 6.161 |               354 |   1.072 / 1.563 |

Gladiolus has the largest cage and exceeds a 16.7 ms frame interval at p95 in
this CPU-only sample. These values do not establish 60 FPS or a universal device
budget. Reproduce with `npx tsx scripts/benchmark-petal-physics.ts
hellebore,primrose,petunia,lily-of-the-valley,snowdrop,gladiolus,delphinium,alstroemeria,gerbera,zinnia`.

### Production rendering

All forty sequential normal/macro samples completed with detailed physics,
WebGL tissue and studio fallbacks, no page errors and no lost contexts. Only
one browser/page was measured at a time, after the browser suite and CPU run
finished. Desktop Chromium used a 1600 × 1000 viewport and a 3098 × 1936 backing
buffer on ANGLE / NVIDIA GeForce RTX 3050 6GB Laptop GPU / D3D11. Playwright
WebKit's iPhone 13 profile used a 390 × 440 buffer in both modes; its “Apple GPU”
label on Windows does not identify a measured physical iPhone.

Each sample warms for at least sixty render advances, starts at a fresh
thirty-frame counter boundary and measures at least 120 new advances. Values
below are counter-based cadence over wall time, including solver work, CPU
texture preparation and rendering submissions. They do not measure compositor
presentations or isolate GPU completion, upload or draw time. Rendered-pixel
browser checks and the inspected captures establish visible output separately.
Default bloom/motion and the macro control are used; these short samples do not
control thermal behavior or every interaction trajectory.

| Specimen           | Desktop normal / macro FPS | Emulated WebKit normal / macro FPS |
| ------------------ | -------------------------: | ---------------------------------: |
| Hellebore          |                47.7 / 48.8 |                        20.6 / 23.0 |
| Primrose           |                48.3 / 48.3 |                        22.0 / 21.9 |
| Petunia            |                47.5 / 47.2 |                        21.8 / 22.0 |
| Lily of the Valley |                48.0 / 48.1 |                        23.7 / 22.7 |
| Snowdrop           |                47.8 / 47.7 |                        23.3 / 23.5 |
| Gladiolus          |                48.3 / 44.6 |                        15.1 / 14.4 |
| Delphinium         |                48.0 / 47.6 |                        20.8 / 23.0 |
| Alstroemeria       |                47.4 / 48.0 |                        21.5 / 22.8 |
| Gerbera            |                48.3 / 37.8 |                        23.8 / 13.9 |
| Zinnia             |                48.4 / 44.0 |                        23.4 / 14.1 |

| Specimen           | Desktop solver normal / macro ms | Desktop transfer normal / macro ms | WebKit solver normal / macro ms | WebKit transfer normal / macro ms |
| ------------------ | -------------------------------: | ---------------------------------: | ------------------------------: | --------------------------------: |
| Hellebore          |                      4.54 / 4.47 |                        0.03 / 0.02 |                     1.12 / 1.04 |                       0.03 / 0.02 |
| Primrose           |                      7.10 / 7.16 |                        0.04 / 0.04 |                     1.18 / 1.21 |                       0.02 / 0.02 |
| Petunia            |                      4.47 / 4.55 |                        0.02 / 0.02 |                     1.00 / 0.91 |                       0.01 / 0.01 |
| Lily of the Valley |                      7.83 / 7.67 |                        0.05 / 0.04 |                     2.06 / 2.14 |                       0.03 / 0.06 |
| Snowdrop           |                      8.32 / 8.20 |                        0.02 / 0.03 |                     2.60 / 2.64 |                       0.03 / 0.03 |
| Gladiolus          |                    17.65 / 17.90 |                        0.09 / 0.07 |                     9.18 / 9.15 |                       0.37 / 0.44 |
| Delphinium         |                    11.77 / 11.41 |                        0.08 / 0.07 |                     1.54 / 1.47 |                       0.04 / 0.02 |
| Alstroemeria       |                      7.80 / 7.57 |                        0.05 / 0.03 |                     1.83 / 1.76 |                       0.01 / 0.01 |
| Gerbera            |                      7.31 / 7.69 |                        0.07 / 0.05 |                     3.61 / 8.25 |                       0.12 / 0.31 |
| Zinnia             |                      7.40 / 7.26 |                        0.05 / 0.05 |                     2.89 / 9.98 |                       0.01 / 0.32 |

Solver and transfer values are running CPU means from the live cages, rounded
to two decimals. Transfer measures displacement/normal texture preparation;
GPU upload remains part of the unisolated rendering path. Frame delays and
contact trajectories can cause more fixed solver steps than the CPU-only
benchmark, so these running means are not directly interchangeable with its
median/p95 values. Dense Gerbera/Zinnia macro views and Gladiolus show substantial
emulated-WebKit costs; isolated success does not resolve the separate garden
transition blocker or establish 60 FPS, photographic equivalence, or sustained
physical-phone performance.

| Specimen           | Desktop / emulated WebKit startup to thirty frames, seconds |
| ------------------ | ----------------------------------------------------------: |
| Hellebore          |                                                 4.31 / 4.42 |
| Primrose           |                                                 2.08 / 4.04 |
| Petunia            |                                                 1.93 / 4.06 |
| Lily of the Valley |                                                 2.76 / 3.81 |
| Snowdrop           |                                                 1.93 / 4.06 |
| Gladiolus          |                                                 3.38 / 5.24 |
| Delphinium         |                                                 3.06 / 4.06 |
| Alstroemeria       |                                                 2.05 / 4.25 |
| Gerbera            |                                                 3.88 / 4.43 |
| Zinnia             |                                                 2.47 / 4.41 |

Startup includes navigation, resources, renderer/material initialization and
thirty render advances on a fresh page. It is not a cold-cache shader-only
measurement. Reproduce against the production server on port 1607 with
`npx tsx scripts/benchmark-specimen-rendering.ts
hellebore,primrose,petunia,lily-of-the-valley,snowdrop,gladiolus,delphinium,alstroemeria,gerbera,zinnia desktop,mobile`.
Raw CPU/rendering JSON and logs remain in ignored `dist/ten-specimens/`; the
tables preserve the measured values in Git.
