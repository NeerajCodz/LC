# Project LC · Living Colors — agent reference

## Project brief

Project LC's mission is to bring every single flower in the world to life as an interactive 3D specimen. Build and maintain Living Colors as a premium, calm botanical art experience in a standalone Next.js app. The current catalog is the beginning of an ongoing collection, not the project's final scope. Every flower must remain recognizably different and physically present. Rose is the quality benchmark. Prioritize convincing petal thickness, curvature, layering, botanical organs, pigments, and crisp macro detail.

Read [README.md](README.md) for the public API and architecture, [development notes](docs/development.md) for commands and verification, and [botanical references](docs/botanical-references.md) before changing a species. Check `package.json` and the lockfile for installed versions; do not assume APIs from a different release.

## Established project requirements

- Describe Project LC as an ever-growing collection with a mission to create every flower. Do not define the project by a fixed species count or imply that the current catalog completes the mission. Derive navigation bounds and test coverage from `FLOWERS` / `FLOWER_TYPES`; avoid hardcoded collection sizes in code or copy.
- Use Next.js App Router, React, TypeScript, Three.js, React Three Fiber, and drei. Do not use ChatGPT Sites or migrate this repository to a site builder.
- **Port 1607 is the permanent local port**, for development, production, browser tests, and documentation. Do not start alternate servers on 3000 or 3001 when it is occupied; inspect the existing process first.
- Use canonical `/flower/<slug>/` routes. The legacy query-string route only redirects. Keep `/`, `/gallery/`, and `/garden/` working.
- Preserve the original Lucide `Flower2` emblem beside **LC** in the header and **living colors** in the footer. `app/icon.svg` uses that same emblem. The theme control is one rounded button cycling Current, Black, and White.
- Flower specimens use actual 3D geometry. SVG is appropriate for the favicon, interface icons, and the animated loading ornament only. Do not replace specimens with SVGs, photographs, sprites, billboards, flat petals, or generic primitive placeholders.
- Keep macro views sharp. Depth-of-field and visual bloom are deliberately disabled. Improve the geometry/materials instead of hiding defects with blur or glow.
- Respect `prefers-reduced-motion`, touch input, keyboard controls, accessible labels, and responsive layout.
- Keep **AGENTS.md as the only agent instruction file**. Do not recreate `CLAUDE.md` or a duplicate guide. Preserve the managed Next.js block below; the installed generator recognizes it and does not require a companion file.

## Rendering map and invariants

- `components/flowers/Flower.tsx` dispatches the typed API to species components. `FlowerPlant`, `PetalWhorl`, `Stem`, and dedicated organ components form a reusable hierarchy; avoid a monolithic scene or one recolored mesh for every flower.
- `lib/three/geometry.ts` creates sealed petal surfaces with deterministic open/folded positions **and normals**. Reuse seeded randomness, memoized geometry/materials, instancing, and scratch objects. Do not allocate vectors, matrices, colors, or materials every frame.
- Morph-enabled leaf and calyx meshes must initialize morph targets (`mesh.updateMorphTargets()`). Preserve this when changing their creation path.
- `PreviewStage` owns one in-flow WebGL canvas per gallery and retained scene portals. Initialize a preview on its first visit, keep its geometry and animation refs when offscreen, and pause work through `RenderActivity` / `useActiveFrame`. Do not return to conditional mount/unmount on visibility or a canvas per flower.
- Sample canvas and preview bounds together for scissor rectangles. Pixels and text must move together during native scrolling. The home scroll study also stays mounted after its first visit. Retention is scoped to the mounted route, not persisted across reloads.
- All canvases use `botanicalEvents`, which safely falls back to the renderer canvas when Suspense clears an event-target ref. Preserve listener cleanup and reconnection.
- Three.js renders geometry, materials, lights, shadows, and interaction in **WebGL 2**. vgpu performs one-time **WebGPU** tissue and HDR studio bakes. Both have complete WebGL-compatible fallbacks; do not require WebGPU to view a flower or attempt to attach two context types to one canvas.
- Share the tissue atlas and raw HDR bake application-wide. Share PMREM output per renderer with reference-counted cleanup. Do not bake or read back textures every frame.
- `BloomLoader` is the shared DOM loading state. It uses CSS-animated SVG petals and rotation, pauses entirely for reduced motion, and requires no 3D engine. `SceneReady` releases specimen/garden overlays after the first drawn scene frame. Do not add artificial delays or restart loaders when retained scenes re-enter view.

## Working and validation

Inspect the current diff before editing and preserve unrelated user changes. Keep TypeScript fully typed, modules focused, and cleanup explicit. Read relevant bundled Next.js documentation before changing framework behavior.

Run type checking and lint for code changes, plus the checks appropriate to the changed system. Geometry changes require geometry tests and visual front/side/45°/macro/bud/half/full-bloom inspection of affected species. WGSL changes require device validation and GPU reference tests when a working adapter is available. Renderer, loading, scrolling, and lifecycle changes require the corresponding browser scenarios. Check a production build for routing or framework integration changes. Report unrun or unavailable checks accurately; do not claim photorealism or 60 FPS without evidence.

Make focused conventional commits (`feat:`, `fix:`, `docs:`, `test:`, etc.) for major completed changes and push them as the established user-authorized workflow. Do not add coauthor trailers. Do not amend or rewrite unrelated history. Use subagents only when the task explicitly authorizes delegation.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
