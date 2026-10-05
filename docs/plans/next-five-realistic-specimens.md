# Next five realistic specimens — implementation plan

Approved October 6, 2026. Implement Lacecap Hydrangea, Snapdragon, Cyclamen,
Hardy Begonia and King Protea on a new branch from updated main. The previous
five-specimen engine is merged at `536bad1`. Keep desktop macro realism and
recognizable mobile anatomy; retain the installed stack and port 1607.

## Construction and interfaces

Each species owns `components/flowers/<slug>/<Name>.tsx` and
`<name>Geometry.ts`, exporting its `SpecimenModel` and `FlowerStructure`.
`FlowerPlant` retains its typed organ/stem slots. Use `SpecimenAssembly` for
sealed articulated shells and bounded contact; dedicated components handle
basal Cyclamen shoots and Snapdragon mouth pressure. Botanical traits, authored
counts/proportions and evidence gaps live in five research dossiers.

Dense centers use repeated real 3D florets. Add `SpecimenInstanceGroup` with
prototype surfaces/organs, a parent cluster and deterministic instance poses.
`specimenInstanceGeometry(group, quality)` creates sealed geometry with matched
folded normals; `FloretInstances` initializes per-instance morphs, shares its
material, follows bloom and retained activity and explicitly disposes textures.
Do not independently simulate every microscopic floret. Main sepals/bracts
retain contact cages; dense central geometry moves with its anchored carrier.

Additional species material profiles extend `createSpecimenMaterial`. Dedicated
continuous leaf blades preserve Cyclamen silver zones and Begonia asymmetry and
red undersides. Reproductive organs remain attached and enclosed in folded buds.
The anatomical male/female differences in Begonia must survive quality changes.

## Constraints and review focus

- Authored geometry, not photographs, sprites, billboards or generic recolors.
- Positive shell thickness, sealed rims, deterministic samples and folded normals.
- At most 2,048 desktop / 512 constrained cage nodes, including pinned obstacles;
  fixed 1/120 / 1/60-second integration with existing bounded substeps.
- Detailed contact only in focused/selected views. Ambient previews/full garden;
  macro preserves cages, offscreen/paused time freezes and reduced motion settles.
- Preserve shared atlas/HDR/PMREM, WebGL fallbacks, SafeCanvas retry, retained
  previews, sharp macro, touch and keyboard controls and anchored planting roots.
- Profile simulation, transfer/upload, drawing and cold shader startup separately.
  Previous WebKit emulation was slow; node ceilings alone do not prove performance.
- Check reverse bloom and mouth release, enclosed organs at every bloom stage,
  repeated-instance normals/shadows, quality changes and expanding garden bounds.

## Commit slices

1. `docs:` five research dossiers and this approved implementation record.
2. `test:` reproducible specimen rendering/cost baseline and readiness diagnostics.
3. `feat:` sealed repeated-floret geometry and deterministic instance transforms.
4. `feat:` shared instance morph/material/shadow rendering and retained lifecycle.
5–6. Cyclamen anatomy; then silver foliage, tissue and independently nodding stalks.
7–8. Snapdragon anatomy; then pigments, foliage and pressure/recovery interaction.
9–10. Hardy Begonia male/female anatomy; then foliage, tissues and pendant motion.
11–12. Lacecap Hydrangea fertile/sterile anatomy; then pigments and cluster motion.
13–14. King Protea bracts/florets; then surfaces, foliage and firm head response.
15. Complete catalog, navigation, search, previews and both garden framing/layouts.
16. Cross-specimen geometry, containment, contact and lifecycle regressions.
17. Desktop/mobile browser, visual reference review and rendering corrections.
18. Generated inventory, API documentation and measured final validation record.

Commit coherent checked slices throughout, not in a batch at the end. Use
Neeraj Sathish Kumar <neerajcodz@gmail.com> as author and committer, omit coauthors,
preserve unrelated history and add genuine fixes as additional slices. Push
`feat/hydrangea,snapdragon,cyclamen,hardy-begonia,king-protea` and create a PR.

## Verification

Numerical tests precede geometry/mechanics changes and cover positive thickness,
sealed topology, finite unit normals, nondegenerate intermediate blooms,
arrangement, instance carriers and both complete node budgets. Compare front,
side, 45-degree, macro, bud, half and full bloom against botanical references
and Rose. Exercise actual rendered pixels, reverse bloom, themes, search,
garden selection, pulse/pressure recovery, pause/reduced motion, retained
pagination, scrolling, renderer failure/retry and WebGPU absence in Chromium
and mobile WebKit. Run typecheck, lint, unit/taxonomy checks, inventory audit
and production build. Run hardware checks if WGSL changes; report emulation
and physical-device limits accurately.
