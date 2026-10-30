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
- Typecheck, full ESLint, inventory audit, six taxonomy tests and production build passed. Additional scoped ESLint covered the final material regression and documentation checker.
- Documentation checker passed 1,031 local links before this validation record was added; rerun it for the current total.
- Fresh seven-view inspection: 20 unique scenarios, ten per browser project, with no failed, skipped or flaky cases. Run: `test-results/isolated-inspection-1793374647237`; the acceptance audit checked every individual JSON report, not just console output.

Inspection covers specimen/overview geometry in desktop Chromium and constrained mobile WebKit. Every board includes front, side, 45°, macro, bud, half and side-bud views. The boards were opened for visual review. Mobile inspection uses the constrained geometry and renderer budgets in a 1600-by-1100 contact-sheet viewport; it is not a physical-phone test or a phone-sized portrait capture.

An earlier default parallel unit attempt stopped after an esbuild service startup failure. An early browser attempt was interrupted while the host had under one GiB available RAM; neither attempt is acceptance evidence. The successful full unit rerun used `--test-concurrency=1`. Browser work is serialized on port 1607 without relaxed deadlines or pixel criteria.

## Measurement interpretation and remaining limits

The [first CPU observation](data/five-flower-realism-cpu-startup-observation.json) contains all 600 samples, source hashes and recomputed summaries. It overlapped production server startup on a shared workstation and is retained as a noisy observation. Lantana's first five desktop samples were approximately 15–23 ms before an abrupt rise to 180–387 ms. A small structural diagnostic found denser broad-phase candidates and more rest contacts after compacting the head, but no grid overflow; its one current rest solve was 15.6 ms. That diagnostic does not establish a steady-state performance change or prove the cause of the later spike.

The initial batch's intermittent mobile WebKit retained-garden preparation stall has not been established as fixed. Lifecycle code is unchanged by this refinement. Authored geometry, optical response and mechanics remain uncalibrated; no photographic-equivalence, physical-phone or guaranteed-FPS claim is made.
