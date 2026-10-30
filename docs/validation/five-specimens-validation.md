# Five flexible specimens — validation record

Implementation reviewed October 4–5, 2026. Source dossiers distinguish anatomical
evidence from authored counts, proportions, pigmentation and mechanics. These are
procedural botanical art studies, not calibrated tissue simulations or a claim
of photographic equivalence.

## Geometry and mechanics

Carnation has forty separately sampled fringed petals, a cylindrical calyx,
basal bracts and a swollen, opposite-leaved shoot. Plumeria has three five-lobed
blossoms, fused throats, included organs and two younger buds. Foxglove has twelve
asymmetric hollow bells, terminal buds, included unequal stamens, interior spots
and hairs, and a basal leaf rosette. Sweet Pea has three banners, six wings and
six enclosing keel halves, included reproductive organs, stipules, paired
leaflets, a winged supported shoot and branching tendrils. Bougainvillea has
three cymes, nine papery bracts, nine true floral tubes, included organs,
alternate foliage and a thorny woody shoot. Sweet Pea stalks and Bougainvillea
cyme branches insert into continuous upper shoot axes rather than floating above
the main stem.

Render shells have paired surfaces and closed rims, positive authored thickness,
deterministic open/folded positions and matched normals. Contact cages remain
separate from render tessellation. Pinned calyx/tube obstacles participate in
contact; bract midribs stay constrained. The solver includes thickness-aware
vertex/triangle and warp/weft edge contact, damping, elastic rest recovery and
fixed bounded substeps. Discrete cages cannot guarantee separation of every
sub-cage fringe, swept crossing, or intersecting biological organ. No tearing,
crushing, growth prediction or measured material coefficients are claimed.

Focused review caught amplified edge corrections near pinned endpoints, which
static shell inspection did not reveal. A shared per-node contact projection
budget now bounds dense corrections to one tissue thickness per substep, and
Plumeria uses a firmer authored curvature-restoring constraint. Regressions cover
the near-pin edge case and stable lobe orientation in both device budgets.

Detailed bud review also caught Foxglove stamens and hairs protruding through
closed bells. Included organs now have matching folded positions and normals,
and use their enclosing bell's delay and phase rather than the earlier calyx.
A regression checks the actual folded organ vertices against the bud wall.

## Measured CPU cost

Local Windows, Intel Core i7-13650HX, Node v24.19.0, 30 warm-up frames followed by
60 samples. Each sample advances 1/60 second; desktop integrates
1/120-second substeps, constrained
integrates 1/60. Full-open transformed clusters include pinned obstacles and
midrib constraints, with wind and local pointer loading. These timings exclude
texture upload, lighting and drawing. The constrained column runs its smaller
cage on the same desktop CPU; it does not measure a physical phone.

| Specimen      | Desktop nodes | Median / p95 ms | Constrained nodes | Median / p95 ms |
| ------------- | ------------: | --------------: | ----------------: | --------------: |
| Carnation     |           632 |  8.888 / 11.055 |               504 |   3.326 / 4.385 |
| Plumeria      |           546 |   5.634 / 7.667 |               297 |   1.090 / 1.721 |
| Foxglove      |           840 |  7.936 / 10.925 |               360 |   1.639 / 2.334 |
| Sweet Pea     |           507 |   5.042 / 5.841 |               240 |   0.896 / 1.462 |
| Bougainvillea |           648 |   5.060 / 6.351 |               405 |   1.129 / 1.510 |

Reproduce with `npx tsx scripts/benchmark-petal-physics.ts`. Runtime canvas
attributes sample actual CPU cost and node/step counts. Drawing performance and
final visual review are recorded below. No universal 60 FPS claim follows from
these CPU measurements.

## Measured drawing cadence

Production server on port 1607, one measurement browser at a time, WebGPU
disabled so both the tissue atlas and studio lighting use their WebGL fallbacks.
Desktop Chrome used a 1600 × 1000 viewport and a 3098 × 1936 backing buffer on
ANGLE / NVIDIA GeForce RTX 3050 6GB Laptop GPU / D3D11. Mobile WebKit used the
Playwright iPhone 13 profile with a 390 × 440 canvas buffer. Its context reports
“Apple GPU”; this is Windows browser emulation, not a measurement of an iPhone.

Each fresh specimen page drew at least 60 frames before sampling. Normal and
macro views each had five one-second CPU telemetry samples, then drawing cadence
was measured over 120 newly counted frames using wall time. Counts are exposed
in batches of 30 frames; measurement began at a fresh counter boundary. The
table includes simulation, uploads and drawing, not GPU-only timer queries.
Default full-bloom motion was active, with no synthetic pointer load. Actual
slow frames may integrate more fixed substeps than the CPU-only 1/60 benchmark.

| Specimen       | Desktop normal FPS | Desktop macro FPS | Emulated WebKit normal FPS | Emulated WebKit macro FPS |
| -------------- | -----------------: | ----------------: | -------------------------: | ------------------------: |
| Rose benchmark |               42.2 |              19.7 |                       24.2 |                      22.5 |
| Carnation      |               40.7 |              27.4 |                        6.1 |                      20.0 |
| Plumeria       |               45.6 |              29.6 |                       25.1 |                      24.3 |
| Foxglove       |               40.0 |              43.2 |                        5.6 |                       6.6 |
| Sweet Pea      |               47.4 |              36.2 |                       20.2 |                      25.4 |
| Bougainvillea  |               47.3 |              47.6 |                       25.9 |                      19.1 |

These are short local observations, not sustained thermal or device benchmarks.
The Foxglove row was refreshed after its included-organ correction, using fresh
desktop and WebKit contexts. The other rows followed the pinned-contact fix.
Emulated WebKit is notably slow for Carnation and Foxglove; bounded buffers and
node counts do not guarantee a smooth cadence. Physical-phone performance still
requires measurement. All focused captures rendered their anatomy, and neither
browser emitted runtime or shader errors during this measurement pass.

## Verification

TypeScript, full repository lint, 48 geometry/motion/lifecycle unit tests and
six taxonomy tests pass. The generated inventory and its checksum audit pass;
all five new names match accepted WFO taxa. The production build compiles and
generates the catalog's canonical specimen routes.

The seven-view development fixture was reviewed for each new specimen against
Rose: front, side, 45 degrees, macro, bud, half bloom and full bloom. Review
corrected the Carnation's exposed center, Plumeria's separated folded limbs,
Foxglove's open bud mouths and upper branch continuity. The final captures have
no runtime or shader errors. Fine geometry, veins, organ inclusion, shell rims
and asymmetric silhouettes remain visible without depth-of-field or visual bloom.

All 42 selected browser scenarios are verified across desktop Chromium and
emulated iPhone 13 WebKit: the full production integration run passed 41 of 42; its single
cold garden-readiness timeout was given the same 60-second startup allowance as
the renderer checks, then both desktop and mobile performance scenarios passed
on rerun (2/2). This was not a single uninterrupted 42/42 run. Assertions still
check actual rendered pixels, bounded buffers and advancing draw counters.
Coverage includes reverse bloom, macro, keyboard pulse, themes, Latin-name
search, selection of every new specimen in both garden layouts, responsive cage
budgets, pause/reduced motion, retained catalog scenes across pagination, native
scroll alignment, WebGPU absence, renderer setup failures, context loss/retry
with preserved bloom, and draw-loop failures. No product loading delay was added.

After the pinned-contact correction, all twelve targeted desktop/mobile specimen
scenarios passed again against the rebuilt production application. After the
included-organ correction, a final uninterrupted run passed all twelve again
in 9.4 minutes, without using its configured retry. The final 48-unit, TypeScript,
lint and production-build results include both corrections.

An earlier post-organ-check run entered the preserved SafeCanvas unavailable
state after Carnation's initial canvas appeared; it was stopped after the next
case passed. Supplementary capture/measurement fixtures also sometimes timed
out waiting for a draw count strictly greater than 60. Fresh-context Foxglove
bud/half/full captures rendered on desktop and WebKit without context loss or
runtime errors, and the final twelve-case run above did not reproduce the
failure. The cause of the earlier fallback has not been established.

The existing `tsx` startup failure at `uv_os_get_passwd` was caused by restricted
Windows process credentials: the installed runtime executes the tests outside
that sandbox without changing project dependencies. No WGSL source changed;
hardware WGSL validation and GPU numerical readback suites were not rerun.
Physical-phone performance and measured species-specific material constants
remain unverified.
