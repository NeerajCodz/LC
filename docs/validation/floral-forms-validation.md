# Additional floral forms — validation record

Started 12 October 2026 from main `437c2c4`, in the existing repository folder.
The accepted specimens are Pansy, African Violet, English Bluebell, Hyacinth,
Amaryllis, Canna, Agapanthus, Chinese Wisteria, Crimson Bottlebrush and
Pincushion Flower. The user explicitly authorized parallel agents with ultra
reasoning. Integration and checked commits remain coordinated on the feature
branch. [PR #6](https://github.com/NeerajCodz/LC/pull/6) contains this work for
review. Validation and measurements completed on 13 October 2026; merging remains
a separate user decision.

The [research dossiers](../botanical-references.md) distinguish botanical evidence
from authored compositions, dimensions, pigments, proportions and mechanical
constants. The [implementation plan](../plans/floral-forms-ten-specimens.md)
records the specimen and verification slices. No scanned surfaces, measured
elastic constants, spectral pigment calibration or physical-phone validation
are claimed.

## Corrections found during review

Generated geometry checks and independent review exposed actual attachment
defects that cage-pin tests alone missed. Head-owned stalks now share the exact
rendered head pose; real lower insertions use an endpoint bridge with matching
inverse-transpose normals. Prediction, garden contact and stalk deformation run
in that order in the same frame. Legacy stem extras retain their existing path.
Canna's sheath occupies the stem frame independently of its pitched leaf blade,
with a sealed neck joining the blade. Bluebell's raceme begins at the actual main
shoot insertion. A Canna branch inversion during entrance growth required a
species-owned insertion correction.

Included stigma geometry now follows the same actual merged bloom partition as
its style. African Violet, Agapanthus and Scabiosa have finite overlapping
terminal tissue rather than permanently open bud mouths. Fine instanced tissue
shares floral carriers and bloom; this is not independently caged cloth.
Scabiosa's marginal terminal junction was additionally tested against its
deforming cage because carrier attachment alone did not prove seam coverage.
Its terminal tissue now starts under the corolla shoulder and has an authored
radial reserve of 0.008 local units, tapering to zero at the ends. This changes the intermediate
side profile and closed collar while preserving the mature outer extent and
endpoints. Four actual quality/device pairs (desktop high/ultra and constrained
low/medium), eleven motion/bloom stages and 840 frames per pair exercise all
80 junctions. The tests check 2,419,200 local strip rays from above and oblique
directions, plus 268,800 positive tissue intersections: no sampled exposed strip
or disconnected sheet remains. Original and deliberately detached geometry fail
the checks. A nearest-midsurface diagnostic still reaches about 0.005–0.011 local units; it is
retained separately from actual occlusion. This is sampled coverage through the
authored motion, not proof for every possible viewing ray or independent cloth
coupling of the fine caps.

Public Bottlebrush portrait captures revealed cropped upper flowers even though
the pixel and interaction assertions passed. Optional full-plant portrait bounds
fit the camera through presets and resizing without overriding manual orbit.
The development inspection fixture fits actual bounds, including tall shoots.
Garden planting now resolves full initial clearance separately from the small
displacements used for runtime head contact, retaining fixed ground roots.
Independent review also found that very tall, narrow portrait fits exceeded the
old fixed fog and far-plane limits. Fitted portraits now keep their complete
bounds visible throughout permitted orbit/zoom, reapply fog after theme changes,
and restore the established ranges after macro or legacy-specimen transitions.

The full-garden native checks exposed 8,395,302 indexed inputs and 2,102 draw
calls per frame, exceeding the unchanged limits of 8,000,000 and 1,800. Distant
main shells use six axial strips while preserving their angular lobes; compatible
surface channels now share submissions across clusters using their actual pose
and articulation texture. Visible, depth and distance passes share the same
transform. CPU position/normal parity, initial texture state, animated bounds and
cleanup are tested; organs, instances and focused geometry retain their original
paths. Both browsers subsequently measured 7,858,758 indexed inputs and 1,643
draws, with no spontaneous loss, duplicate shader source or excess pending fence
in those checks.

All 80 overview boards passed runtime checks and their 560 panels were reviewed.
Visual review found that six axial rows erased deep leaf divisions in Anemone,
Pansy, Ranunculus and Scabiosa. Authored deeply cut leaf profiles now retain four
samples per tooth, including Anemone's involucral leaves. Shallow margins and all
four focused tiers remain unchanged. This adds 39,648 inputs and no draws; the
eight affected boards were recaptured and all 56 corrected panels were reviewed.
The final native checks in both browsers measured 7,898,406 indexed inputs and
1,643 draws, retaining a margin of 101,594 indexed inputs. Both actual contexts recorded zero
spontaneous losses and duplicate shader sources, with at most one pending fence.
The complete production sweep after that leaf correction passes all 174 cases.

## Final checks

Inventory generation and audit pass: 66 implemented studies, 62 unambiguous
exact-name candidates and the four pre-existing naming gaps. The inventory retains
396,788 accepted flowering-plant taxa; inventory presence is not implementation
or scientific validation. Six taxonomy tests pass. Both device shader validations
and both GPU reference tests pass; no WGSL source changed in this batch.

The final geometry slice passes typecheck, full lint and all 459 unit tests,
including the full Scabiosa junction regression. No unit tests are skipped or
excluded. The production build on the final geometry passes and
generates all 66 specimen paths (73 static pages in total). The production
browser matrix passes all 174 cases on app source `bc7eee9`, with no skipped,
flaky or unexpected results and no reporter errors. Its 42 new-specimen cases
cover both desktop Chromium and Windows WebKit's iPhone emulation.

The earlier full sweep passed 170/174. Two cases encountered spontaneous native
context loss during full-garden startup before Carnation/Wisteria selection;
two native budget cases exposed the indexed-input and subsequent draw-call
excesses. The six-case recheck passed both species in both browsers, then reached
the still-excessive draw count. After the geometry/batching and leaf corrections,
the complete unchanged 174-case sweep passes. Initial traces remain available;
the initial context-loss cause is not established or presented as a repaired
driver. The standalone measurement driver also needed the `tsx` name helper
inside its evaluated callbacks before collecting samples; application tests use
Playwright's separate transpilation.

The complete development inspection matrix passes all 78 cases in desktop
Chromium and emulated-mobile WebKit. The earlier run passed 75/78: three legacy
Delphinium/Gerbera captures were blank. Eight fresh isolated rechecks passed,
followed by the complete 78/78 run; the original failures remain recorded and
their cause is not established. Scabiosa and two captures overlapping its source
update were also recaptured. Saved seven-view boards for Rose and all ten new
specimens were visually reviewed after source changes. These wide boards test
renderer quality and anatomy; narrow layout and input are checked separately
through public routes.

The ten forms remain recognizable without new visible attachment gaps. Further
visual refinements remain: thin Bottlebrush filaments can appear dashed at small
pixel sizes, Hyacinth/Agapanthus rims are angular, Wisteria's support and leaflets
can crowd its raceme, and Canna collars and monocot spathes look fairly rigid.
Repeated leaf detail and smooth petal interiors are less varied than Rose's
layered benchmark. These results do not establish photorealism.

The browser matrix uses the established fresh-browser-process-per-case runner
with normal tracing and strict pixels/errors. The inherited Windows WebKit
shared-process graphics limitation is not presented as a repaired driver.
The final independent code review found no remaining Important defects after
the attachment, terminal overlap, responsive visibility, overview batching and
deep-leaf sampling corrections.

## CPU contact measurement method

The production solver is sampled sequentially at each device budget on the same
Windows desktop CPU: 30 warm-up frames, then 60 calls to `step(1/60)` at full bloom,
wind 0.7 and proximity 0.8. Desktop integrates at 1/120 second and constrained at
1/60. The shared production pin initializer is also used by the benchmark and
motion tests. Median and nearest-rank p95 are reported separately from rendering.
`scripts/benchmark-petal-physics.ts` accepts comma-separated specimen slugs.

These timings exclude geometry preparation, moving-carrier preparation, texture
transfer, browser cadence and WebGL drawing. Other desktop applications remain
active; neither power mode nor CPU affinity is isolated. Constrained-budget
measurements on this desktop are not physical-phone measurements or FPS claims.
The following CPU samples were taken on 13 October 2026 (local time), Node 24.19.0, Windows 10.0.26300 x64, Intel Core i7-13650HX with 20 logical processors. Available RAM at sample start was 2,521 MiB. The measured app source is commit `426b820`.

| Specimen       | Desktop nodes | Median / p95 ms | Constrained nodes | Median / p95 ms |
| -------------- | ------------: | --------------: | ----------------: | --------------: |
| pansy          |           464 |   2.403 / 2.849 |               276 |   0.544 / 0.634 |
| african-violet |           360 |   2.590 / 3.930 |               144 |   0.355 / 0.628 |
| bluebell       |           720 |   6.385 / 7.308 |               320 |   0.977 / 1.276 |
| hyacinth       |          1260 | 10.644 / 12.065 |               504 |   1.555 / 2.176 |
| amaryllis      |           910 | 13.213 / 17.565 |               372 |   1.720 / 2.259 |
| canna          |          1060 | 12.974 / 17.235 |               376 |   1.508 / 1.873 |
| agapanthus     |          1008 |  9.012 / 12.853 |               378 |   0.873 / 1.232 |
| wisteria       |          1680 | 12.452 / 16.038 |               480 |   0.894 / 1.802 |
| bottlebrush    |           768 |   4.183 / 6.135 |               288 |   0.689 / 0.832 |
| scabiosa       |          1384 | 14.253 / 19.343 |               462 |   1.496 / 2.465 |

## Browser rendering measurement method

The rendering driver uses one fresh page per species/device, then samples the
full specimen and macro on that page. It forces active motion and disables the
optional WebGPU bakes, requiring both WebGL fallback labels and the correct
render budget. Each view receives at least sixty new advances before a fresh
counter boundary and a 120-advance sample. The ninety-count warmup guard accounts
for the counter's unpublished partial thirty-frame block. Actual flower pixels,
a live context, positive solver progress and cage limits must pass for each
modeled specimen.

Cadence is approximate successful R3F advances per second, observed through
thirty-frame counters and fifty-millisecond polling/RPC. It does not measure GPU
completion or compositor presentations. The live solver and CPU texture-preparation
counters are arithmetic means for the first sixty calls, then exponentially
weighted means with coefficient 1/60. They carry across views and are rounded to
two decimal places, rather than being arithmetic means of the 120-advance sample.
Texture preparation times exclude GPU upload. Windows WebKit's iPhone profile is
emulation on the same desktop, not a physical-phone performance measurement.
All forty samples pass the active-physics, pixels, context, fallback and node
checks. They were completed on 13 October 2026 local time, with app source
`bc7eee9` and benchmark source `4a90222`. Desktop buffers were 3098 × 1936;
mobile buffers were 390 × 440. Chromium reported an ANGLE NVIDIA GeForce
RTX 3050 6GB Laptop GPU D3D11 renderer. Windows WebKit reported the string
`Apple GPU`; this is not verification of Apple hardware. The raw CPU and
browser values are retained in [the measurement record](data/floral-forms-costs.json).

Values below are full specimen / macro. Cadence is approximate advances per
second; the CPU columns are the live rounded EWMAs described above.

### Desktop Chromium

| Specimen       | Cadence / s | Solver EWMA ms | CPU texture prep EWMA ms |
| -------------- | ----------: | -------------: | -----------------------: |
| pansy          | 48.3 / 47.2 |    3.30 / 3.27 |              0.02 / 0.02 |
| african-violet | 48.3 / 48.3 |    3.41 / 3.43 |              0.02 / 0.02 |
| bluebell       | 48.0 / 48.0 |    8.31 / 8.19 |              0.03 / 0.04 |
| hyacinth       | 49.1 / 48.7 |  13.60 / 13.49 |              0.05 / 0.05 |
| amaryllis      | 48.0 / 48.2 |  10.31 / 10.20 |              0.04 / 0.04 |
| canna          | 47.6 / 48.8 |  11.88 / 11.91 |              0.05 / 0.05 |
| agapanthus     | 48.0 / 48.1 |    8.92 / 8.93 |              0.03 / 0.04 |
| wisteria       | 48.0 / 48.4 |  13.17 / 13.06 |              0.07 / 0.08 |
| bottlebrush    | 48.7 / 48.4 |    4.80 / 4.64 |              0.05 / 0.04 |
| scabiosa       | 47.7 / 48.4 |  11.91 / 11.40 |              0.09 / 0.09 |

### Windows WebKit mobile emulation

| Specimen       | Cadence / s | Solver EWMA ms | CPU texture prep EWMA ms |
| -------------- | ----------: | -------------: | -----------------------: |
| pansy          | 20.5 / 21.2 |    1.05 / 1.01 |              0.02 / 0.02 |
| african-violet | 21.1 / 21.5 |    0.72 / 0.69 |              0.02 / 0.00 |
| bluebell       | 20.8 / 21.4 |    1.75 / 1.61 |              0.01 / 0.06 |
| hyacinth       | 20.7 / 23.3 |    2.56 / 2.58 |              0.04 / 0.01 |
| amaryllis      | 20.9 / 21.9 |    1.92 / 1.90 |              0.03 / 0.02 |
| canna          | 21.0 / 21.0 |    1.75 / 1.76 |              0.02 / 0.01 |
| agapanthus     | 23.6 / 24.7 |    1.38 / 1.28 |              0.01 / 0.02 |
| wisteria       | 21.0 / 23.0 |    1.23 / 1.35 |              0.03 / 0.01 |
| bottlebrush    | 21.3 / 20.8 |    0.79 / 0.76 |              0.02 / 0.00 |
| scabiosa       | 22.5 / 24.0 |    1.77 / 1.67 |              0.01 / 0.07 |
