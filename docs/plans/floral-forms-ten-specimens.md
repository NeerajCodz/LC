# Ten additional floral forms implementation plan

> Follow the established approved specimen workflow and the user's same-folder
> preference. The user explicitly authorized parallel subagents with ultra reasoning;
> specimen owners work on separate files while integration, commits and browser checks
> remain coordinated here.

**Goal:** Add the accepted Pansy, African Violet, Bluebell, Hyacinth, Amaryllis,
Canna, Agapanthus, Wisteria, Bottlebrush and Scabiosa studies to Living Colors.

**Architecture:** Reuse FlowerPlant, BotanicalStem/typed Organs, SpecimenAssembly,
sealed deterministic surfaces and bounded XPBD contact. Each species owns its
model, foliage and pigments. Preserve retained previews, rendering fallbacks,
sharp macro, 15-item pagination and port 1607. No stack or WGSL changes are planned.

**Baseline:** main 437c2c4, clean tree; 273 unit tests passed. Continue in
E:/codz/Projects/lc on the new feat branch naming all ten accepted slugs.

## Coherent slices

- [x] 1. Research dossiers, provenance and this plan.
- [x] 2. Pansy: dedicated pansyGeometry.ts model plus anatomy, sealed
      geometry, normal, transition and cage-budget tests.
- [x] 3. Pansy: Pansy.tsx, dedicated foliage module, optical response,
      pigments and exhaustive FlowerType/catalog/structure/wind registration.
- [x] 4. African Violet: dedicated africanVioletGeometry.ts model plus anatomy, sealed
      geometry, normal, transition and cage-budget tests.
- [x] 5. African Violet: AfricanViolet.tsx, dedicated foliage module, optical response,
      pigments and exhaustive FlowerType/catalog/structure/wind registration.
- [x] 6. English Bluebell: dedicated bluebellGeometry.ts model plus anatomy, sealed
      geometry, normal, transition and cage-budget tests.
- [x] 7. English Bluebell: Bluebell.tsx, dedicated foliage module, optical response,
      pigments and exhaustive FlowerType/catalog/structure/wind registration.
- [x] 8. Hyacinth: dedicated hyacinthGeometry.ts model plus anatomy, sealed
      geometry, normal, transition and cage-budget tests.
- [x] 9. Hyacinth: Hyacinth.tsx, dedicated foliage module, optical response,
      pigments and exhaustive FlowerType/catalog/structure/wind registration.
- [x] 10. Amaryllis: dedicated amaryllisGeometry.ts model plus anatomy, sealed
      geometry, normal, transition and cage-budget tests.
- [x] 11. Amaryllis: Amaryllis.tsx, dedicated foliage module, optical response,
      pigments and exhaustive FlowerType/catalog/structure/wind registration.
- [x] 12. Canna: dedicated cannaGeometry.ts model plus anatomy, sealed
      geometry, normal, transition and cage-budget tests.
- [x] 13. Canna: Canna.tsx, dedicated foliage module, optical response,
      pigments and exhaustive FlowerType/catalog/structure/wind registration.
- [x] 14. Agapanthus: dedicated agapanthusGeometry.ts model plus anatomy, sealed
      geometry, normal, transition and cage-budget tests.
- [x] 15. Agapanthus: Agapanthus.tsx, dedicated foliage module, optical response,
      pigments and exhaustive FlowerType/catalog/structure/wind registration.
- [x] 16. Chinese Wisteria: dedicated wisteriaGeometry.ts model plus anatomy, sealed
      geometry, normal, transition and cage-budget tests.
- [x] 17. Chinese Wisteria: Wisteria.tsx, dedicated foliage module, optical response,
      pigments and exhaustive FlowerType/catalog/structure/wind registration.
- [x] 18. Crimson Bottlebrush: dedicated bottlebrushGeometry.ts model plus anatomy, sealed
      geometry, normal, transition and cage-budget tests.
- [x] 19. Crimson Bottlebrush: Bottlebrush.tsx, dedicated foliage module, optical response,
      pigments and exhaustive FlowerType/catalog/structure/wind registration.
- [x] 20. Pincushion Flower: dedicated scabiosaGeometry.ts model plus anatomy, sealed
      geometry, normal, transition and cage-budget tests.
- [x] 21. Pincushion Flower: Scabiosa.tsx, dedicated foliage module, optical response,
      pigments and exhaustive FlowerType/catalog/structure/wind registration.
- [x] 22. Whole-plant transformed contact, reverse bloom, reduced-motion and
      supported-vine attachment coverage across the ten models.
- [x] 23. Catalog-derived framing, both garden layouts, collection/search,
      taxonomy mapping and overview budget review.
- [x] 24. Browser coverage for routes, controls, actual pixels, full collection,
      selection, retained scenes and renderer failure/retry in both engines.
- [x] 25. Front/side/45-degree/macro/bud/half/full inspection against the dossiers
      and Rose; correct geometry/pigments found wanting in genuine fix commits.
- [x] 26. Generated inventory, API docs, measured cost and complete validation
      record; publish a separate PR for review, without merging it.

## Interfaces and gates

Each geometry module exports its uppercase MODEL and any required stalks/leaf
poses. Models conform to SpecimenModel; foliage creates initialized sealed morph
geometry through BotanicalBlade. Species modules export a typed FlowerStructure
and Omit<FlowerProps, 'type'> component. Register each completed species in
FLOWER_TYPES, Flower dispatcher, FLOWERS, PETAL_PALETTES, FLOWER_STRUCTURES,
WIND_PROFILES and TISSUE_RESPONSE; both gardens and canonical routes derive from
these registries. Stage only the coherent slice's files.

Before anatomy code, write an assertion for its defining organs and run it to
confirm the missing model fails. Run sealed-surface/normal/nondegenerate morph and
node-cap checks after implementation. Before registration, assert catalog and
API coverage. Run typecheck, full lint and unit tests at each completed slice;
run build, inventory generation/audit and taxonomy checks after catalog completion.
Use exact real browser cases in the process-isolated runner with normal tracing,
no weakened pixels/errors or skipped taxa. Shared-process Windows WebKit context
loss remains an inherited limitation, not a claim of a repaired driver.

Review focus: bilateral petal/half-stamen anatomy; continuous six-lobed bells;
umbel pedicels converging at one insertion; fixed vine support and paired keel;
instanced fine organs retaining all counts while cage/overview budgets stay bounded.
Add actual arrangement/attachment assertions for each of these in its owning slice.

Commit each checked slice with lowercase conventional subjects as both author
and committer Neeraj Sathish Kumar <neerajcodz@gmail.com>, without coauthor
trailers. Preserve unrelated history; push slices throughout implementation.
