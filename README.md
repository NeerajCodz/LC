# Living Colors

A standalone Next.js application with fifteen procedural botanical specimens. Every flower is built from curved, sealed 3D petal geometry; the collection contains no photographs, sprites, billboards, or imported flower models.

## Run locally

Requires Node.js 22.12 or newer and a browser with WebGL 2 and hardware acceleration.

```bash
npm install
npm run dev
```

Open [localhost:3000](http://localhost:3000).

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

- `/` — cinematic Rose specimen, fifteen-species selector, previous/next, bloom slider, replay, pause, macro camera, and scroll-driven growth.
- `/flower/lotus` (and all fifteen species slugs) — a dedicated specimen route with species metadata. Legacy `/?flower=lotus` links permanently redirect here. Repeated slashes are normalized by Next.js.
- `/flower/lotus/#angles` — four simultaneous live views of the selected flower: front, 45°, side, and macro, with a shared bloom control. Every specimen has this gallery section.
- `/garden` — nine flowers in an asymmetric composition. A shared bloom slider controls the garden; select a flower to inspect it.
- `/gallery` — all fifteen species, with visible previews rendered directly inside their page frames. Compare front, side, 45-degree and macro views, and control bloom across the collection.
- `/dev/inspection` — development-only seven-view geometry fixture. It returns 404 in production. Select any species to inspect full bloom, multiple angles, macro, bud and half bloom side by side.

Move the pointer or drag on the flower to sway it. Click or tap for a bloom pulse and close-up. The equivalent macro, bloom and pause actions are available through keyboard-accessible DOM controls. Escape closes the collection selector. Reduced-motion preferences disable pulses and pollen, simplify camera movement and make bloom controls immediate.

The original flower emblem sits beside **LC** in the header. One rounded toggle that cycles through **Current** (forest charcoal), **Black**, and **White** (warm ivory). Its sliding thumb and leaf/moon/sun icons show the active theme; its accessible label names the current and next theme. Themes update both the interface and the 3D background/fog. The choice persists locally and synchronizes between browser tabs; flower pigments stay consistent across themes. The footer carries the full **living colors** wordmark.

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
app/                         Next.js App Router pages and error boundaries
components/
  Experience.tsx             Specimen UI and closing/entry transitions
  Gallery.tsx                Collection layout and visible previews
  AngleGallery.tsx           Four simultaneous views of the selected species
  Garden.tsx                 Garden controls
  flowers/
    Flower.tsx               Exhaustive species dispatcher
    BotanicalView.tsx         Reusable camera, lighting, and preview content
    FlowerPreview.tsx        Inline canvas tied to each DOM preview frame
    FlowerPlant.tsx          Reusable plant hierarchy and interaction
    PetalWhorl.tsx           Instanced petals with individual transforms/morphs
    FlowerCore.tsx           Phyllotaxis seeds, florets, pods and stamens
    Stem.tsx, Branch.tsx      Tapered stem, leaves, veins and branches
    <species>/               Distinct botanical construction per species
  scene/                     Lights, studio environment, camera, pollen, effects
hooks/                       Bloom damping, pointer projection, quality, interaction
lib/
  flowers/                   Typed public API, metadata and whorl construction
  three/                     Parametric geometry, physical materials, seeded noise
  gpu/                       vgpu tissue bake, WGSL source, shared WebGL texture
tests/                       Geometry invariants and browser regression scenarios
```

### Geometry and animation

Petals have indexed front and back surfaces joined around their perimeter. Thickness is applied along their computed surface normals, including recurved tips. Open and folded positions **and normals** are generated once, with deterministic seeds. Each instanced petal receives its own morph weight, opening delay, rotation, size, twist and tone. The Tulip uses cylindrical cup sections; the general petal generator supports rounded, tapered, ruffled, notched and spotted profiles.

Species vary in whorl structure, petal count, profile, opening angle, core organs and branching. The Rose uses nested spiral whorls; Dahlia and Chrysanthemum use hundreds of different-sized florets; Sunflower uses 610 phyllotaxis seeds; Jasmine and Cherry Blossom form branch groups; Lavender uses tiered florets on multiple spikes. The Lotus has a dedicated tapered receptacle, recessed carpel sockets, 156 curved stamens, and a peltate leaf on its own petiole. Lily and Tulip have six filaments with paired anthers and separate pistils; Hibiscus has a curved column with five stigma tips. Species-specific foliage includes compound leaflets, actual toothed/lobed margins, and basal strap leaves. These are artist-directed procedural specimens, not scans of individual plants. See [botanical references and interpretation notes](docs/botanical-references.md).

Stem vertices and their leaf/head attachments sample the same travelling wind bend. Secondary head movement and delayed petal flutter keep the hierarchy from moving rigidly. Pointer rays intersect a world-space plane; local proximity drives individual petal response. Camera motion is damped; flower switching closes the outgoing petals before mounting and opening the next specimen. No global state store is needed.

### Materials and lighting

Physical petal materials use species-specific root, body, edge, and vein pigment zones in `lib/flowers/palettes.ts`. Shader uniforms are converted to linear color space by Three.js. Subtle mottling, darker inner layers, neutral vertex shading, restrained tinted sheen, and a balanced studio light preserve saturated pigments and clean ivory whites. Procedural veins, derivative-based micro-normal detail, roughness variation and restrained back scattering add surface detail. This is a real-time approximation of organic light transport, not volumetric subsurface scattering. A local Lightformer studio environment provides reflections without an HDR download. Desktop effects include ambient occlusion, multisample antialiasing, and a subtle vignette. Depth-of-field and visual bloom are disabled so zooming preserves sharp petal and pollen detail. Procedural tissue noise is filtered at a distance to reduce shimmer.

### WebGL and vgpu

All flower geometry, morphs, PBR lighting, shadows, instancing, and interaction render through Three.js / React Three Fiber in **WebGL 2**. [vgpu](https://vgpu.sh/docs/get-started/web) is a WebGPU library; its `Surface` requires a WebGPU canvas context and cannot replace an existing WebGL canvas directly.

On WebGPU-capable browsers, `SurfaceDetail` asynchronously starts a real vgpu render pass that generates a **1024 × 1024 linear tissue atlas**. Its three channels encode vein irregularity, pigment mottling, and cellular roughness/micro-height. The atlas is read back once, mipmapped, and shared by all species' WebGL materials. This avoids repeatedly evaluating those noise fields per fragment. The temporary WebGPU device and resources are disposed after the bake; there is no per-frame GPU readback or additional onscreen canvas. This is procedural material data, not a flower photograph or sprite.

If WebGPU is missing, blocked, or initialization fails, the complete GLSL tissue field stays active. WebGPU preparation never suspends a flower canvas. `canvas[data-surface-detail]` reports `vgpu` or `webgl` for development inspection. Preview pointer events fall back to the renderer-owned canvas when Suspense clears the wrapper ref, preserving event cleanup during fast scrolling and route changes.

### Performance

Petals are instanced per whorl; seeds, anthers and pollen are instanced. Geometry/material construction is memoized and resources are disposed on replacement. Vector, matrix and color scratch objects are reused in frame callbacks. The hero keeps high geometry quality, upgrading to **ultra** in macro mode; macro pixel density is 2–2.5 and normal views use 1.5–2. There is no automatic hero resolution downgrade. Mobile reduces particles and skips expensive postprocessing while retaining detailed specimen geometry. Garden and collection previews use separate lighter quality settings. Only nearby gallery previews create renderers; offscreen previews are unmounted while their layout is retained. Each canvas belongs to its caption’s page frame, so native scrolling moves the artwork and text together. Previews measure size changes without recalculating viewport offsets during scrolling. The hero renderer pauses while offscreen.

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

The event regression exercises null refs, reconnection, and listener cleanup using the actual R3F event manager. GPU checks require a working WebGPU adapter: `npx vgpu doctor --pretty` diagnoses it. `check:shaders` validates WGSL on a real device; `test:gpu` renders the production bake twice, checks determinism and RGBA readback, and compares all three channels against a numerical reference.

Optional Playwright scenarios are included for desktop and mobile regression checks:

```bash
npx playwright install chromium webkit
npm run test:browser
```

Browser scenarios also check that flower canvases and captions move by the same amount when scrolling down and back up on the collection, home hero, and home angle gallery.

Lifecycle scenarios cover rapid preview teardown, gallery/specimen navigation, and macro viewing with WebGPU unavailable. To use an installed Google Chrome for desktop tests, set `PLAYWRIGHT_CHANNEL=chrome` in your shell. The default uses Playwright's bundled Chromium; the mobile project uses WebKit.

Use `/dev/inspection` for the visual checks that numerical tests cannot establish. Confirm silhouettes, overlap, underside attachment and macro detail, then verify pointer/touch motion and the garden on the target GPU.

## Toolchain compatibility

Next.js 16.3.4 and React 19.2.8 were the stable releases at implementation. Type checking uses TypeScript 7.0.2. ESLint and Next.js build tooling use Microsoft's TypeScript 6 compatibility alias because TypeScript 7.0 does not expose the older compiler API. This follows Microsoft's [side-by-side configuration](https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/#running-side-by-side-with-typescript-6.0). Three.js 0.185 is pinned to the supported peer range of the installed postprocessing version.
