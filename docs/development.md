# Development and verification

`next-ten-inspection.spec.ts` covers Rose plus Ranunculus, Anemone, Crocus, Freesia,
Lisianthus, Camellia, Magnolia, Gardenia, Nasturtium and Cosmos. Use
`DEV_INSPECTION=1` on a development port-1607 server and optionally filter with
`SPECIMENS_TO_INSPECT`. `next-ten-specimens.spec.ts` exercises actual pixels,
macro cage retention, pulse, pause, reduced motion, bloom, themes, search and
selected garden rendering for all ten. Their geometry, arrangement and transformed
contact tests are in the corresponding `*-specimen.test.ts` files and
`next-ten-specimen-dynamics.test.ts` / `flower-head-pose.test.ts`.

`garden-overview.test.ts` checks the distant garden tier across classical petals and dense organ prototypes. Overview retains all authored organ counts and sealed bloom geometry; selected specimens restore their original detail. `shader-reuse.spec.ts` counts native submitted vertices at exact render boundaries, detects duplicate live shader sources and spontaneous context loss, and checks actual garden/selected pixels through resize.

`ten-specimen-geometry.test.ts` checks all ten recent models, their defining organs and sealed dense-floret prototypes. `ten-specimen-dynamics.test.ts` stresses transformed/pinned cages at both budgets; `ten-specimen-arrangement.test.ts` checks assembled dorsal orientation, the ascending Delphinium spur and Zinnia peduncle clearance. `botanical-blades.test.ts` / `specimen-tissue.test.ts` verify continuous palmate surfaces, required color attributes, distinct tissue channels and independent leaf pigments.

The material regression also compares shader source across organ/tissue combinations, preserves Zinnia's bicolored calyx program, and verifies independent species/region/scatter and blade pigment uniforms. Shared program keys must never merge different source code or embed per-material colors as shared GLSL literals.

`ten-specimens.spec.ts` covers rendered pixels, bloom, themes, collection/search, both garden layouts and focused physics lifecycle. `DEV_INSPECTION=1` enables `ten-specimen-inspection.spec.ts`; `SPECIMENS_TO_INSPECT` optionally filters its comma-separated slugs. Inspect the seven-view captures against Rose and the dossiers; keep images/logs in ignored outputs. Rendering and CPU drivers accept the new slugs as comma-separated filters. See [measured validation](specimens/ten-specimens-validation.md).

Project LC's mission is to bring every single flower in the world to life in 3D. Living Colors is its standalone Next.js App Router application, with a catalog that grows as specimens are developed. [README](../README.md) documents the rendering architecture and Flower API; [AGENTS.md](../AGENTS.md) holds the project brief and coding requirements. Botanical changes should follow the [reference notes](botanical-references.md) and [wind/contact model](wind-and-contact.md).

## Local setup

Use Node.js 22.12 or newer. The checked-in lockfile uses pnpm 10.28.2:

```bash
corepack enable
pnpm install --frozen-lockfile
pnpm dev
```

The npm quick start also works:

```bash
npm install
npm run dev
```

Open [http://localhost:1607/](http://localhost:1607/). Development, production, and Playwright all use **1607**. If it is occupied, inspect/reuse the app already running there, or stop that app before switching development/production modes. Do not fall back to another port. Keep the pnpm lockfile as the repository's canonical dependency lockfile.

```bash
npm run build
npm start
```

`next start` requires a completed build. Production excludes `/dev/inspection/`. The app needs no secrets, database, external font request, or downloaded flower asset. WebGL 2 enables interactive specimens when available, including software-rendered contexts; unavailable contexts retain the non-interactive catalog and route content. WebGPU is optional at runtime.

## Commands

| Command                 | Purpose                                                                                     |
| ----------------------- | ------------------------------------------------------------------------------------------- |
| `npm run typecheck`     | TypeScript checks, including GPU `.mts` test sources.                                       |
| `npm run lint`          | Next.js / React / TypeScript lint rules.                                                    |
| `npm test`              | Deterministic geometry, Lotus anatomy, bloom/spring invariants, and Canvas event lifecycle. |
| `npm run check:shaders` | Real-device WGSL validation for tissue and HDR studio programs.                             |
| `npm run test:gpu`      | Render/readback tests comparing tissue and HDR output to numerical references.              |
| `npm run test:browser`  | Playwright desktop Chromium and mobile WebKit scenarios.                                    |
| `npm run build`         | Production compilation and route generation.                                                |

For GPU diagnostics and the installed vgpu API:

```bash
npx vgpu doctor --pretty
npx vgpu docs ls /guides
npx vgpu docs cat Target
```

Shader/device checks need a working WebGPU adapter even though the deployed application can fall back to WebGL. Report unavailable hardware checks rather than treating them as passing.

## Browser checks

Install Playwright browsers once, then run scenarios:

```bash
npx playwright install chromium webkit
npm run test:browser
```

On Windows, an installed Google Chrome can run the desktop suite without a separate Chromium download:

```powershell
$env:PLAYWRIGHT_CHANNEL = 'chrome'
pnpm exec playwright test --project=desktop --workers=1
```

The mobile project still requires Playwright WebKit. The test tooling is pinned to `1.65.0-alpha-2026-10-08`, with WebKit build 2373, because Windows WebKit 2359 in Playwright 1.63 produces blank WebGL captures after drawing-buffer resize. The [upstream fix](https://github.com/WebKit/WebKit/pull/75957) repairs native display-buffer readiness; the app does not reset contexts or change its rendering stack to work around it. Keep this exact tooling pin until a stable Playwright release includes that fix. Reinstall WebKit after changing the test dependency. `webgl-resize.spec.ts` checks the native compositor with a plain WebGL 2 control before and after resize; `shader-reuse.spec.ts` checks actual garden and close-up screenshots, shader reuse, atlas sampling and submitted geometry budgets.

The config starts the development server on 1607 when needed and reuses an existing server locally. First shader compilation can take longer under software rendering; assertions allow 15 seconds. Traces from failed tests are saved under the ignored `test-results/` directory.

- `expanded-specimens.spec.ts`: new specimen routes, bloom and macro controls, and garden macro selection.
- `viewer.spec.ts`: garden macro selection, orbit drag, wheel zoom, and return without leaving the route.
- `experience.spec.ts`: home collection links, bloom/macro/lighting/pause controls, navigation, reduced motion, themes, legacy redirects, and the four-angle section.
- `scroll.spec.ts`: flower pixels and captions move together on the collection, specimen hero, and specimen angle gallery.
- `retention.spec.ts`: every catalog scene ID survives return scrolling; specimen angle scenes, scroll-study Canvas, and bloom controls retain their state.
- `mobile-performance.spec.ts`: constrained buffers and continuing frames across specimen, macro, collection, and garden.
- `lifecycle.spec.ts`: rapid scrolling/navigation without null event-target crashes; macro rendering with WebGPU unavailable.
- `rendering-fallback.spec.ts`: null/throwing capability probes across all public routes, actual renderer initialization failure after a successful probe, real context loss and retry with retained bloom state, and a thrown draw call. Recovery checks actual flower pixels as well as frames. Runs on desktop Chromium and mobile WebKit.

Renderer failures are contained at three boundaries: the shared capability probe, `SceneBoundary` around R3F, and the manually scheduled `RenderBudget` frame. All public canvases must remain behind `SafeCanvas`. Keep unsupported and pending capability states distinct. Retry is user initiated and must preserve DOM controls/selection; it creates fresh GPU resources instead of reusing a lost context. Do not suppress global errors or hide unrelated route errors.

Both npm and pnpm installs run `scripts/patch-fiber.mjs` to forward R3F 9.7.0's rejected async Canvas setup to its error state. It verifies and patches the ESM and both CJS bundles. On dependency upgrades, inspect the installed Canvas startup before updating/removing this compatibility fix, then run the renderer-rejection browser case. Installations using `--ignore-scripts` must run this script explicitly. `dist/` holds ignored research/test artifacts and is excluded from lint/type checking.

For manual loading inspection, disable browser cache and throttle JavaScript requests. Inspect the specimen overlay, collection code fallback, and garden overlay. The SVG should unfold and rotate while loading, then disappear when the scene draws. In all three themes, text and ornament must remain legible. With reduced motion enabled, verify a still flower, fixed light, no pollen, and a readable status. Do not add a fake delay solely to make the loader visible on fast connections.

Confirm that each route's `rel="icon"` link resolves to `app/icon.svg` and that its emblem matches the header. Next.js fingerprints this metadata asset; a browser may retain an older favicon until the page/tab refreshes.

## Visual and performance inspection

Use [the development inspection fixture](http://localhost:1607/dev/inspection/) for every affected species at front, side, 45 degrees, macro, bud, half bloom, and full bloom. Inspect petal edge thickness, folded normals, underside attachments, foliage, stamens, shadows, gaps, and intersections. The fixture is heavier than the public single-specimen page; use the public page for representative performance measurements.

Check a narrow viewport and actual touch interaction when available. Keep the main flower sharp in macro mode. Test pointer motion, cursor-light locking, tap/click pulses, reverse bloom, theme changes, and pause/reduced-motion behavior. No automated pixel or geometry test establishes botanical realism on its own.

Useful runtime diagnostics:

| Attribute / element                       | Meaning                                                       |
| ----------------------------------------- | ------------------------------------------------------------- |
| `canvas[data-surface-detail]`             | Tissue source: `vgpu` or the cached `webgl` CPU atlas.         |
| `canvas[data-lighting-backend]`           | HDR studio source: `vgpu` or the `webgl` CPU fallback.        |
| `.preview-stage[data-retained-scenes]`    | Number of lazily initialized scenes retained in this gallery. |
| `[data-flower-preview][data-scene-id]`    | Stable scene identity across offscreen pauses.                |
| `[data-flower-preview][data-render-rect]` | Preview scissor rectangle relative to its shared canvas.      |
| `canvas[data-render-budget]`              | Mobile or desktop rendering budget.                           |
| `canvas[data-render-frames]`              | Draw count sampled every 30 frames.                           |
| `#render-stats[data-fps]`                 | Sampled development hero frame rate, measured in wall time.   |

Wait for a fresh page to settle before comparing scene IDs; hot reloads during code edits can replace scenes. Offscreen retention lasts for the mounted route, not navigation away or a browser reload. The collection uses one WebGL context after every species is visited; a complete specimen page uses three after its angle gallery and scroll study initialize. The shared gallery backing buffer covers its finite grid but its DPR is bounded by pixel and dimension limits. Browser emulation does not establish performance on a physical phone. Use the Wind study toggle in the inspection fixture to check anchored bases and moving attachments.

Custom organ geometry is tested in `floral-surfaces.test.ts`; the [specimen dossier](specimens/expanded-forms.md) records research and interpretation. Run the seven-view fixture after changing shell sampling or folds.

`passionflower.test.ts` adds continuous palmate-leaf topology, corona pigment zones, finite folded normals, low-quality geometry bounds and fixed-support derivative checks. The [passionflower dossier](specimens/passionflower-research.md) describes its modular corolla, reproductive organs and climbing stem. Its canonical route and garden macro selection are included in `expanded-specimens.spec.ts`. Preserve optional organ interaction refs and the custom stem slot when extending these systems; no existing flower should acquire the vine's support constraint by default.

`passionflower.spec.ts` disables WebGPU to exercise the GLSL material fallback through bloom, macro and all themes. It rejects runtime/shader errors and samples actual canvas pixels. Driver informational warnings are not compile failures. `mobile-performance.spec.ts` also checks that entering macro keeps the mobile framebuffer size stable and the flower drawn; frame counters alone cannot establish visible rendering. Inspect a composited screenshot as well as pixel readback when checking WebKit behavior.

Spadix checks include capped topology, normal direction and mobile tessellation bounds. When validating retained galleries, check the framebuffer after registering all previews as well as after resizing: Canvas configuration can reset DPR even when its DOM size does not change. `RenderBudget` subscribes to renderer-store changes to reapply its limit.

`morning-glory.test.ts` verifies its periodic sealed shell, matched bud normals, thickness and nondegenerate unfolding triangles. `morning-glory.spec.ts` covers visible pixels, bloom, macro, themes, collection search and garden selection. Its [dossier](specimens/morning-glory-research.md) records the distinction between artistic reverse bloom and biological mature closure. `previewScale` is optional authored camera framing; it must not change geometry scale or existing species framing by default.

`fuchsia.test.ts` checks sealed parametric shells, intermediate triangles, valvate bud seams, two stamen lengths and pendant stability. `fuchsia.spec.ts` checks real rendering, reverse bloom, macro, themes, collection search and garden selection with WebGPU disabled. Its [dossier](specimens/fuchsia-research.md) documents source proportions and uncalibrated mechanics. Custom `Organs` now receive the optional `leaves` flag so upper-branch foliage honors the public API. Shared leaf shaders support an optional `veinColor`; absent values preserve the original appearance.

`specimen-geometry.test.ts` checks the five flexible specimens' sealed surfaces, positive thickness, deterministic normals, intermediate bloom triangles, organ arrangement and complete cage budgets including pinned obstacles. `petal-dynamics.test.ts`, `petal-deformation.test.ts` and `petal-lifecycle.test.ts` cover contact, pinned insertions, elastic recovery, extreme inputs, reverse bloom, frame-rate consistency, render bindings, shadows and retained time. `five-specimens.spec.ts` exercises actual flower pixels, themes, reverse bloom, search, both garden layouts, macro, keyboard pulse, pause, reduced motion and responsive cage budgets with WebGPU disabled. Cold software WebKit renderer/shader startup can exceed 15 seconds; the new readiness assertions allow 60 seconds without adding any product loading delay.

Run `npx tsx scripts/benchmark-petal-physics.ts` for warmed CPU-only measurements. Browser canvases expose `data-petal-physics`, `data-petal-nodes`, `data-petal-steps` and sampled `data-petal-ms`; macro must keep the same node count and advance the same step counter. Paused/offscreen counters freeze. CPU timing excludes draw and texture-upload cost. See the [validation record](specimens/five-specimens-validation.md) for measured results and limitations.

## Maintenance

The global target inventory is [FLOWERS.md](FLOWERS.md); the interactive catalog is still `lib/flowers/catalog.ts`. After adding or renaming a specimen, run `npm run flowers:inventory` and `npm run flowers:check` so its mapping does not drift. These optional commands require Python 3.10+. Source metadata and checksums live in `data/taxonomy/source.json`; the generated audit manifest is `data/taxonomy/inventory.json`. Never relabel inventory entries as completed models just because a binomial matches.

The WFO archive's sole missing parent is its nomenclatural Code record above kingdom Plantae. The importer permits only that pinned, source-verified boundary and requires it to attach solely to the expected Plantae kingdom. All other missing parents, duplicate IDs, missing accepted names, malformed rows and cycles fail before the document is written. `npm run test:taxonomy` exercises those boundaries. The importer preserves all accepted descendants of species, including uncommon infraspecific ranks, rather than silently dropping unfamiliar ranks.

Keep collection copy open-ended and aligned with the mission to create every flower. Use `FLOWERS` / `FLOWER_TYPES` for navigation bounds and test coverage. When adding a species, extend its type, catalog entry, palette, botanical construction, exhaustive dispatcher, and `FLOWER_STRUCTURES` registry and `WIND_PROFILES` response; verify all derived routes and previews. Add botanical sources and inspect the specimen before presenting it as available. The current implementation list does not define the project's final scope.

Keep `AGENTS.md` as the only agent instruction file. Its managed Next.js documentation block should remain intact; the installed Next generator recognizes the existing guide without requiring `CLAUDE.md`. Read framework docs under `node_modules/next/dist/docs/` before changing App Router conventions.

The SVG favicon duplicates the installed Lucide `Flower2` paths used by `Header.tsx`, with a slightly stronger stroke for small browser tabs. Keep both in sync if the emblem changes. The shared `BloomLoader` controls all decorative loading UI; `SceneReady` controls initial specimen/garden readiness. These are independent from procedural flower-opening animation and GPU material preparation.

Keep docs aligned with changed APIs and behavior. Use conventional commits for completed major changes, without coauthor trailers, and push under the established project workflow. Record actual checks and known limitations in the handoff.

`next-specimen-geometry.test.ts` and `next-specimen-dynamics.test.ts` add sex-specific Begonia, Cyclamen basal/reflexed anatomy, fertile lacecap and Protea floret checks, folded-tip containment, sealed dense prototypes, and transformed/pinned cage stress at both budgets. `floret-instances.test.ts` checks first-draw transforms, morph texture retention, full counts and folded Protea carriers. `snapdragon-pressure.test.ts` checks the same mouth pressure in cage rest and pinned insertions. `next-specimens.spec.ts` covers the new routes, rendered pixels, controls, gallery search and garden selection; `DEV_INSPECTION=1` enables the development-only `specimen-inspection.spec.ts` seven-view captures. Keep screenshots in ignored validation outputs.

Run `npx tsx scripts/benchmark-specimen-rendering.ts cyclamen,snapdragon,hardy-begonia,hydrangea,king-protea desktop,mobile` against a production server on 1607 for sequential warm frame samples. Fresh 30-frame boundaries avoid counting historical frames. Output includes renderer, buffer budget, tissue/HDR fallback, solver and CPU cage-texture preparation; GPU upload and drawing remain combined in frame wall time. `benchmark-petal-physics.ts` accepts the same optional comma-separated species filter. See [validation](specimens/next-five-validation.md) for exact results and limits.
