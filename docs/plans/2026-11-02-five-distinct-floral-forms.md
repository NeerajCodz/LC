# Five distinct floral forms implementation plan

**Goal:** Add the approved Trillium, Datura, Giant Allium, Grevillea and Calceolaria studies with dedicated anatomy, foliage, tissue response, opening and bounded contact, in a new PR.

**Architecture:** Continue the existing typed Flower API, FlowerPlant, SpecimenAssembly, BotanicalStem/Blade and sealed parametric shells. Each species owns its geometry and real reproductive organs. Reuse the tissue atlas/fallback, anchored motion, persistent contact cages and retained rendering. Dense microscopic organs retain their authored counts but need not have individual cloth simulations.

**Stack:** Installed Next.js 16.3.4, React 19.2.8, Three.js 0.185.0, R3F 9.7.0 and current lockfile. Use the same repository folder and port 1607. Base: merged main b590c55. Branch: codex/trillium-datura-allium-grevillea-calceolaria.

## Approved design and research

The user approved this mix on 2 November 2026 and the established research/implementation/verification workflow. Preserve the existing app and use actual 3D geometry throughout. Counts, dimensions, pigments, developmental timing and mechanics are authored unless explicitly supported by a cited source.

| Slug / taxon | Anatomy and intended appearance | Response |
| --- | --- | --- |
| trillium / Trillium grandiflorum | Three broad white, gently undulating petals; three green sepals; six stamens; ovary and three stigma branches; terminal whorl of three broad leaf-like bracts. | Rooted scape, restrained nodding and independent petal contact; no invented repeated stem leaves. |
| datura / Datura stramonium | Upright white five-pointed folded trumpet, continuous five-lobed corolla and tubular calyx, five included stamens and included stigma; forked shoot and irregularly toothed foliage. | Plicate bud unfolds into a real hollow trumpet; tube attachments remain pinned. |
| allium / Allium giganteum | Dense lilac globe with true six-tepalled flowers, six stamens, real pedicels and basal spathe remnants; tall leafless scape and restrained senescing basal straps. | Independent supported floral motion with bounded carrier/contact detail; no radial sphere placeholder or artificial central pollen cloud. |
| grevillea / Grevillea rosmarinifolia | Red/cream clustered paired flowers, four real perianth segments with attached anthers, curved style and lateral pollen presenter; narrow revolute leaves on a woody shoot. | Curved bud/style presentation releases through an authored continuous trajectory; no bottlebrush stamen substitution. |
| calceolaria / Calceolaria integrifolia | Yellow fused bilabiate pouch, small upper lip and inflated lower lip, four sepals, two included stamens; opposite textured leaves on a branching shoot. | Hollow pouch expands without collapsing; mouth, internal organs and attachment stay distinct. |

Initial primary references: [NC State Trillium](https://plants.ces.ncsu.edu/plants/trillium-grandiflorum/), [Burke Herbarium Datura](https://burkeherbarium.org/imagecollection/taxon.php?Taxon=Datura+stramonium), [NC State Allium](https://plants.ces.ncsu.edu/plants/allium-giganteum/), [RHS Allium](https://www.rhs.org.uk/plants/829/allium-giganteum/details), [Australian Plants Society Grevillea](https://resources.austplants.com.au/plant/grevillea-rosmarinifolia/), [NSW flora Calceolariaceae](https://plantnet.rbgsyd.nsw.gov.au/cgi-bin/NSWfl.pl?lvl=fm&name=Calceolariaceae&page=nswfl) and [RHS Calceolaria](https://www.rhs.org.uk/plants/2663/calceolaria-integrifolia/details). Per-flower dossiers must record species evidence versus genus evidence, source conflicts, inaccessible sources and approximations. In particular, do not infer species-specific oil glands solely from a family description.

## Constraints and review focus

- Sharp macro geometry, positive thickness, deterministic buffers, finite unit open/folded normals, nondegenerate intermediate bloom and initialized morph targets. Dispose replaced resources explicitly.
- Detailed physics only in focused/selected specimens; keep 2,048 desktop / 512 constrained nodes, existing fixed-step bounds, pause/offscreen freeze and immediate reduced-motion settlement.
- Maintain the native whole-garden limits of eight million submitted inputs, 1,800 draws and shared shader bounds. Baseline constrained garden is 7,974,894 inputs / 1,601 draws / 50 programs. Reduce distant tessellation only where actual anatomy survives; never delete authored florets or raise the budgets.
- Keep all catalog plants in both layouts, conservative planting clearance separate from runtime head contact, and targets/bounds derived from actual assembled geometry and foliage transforms.
- Preserve SafeCanvas, retained previews, canonical routes, theme control/emblem, 15-per-page pagination, WebGL fallback and shared serialized optional GPU bakes.
- No automatic airborne pollen bursts for these studies. Place reproductive structures on anatomical organs. No WGSL/dependency changes planned.
- Use Neeraj Sathish Kumar <neerajcodz@gmail.com> as both author and committer; no coauthor trailers, history rewrites or automatic merge. Root serializes Git. Workers own disjoint species files and run no GPU/browser checks concurrently.

## Coherent slices and ownership

- [x] 1. Confirm mix, inspect clean main and installed stack, research initial sources, create branch and commit plan.
- [x] 2. Complete five source-backed dossiers under docs/research/, documenting proportions, attachments, surfaces, buds, behavior and evidence gaps.
- [x] 3–7. Dedicated anatomy/geometry and meaningful generated-buffer regressions, one checked commit per species. Use a failing regression before its corresponding change.
- [x] 8–12. Dedicated foliage geometry and tests, one checked commit per species, including actual stem/leaf transformation and insertion where applicable.
- [x] 13. Register typed slugs, species assemblies, custom stems/foliage renderers, palettes, metadata, structures and wind profiles together so the catalog remains complete.
- [x] 14. Add species-specific optical response, pigments, anti-aliased veins and restrained micro-relief with shared shader programs and the existing atlas/fallback.
- [x] 15. Exercise actual assembled contact cages, pins, elastic recovery, frame-rate consistency, reverse bloom, extreme inputs, pause, reduced motion and quality changes. Fix real defects in separate slices.
- [x] 16. Verify actual framing and native garden budgets; implement measured distant-geometry improvements only when required and preserve defining anatomy/counts.
- [x] 17. Add desktop/mobile canonical-route, controls, themes, retained gallery/garden and seven-view inspection coverage with unchanged readiness/pixel deadlines.
- [x] 18. Add docs/specimens/<slug>.md companions, paired indexes and public API/development/reference updates; verify all local documentation links.
- [x] 19. Regenerate the inventory, run taxonomy and coverage audit, typecheck, lint, complete unit/geometry/motion checks and production build.
- [x] 20. Inspect every species at specimen/overview detail on standard/constrained devices; record fresh CPU/rendering costs and browser results with source hashes and all failures/limitations, and review the branch.
- [x] 21. Verify all commit identities/trailers, push the completed branch and create a PR.

Trillium/Datura, Allium/Grevillea and Calceolaria have separate species owners. Root owns shared registries/materials, integration, GPU/browser serialization, commits and the final PR. Browser verification from the prior batch had intermittent mobile timing, RSC navigation and preparation observations; preserve that history and investigate new failures without relaxing checks.

Progress: dedicated anatomy, foliage, catalog, optics, actual-cage dynamics and paired documentation are committed. Native development/production garden budgets, inventory/taxonomy audits, typecheck, lint, a final 933-test full run and production build pass. Final-source specimen/overview boards for the five new flowers and Rose are accepted after two recorded unchanged mobile retries; all 86 affected existing desktop/mobile overview cases pass and their boards are reviewed. All 60 selected production cases have passing evidence across 61 attempts; Datura's recorded old-document RSC failure passed unchanged on retry and remains an unproven intermittent limitation. CPU costs and all 20 rendering samples are recorded, including slow Grevillea results. See the validation record for source hashes, failures and scope. Independent review findings on Allium and Datura attachments are resolved and regression-covered. The completed branch is published as [PR #10](https://github.com/NeerajCodz/LC/pull/10), awaiting review; no merge was performed.
