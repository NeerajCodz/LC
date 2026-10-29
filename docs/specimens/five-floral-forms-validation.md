# Five floral forms — validation record

Work starts from merged main `6f9857c` on
`codex/gazania-salvia-nicotiana-lantana-echinacea`, October 29, 2026. The approved
studies are Gazania rigens, Salvia splendens, Nicotiana alata, Lantana camara and
Echinacea purpurea. Living Colors remains an ever-growing collection.

[Draft PR #9](https://github.com/NeerajCodz/LC/pull/9) publishes this work. The
intermittent preparation observation below remains an open review limitation.

## Construction and evidence

The five source-linked dossiers separate botanical traits from authored counts,
dimensions, pigments, opening trajectories and mechanical constants. Gazania's
sterile rays and true disk florets sit on a solid receptacle inside the fused
involucre. Echinacea has recurved rays, true conical disk florets and sharp
receptacular scales. Salvia has bilateral hooded corollas and persistent scarlet
calyces; Nicotiana has long salverform tubes and five included unequal stamens.
Lantana has two rounded heads with fixed authored pigment cohorts, included
reproductive organs and supporting receptacles.

All specimens use the existing shared tissue atlas/fallback, anchored stems and
bounded CPU contact cages. Overview prototypes retain all authored florets and
organs with fewer distant samples. The 15-per-page collection, retained previews,
canonical routes and port 1607 remain unchanged. No dependencies or WGSL changed.

Review corrected three generated-geometry defects: Echinacea's inner cone apex
crossed its axis; Gazania lacked support beneath its disk; and radial flower
poses lost or reversed ascent at certain azimuths under Euler XYZ composition.
New regressions check actual buffers, supporting tissue intersections and
transformed flower axes. These checks complement sealed topology and finite
normals rather than substituting for visual review.

## Verification status

Implementation `f072863` passes all 809 unit tests in 139.913 seconds, with no
failures or skips. TypeScript, repository ESLint and changed-source formatting
pass. Inventory regeneration and audit pass; six taxonomy tests pass. The
production build passes on Next.js 16.3.4, build ID `CVEih5fHdSNCJQc5K2Ooq`.
Twenty focused rendering measurements are complete. A fresh final `npm run
typecheck` and `npm run lint` also pass with the bounded browser assertions.
The [browser verification record](five-floral-forms-browser-verification.json)
contains all acceptance-run outcomes, including three failed attempts. The
latest observations pass all 22 unique production scenarios: ten specimen-control
cases and two native-garden cases from the initial run, nine collection cases
from the later ten-case run, and final mobile Echinacea in
`isolated-production-1793298531543`. This is coverage across runs, not a claim of
one clean repeated 22-case sweep.

The first 22-case production run (`isolated-production-1793293927655`) passed
21 cases. Mobile Salvia's garden-return pixel check failed while the canvas still
reported shader preparation pending. Its trace shows no flower frame was ready
within the pixel sampler's 20-second deadline. A separate instrumented return
completed preparation in 3.8 seconds and then passed the same pixel criterion;
preparation duration varies. The collection scenarios now explicitly require
`data-shader-preparation="ready"` after selection/return, using the established
120-second preparation allowance before the unchanged pixel sampling deadline.
This adds a readiness assertion rather than changing runtime behavior or lowering
pixel coverage. The next collection run (`isolated-production-1793295257297`)
passed nine cases, including mobile Salvia's complete garden return. Mobile
Echinacea instead failed the initial specimen pixel check after gallery navigation;
its trace shows the loading ornament and a default-sized canvas without renderer
diagnostic attributes when the pixel evaluation began. That evaluation did not
finish within its 20-second deadline; no numeric blank-coverage result was
recorded. The new navigation assertion waits for thirty published drawn frames
using the existing 120-second startup allowance before that unchanged pixel
check. The trace also contains a context-lost console message whose canvas cannot
be identified; the post-navigation health assertion was not reached. Host
contention is possible but is not established as the cause by this trace.

The subsequent collection run (`isolated-production-1793296164675`) again passed
nine cases. Mobile Echinacea passed initial startup, first selection and return,
but its second selection remained in preparation for the entire 120-second
allowance. This is a distinct retained-garden stall, with a blank surface and no
error or context-loss event during that interval. Native fence, program-query,
RAF and visibility instrumentation investigated its cause; the deadline was not
extended. One diagnostic repeat completed the transitions
but failed its final health assertion on navigation access-control errors and
does not count as a passing acceptance case.

Three further instrumented repetitions completed every rendering transition;
two passed fully, while one failed on the same navigation access-control errors.
Three repetitions with no additional RAF/timer callbacks then passed fully. A
separate stress case passed six additional return/reselection cycles with actual
flower pixels, retained canvas identity, stable node count and bloom amount, and
no recorded rendering-health errors. These results do not establish a cause or
prove the earlier preparation stall fixed; it remains an intermittent observation.

The final five-species sweep passed all twenty desktop/mobile inspection cases
in `isolated-inspection-1793292821090`, with specimen and overview detail and
seven poses per case. The standard and constrained boards were reviewed for
distinct anatomy, opening and framing. This predates the distant organ-carrier
optimization described below; focused geometry is unchanged. Both board projects
use a 1600-by-1100 inspection surface with separately asserted geometry tiers;
these are not narrow-portrait phone screenshots.

The initial complete-garden native check measured 8,740,734 submitted inputs in
both engines, above the unchanged eight-million frame ceiling. Distant organic
organ carriers now use one axial interval per authored control-point interval,
with a minimum of two, instead of a minimum of four. Caps, attachments, closed
topology, folded attributes and every organ/floret remain present. Low through
ultra detail are unchanged. The generated dedicated-head census falls to
4,201,752 inputs, below the original 4,300,000 allowance; neither budget is raised.
Tests check actual transported ring centers, endpoints, sealed caps and unchanged
focused buffers. The circumference-hint savings test now uses a relative workload
bound rather than a fixed historical catalog total, and distinguishes broad
receptacle sampling from narrow stamen sections.

The full native garden check then passed in both engines in
`isolated-production-1793293189362`, retaining the original eight-million-input,
1,800-draw, shader-sharing and one-pending-frame assertions. Post-optimization
overview inspection passed all eighteen cases in
`isolated-inspection-1793293233417`: the new five plus Rose, Fuchsia, Hoya and
Torenia in desktop Chromium and mobile WebKit. Neither run reports errors, skips
or flaky cases. Across the two inspection runs, 38 successful executions cover
28 unique device/detail scenarios and 196 unique view slots; ten overview cases
repeat. Constrained device evidence is browser emulation on this host, not
physical-phone testing. The shared overview change was visually inspected on
these nine species, while the native workload check includes the whole catalog.

The [native garden observations](five-floral-forms-garden-observations.json)
record 7,974,894 maximum submitted inputs, 1,596 draws and 50 linked programs in
both engines, before and after resize. Maximum pending frames remained one.
The native-budget test forces a 390-by-844 mobile/touch layout in both browser
engines; these numbers describe that constrained layout rather than desktop
shadows.
The input headroom is only 25,106 under the fixed ceiling, so later collection
growth requires another measured budget review. These are instrumented workload
observations, not a rendered-FPS measurement.

The initial eight Salvia/Nicotiana inspection cases precede the pose correction
and remain diagnostic evidence only. The all-catalog portrait test was extended
to all five real models; it exposed undersized Gazania/Echinacea bounds, now
corrected to include the transformed open/folded head envelopes. Every declared
catalog portrait then passed all camera presets. These framing values do not
change the geometry used in the inspection fixture.

Dedicated contact tests exercise every new model under transformed parents,
wind, pointer contact, pulse, reverse bloom, pause/offscreen clocks, reduced motion
and extreme input. Geometry tests check authored anatomy, determinism, closed
edges, thickness and matched morph normals. Independent read-only review of
the five assemblies, foliage, tissue integration, cleanup and overview changes
found no blocking issue. A minor Lantana attachment claim was corrected to match
the authored model.

## CPU measurements

The [fresh CPU samples](five-floral-forms-cpu-measurements.json) contain ten
budget cases with thirty warmup and sixty measured calls each. All 600 raw
samples are finite and nonnegative; median, mean and nearest-rank p95 were
recomputed within the published rounding. Recorded source hashes remained
unchanged during the run. Independent review recomputed all 600 samples and
matched the nine recorded source hashes to that historical source revision.
A later Lantana comment clarifies approximate leaf-axil attachment without
changing geometry or solver behavior; its current text hash consequently differs.
The script measures only the solver after production
cluster transforms and pin initialization; it excludes rendering, upload,
geometry construction, per-frame rest preparation and independent animations.
Both budgets run on this desktop CPU, so constrained timings are not phone timings.

| Specimen  | Desktop / constrained nodes | Desktop median / p95 (ms) | Constrained median / p95 (ms) |
| --------- | --------------------------: | ------------------------: | ----------------------------: |
| Gazania   |                   530 / 264 |             3.210 / 3.746 |                 0.604 / 0.773 |
| Salvia    |                 1,200 / 480 |            9.545 / 10.546 |                 1.230 / 1.444 |
| Nicotiana |                   630 / 280 |             5.887 / 6.994 |                 0.898 / 1.122 |
| Lantana   |                 1,680 / 504 |           13.799 / 16.681 |                 1.448 / 1.972 |
| Echinacea |                   554 / 276 |             4.816 / 6.019 |                 0.988 / 1.288 |

## Rendering observations

The [twenty rendering observations](five-floral-forms-rendering-measurements.json)
cover every specimen in full and macro views in desktop Chromium and mobile
WebKit, with WebGPU disabled. Each view warms at least sixty fresh advances and
samples at least 120. All observations recorded positive solver steps, expected
node counts, WebGL tissue/lighting fallback, no context loss and no captured
page/shader errors. Source hashes and the production build remained unchanged;
the cadence formula and every recorded source hash were independently checked
again after capture.

Values below are full-view / macro pairs. Advances per second are approximate
published R3F advances, sampled through thirty-frame bins and polling, rather
than compositor-presented FPS. Solver costs are live rolling counters after
warmup, carry between views and exclude rest preparation and native drawing;
they are not isolated per-view medians. Texture preparation counters, dimensions,
startup timings and renderer strings remain in the raw record.

| Specimen  | Desktop advances/s | Constrained advances/s | Desktop solver ms | Constrained solver ms |
| --------- | -----------------: | ---------------------: | ----------------: | --------------------: |
| Gazania   |        47.5 / 39.2 |            19.0 / 15.8 |       7.78 / 9.48 |           2.97 / 2.92 |
| Salvia    |        23.1 / 25.1 |            21.5 / 20.5 |     40.13 / 36.93 |           4.54 / 4.07 |
| Nicotiana |        47.5 / 47.5 |            22.2 / 15.6 |     12.30 / 12.18 |           3.19 / 5.24 |
| Lantana   |        21.5 / 19.1 |            20.4 / 12.9 |     37.21 / 41.71 |          3.89 / 10.81 |
| Echinacea |        49.0 / 48.0 |            17.8 / 25.0 |       9.53 / 9.47 |           2.15 / 2.84 |

This Windows workstation reports an i7-13650HX, 16 GiB RAM and a desktop RTX
3050 renderer. Only 441 MiB RAM was available at capture start, and other
applications shared the host; this was not an isolated performance lab. WebKit's
reported `Apple GPU` string under emulation does not establish Apple hardware.
These measurements are workload observations, not hardware-independent targets
or evidence of 60 FPS. Lantana and Salvia are the slowest desktop cases here.

## Explicit limits

Counts, dimensions, optical response and mechanics are authored rather than
measured. Lantana color cohorts do not simulate pollination or aging. Nicotiana's
external corolla gland-headed hairs are omitted; its foliage pubescence is an
optical approximation. Lantana's geometric trichomes/prickles and fruit are
omitted. Physical phones, scanned tissue and spectral calibration are outside the
recorded scope. No claim of photographic equivalence or guaranteed FPS is made.
The earlier intermittent mobile garden preparation stall has not been explained
or established as fixed, despite passing subsequent repetitions and stress cycles.
Lantana's peduncle roots join the shoot near, rather than exactly at, the modeled
leaf axils; this authored attachment approximation is recorded in its dossier.
