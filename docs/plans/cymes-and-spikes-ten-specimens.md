# Ten cymes, spikes and bilateral flowers implementation plan

> For agentic workers: use superpowers:subagent-driven-development to implement
> the independent specimen tasks, with coordinated registration, commits and
> browser verification. The user authorized parallel agents with ultra reasoning
> and requested the same repository folder rather than a worktree.

**Goal:** Add Lupine, single Hollyhock, Crown Imperial, single Tuberose, Ixora,
Pentas, Torenia, Lobelia, Hoya and single Impatiens as distinct interactive studies.

**Architecture:** Species own their sealed surfaces, reproductive organs,
attachments and foliage. Reuse FlowerPlant, BotanicalStem, SpecimenAssembly,
shared tissue fields and bounded XPBD contact. Batch compatible repeated organs
without changing their anatomy, and measure the expanded garden within its
existing rendering ceilings.

**Tech stack:** Next 16.3.4, React 19.2.8, Three 0.185.0, Fiber 9.7.0, drei 10.7.8,
TypeScript and vgpu 0.4.1; retain the installed lockfile.

**Spec:** The user-approved ongoing specimen workflow, AGENTS.md and the ten
source-linked research dossiers in docs/specimens/ are the requirements.

**Baseline:** main 508ee7f, the reviewed PR #6 tree; 459 unit checks and 174
production browser cases passed for that tree. Work in E:/codz/Projects/lc on
feat/lupine,hollyhock,fritillaria,tuberose,ixora,pentas,torenia,lobelia,hoya,impatiens.

## Global constraints

- Port 1607; canonical /flower/<slug>/, /, /gallery/ and /garden/ remain usable.
- Actual sealed 3D tissue with positive thickness, deterministic folded positions
  and normals; initialize morph targets and dispose every owned resource.
- Sharp macro, no depth-of-field/glow; full anatomy remains on constrained devices.
- Detailed contact only in focused/selected views; 2,048 desktop / 512 constrained
  nodes and bounded 1/120 / 1/60 second substeps. Inactive and paused work freezes;
  reduced motion settles immediately and never accumulates catch-up time.
- Preserve retained previews, SafeCanvas retry/fallback, botanicalEvents, shared
  atlas/HDR resources, anchored roots/supports and garden contact clearance.
- Keep 15 specimens per collection page; derive collection bounds from registries.
- Native garden indexed inputs remain below 8,000,000 and draws below 1,800;
  preserve the existing browser pixel/error assertions and every catalog specimen.
- Source-backed traits are separate from authored counts, dimensions, pigment and
  mechanics. Inventory mapping does not establish scientific validation.
- Commit checked slices throughout as author and committer Neeraj Sathish Kumar
  <neerajcodz@gmail.com>, lowercase conventional subjects, no coauthor trailers.
  Push the branch and open a separate PR after verification; preserve history.

## Review focus

1. Bilateral fused regions and natural clefts must stay continuous where joined,
   retain sealed cut walls where split, and keep their correct 2+3 or paired form.
2. Raceme/cyme flowers, leaves and reproductive organs must remain connected to
   their actual moving carrier at closed, half and full bloom, including contact.
3. Crown Imperial's six separate tepals and Hoya's corolla/corona/gynostegium must
   remain distinguishable at overview as well as macro.
4. Dense floral clusters must preserve all authored flowers/organs while the
   native garden and contact node budgets remain unchanged.
5. Torenia's stigma touch response is confined to an inner touched lobe; a UI
   reset is authored interaction, not evidence of natural repeated reopening.

## Anatomy contracts

| Slug        | Dedicated construction and tests                                                                                                                                                                          |
| ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| lupine      | Approximately whorled bilateral raceme, banner/two wings/paired keel, ten monadelphous stamens and brushy style, palmate compound leaves.                                                                 |
| hollyhock   | Five notched petals, separate 6–7-lobed epicalyx and five-lobed calyx, numerous upper-column anthers and filiform style branches, continuous lobed hairy leaves.                                          |
| fritillaria | Hanging false umbel below leafy crown, six separately sealed tepals, six stamens and basal nectaries, tripartite stigma, whorled lower foliage.                                                           |
| tuberose    | Paired bracteate flowers, bent continuous six-lobed tube, six included stamens, three stigma divisions, inferior ovary and basal strap leaves.                                                            |
| ixora       | Branched terminal cyme, slender continuous four-lobed tubes, contorted tips, four throat anthers and exserted bifid style, glossy opposite leaves/stipules.                                               |
| pentas      | Five pointed valvate lobes on swollen hairy throat, five included anthers and exserted bifid style, unequal hairy calyx, petiolate hairy opposite foliage.                                                |
| torenia     | Continuous bilateral two-plus-three corolla, five-winged fused calyx, four paired unequal stamens and two stigma lamellae, opposite toothed foliage.                                                      |
| lobelia     | Dorsally split fused corolla with two narrow upper/three broad lower lobes, mouth bumps, fused anther tube with two bearded tips, alternate variable foliage.                                             |
| hoya        | Convex umbel, continuous five-lobed papillose corolla, five ridged waxy corona lobes around gynostegium/pollinia, supported twiner with thick opposite leaves.                                            |
| impatiens   | Dorsal petal and two deeply divided fused lateral pairs, lower boat-shaped sepal continuing into long hollow spur, two small sepals, anther cap over ovary, succulent shoot and alternate toothed leaves. |

Tuberose uses the pinned WFO concept Agave amica; its dossier records that current
POWO accepts Polianthes tuberosa. Do not silently rewrite the inventory backbone.

## Interfaces and file ownership

Each anatomy task creates components/flowers/<slug>/<camelName>Geometry.ts and
tests/<slug>-specimen.test.ts. Export <UPPERCASE>_MODEL: SpecimenModel and any
<UPPERCASE>_STALKS: SpecimenOrgan[] needed for actual branch/pedicel attachments.
Use SpecimenSurface.sample(u,v,open): Vec3 with pressureSample only when the
anatomy supports an authored independent deformation; do not use a radial proxy.

The following tissue task creates <PascalName>.tsx, <PascalName>Foliage.tsx and
<camelName>Leaf.ts in that species directory. Export <camelName>Structure:
FlowerStructure and <PascalName>(Omit<FlowerProps,"type">). Root alone registers
FLOWER_TYPES, Flower dispatcher, FLOWERS, PETAL_PALETTES, FLOWER_STRUCTURES,
FOLIAGE, WIND_PROFILES and TISSUE_RESPONSE/specimenTissueShader. Owners provide
authored registration values in their report; avoid simultaneous shared edits.

The budget owner modifies FloretInstances and a focused prototype batching helper
plus its tests; any overview resolution change must be opt-in and preserve
diagnostic angular/axial landmarks and unchanged focused geometry.

## Coherent commit slices and verification

- [ ] 1. Ten research dossiers, source index and this implementation plan.
- [ ] 2. Compatible repeated-organ batching, with exact pose/morph/color/index
      equivalence and cleanup tests. Run existing floret/surface batch tests.
- [ ] 3. Anatomical overview budget headroom, only if measured needed, with
      landmark preservation, unchanged focused geometry and CPU census checks.
- [ ] 4–23. Two slices for each species in table order: anatomy/geometry first;
      then foliage, tissue optics, anchored motion and catalog integration.
- [ ] 24. Whole-plant contact, reverse bloom, pause/resume, reduced motion and
      constrained quality transition coverage for the ten registered models.
- [ ] 25. Complete collection/search/15-item pagination and both garden layouts;
      asymmetric framing and exact-name inventory candidates.
- [ ] 26. Desktop Chromium/mobile WebKit routes, controls, retained galleries,
      garden selection, fallback/failure/retry and live native budget coverage.
- [ ] 27. Seven-view botanical inspection against dossiers and Rose; correct
      actual geometry or shading defects in additional genuine fix slices.
- [ ] 28. Generated inventory, API/source docs, measured rendering/contact costs,
      full validation record and a separate PR.

For every anatomy task, first write arrangement assertions for its table row and
run them to observe the absent model fail. Implement the actual anatomical model,
then use verifySpecimen to check sealed edges, positive thickness, finite unit
normals, deterministic samples and nondegenerate closed/half/open transitions.
Assert included organ positions, exact attachments and both contact node caps.

Before registration, add the relevant exhaustive catalog/API assertion and
observe it fail. Implement the component, foliage, optical response and registries;
check every owned resource is disposed and morph targets initialize. Run the
species tests, full typecheck, lint and unit suite for each completed code slice.
Stage exact slice files, inspect staged diff, commit and push with verified identity.

After all ten are integrated, run taxonomy, flowers:inventory, flowers:check and
production build. Run actual process-isolated browser cases with normal tracing
on port 1607; no skips, weaker pixels/error thresholds or fake counters. Inspect
front, side, 45 degrees, macro, bud, half and full bloom for every species on both
device tiers, including overview anatomy. Record raw costs and sampling limits.
No WGSL changes are planned; run hardware validation/reference tests if that changes.

## Progress and review

Root coordinates commits and keeps a plan-specific ignored ledger under
dist/cymes-and-spikes-work/. Review anatomy, integration and batching diffs with
independent agents before declaring the corresponding tasks complete. Resolve
material findings, then perform one final branch review. Final reporting links
the PR, gives checks actually run and preserves botanical/device evidence gaps.
