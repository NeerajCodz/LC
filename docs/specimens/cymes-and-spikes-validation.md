# Cymes, spikes and bilateral flowers — validation record

Work started from main `508ee7f` in the existing repository folder. The accepted
studies are Lupine, single Hollyhock, Crown Imperial, single Tuberose, Ixora,
Pentas, Torenia, Lobelia, Hoya and single Impatiens. This extends Living Colors'
ongoing mission to create every flower; the current catalog is not its final scope.

Status: final browser validation is in progress. Product `dda2c98` passed all 699
unit tests, full typecheck, lint and production build
`EPlYJEnyz15ZLYF49PMmw`. All 14 targeted Hoya, readiness/retry and legacy
regressions passed strict audit. The full 238-case inspection sweep also passed,
with 119 desktop and 119 mobile cases and no skips, flaky outcomes or report
errors. The requested visual assessment is complete within the documented limits.
The production sweep was stopped after 13 completed cases (12 passed, one
failed) to diagnose Crown Imperial's return-to-garden pixel-evaluation deadline.
Its final trace frame shows the garden, but the evaluation did not return before
the unchanged deadline; this is not evidence of a measured zero-pixel result or
a diagnosed renderer cause. That interrupted run is not accepted. A complete
passing production sweep and refreshed native rendering measurements remain
pending.

The [research dossiers](../botanical-references.md) separate botanical evidence
from authored counts, dimensions, pigments and mechanical parameters. No scanned
tissue, measured spectra, calibrated elasticity, physical-phone testing or
universal frame-rate guarantee is claimed.

The dossiers also record remaining detail limits: Pentas uses a rounded rather
than quadrangular young stem, Hollyhock's claw/style microhairs and Lobelia's
translucent anther appendages are omitted, Hoya's papillae use material fields,
and Impatiens petiole/gland insertions are approximated at stem nodes. Hoya's
leaves do not have a separate silver-fleck field. These studies preserve their
diagnostic floral arrangements but do not claim exhaustive botanical anatomy.

## Corrected anatomy and interaction

- Lobelia's lower limbs now form broad downward contours instead of narrow
  sideways blades. An actual sampled-rim regression checks their direction and
  authored width/length, while preserving the dorsal cleft, upper lobes and cages.
- Impatiens' dorsal blade is assembled above its spurred lower sepal. Generated
  shells and actual overview batch vertices verify this relationship at all five
  geometry tiers, half/full bloom and under transformed parents. Insertions,
  reproductive organs and the lower sepal/spur are preserved. Rounded, deeply
  cleft lateral pairs replace acute triangular fins. Coherent folding avoids
  inverted inner skins, and a small basal widening restores the young root caps'
  real tissue intersections through all 350 tested quality/bloom/side states.
  Twelve overview columns preserve the rounded tips that six columns missed;
  actual batched boundary curvature rejects the resulting rectangular strips.
  The change adds 840 vertices and 5,040 inputs without extra draws or cages.
- Tuberose's former narrow closed tip turned its inner wall through the axis;
  small sixfold corrugations also intersected in persistent younger buds. A
  distal-only radius margin and cubic lobe emergence correct all 70 sampled
  adult/young, quality and fold states. Full adult position/normal buffers remain
  bit-identical in all five tiers; basal positions and organ insertions are
  preserved. Boundary-adjacent normals recompute from their corrected neighbors.
- Ixora and Pentas retain upright anatomy and use authored camera elevations of
  45 and 50 degrees respectively for face-reading presets. Tests measure the
  actual mature corolla rims' projection and preserve the 0.45 incidence floor.
  Independent comparison retained 456 head targets, 1,332 metadata-free portrait
  poses and 12 opted-in side poses exactly. Macro/focus distance, manual orbit
  and the garden overview camera retain their existing behavior.
- Hollyhock's finite petal claw prevents persistent self-contact at narrow pinned
  roots without changing its maximum blade width. Actual transformed roots and
  elastic recovery use the unchanged 30% recovery criterion. Its leaves carry
  connected five-armed stellate hairs, rather than a material sheen alone.
- Pentas retains a distal hair on every calyx at all tiers, with additional fine
  hairs at focused quality. Young-shoot hairs follow the actual sealed stem and
  its clamped bend. Sparse sampling adds detail within existing overview ceilings.
- Torenia's inner-face probe rejects outer faces, immature organs and actual
  occluders. Its CPU ray geometry includes the same cage displacement and
  normal-side offset as visible tissue. Ordinary clicks preserve stigma closure;
  only the explicit authored Pulse or garden breeze counter resets it. This does
  not claim natural repeated reopening.
- Hoya's earlier terminal overlays sealed the apex but produced raised pinwheel
  strips and doubled open-petal edges in actual close-ups. A short fused cup and
  five real valvate lobes replace them. Five acute ridged corona limbs alternate
  with those lobes; every membrane, pollinium and gynostegium remains present.
  Five patches per flower retain 1,100 desktop / 440 constrained nodes. Actual
  displaced roots at mature cluster 0 and young cluster 19, bloom 0/0.5/1,
  high/low/overview geometry, both budgets and frames 0/20/40 retain the strict
  inside-solid or 0.007 overlap bound and closed-apex rays through radius 0.04.
  The overlap bound is a test tolerance, not the shell's half-thickness.
- Closed Hoya lobes share axial-row displacement until an authored opening
  interval releases independent motion. Persistent younger buds remain coupled.
  Controls isolated contact repulsion as the cause of the first prototype's
  separated seams. Shared tests cover continuous release without an epsilon,
  pinned roots, genuine motion, external clearance, aggregate thickness budgets,
  pause/reset/reverse bloom and exact released/default parity. Independent
  comparison with the prior unannotated solver matched positions, normals,
  velocity and contact counts at 200 checkpoints. The existing 30% recovery
  criterion is retained; isolation now keeps an entire declared cohort.
- Fritillaria's flattened nectaries now follow each tepal's tangent and remain
  on its inner face. All 30 pads pass centre and silhouette ray checks, actual
  wall/root-cap overlap and normal checks through all bloom poses and five tiers.
  The former common ellipse orientation exposed two pads through the outer wall.

The four tall inflorescences carry their positive axes once in a zero-nod identity
cluster. Lower insertions use the existing rooted stem bridge. Dedicated tests
cover actual capped geometry, growth, head pose, parent transforms and normals.

## Geometry and cost contracts

| Study          | Authored composition                    | Desktop / constrained cage nodes |
| -------------- | --------------------------------------- | -------------------------------: |
| Lupine         | 21 mature flowers and 3 younger flowers |                      1,680 / 420 |
| Hollyhock      | 5 open flowers and 2 younger flowers    |                        750 / 300 |
| Crown Imperial | 5 hanging six-tepal bells               |                      1,080 / 432 |
| Tuberose       | 6 pairs and a younger terminal pair     |                        840 / 336 |
| Ixora          | 19 mature flowers and 3 buds            |                        880 / 352 |
| Pentas         | 19 mature flowers and 3 buds            |                      1,100 / 440 |
| Torenia        | 3 mature flowers and 2 buds             |                        640 / 240 |
| Lobelia        | 7 mature flowers and 2 buds             |                        702 / 315 |
| Hoya           | 19 mature flowers and 3 buds            |                      1,100 / 440 |
| Impatiens      | 3 mature flowers and 2 buds             |                        690 / 350 |

Fixed substeps remain 1/120 second on desktop and 1/60 second on constrained
devices, with bounded catch-up. Macro transitions retain cages; pause and inactive
time freeze activity, and reduced motion settles immediately. Leaves follow rooted
carrier motion rather than each receiving an independent cage. Torenia's sensitive
lamellae have their own closure state outside the corolla solver.

Opt-in overview reductions preserve floral landmarks, complete organ counts and
unchanged focused legacy buffers. Compatible repeated prototypes share draw
resources. CPU input savings before the new studies were 1,217,448. Pubescence adds
11,772 overview inputs and 12 joined leaf draws. The final Hoya rebuild raises its
overview surface inputs from 69,960 to 99,000, while preserving low/high surface
counts and the existing node budgets. Current measured costs must include the
rebuilt form.

Ordinary overview organs now share fixed/included draws across floral clusters,
preserving original colors, indices, morph targets, legacy scaling and carrier
poses. Independent parity covered 50 models and 435,639 vertex/normal comparisons.
The ordinary partition drops from 501 to 75 draws, retaining all 780,510 inputs;
the complete CPU dedicated-head census drops from 731 to 305 draws. Focused and
detailed rendering keep their original organ path.

Hoya additionally opts into ambient surface batching at the requested geometry
tier. All 352 shells retain their indices, positions, normals, tissue channels,
fold and pressure targets, cluster poses, picking and shadow deformation.
Detailed contact continues to use individual surfaces and the same cages.
Parity checks cover all five tiers and seven bloom settings. This changes draw
organization without reducing the authored anatomy or geometry quality.

An unchanged seven-view mobile diagnostic originally lost its context before
its first Hoya fence completed. With batching, the same instrumented scenario
passed: its Hoya submission used 238 draws instead of 2,681, retaining 9,707,700
submitted inputs. Requested morph-texture uploads fell from 55,261,248 to
13,740,736 bytes, while the tracked buffer ledger increased from 93,887,648 to
139,822,240 bytes. These are native-call observations, not GPU timestamps or
total VRAM measurements. One comparison does not establish the driver cause or
a general memory reduction. Both originally failing uninstrumented Hoya mobile
fixtures also passed on the candidate; complete final sweeps remain required.

The unchanged native garden limits are 8,000,000 submitted inputs and 1,800 draws
per frame. The CPU dedicated-head limits remain 4,300,000 inputs and 800 draws. CPU
head counts do not include all body foliage or the stem bridge's native 22-by-6
tessellation; the browser census remains the authority for complete garden costs.

## Verification

At product `dda2c98`, full typecheck, lint, all 699 unit tests and production
build passed. The build generated all 76 catalog specimen routes. Browser
discovery derives 216 production cases and 238 inspection cases across desktop
Chromium and mobile WebKit, including 48 seven-view cases with Rose and affected
legacy Fuchsia, targeted internal-organ views and automatic device-tier checks.
No case is accepted as skipped, flaky
or passing solely through cached counters.

The complete inspection run `1792005620603` finished with 232 passes and four
failures and was rejected by the strict audit. Hoya's two mobile specimen cases
lost their contexts. Delphinium and Gerbera desktop cases timed out in the pixel
predicate without recorded context loss. In a separate unchanged Gerbera
diagnostic, all eight pixel samples were positive, but startup consumed almost
the entire deadline and evaluation returned 4.376 ms late. These findings
motivated separate submission and first-draw readiness fixes; the failed sweep
does not count as final acceptance.

Inspection tiles now expose first-draw readiness through the existing SceneReady
boundary. Species, geometry-tier and study changes create a fresh tile state;
disposing a renderer clears readiness before retry. Browser checks wait for all
mounted tile scenes before starting the unchanged 20-second pixel predicate,
which still samples eight frames at the same threshold. Readiness alone never
counts as rendered content. A dedicated regression observes native draws,
revisited species/detail states, retained canvases and explicit fallback/retry.
Final discovery includes 238 inspection cases and the unchanged 216 production
cases. Inspection run `1792032078844` passed all 238 unique cases with zero skips,
flaky outcomes or report errors. Both independent strict audits accepted all 119
desktop and 119 mobile reports. Production run `1792036170655` was interrupted
after 13 completed cases to investigate the return-to-garden failure described
above. A full passing production sweep remains pending.

The first targeted readiness run finished with 12 passes and two failures.
Both new readiness/retry regressions and all four Delphinium/Gerbera checks
passed. The two failures occurred in the dynamic client's loading fallback,
before controls, Hoya selection or pixel sampling. A separate startup boundary
now waits concurrently for the real heading and three controls for up to 60
seconds, without holding an initial draw. Existing control-value assertions,
selection order, first-draw and pixel checks remain unchanged. All 14 targeted
cases subsequently passed in run `1792027113317`, with zero skips, flaky outcomes
or report errors. The failed run does not count as acceptance.

Earlier acceptance at `0b8793c` passed all 40 new public-route cases in both
engines, covering canonical routes,
legacy redirects, name/Latin-name search, themes, reverse bloom, macro retention,
keyboard pulse, pause/resume, reduced motion, complete garden options and selected
specimen return/reselection. The remaining existing production cases are pending.

Earlier acceptance at `231efbc` passed the actual native garden scenario in
desktop Chromium and mobile WebKit,
including canvas resize, selected rendering, atlas sampling,
shader reuse and pixels. Each connected renderer's overview submitted at most 7,660,890
submitted inputs and 1,511 draws, with zero context losses or duplicate shader
sources and at most one pending fenced frame. The initial 1,937-draw failure
motivated organ batching; no ceiling or pixel assertion was increased.

The first complete 214-case production run had 212 passes and two mobile garden
return failures, with zero skips/flakes/report errors. The unchanged active-motion
return case reproduced the same stalled pixel evaluation on the same build.
Independent review found that evicted programs inherited permanently completed
preparation. An explicit visible-selection revision now rearms preparation in the
layout phase while preserving the existing fence, canvas, clock and released
loader. Two CPU lifecycle regressions observed RED, then passed. The controlled
completion browser regression also observed RED in both engines on the old build:
readiness stayed `ready` where newly recreated programs required `pending`.
All six targeted fixed-build return checks passed, including both original
failures and held-completion tests in both engines, with zero skips/flakes/errors.
Final full fixed-build browser acceptance is pending. A high-volume observer capture
was terminated as inconclusive because logging overwhelmed transport; it does not
establish the exact native driver call that caused the stall.

The inspection fixture initializes from the actual device tier before a manual
override: high/ultra on desktop, low/medium on constrained devices, with overview
remaining overview. Each new case checks seven
caption-free compositor crops at the unchanged 0.004 pixel threshold. Mobile
inspection uses WebKit with low/medium geometry on a 1600-by-1100 contact sheet.
Wide inspection sheets use file-local device scale factor 1 to keep compositor
captures at CSS resolution; native drawing-buffer budgets and real touch/coarse
pointer assertions remain checked. Public routes retain the configured phone
viewport, device scale factor 3 and actual renderer budget.

Both unchanged WGSL modules passed required hardware validation. The two actual
GPU reference tests passed, comparing tissue detail fields and HDR radiance with
their WebGL-compatible fallbacks. No dependency, lockfile or WGSL changes were
made for this batch.

Inventory generation and audit passed against the checksum-pinned WFO June 2026
release: 396,788 inventory taxa, 76 app studies and 72 exact accepted-name matches.
All ten additions have exact matches. The four prior unresolved/ornamental studies
remain explicit gaps; `exactBiologicalSimulationVerified` remains false. Six
taxonomy tests passed. Tuberose uses pinned WFO `Agave amica`, while its dossier
records current POWO's different accepted treatment.

## Measurements and limits

CPU observations at frozen product `dda2c98` were recorded on 15 October 2026
from 02:37:56 to 02:38:20 UTC using Node 22.22.0 on Windows 10.0.26300, an Intel Core
i7-13650HX with 20 logical processors and 15.71 GiB RAM. All ten species ran
both budgets on this desktop CPU. Each of the 20 cases warmed 30 calls, then
measured 60 sequential calls without resetting. Each measured 1/60-second input
call contains two 1/120-second solver substeps with six constraint iterations
per substep on desktop, or one 1/60-second substep with four iterations under
the constrained budget.

The fixture uses full-bloom rest geometry, fixed production cluster transforms
and production pins. Authored forces are wind 0.7, pulse 0, proximity 0.8 and
pointer position (0, 0.4, 0.2), with force time advancing each call. Named source
hashes stayed unchanged during the run. Independent audit matched all 23 hashes,
including 21 tracked files against the frozen product and two measurement
drivers. It reproduced all 240 summary values from 2,400 raw timing samples.
All 20 node counts match the census and unchanged 2,048 / 512 caps.

The [raw CPU report](cymes-and-spikes-cpu-measurements.json) preserves all 60
samples per metric and case, exact summaries, source hashes, environment and
methodology. Its SHA256 is
`68daa893fdf88b6c6b42c5dbbbc86b90b0ed08114fbb07e4c4c07870d07ef088`.
Median averages the middle pair; p95 uses nearest rank (the 57th sorted sample
of 60). The table displays five decimal places; CPU packing p95 values are also
available in the raw report.

| Study          | Desktop solver median / p95 (ms) | Constrained solver median / p95 (ms) | CPU packing median, desktop / constrained (ms) |
| -------------- | -------------------------------: | -----------------------------------: | ---------------------------------------------: |
| Lupine         |              15.60855 / 23.00520 |                    1.06085 / 1.35190 |                              0.12005 / 0.04905 |
| Hollyhock      |                8.64625 / 9.40560 |                    1.11610 / 1.61780 |                              0.08980 / 0.03260 |
| Crown Imperial |              14.97680 / 18.02000 |                    1.77375 / 2.08540 |                              0.13265 / 0.04485 |
| Tuberose       |             38.09245 / 150.02250 |                    4.85615 / 7.63600 |                              0.10720 / 0.04475 |
| Ixora          |              16.67810 / 24.96040 |                    1.92515 / 3.64670 |                              0.10280 / 0.04255 |
| Pentas         |              20.66905 / 46.72180 |                    2.01000 / 2.95900 |                              0.13125 / 0.05015 |
| Torenia        |              10.15490 / 11.54120 |                    1.25905 / 1.61710 |                              0.07745 / 0.03130 |
| Lobelia        |               8.63020 / 10.82800 |                    1.37220 / 1.51370 |                              0.06725 / 0.03815 |
| Hoya           |              13.06450 / 14.04410 |                    1.14875 / 1.70820 |                              0.13165 / 0.05130 |
| Impatiens      |             29.30565 / 312.99580 |                    3.72955 / 4.88300 |                              0.08710 / 0.04495 |

Solver timing includes integration, constraints, contacts and cage/rest normals.
Texture preparation measures CPU displacement/normal packing and marking the
texture for upload; it excludes the GPU upload itself. Both metrics exclude
moving carrier preparation, per-frame rest updates, independent organ animation
(including Torenia's stigma), rendered geometry tessellation, instance updates,
tissue/HDR bakes, PMREM, DOM work and GPU draw. Initialization durations in the
raw report are separate single observations, not warmed medians.

Other applications may have been active; CPU affinity and power mode were not
isolated. This single sequential run samples one authored force/rest setting,
not worst-case interaction or every bloom stage. Three desktop solver medians
exceed a 16.7 ms frame interval before rendering costs: Tuberose 38.09245 ms,
Pentas 20.66905 ms and Impatiens 29.30565 ms. Desktop p95 reaches 150.02250 ms
for Tuberose and 312.99580 ms for Impatiens; the largest raw solver sample is
Impatiens at 470.85820 ms. All samples, including these outliers, are retained
without filtering or replacement runs. This record does not establish their
cause or explain native renderer behavior. These timings are not a controlled
comparison with earlier runs, and no CPU timing threshold was used as a pass
gate. They establish neither 60 FPS nor physical-phone performance.

Final native rendering and approximate advance cadence measurements: pending.
The prepared drivers record source hashes,
browser versions, buffer sizes, raw counters and whether source changed during
each run. They warm each view independently and distinguish rolling live counters
from CPU-only median/p95 samples. Cadence is an approximate advance rate, not a
GPU presentation-rate measurement. CPU texture preparation excludes GPU upload;
initialization observations exclude tissue/HDR bake durations. Both node budgets
run on the desktop host and cannot establish physical-phone performance.

The bounded visual assessment covers front, side, 45-degree, macro, bud, half and
full bloom for all ten additions at specimen and overview detail on both device
profiles, with Rose and Fuchsia comparisons: 336 individual postures plus 16
targeted bell/floret views. Review includes the corrected Impatiens and Tuberose
captures and current batched Hoya captures. All 20 current mobile Hoya PNGs
match their corresponding accepted references byte-for-byte; the desktop review
also found no new material visible defect. Original reports, PNGs, source hashes
and comparison manifests are retained in the ignored validation archive.

These views establish appearance at the captured scales and angles. Fine tissue
papillae, tiny pollinia, hairs and obscured roots cannot all be resolved; nectary
and reproductive-organ views retain documented occlusion. The evidence does not
establish exhaustive botanical anatomy, measured optics or physical-phone quality.

Final full browser acceptance, native rendering measurements and PR link: pending.
