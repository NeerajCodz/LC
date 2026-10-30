# Five-flower realism and documentation refinement

Reviewed 30 October 2026 on `codex/gazania-salvia-nicotiana-lantana-echinacea`, continuing [PR #9](https://github.com/NeerajCodz/LC/pull/9). The [initial batch record](five-floral-forms-validation.md) remains historical evidence; its measurements do not describe the refined geometry.

## Changes and evidence

The research dossiers for [Gazania](../research/gazania.md), [Salvia](../research/salvia.md), [Nicotiana](../research/nicotiana.md), [Lantana](../research/lantana.md) and [Echinacea](../research/echinacea.md) record fresh botanical descriptions and macro-photo observations separately from authored dimensions, counts, pigments and mechanics.

- Gazania retains twenty sterile rays and 96 true disk florets. Geometric ray folds, bounded variation and three permanent disk maturity cohorts refine its surface and central anatomy.
- Salvia gains broader scarlet calyces, graduated flower inclinations and a more differentiated hood/lip. Narrower, lower anther axes keep the actual transported cross-section inside its half-open hood.
- Nicotiana gains an angular, lightly creased limb, bowed tubes, varied inclinations and larger graded basal foliage. Portrait bounds include the generated leaves. Physical outer/inner skin labels distinguish its green exterior from ivory interior.
- Lantana's floral bases converge onto small shared receptacles; outward-fanning tubes form compact crowns. Peduncles share the authored upper leaf-node insertions. All 42 florets and existing cages remain.
- Echinacea retains 112 authored florets, with wider flattened paleae, warm tip gradients, real ray fluting and brown receptacle tissue. This count remains an explicit simplification.

Shared filtered micro-relief uses the existing atlas sample and stable shader families. No WGSL, dependencies, blur, glow, photographs or replacement sprites are introduced. The Gazania Gaussian pigment expressions now avoid undefined negative-base GLSL powers. Quality tiers retain authored organ counts and sealed open/folded surfaces.

## Documentation organization

The [documentation index](../README.md) separates `research/<flower>.md` evidence from `specimens/<flower>.md` maintenance guides. Fifty-eight existing dossiers have companion guides and paired indexes. Shared architecture, plans, historical validation and raw data have dedicated directories. Root README and AGENTS links follow the new paths; AGENTS remains the sole agent instruction file and its managed Next.js block is preserved.

Ten historical JSON artifacts moved without changing their tracked content. Historical validation links were rebased; source hashes and recorded limitations were retained. `npm run docs:check` checks local Markdown targets, paired guides in both directions and directory contents. It does not check remote availability, heading anchors or scientific correctness. Older catalog specimens without standalone dossiers remain explicit documentation gaps.

## Completed verification

- Serial full unit run: 838 passed, zero failed/skipped/cancelled. A later Gazania GLSL portability regression and material checks passed in a focused 15-test run. The added regression failed before its fix.
- The Nicotiana framing regression was subsequently corrected to include its blade's inner Y rotation as well as the BotanicalStem node transform, and passed. The existing portrait bounds contain the actual open/folded leaf buffers; no runtime change was needed.
- Typecheck, full ESLint, inventory audit, six taxonomy tests and production build passed. Additional scoped ESLint covered the final material regression and documentation checker.
- Documentation checker validates the organized local targets and paired guides; its command reports the current total after record updates.
- Fresh seven-view inspection: 20 unique scenarios, ten per browser project, with no failed, skipped or flaky cases. Run: `test-results/isolated-inspection-1793374647237`; the acceptance audit checked every individual JSON report, not just console output.

Inspection covers specimen/overview geometry in desktop Chromium and constrained mobile WebKit. Every board includes front, side, 45°, macro, bud, half and side-bud views. The boards were opened for visual review. Mobile inspection uses the constrained geometry and renderer budgets in a 1600-by-1100 contact-sheet viewport; it is not a physical-phone test or a phone-sized portrait capture.

An earlier default parallel unit attempt stopped after an esbuild service startup failure. An early browser attempt was interrupted while the host had under one GiB available RAM; neither attempt is acceptance evidence. The successful full unit rerun used `--test-concurrency=1`. Browser work is serialized on port 1607 without relaxed deadlines or pixel criteria.

The first fresh production batch (`test-results/isolated-production-1793375351404`) passed 20 of 22 cases. Salvia's mobile case exhausted the overall 240-second deadline during a reverse half-bloom pixel poll. The trace shows earlier reduced-motion bud/half/full pixel checks passing, a visibly rendered flower in the final screenshot, and the last poll interrupted about 4.9 seconds after starting; it did not finish its own 20-second sampling window. Eight-frame probes had repeatedly taken 7–10 seconds. Its unchanged isolated rerun passed in about 1.2 minutes. This establishes variable test/renderer cadence, not a proven cause or a runtime fix.

Nicotiana's mobile garden case reached its final renderer-health check but recorded three RSC access-control errors during document navigation. The trace places them 160–164 ms after garden navigation starts, before the new document commits. Recorded RSC responses, including subsequent garden prefetches, were 200; the three failing URLs had no network entries. Old-document prefetch cancellation is plausible but unproven. The errors are retained rather than filtered from the health assertion.

Both unchanged mobile follow-ups passed in `test-results/isolated-production-1793377825766` (Salvia about 1.2 minutes; Nicotiana about 1.4 minutes). The [browser verification record](data/five-flower-realism-browser-verification.json) preserves the original 20/22 run and both successful follow-ups. All 22 unique production scenarios have passing latest observations across those runs; this is not a clean repeated 22-case sweep. No runtime fix for either intermittent observation is claimed.

The [native garden observations](data/five-flower-realism-garden-observations.json) passed in both engines: 7,974,894 submitted inputs, 1,601 draws, 50 programs, at most one pending GPU fence, no duplicate live shader sources and no active-context loss. These are the constrained 390-by-844 touch layout in both projects, including resize/reconfiguration, not ordinary desktop shadows or a frame-rate measurement. The existing eight-million-input, 1,800-draw and shader-sharing limits are unchanged.

## Measurement interpretation and remaining limits

The [first CPU observation](data/five-flower-realism-cpu-startup-observation.json) contains all 600 samples, source hashes and recomputed summaries. It overlapped production server startup on a shared workstation and is retained as a noisy observation. Lantana's first five desktop samples were approximately 15–23 ms before an abrupt rise to 180–387 ms. A small structural diagnostic found denser broad-phase candidates and more rest contacts after compacting the head, but no grid overflow; its one current rest solve was 15.6 ms. That diagnostic does not establish a steady-state performance change or prove the cause of the later spike.

The [CPU repeat](data/five-flower-realism-cpu-measurements.json) ran after the browser cases finished, with about 1,785 MiB RAM available at its start. Ten cases contain thirty warmup and sixty measured calls each, with recorded source hashes unchanged. Both cage tiers use this same desktop CPU; solver timing excludes per-frame rest preparation, articulation, deformation transfer, upload and drawing. It is not physical-phone timing. Run `node --import tsx scripts/benchmark-petal-physics.ts gazania,salvia,nicotiana,lantana,echinacea` to collect the driver output.

| Specimen  | Desktop / constrained nodes | Desktop median / p95 ms | Constrained median / p95 ms |
| --------- | --------------------------: | ----------------------: | --------------------------: |
| Gazania   |                   530 / 264 |           3.338 / 4.623 |               0.684 / 0.723 |
| Salvia    |                 1,200 / 480 |         11.179 / 13.948 |               1.285 / 1.483 |
| Nicotiana |                   630 / 280 |          8.201 / 15.885 |               1.796 / 2.919 |
| Lantana   |                 1,680 / 504 |         27.083 / 32.341 |               2.489 / 3.615 |
| Echinacea |                   554 / 276 |           6.331 / 8.319 |               0.938 / 1.592 |

Compact Lantana has denser potential contacts and remains the most expensive desktop cage here. The repeat is slower than the historical batch measurement, while far below the startup-overlapped spike; differing workstation conditions prevent isolating geometry's contribution from these two recordings. No claim of a performance improvement is made.

The [twenty rendering observations](data/five-flower-realism-rendering-measurements.json) cover full and macro views of each species in desktop Chromium and mobile WebKit. Each view warms at least sixty fresh advances and samples at least 120. All observations record positive solver progress, valid dimensions and node counts, WebGL tissue/lighting fallbacks, no captured page/shader errors and no context loss. Recorded source hashes and the production build remained unchanged during capture; the cadence calculation and all recorded hashes were independently recomputed afterward.

Values are full / macro pairs. Cadence is approximate published R3F advances per second, measured through thirty-frame counters and polling, not compositor-presented FPS. Live solver counters are rolling CPU measurements that carry across views; they are not isolated per-view medians and exclude rest preparation, upload and drawing. Transfer counters measure CPU texture preparation, not native GPU upload cost.

| Specimen  | Desktop advances/s | Constrained advances/s | Desktop solver ms | Constrained solver ms |
| --------- | -----------------: | ---------------------: | ----------------: | --------------------: |
| Gazania   |        47.2 / 35.2 |            19.5 / 20.1 |        8.8 / 12.4 |             2.7 / 1.9 |
| Salvia    |        18.1 / 18.7 |            23.2 / 20.8 |       45.7 / 45.0 |             3.6 / 3.8 |
| Nicotiana |        38.5 / 34.5 |            21.8 / 20.2 |       20.3 / 23.9 |             2.8 / 3.3 |
| Lantana   |        12.3 / 12.4 |            17.7 / 16.2 |       63.5 / 64.9 |             5.3 / 4.8 |
| Echinacea |        48.5 / 46.5 |            14.6 / 16.4 |       10.9 / 11.3 |             4.4 / 3.2 |

The rendering capture started with about 1549 MiB RAM available on a shared Windows workstation. These measurements do not isolate geometry from host load or establish hardware-independent targets. WebKit's renderer string under emulation does not establish Apple hardware. Detailed Lantana is particularly expensive on this desktop, and no 60-FPS claim is supported.

The initial batch's intermittent mobile WebKit retained-garden preparation stall has not been established as fixed. Lifecycle code is unchanged by this refinement. Authored geometry, optical response and mechanics remain uncalibrated; no photographic-equivalence, physical-phone or guaranteed-FPS claim is made.
