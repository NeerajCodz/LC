# Development and verification

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

`next start` requires a completed build. Production excludes `/dev/inspection/`. The app needs no secrets, database, external font request, or downloaded flower asset. Use a browser with WebGL 2 and hardware acceleration. WebGPU is optional at runtime.

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

The mobile project still requires Playwright WebKit. The config starts the development server on 1607 when needed and reuses an existing server locally. First shader compilation can take longer under software rendering; assertions allow 15 seconds. Traces from failed tests are saved under the ignored `test-results/` directory.

- `experience.spec.ts`: all species links, bloom/macro/pause controls, navigation, reduced motion, themes, legacy redirects, and the four-angle section.
- `scroll.spec.ts`: flower pixels and captions move together on the collection, hero, and angle gallery.
- `retention.spec.ts`: every catalog scene ID survives return scrolling; home angle scenes, scroll-study Canvas, and bloom controls retain their state.
- `mobile-performance.spec.ts`: constrained buffers and continuing frames across specimen, macro, collection, and garden.
- `lifecycle.spec.ts`: rapid scrolling/navigation without null event-target crashes; macro rendering with WebGPU unavailable.

For manual loading inspection, disable browser cache and throttle JavaScript requests. Inspect the initial home/specimen overlay, collection code fallback, and garden overlay. The SVG should unfold and rotate while loading, then disappear when the scene draws. In all three themes, text and ornament must remain legible. With reduced motion enabled, verify a still flower, no pollen, and a readable status. Do not add a fake delay solely to make the loader visible on fast connections.

Confirm that each route's `rel="icon"` link resolves to `app/icon.svg` and that its emblem matches the header. Next.js fingerprints this metadata asset; a browser may retain an older favicon until the page/tab refreshes.

## Visual and performance inspection

Use [the development inspection fixture](http://localhost:1607/dev/inspection/) for every affected species at front, side, 45 degrees, macro, bud, half bloom, and full bloom. Inspect petal edge thickness, folded normals, underside attachments, foliage, stamens, shadows, gaps, and intersections. The fixture is heavier than the public single-specimen page; use the public page for representative performance measurements.

Check a narrow viewport and actual touch interaction when available. Keep the main flower sharp in macro mode. Test pointer motion, tap/click pulses, reverse bloom, theme changes, and pause/reduced-motion behavior. No automated pixel or geometry test establishes botanical realism on its own.

Useful runtime diagnostics:

| Attribute / element                       | Meaning                                                       |
| ----------------------------------------- | ------------------------------------------------------------- |
| `canvas[data-surface-detail]`             | Tissue source: `vgpu` or the `webgl` shader fallback.         |
| `canvas[data-lighting-backend]`           | HDR studio source: `vgpu` or the `webgl` CPU fallback.        |
| `.preview-stage[data-retained-scenes]`    | Number of lazily initialized scenes retained in this gallery. |
| `[data-flower-preview][data-scene-id]`    | Stable scene identity across offscreen pauses.                |
| `[data-flower-preview][data-render-rect]` | Preview scissor rectangle relative to its shared canvas.      |
| `canvas[data-render-budget]`              | Mobile or desktop rendering budget.                           |
| `canvas[data-render-frames]`              | Draw count sampled every 30 frames.                           |
| `#render-stats[data-fps]`                 | Sampled development hero frame rate.                          |

Wait for a fresh page to settle before comparing scene IDs; hot reloads during code edits can replace scenes. Offscreen retention lasts for the mounted route, not navigation away or a browser reload. The collection uses one WebGL context after every species is visited; home uses three after its angle gallery and scroll study initialize. The shared gallery backing buffer covers its finite grid but its DPR is bounded by pixel and dimension limits. Browser emulation does not establish performance on a physical phone. Use the Wind study toggle in the inspection fixture to check anchored bases and moving attachments.

## Maintenance

Keep collection copy open-ended and aligned with the mission to create every flower. Use `FLOWERS` / `FLOWER_TYPES` for navigation bounds and test coverage. When adding a species, extend its type, catalog entry, palette, botanical construction, exhaustive dispatcher, and `FLOWER_STRUCTURES` registry and `WIND_PROFILES` response; verify all derived routes and previews. Add botanical sources and inspect the specimen before presenting it as available. The current implementation list does not define the project's final scope.

Keep `AGENTS.md` as the only agent instruction file. Its managed Next.js documentation block should remain intact; the installed Next generator recognizes the existing guide without requiring `CLAUDE.md`. Read framework docs under `node_modules/next/dist/docs/` before changing App Router conventions.

The SVG favicon duplicates the installed Lucide `Flower2` paths used by `Header.tsx`, with a slightly stronger stroke for small browser tabs. Keep both in sync if the emblem changes. The shared `BloomLoader` controls all decorative loading UI; `SceneReady` controls initial specimen/garden readiness. These are independent from procedural flower-opening animation and GPU material preparation.

Keep docs aligned with changed APIs and behavior. Use conventional commits for completed major changes, without coauthor trailers, and push under the established project workflow. Record actual checks and known limitations in the handoff.
