# Five-flower realism refinement implementation plan

**Goal:** Refine Gazania, Salvia, Nicotiana, Lantana and Echinacea against fresh botanical descriptions and real macro photographs, in the existing draft PR #9.

**Architecture:** Keep the five dedicated parametric assemblies and their sealed open/folded shells. Improve their anatomical silhouettes, attachments and tissue treatment rather than adding image assets or postprocessing. Species files own shape; shared material uniforms retain shader reuse and the existing tissue atlas/fallback.

**Tech stack:** Installed Next.js 16.3.4, React 19.2.8, Three.js 0.185.0 and R3F 9.7.0. Port 1607 and current dependencies remain.

## Design and evidence

The existing seven-view boards at runtime implementation `f072863` provide the before views. This refinement starts at `94b6974`, with the same runtime geometry. The user authorizes realism improvements and web research in the same workflow; the existing stack and dedicated specimen architecture remain the chosen approach.

- [NC State Gazania](https://plants.ces.ncsu.edu/plants/gazania-rigens/) and its center photographs show strongly marked rays, varied narrow/divided leaves and a dense disk. Refine real longitudinal ray relief, bounded irregularity and outer-open/inner-bud disk presentation.
- [NC State Echinacea](https://plants.ces.ncsu.edu/plants/echinacea-purpurea/) and its macro photographs show drooping ribbed rays and a spiny, densely textured warm cone. Correct exposed generic green cone tissue and improve palea overlap, shape and base-to-tip pigmentation. The authored 112-floret count remains a simplification, not a botanical constant.
- [NParks Salvia](https://www.nparks.gov.sg/florafaunaweb/flora/2/4/2414) describes dense whorled terminal racemes and persistent calyces. Refine broad scarlet calyces, bilateral mouths, distinct bud/open poses, graduated whorls and restrained natural variation rather than identical upward spikes.
- [NC State Nicotiana](https://plants.ces.ncsu.edu/plants/nicotiana-alata/) describes the pointed star-shaped species flower and distinguishes compact horticultural hybrids. Refine angular lobes, subtle folds and tube curvature with varied flower orientation; do not replace its long-tubed identity or assert every lobe reflexes.
- [NC State Lantana](https://plants.ces.ncsu.edu/plants/lantana-camara/) and flora descriptions support compact heads of small tubular florets. Move floral bases onto a small common receptacle, fan tubes into a continuous crown and reduce the exposed green bowl. Correct peduncle insertion relative to authored leaf axils where practical.

Counts, exact dimensions, pigments, curvature and mechanical coefficients remain authored choices. Each species dossier records the fresh sources and separates observed traits from those choices. Optical refinements are not calibrated reflectance data.

## Ownership and coherent slices

- [x] Research and baseline record: update the five dossiers, identify specific before-view defects, and commit this plan and source evidence.
- [x] Gazania geometry: add real ray relief/variation and staged disk anatomy; add regression checks using generated buffers and open/folded states. Owner: ray-flower agent; only Gazania files and its tests/dossier.
- [x] Echinacea geometry: refine the cone/paleae and ray relief; check actual tissue role, geometry colors, overlap and transformed support. Owner: ray-flower agent; only Echinacea files and its tests/dossier.
- [x] Salvia geometry: improve calyx/corolla proportions, whorl arrangement and distinct closed/open silhouettes. Owner: tube-flower agent; only Salvia files and its tests/dossier.
- [x] Nicotiana geometry: refine pointed stars, crease relief, flexible tubes and varied inflorescence poses. Owner: tube-flower agent; only Nicotiana files, its tests/dossier and shared Salvia/Nicotiana quality tests.
- [x] Lantana geometry: replace the exposed broad bowl with compact converging floral bases and a dense domed crown; preserve all 42 florets, true included organs and four unequal lobes. Owner: cluster agent; only Lantana files and tests/dossier.
- [x] Shared tissue integration: explicitly type receptacle surfaces and optional organ tip pigments; add species-specific filtered micro-relief and restrained pigment gradients while preserving shader sharing and fallback. Owner: root; `lib/three/specimenModel.ts`, `specimenTissue.ts`, `specimenMaterials.ts`, palettes and material tests. Agents request shared edits instead of making them.
- [x] Integration/framing: update bounds only if actual generated envelopes require it; verify all stages and catalog-wide portrait containment. Root owns registries.
- [x] Fresh verification and visual comparison: typecheck, lint, unit/geometry/contact tests, seven-view inspection at specimen/overview and standard/constrained tiers, focused controls, selected garden and native budget scenarios. Inspect real images after rendering. Lifecycle code is outside the proposed refinement; the previously observed intermittent WebKit stall remains documented unless a cause is established.
- [x] Publish fresh rendering costs and validation evidence, verify author/committer identity and trailer absence, push each checked coherent slice, and update PR #9. Preserve the original measurements as historical evidence.

## Global constraints and review focus

- Keep closed tissue walls, deterministic geometry, positive thickness, open/folded normals, initialized morph targets and explicit disposal.
- Keep all authored florets at constrained detail and existing simulation-node ceilings: 2,048 desktop / 512 constrained. Do not increase flower/organ counts to hide shape problems.
- Keep current full-garden limits (eight million submitted inputs, 1,800 draws and bounded shader sharing); measure rather than raise them.
- Keep current navigation, themes, 15-per-page pagination, retained previews and WebGL-compatible tissue/lighting fallback. No blur, glow or replacement photographs.
- Follow a meaningful failing regression with its focused geometry/material change, then commit after the relevant check passes. Avoid tests that merely assert a new magic constant.
- Verify bud and half-bloom walls do not collapse, included organs stay inside curved tubes, roots remain attached and reduced motion settles correctly.
- Use Neeraj Sathish Kumar <neerajcodz@gmail.com> as author and committer, without coauthor trailers. Root serializes Git operations; agents do not commit shared state.
