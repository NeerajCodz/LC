# Next ten realistic specimens

Continue the approved dedicated-specimen workflow on updated main after PR #3.
The user requested merging that batch with its disclosed WebKit stress failure.
Its validation remains historical evidence, not a claim that the failure is fixed.

## Design and authored compositions

| Slug       | Study                                   | Dedicated construction                                                                                                                    |
| ---------- | --------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| ranunculus | Ranunculus asiaticus, cultivated double | Forty-eight thin cupped petals, five sepals, divided basal/alternate leaves                                                               |
| anemone    | Anemone coronaria, single form          | Eight petaloid sepals, dark anthers and carpels, divided foliage and leafy involucre                                                      |
| crocus     | Crocus vernus                           | Three flowers plus bud; six tepals, long tube, three stamens, three stigma branches, striped basal leaves                                 |
| freesia    | Freesia refracta                        | Five flowers plus two buds on bent unilateral spike; continuous six-lobed tubes, three stamens, bifid style branches                      |
| lisianthus | Eustoma russellianum, single form       | Three flowers plus two buds; five-lobed short-tubed corollas, five stamens, two stigma lobes, opposite clasping leaves                    |
| camellia   | Camellia japonica, single form          | Seven petals, basal petal/stamen fusion, nine bracteoles/sepals, many stamens, three-lobed style, woody leafy shoot                       |
| magnolia   | Magnolia grandiflora                    | Nine substantial tepals, elongate receptacle, spiral stamens/carpels, protective bracts and rusty leaf undersides                         |
| gardenia   | Gardenia jasminoides, single form       | Six overlapping lobes on long fused tube, included stamens, inferior ovary, opposite glossy leaves and stipules                           |
| nasturtium | Tropaeolum majus                        | Three bilateral flowers plus bud; five sepals and dorsal nectar spur, two upper/three fringed lower petals, eight stamens, peltate leaves |
| cosmos     | Cosmos bipinnatus                       | Eight ray florets, true five-lobed disk flowers, two involucral ranks, opposite finely divided foliage                                    |

Counts, dimensions, colors, delays and mechanics are authored. Taxon-specific
accounts and their evidence gaps live in the ten research dossiers. Keep source
traits separate from our choices; Lisianthus's historical name needs explicit mapping.

## Interfaces and invariants

Reuse FlowerPlant, dedicated organ modules, BotanicalStem and initialized sealed
leaf geometry. Parametric shells must preserve thickness, deterministic geometry,
folded normals and nondegenerate bloom. Dense organs use real instanced prototypes.
Retain independent tissue uniforms and the shared atlas/fallback. No WGSL changes.

Use the existing bounded XPBD cages (2,048 desktop/512 constrained, fixed
1/120 and 1/60 steps), anchored plant motion, persistent pointer state and matching
shadow displacement. Detailed physics belongs in focused/selected views; full
garden and previews stay ambient. Freeze pause/offscreen activity and settle
reduced motion. Preserve 15-item pagination, catalog-derived routes/layouts,
sharp macro, port 1607, installed stack, retained previews and explicit retry.

## Commit slices and validation

- [x] 1. Research dossiers, provenance and this record.
- [ ] 2. Shared construction extensions only where anatomy requires them.
- [ ] 3–22. Two slices per species: sealed anatomy plus tests, then dedicated
      foliage/tissue/motion and exhaustive catalog integration. Run failing
      missing-model/count assertions before geometry, then geometry/normal/bloom
      tests, typecheck and affected lint before each completed slice.
- [ ] 23. Transformed contact, attachments, reverse bloom and quality transitions.
- [ ] 24. Framing, garden clearance, collection/search and all canonical routes.
- [ ] 25. Rose-plus-ten seven-view review; desktop/mobile pixels, controls,
      interaction, retention, lifecycle, fallback and full collection-to-garden.
- [ ] 26. Inventory/audit, API documentation, production build and measured costs.

Commit coherent completed slices throughout as Neeraj Sathish Kumar
<neerajcodz@gmail.com>, both author and committer, without coauthor trailers.
Push and open a separate PR. Do not merge the new PR without a later request.
Record failures honestly, including the inherited traced WebKit garden issue;
no universal 60 FPS or photographic-equivalence claims.
