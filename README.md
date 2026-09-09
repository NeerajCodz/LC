# Project LC · Living Colors

**Our mission is to bring every single flower in the world to life in 3D.** Project LC is an ever-growing collection of interactive botanical specimens, built as a standalone Next.js application. The current catalog is a beginning; the mission grows beyond it. Every flower is built from curved, sealed 3D petal geometry; the collection contains no photographs, sprites, billboards, or imported flower models.

Explore the flowers currently available through the collection page. The source of truth for implemented specimens is `lib/flowers/catalog.ts`; new flowers join the collection as their geometry, materials, and behavior are developed and reviewed.

Project documentation: [agent brief and implementation rules](AGENTS.md), [development and verification](docs/development.md), and [botanical references](docs/botanical-references.md). `AGENTS.md` is the sole agent instruction file.

## Run locally

Requires Node.js 22.12 or newer and a browser with WebGL 2 and hardware acceleration.

```bash
npm install
npm run dev
```

Open [localhost:1607](http://localhost:1607). Both development and production start scripts explicitly use port **1607**.

The repository uses pnpm for its checked-in lockfile. For a reproducible installation with that lockfile:

```bash
corepack enable
pnpm install --frozen-lockfile
pnpm dev
```

## Production

```bash
npm run build
npm start
```

Deploy as a regular Next.js application on a Node.js host or a Next.js-compatible platform. This repository has no dependency on ChatGPT Sites, hosted assets, API keys, or a database. Fonts are bundled locally.

## Pages and interaction

- `/` — cinematic Rose specimen, catalog-driven selector, previous/next, bloom slider, replay, pause, macro camera, and scroll-driven growth.
- `/flower/lotus/` (and each implemented species slug) — a dedicated specimen route with species metadata. Legacy `/?flower=lotus` links permanently redirect here. Repeated slashes are normalized by Next.js.
- `/flower/lotus/#angles` — four simultaneous live views of the selected flower: front, 45°, side, and macro, with a shared bloom control. Every specimen has this gallery section.
- `/garden/` — nine flowers in an asymmetric composition. A shared bloom slider controls the garden; select a flower to inspect it.
- `/gallery/` — the growing collection, with visible previews rendered directly inside their page frames. Compare front, side, 45-degree and macro views, and control bloom across the current catalog.
- `/dev/inspection/` — development-only seven-view geometry fixture. It returns 404 in production. Select any species to inspect full bloom, multiple angles, macro, bud and half bloom side by side.

Move the pointer or drag on the flower to sway it. Click or tap for a bloom pulse and close-up. The equivalent macro, bloom and pause actions are available through keyboard-accessible DOM controls. Escape closes the collection selector. Reduced-motion preferences disable pulses and pollen, simplify camera movement and make bloom controls immediate.

The original Lucide `Flower2` emblem sits beside **LC** in the header and appears in the SVG favicon, on a forest-charcoal tile with ivory strokes. Next.js discovers `app/icon.svg` and adds its metadata on every route. One rounded toggle cycles through **Current** (forest charcoal), **Black**, and **White** (warm ivory). Its sliding thumb and leaf/moon/sun icons show the active theme; its accessible label names the current and next theme. Themes update both the interface and the 3D background/fog. The choice persists in local storage for the current origin and synchronizes between browser tabs; flower pigments stay consistent across themes. The footer carries the full **living colors** wordmark.

### Loading

`BloomLoader` draws a small SVG flower with staggered petal unfolding, a slowly rotating flower head, opening leaves, a traced stem, and restrained pollen. It uses theme colors and CSS animation, so it can appear before the 3D code loads. A single polite status message announces loading; the decorative SVG is hidden from assistive technology. Reduced-motion preferences show a still, open flower with no rotation or pollen.

The shared loader covers route Suspense, collection/inspection code loading, and initial specimen/garden preparation. `SceneReady` removes the specimen and garden overlays after their first drawn frame, without an artificial minimum wait. vgpu bakes continue asynchronously with working material and lighting fallbacks. Scrolling back to an already visited preview resumes its retained scene without replaying loading. The SVG ornament is UI only; every specimen remains real 3D geometry.

## Flower API

Use inside a React Three Fiber canvas:

```tsx
import { Flower } from "@/components/flowers/Flower";

<Flower
  type="rose"
  color="#b31e47"
  bloom={1}
  growth={1}
  scale={1}
  position={[0, 0.5, 0]}
  rotation={[0, 0, 0]}
  animationSpeed={1}
  windStrength={0.8}
  cursorStrength={1}
  interactive
  stem
  leaves
  quality="high"
/>;
```

`bloom` and `growth` are normalized to 0–1 by the UI. Bloom is clamped inside the animation hook. `growth` is optional and defaults to 1; it allows the scroll sequence to animate the rooted stem separately from the petals. `hovered`, `paused`, `reducedMotion`, `pulse`, `onHover`, and `onClick` support embedding and interaction. Increment `pulse` to trigger a secondary bloom. Set `animateEntrance={false}` for immediately composed gallery previews while preserving subsequent bloom animation. Omit `color` to use the authored species pigment palette; a custom color generates a coordinated root-to-tip palette. Specialized organs such as sepals, seeds and the orchid lip retain their botanical colors.

## Architecture

```text
app/                         App Router pages, route loading, errors, and icon.svg
components/
  Experience.tsx             Specimen UI and closing/entry transitions
  Gallery.tsx                Collection layout and visible previews
  AngleGallery.tsx           Four simultaneous views of the selected species
  Garden.tsx                 Garden controls
  ui/                        LC header, theme toggle, and SVG BloomLoader
  flowers/
    Flower.tsx               Exhaustive species dispatcher
    BotanicalView.tsx        Reusable camera, lighting, and preview content
    FlowerPreview.tsx        DOM preview registration; stable scene identity
    FlowerPlant.tsx          Reusable plant hierarchy and interaction
    PetalWhorl.tsx           Instanced petals with individual transforms/morphs
    FlowerCore.tsx           Phyllotaxis seeds, florets, pods and stamens
    Stem.tsx, Branch.tsx      Tapered stem, leaves, veins and branches
    <species>/               Distinct botanical construction per species
  scene/                     Lights, studio environment, camera, pollen, effects
    PreviewStage.tsx         Shared in-flow WebGL renderer and retained scene portals
    SceneReady.tsx           First-frame readiness for scene loading overlays
hooks/                       Bloom damping, pointer projection, quality, interaction
lib/
  flowers/                   Typed public API, metadata and whorl construction
  three/                     Parametric geometry, physical materials, seeded noise
  gpu/                       vgpu tissue/HDR bakes, WGSL, and CPU reference field
docs/                        Development guide and botanical source notes
tests/                       Geometry, events, GPU pixels, and browser scenarios
```

### Geometry and animation

Petals have indexed front and back surfaces joined around their perimeter. Thickness is applied along their computed surface normals, including recurved tips. Open and folded positions **and normals** are generated once, with deterministic seeds. Each instanced petal receives its own morph weight, opening delay, rotation, size, twist and tone. The Tulip uses cylindrical cup sections; the general petal generator supports rounded, tapered, ruffled, notched and spotted profiles.

Species vary in whorl structure, petal count, profile, opening angle, core organs and branching. The Rose uses nested spiral whorls; Dahlia and Chrysanthemum use hundreds of different-sized florets; Sunflower uses 610 phyllotaxis seeds; Jasmine and Cherry Blossom form branch groups; Lavender uses tiered florets on multiple spikes. The Lotus has a dedicated tapered receptacle, recessed carpel sockets, 156 curved stamens, and a peltate leaf on its own petiole. Lily and Tulip have six filaments with paired anthers and separate pistils; Hibiscus has a curved column with five stigma tips. Species-specific foliage includes compound leaflets, actual toothed/lobed margins, and basal strap leaves. These are artist-directed procedural specimens, not scans of individual plants. See [botanical references and interpretation notes](docs/botanical-references.md).

Stem vertices and their leaf/head attachments sample the same travelling wind bend. Secondary head movement and delayed petal flutter keep the hierarchy from moving rigidly. Pointer rays intersect a world-space plane; local proximity drives individual petal response. Camera motion is damped; flower switching closes the outgoing petals before mounting and opening the next specimen. No global state store is needed.

### Materials and lighting

Physical petal materials use species-specific root, body, edge, and vein pigment zones in `lib/flowers/palettes.ts`. Shader uniforms are converted to linear color space by Three.js. Subtle mottling, darker inner layers, neutral vertex shading, restrained tinted sheen, and a balanced studio light preserve saturated pigments and clean ivory whites. Procedural veins, derivative-based micro-normal detail, roughness variation and restrained back scattering add surface detail. This is a real-time approximation of organic light transport, not volumetric subsurface scattering. A procedural HDR studio environment provides reflections without an external image download. Desktop effects include ambient occlusion, multisample antialiasing, and a subtle vignette. Depth-of-field and visual bloom are disabled so zooming preserves sharp petal and pollen detail. Procedural tissue noise is filtered at a distance to reduce shimmer.

### WebGL and vgpu

All flower geometry, morphs, PBR lighting, shadows, instancing, and interaction render through Three.js / React Three Fiber in **WebGL 2**. [vgpu](https://vgpu.sh/docs/get-started/web) is a WebGPU library; its `Surface` requires a WebGPU canvas context and cannot replace an existing WebGL canvas directly.

On WebGPU-capable browsers, `SurfaceDetail` asynchronously starts a real vgpu render pass that generates a **1024 × 1024 linear tissue atlas**. Its three channels encode vein irregularity, pigment mottling, and cellular roughness/micro-height. The atlas is read back once, mipmapped, and shared by all species' WebGL materials. This avoids repeatedly evaluating those noise fields per fragment. The temporary WebGPU device and resources are disposed after the bake; there is no per-frame GPU readback or additional onscreen canvas. This is procedural material data, not a flower photograph or sprite.

If WebGPU is missing, blocked, or initialization fails, the complete GLSL tissue field stays active. WebGPU preparation never suspends a flower canvas. `canvas[data-surface-detail]` reports `vgpu` or `webgl` for development inspection. Preview pointer events fall back to the renderer-owned canvas when Suspense clears the wrapper ref, preserving event cleanup during fast scrolling and route changes.

Lighting also uses vgpu: `studio-lighting.wgsl` renders a **1024 × 512 RGBA16F HDR environment** containing warm key, cool fill, and rim emitters. WebGL's [PMREMGenerator](https://threejs.org/docs/pages/PMREMGenerator.html) prefilters that radiance for the actual material roughness, lighting curved petals, leaves, and anthers with diffuse irradiance and soft reflections. Direct WebGL lights still supply moving highlights and shadows. The HDR bake is shared application-wide; the filtered environment is cached once per WebGL renderer with reference-counted cleanup. No lighting render pass or readback runs every frame. WebGL-only devices use the same analytic studio field, generated at 512 × 256. `canvas[data-lighting-backend]` identifies the source. The GPU pixel test compares the complete HDR field against the fallback and verifies that highlights exceed 1 without clipping.

### Performance

Petals are instanced per whorl; seeds, anthers and pollen are instanced. Geometry/material construction is memoized and resources are disposed on replacement. Vector, matrix and color scratch objects are reused in frame callbacks. The hero keeps high geometry quality, upgrading to **ultra** in macro mode; macro pixel density is 2–2.5 and normal views use 1.5–2. There is no automatic hero resolution downgrade. Mobile reduces particles and skips expensive postprocessing while retaining detailed specimen geometry. Garden and collection previews use separate lighter quality settings.

Each gallery uses **one WebGL context** and a separate retained scene per visited preview. Intersection visibility initializes each scene once, then pauses/resumes it. `useActiveFrame` skips offscreen bloom, wind, petal matrices and interaction updates while retaining their refs, geometries, materials, and GPU buffers. Unvisited scenes remain lazy; leaving the route releases them. The home scroll study also stays mounted after its first visit, with its render loop paused offscreen. The collection therefore uses one context after visiting the entire current catalog; the complete home page uses three (hero, angle gallery, scroll study).

The shared gallery canvas is positioned inside the document-flow grid. Scissor rectangles are computed from the canvas and preview bounds sampled together, so native scrolling moves the flower pixels and captions together. This avoids both fixed-overlay scroll drift and one-renderer-per-flower context limits. The canvas backing buffer covers the finite gallery grid; only nearby scene rectangles are drawn. The implementation follows [R3F's guidance on avoiding repeated mounts](https://r3f.docs.pmnd.rs/advanced/pitfalls).

Frame rate depends on the browser, GPU, display resolution, active effects and selected species. The development hero exposes a screen-reader-hidden `#render-stats` output with a sampled `data-fps` value for local profiling. The seven-view inspection fixture is intentionally heavier than the public specimen view.

## Validation

```bash
npm run typecheck
npm run lint
npm test
npm run check:shaders
npm run test:gpu
```

Geometry tests cover every species and every petal layer: closed topology, positive thickness, finite morph positions/normals, deterministic seeds, bloom endpoints, spring stability and characteristic organ counts. Lotus checks additionally cover sealed organ surfaces, outward normals, recessed sockets, and stable stamen variation.

The event regression exercises null refs, reconnection, and listener cleanup using the actual R3F event manager. GPU checks require a working WebGPU adapter: `npx vgpu doctor --pretty` diagnoses it. `check:shaders` validates both WGSL programs on a real device. `test:gpu` checks deterministic tissue atlas readback against a numerical reference and verifies the HDR studio field against its CPU fallback, including unclipped radiance above 1.

Optional Playwright scenarios are included for desktop and mobile regression checks:

```bash
npx playwright install chromium webkit
npm run test:browser
```

Browser scenarios also check that flower canvases and captions move by the same amount when scrolling down and back up on the collection, home hero, and home angle gallery.

Lifecycle scenarios cover rapid preview teardown, gallery/specimen navigation, and macro viewing with WebGPU unavailable. To use an installed Google Chrome for desktop tests, set `PLAYWRIGHT_CHANNEL=chrome` in your shell. The default uses Playwright's bundled Chromium; the mobile project uses WebKit.

Retention scenarios visit every implemented species, scroll back, and assert unchanged scene identities with exactly one collection canvas. Coverage and navigation derive from the catalog rather than a fixed collection size. The home test verifies that its angle scenes, scroll-study canvas, and bloom control survive scrolling away and returning.

Use `/dev/inspection/` for the visual checks that numerical tests cannot establish. Confirm silhouettes, overlap, underside attachment and macro detail, then verify pointer/touch motion and the garden on the target GPU. See the [development guide](docs/development.md) for loading, favicon, fallback, and scroll verification details.

## Toolchain compatibility

Next.js 16.3.4 and React 19.2.8 were the stable releases at implementation. Type checking uses TypeScript 7.0.2. ESLint and Next.js build tooling use Microsoft's TypeScript 6 compatibility alias because TypeScript 7.0 does not expose the older compiler API. This follows Microsoft's [side-by-side configuration](https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/#running-side-by-side-with-typescript-6.0). Three.js 0.185 is pinned to the supported peer range of the installed postprocessing version.
