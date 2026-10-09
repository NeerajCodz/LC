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

Composition counts, dimensions, colors, delays and mechanics are authored; per-flower
organ counts follow the cited accounts where documented. Taxon-specific
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
- [x] 2. Paired anther chambers with preserved open/folded attachments.
- [x] 3. Ranunculus sealed anatomy and geometry/count/budget checks.
- [x] 4. Ranunculus divided foliage, tissue, anchored motion and catalog API.
- [x] 5–22. Two slices for each remaining species: sealed anatomy plus tests, then dedicated
      foliage/tissue/motion and exhaustive catalog integration. Run failing
      missing-model/count assertions before geometry, then geometry/normal/bloom
      tests, typecheck and affected lint before each completed slice.
- [x] 23. Transformed contact, attachments, reverse bloom and quality transitions.
- [x] 24. Framing, garden clearance, collection/search and all canonical routes.
- [x] 25. Execute Rose-plus-ten seven-view review; desktop/mobile pixels, controls,
      interaction, retention, lifecycle, fallback and full collection-to-garden.
      Review captures passed. Production sweep: 41/52 passed, with ten traced
      mobile context losses and one route-prefetch error; see the validation record.
- [x] 26. Inventory/audit, API documentation, production build and measured costs.
- [x] Complete the expanded functional browser gate after resource recovery:
      132 production cases (66 per engine) and 56 development inspection cases
      (28 per engine), each in a fresh browser process with normal tracing,
      no retries, skips, flaky cases or assertion changes. Typecheck, lint and
      all 273 unit tests pass. See the final recovery table in the validation record.
- [x] Review the ten new specimens and Rose in both engines, and capture all
      catalog specimens at overview quality in both engines. Verify the isolated
      runner against the Rose/Primrose title collision before publishing it.

This complete isolated matrix supports review of the feature and resource fixes;
it does not erase the original production sweep or establish a resolved
shared-process Windows WebKit driver issue. That limitation remains documented,
along with unavailable physical-phone validation. The PR can be ready for review
on this evidence; merging still requires a later user request.

Commit coherent completed slices throughout as Neeraj Sathish Kumar
<neerajcodz@gmail.com>, both author and committer, without coauthor trailers.
Push and open a separate PR. Do not merge the new PR without a later request.
Record failures honestly, including the inherited traced WebKit garden issue;
no universal 60 FPS or photographic-equivalence claims.
