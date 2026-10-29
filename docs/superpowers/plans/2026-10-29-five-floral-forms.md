# Five floral forms implementation plan

**Goal:** Add the approved Gazania, Salvia, Nicotiana, Lantana and Echinacea mix to Living Colors with dedicated anatomy and the established realism workflow.

**Architecture:** Species own geometry, foliage and FlowerPlant wrappers. Existing sealed parametric shells, SpecimenAssembly, anchored stems, tissue atlas and bounded contact cages remain the rendering path. Shared registries provide automatic navigation, search, retained previews and garden inclusion.

**Stack:** Installed Next.js 16.3.4, React 19.2.8, Three.js 0.185.0 and R3F 9.7.0. Port 1607; no dependency migration.

## Design

Gazania rigens has yellow/orange rays with basal eyes, true disk florets and felted leaf undersides. Echinacea purpurea has drooping pink rays around a raised cone of true florets and pointed receptacular scales. Salvia splendens has scarlet hooded flowers and persistent calyces on a whorled spike. Nicotiana alata has white salverform flowers on long tubes, younger furled buds and decurrent leaves. Lantana camara has dense heads of small asymmetric tubular flowers, authored yellow/orange/pink cohorts and rough opposite leaves.

Source-backed traits, authored counts/palettes/mechanical constants and evidence gaps are recorded separately in five dossiers. Biological fragrance or color aging is not represented as a measured simulation. Reverse bloom remains an inspection control.

## Sequenced slices

- [x] Add five source dossiers and meaningful failing anatomy tests before production geometry.
- [x] For each species, implement deterministic sealed geometry and actual organs; check normals, thickness, topology, intermediate bloom and whole-plant node ceilings; commit anatomy independently.
- [x] For each species, implement its foliage, rooted stem attachments and renderer wrapper; check the focused tests; commit the completed species slice.
- [x] Register typed dispatch, catalog, palettes, tissue optics, wind and framing. Verify all five use dedicated components and complete metadata.
- [x] Add parameterized production browser scenarios and seven-view inspection coverage, including constrained tiers. Inspect front/side/45°/macro/bud/half/full views against research.
- [x] Run full typecheck, lint, unit tests, taxonomy/inventory audit and build. Test focused desktop/mobile controls, retained gallery and selected garden behavior with WebGPU disabled. Run renderer lifecycle tests if shared lifecycle changes are needed.
- [x] Record actual simulation/render costs and limitations; independently review; commit validation and generated inventory.
- [ ] Verify author/committer Neeraj Sathish Kumar <neerajcodz@gmail.com>, no trailers, push focused slices and create/attach a new PR. Preserve unrelated history.

## Review focus

Avoid duplicate distal tissue, periodic pigment seams, organs piercing roofs or calyces, collapsed folded tips, missing foliage at constrained detail and mismatched attachment transforms. Keep 2048 desktop / 512 constrained simulation-node ceilings, fixed roots, reduced motion, pause/offscreen retention and sharp macro rendering. Existing 15-per-page pagination remains unchanged.
