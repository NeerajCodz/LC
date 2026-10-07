# Ten researched specimens — implementation plan

> Use `superpowers:executing-plans` inline, one checked commit slice at a time.
> The project requires explicit authorization for delegation; none was requested.

**Goal:** Implement the ten species selected by the user on October 7, 2026 and
open a new PR from updated main, preserving realistic anatomy and all established
rendering, interaction, pagination and commit requirements.

**Base:** `068456d6a571324bb3a640595951d46fdc09429d`.
**Branch:** `feat/hellebore,primrose,petunia,lily-of-the-valley,snowdrop,gladiolus,delphinium,alstroemeria,gerbera,zinnia`.
**Stack:** Next 16.3.4, React 19.2.8, Three 0.185.0, Fiber 9.7.0, drei 10.7.8.
**Spec:** The following anatomy table, research dossiers and project AGENTS.md.

| Slug / taxon                             | Authored composition, source-backed anatomy to preserve                                                                                                                                                              |
| ---------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| hellebore / Helleborus orientalis        | Three nodding flowers and one bud; five substantial sepals, ten tubular nectaries, forty stamens and five carpels per flower; seven-leaflet basal foliage.                                                           |
| primrose / Primula vulgaris              | Five flowers and two buds on separate basal stalks; continuous five-notched-lobe corollas; pin-form stigma at the mouth, five included anthers below; wrinkled rosette.                                              |
| petunia / Petunia axillaris              | Three flowers and two buds; white continuous salver/trumpet corollas with long narrow tubes, five calyx lobes, unequal included stamens, glandular-pubescent shoot and leaves.                                       |
| lily-of-the-valley / Convallaria majalis | Eight hanging bells and three buds on one arching raceme; six turned-back rim teeth, six included stamens, two broad basal leaves.                                                                                   |
| snowdrop / Galanthus nivalis             | Two mature scapes and one bud scape, each solitary and bract-bearing; three long outer and three shorter notched, green-marked inner tepals, inferior ovary, six included stamens; two narrow leaves per scape.      |
| gladiolus / Gladiolus communis           | Eight flowers and three buds in a weakly two-ranked spike; continuous oblique perianth bases, six unequal tepals, guides on the three outer tepals, three unilateral stamens and three style branches; sword leaves. |
| delphinium / Delphinium elatum           | Nine flowers and three buds; five petaloid sepals including a real hollow dorsal spur, four inner petals with two bearded lower blades, included reproductive organs, continuous deeply divided palmate leaves.      |
| alstroemeria / Alstroemeria aurea        | Three flowers and two buds; six unequal free tepals, two marked upper inner tepals, six stamens and three style branches, inferior ovary, alternating resupinate leaves.                                             |
| gerbera / Gerbera jamesonii              | One head with thirty-two outer ray florets, twenty-four inner rays and sixty-four bilateral disk florets, including reproductive organs; involucre and pinnatifid basal foliage.                                     |
| zinnia / Zinnia elegans                  | One authored semi-double head with twenty-eight rays and thirty-two five-lobed disk florets, involucral bracts, opposite sessile clasping hairy leaves with basal veins.                                             |

All counts, relative dimensions, ages, palettes and mechanical coefficients above
are authored composition choices. Dossiers distinguish genus-level evidence,
species accounts, botanical uncertainty and inventory name candidates.

## Architecture and constraints

Species own `components/flowers/<slug>/<Name>.tsx`, `<slug>Geometry.ts` and their
foliage geometry. Geometry exports `<NAME>_MODEL: SpecimenModel`; wrappers export
`<name>Structure: FlowerStructure` and render through `FlowerPlant`'s organ/stem
slots. Shared rendering remains `SpecimenAssembly` / `FloretInstances`; models
remain species-specific. No recolored placeholder, billboard or primitive head.

Add optional typed tissue channels to `SpecimenSurface` and transport them to
shared material creation, enabling marked inner segments/tepals and true floret
pigments without changing public Flower props or existing species. A focused
blade renderer handles sealed dedicated leaf geometry, initialized morphs,
memoized atlas-compatible materials and explicit disposal. Compound Hellebore
leaflets and continuous Delphinium leaves must retain their distinct topology.

Use current CPU XPBD contact with at most 2,048 desktop / 512 constrained nodes,
fixed 1/120 / 1/60 steps and bounded substeps. Simulate main shells/rays; dense
florets use real instanced geometry and anchored carriers without individual
cages. Preserve displacement/normal/shadow transfer, macro retention, inactive
freeze, immediate reduced-motion settling, and anatomically located pollen.

Register each slug in `types.ts`, `catalog.ts`, `palettes.ts`, `foliage.ts`,
`structures.ts`, `wind.ts` and `Flower.tsx` only when its renderer is complete.
Routes, searches, previews and both garden layouts remain catalog-derived.
Keep 15 flowers per page, port 1607, sharp macro, installed dependencies,
SafeCanvas and WebGL-compatible tissue/HDR fallbacks. No WGSL change is planned.

## Commit slices and checks

- [ ] 1. `docs:` ten source dossiers and this implementation record.
- [ ] 2. `feat:` typed tissue channels and sealed blade rendering; verify default
      material preservation, normal/thickness invariants and initialized morphs.
- [ ] 3–22. Two commits per species, in the table's order: anatomy/geometry with
      `tests/ten-specimen-geometry.test.ts` assertions, followed by tissue, foliage,
      dedicated stem/motion and complete catalog integration. Each anatomy slice
      first demonstrates a failing missing-model/count/geometry assertion, then
      passes sealed/thickness/determinism/normals/bud/intermediate-bloom checks.
      Each integration slice passes typecheck, affected lint and relevant tests.
- [ ] 23. `test:` all ten transformed contact cages, reverse bloom, insertions,
      included organs and low/high quality retention. Dense prototype tests include
      true Gerbera bilateral florets and Zinnia disk corollas.
- [ ] 24. `feat:` complete framing and planting clearance across both layouts;
      retain 15-item pagination and exhaustive routes/metadata/search.
- [ ] 25. `test:` Chromium and mobile WebKit rendered pixels, pulse, pause,
      reduced motion, macro retention, themes, search, gallery retention and garden
      selection. Extend the seven-view inspection fixture to Rose plus all ten.
      Commit genuine visual corrections separately after reference review.
- [ ] 26. `docs:` generated inventory, API/dossier links and measured validation.
      Extend CPU/rendering drivers with these models; measure sequentially on a
      production port-1607 server. Record solver, transfer and total drawing costs,
      reported hardware, startup scope and physical-device/GPU-timing limits.

## Review focus

Closed tubes/sepals must enclose organs at bud and half bloom; coarse cages must
not invert bells or sever pinned attachments under extreme pointer input.
Spurs must join their dorsal sepals; basal stalks, cymes and racemes must connect
to the anchored shoot. Keep full floret counts and sex-specific ray/disk organs
at constrained quality. The fourth collection page must remain reachable after
search/reset; all scenes must retain their identities and one preview canvas.

Run typecheck, full lint, geometry/motion units, taxonomy tests, generated
inventory/audit and production build. Inspect front, side, 45°, macro, bud,
half and full bloom against botanical sources and Rose. Run relevant browser
fallback/lifecycle/scroll/retention scenarios. WGSL hardware checks are required
only if WGSL changes. Report failures and unavailable checks accurately.

Commit each coherent checked slice throughout as Neeraj Sathish Kumar
<neerajcodz@gmail.com>, both author and committer, with lowercase conventional
subjects and no coauthor trailers. Preserve unrelated history, push the branch
and open/attach a new PR; merging it requires the user's later instruction.
