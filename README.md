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

- `/` — cinematic specimen, fifteen-species selector, previous/next, bloom slider, replay, pause, macro camera, and scroll-driven growth. `/?flower=orchid` opens a particular species.
- `/garden` — nine flowers in an asymmetric composition. A shared bloom slider controls the garden; select a flower to inspect it.
- `/gallery` — all fifteen species, rendered through a single canvas with scissored viewports. Compare front, side, 45-degree and macro views, and control bloom across the collection.
- `/dev/inspection` — development-only seven-view geometry fixture. It returns 404 in production. Select any species to inspect full bloom, multiple angles, macro, bud and half bloom side by side.

Move the pointer or drag on the flower to sway it. Click or tap for a bloom pulse and close-up. The equivalent macro, bloom and pause actions are available through keyboard-accessible DOM controls. Escape closes the collection selector. Reduced-motion preferences disable pulses and pollen, simplify camera movement and make bloom controls immediate.

## Flower API

Use inside a React Three Fiber canvas:

```tsx
import { Flower } from "@/components/flowers/Flower";

<Flower
  type="rose"
  color="#b8435c"
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

`bloom` and `growth` are normalized to 0–1 by the UI. Bloom is clamped inside the animation hook. `growth` is optional and defaults to 1; it allows the scroll sequence to animate the rooted stem separately from the petals. `hovered`, `paused`, `reducedMotion`, `pulse`, `onHover`, and `onClick` support embedding and interaction. Increment `pulse` to trigger a secondary bloom. Color changes the main petal tissue; specialized organs such as sepals, seeds and the orchid lip retain their botanical colors.

## Architecture

```text
app/                         Next.js App Router pages and error boundaries
components/
  Experience.tsx             Specimen UI and closing/entry transitions
  Gallery.tsx                Scissored shared-canvas previews
  Garden.tsx                 Garden controls
  flowers/
    Flower.tsx               Exhaustive species dispatcher
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
tests/                       Geometry invariants and browser regression scenarios
```

### Geometry and animation

Petals have indexed front and back surfaces joined around their perimeter. Thickness is applied along their computed surface normals, including recurved tips. Open and folded positions **and normals** are generated once, with deterministic seeds. Each instanced petal receives its own morph weight, opening delay, rotation, size, twist and tone. The Tulip uses cylindrical cup sections; the general petal generator supports rounded, tapered, ruffled, notched and spotted profiles.

Species vary in whorl structure, petal count, profile, opening angle, core organs and branching. The Rose uses nested spiral whorls; Dahlia and Chrysanthemum use hundreds of different-sized florets; Sunflower uses 610 phyllotaxis seeds; Jasmine and Cherry Blossom form branch groups; Lavender uses tiered florets on multiple spikes. These are artist-directed procedural specimens, not scans of individual plants.

Stem vertices and their leaf/head attachments sample the same travelling wind bend. Secondary head movement and delayed petal flutter keep the hierarchy from moving rigidly. Pointer rays intersect a world-space plane; local proximity drives individual petal response. Camera motion is damped; flower switching closes the outgoing petals before mounting and opening the next specimen. No global state store is needed.

### Materials and lighting

Physical petal materials use seeded vertex tones, procedural veins, derivative-based micro-normal detail, roughness variation, sheen and a restrained back-scattering approximation. This is a real-time approximation of organic light transport, not volumetric subsurface scattering. A local Lightformer studio environment provides reflections without an HDR download. Desktop effects include restrained visual bloom, ambient occlusion, depth of field and a vignette.

### Performance

Petals are instanced per whorl; seeds, anthers and pollen are instanced. Geometry/material construction is memoized and resources are disposed on replacement. Vector, matrix and color scratch objects are reused in frame callbacks. Mobile uses lower geometry resolution, lower DPR, fewer particles and no expensive postprocessing. A performance monitor can reduce desktop quality. Offscreen gallery specimens are unmounted while their layout is retained.

Frame rate depends on the browser, GPU, display resolution, active effects and selected species. The development hero exposes a screen-reader-hidden `#render-stats` output with a sampled `data-fps` value for local profiling. The seven-view inspection fixture is intentionally heavier than the public specimen view.

## Validation

```bash
npm run typecheck
npm run lint
npm test
```

Geometry tests cover every species and every petal layer: closed topology, positive thickness, finite morph positions/normals, deterministic seeds, bloom endpoints, spring stability and characteristic organ counts.

Optional Playwright scenarios are included for desktop and mobile regression checks:

```bash
npx playwright install chromium webkit
npm run test:browser
```

Use `/dev/inspection` for the visual checks that numerical tests cannot establish. Confirm silhouettes, overlap, underside attachment and macro detail, then verify pointer/touch motion and the garden on the target GPU.

## Toolchain compatibility

Next.js 16.3.4 and React 19.2.8 were the stable releases at implementation. Type checking uses TypeScript 7.0.2. ESLint and Next.js build tooling use Microsoft's TypeScript 6 compatibility alias because TypeScript 7.0 does not expose the older compiler API. This follows Microsoft's [side-by-side configuration](https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/#running-side-by-side-with-typescript-6.0). Three.js 0.185 is pinned to the supported peer range of the installed postprocessing version.
