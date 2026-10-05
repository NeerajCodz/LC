# Five realistic specimens — implementation record

Approved October 4, 2026. Extend Living Colors with Carnation, Plumeria,
Foxglove, Sweet Pea and Bougainvillea. Desktop macro detail has priority;
mobile retains the same anatomy with smaller rendering and simulation budgets.

## Delivery slices

1. Source-linked botanical research.
2. Constrained surface dynamics.
3. Thickness-aware vertex/triangle and edge contacts.
4. WebGL cage deformation, normals and matching shadows.
5. Focused simulation inputs and lifecycle.
6–15. Geometry/organs, then materials/foliage/motion/catalog for each species.
16. Gallery/garden integration and framing.
17. Browser and lifecycle verification.
18. Generated inventory and final validation documentation.

Commit completed slices throughout development using the repository's
lowercase conventional subjects, authored and committed by
Neeraj Sathish Kumar <neerajcodz@gmail.com>, without coauthor trailers.

## Constraints and acceptance

Use sealed procedural surfaces, deterministic seeds, initialized morph targets,
matching folded normals and explicit resource cleanup. Reuse FlowerPlant and
its dedicated organ/stem slots. Preserve retained previews, SafeCanvas, optional
GPU bakes, sharp macro views, accessible controls and port 1607.

Detailed XPBD contact is confined to the focused viewer and selected garden
specimen. Ambient previews and the whole garden retain inexpensive dynamics.
The node ceilings are 2,048 desktop and 512 constrained; fixed substeps are
1/120 and 1/60 second respectively. Pause/offscreen work freezes; reduced motion
settles the geometry without continuous movement. Add optional
FlowerProps.physics = "ambient" | "detailed", default "ambient".

Verify topology, thickness, folded normals, intermediate blooms, attachment
constraints, contact, recovery, frame-rate independence and lifecycle. Review
front, side, 45°, macro, bud, half and full bloom for each specimen. Run typecheck,
lint, unit/taxonomy tests, inventory audit, production build and desktop/mobile
browser scenarios. Record measured results and unavailable hardware checks.
