# Five floral forms — validation record

Work starts from merged main `6f9857c` on
`codex/gazania-salvia-nicotiana-lantana-echinacea`, October 29, 2026. The approved
studies are Gazania rigens, Salvia splendens, Nicotiana alata, Lantana camara and
Echinacea purpurea. Living Colors remains an ever-growing collection.

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
Production browser checks and focused rendering measurements remain in progress.

The final five-species sweep passed all twenty desktop/mobile inspection cases
in `isolated-inspection-1793292821090`, with specimen and overview detail and
seven poses per case. The standard and constrained boards were reviewed for
distinct anatomy, opening and framing. This predates the distant organ-carrier
optimization described below; focused geometry is unchanged.

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
or flaky cases. Constrained device evidence is browser emulation on this host,
not physical-phone testing.

The [native garden observations](five-floral-forms-garden-observations.json)
record 7,974,894 maximum submitted inputs, 1,596 draws and 50 linked programs in
both engines, before and after resize. Maximum pending frames remained one.
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
edges, thickness and matched morph normals. Full project checks and production
browser results will be recorded before review.

## CPU measurements

The [fresh CPU samples](five-floral-forms-cpu-measurements.json) contain ten
budget cases with thirty warmup and sixty measured calls each. All 600 raw
samples are finite and nonnegative; median, mean and nearest-rank p95 were
recomputed within the published rounding. Recorded source hashes remained
unchanged during the run. The script measures only the solver after production
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

## Explicit limits

Counts, dimensions, optical response and mechanics are authored rather than
measured. Lantana color cohorts do not simulate pollination or aging. Nicotiana's
external corolla gland-headed hairs are omitted; its foliage pubescence is an
optical approximation. Lantana's geometric trichomes/prickles and fruit are
omitted. Physical phones, scanned tissue and spectral calibration are outside the
recorded scope. No claim of photographic equivalence or guaranteed FPS is made.
