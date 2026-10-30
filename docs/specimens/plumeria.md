# Plumeria — Plumeria rubra — specimen implementation

Route: `/flower/plumeria/`. The [research dossier](../research/plumeria.md) preserves source provenance, reviewed anatomy, authored construction choices and evidence gaps. This page is the maintenance map for that study.

## Anatomy to preserve

Retain a fused tube with five overlapping waxy lobes, a contorted bud, concealed organs and a succulent woody flowering shoot.

## Implementation map

- [Plumeria.tsx](../../components/flowers/plumeria/Plumeria.tsx)
- [plumeriaGeometry.ts](../../components/flowers/plumeria/plumeriaGeometry.ts)

The public typed dispatch is [Flower.tsx](../../components/flowers/Flower.tsx). Shared geometry and lifecycle behavior are documented in [development](../development.md) and [wind and contact](../architecture/wind-and-contact.md).

## Motion and construction constraints

Thicker limbs and short pedicels respond more slowly than papery bracts; preserve authored curvature compliance and independent leaf movement.

Keep sealed positive-thickness surfaces, corresponding open/folded normals, initialized morph targets and explicit resource cleanup. Respect reduced motion and the shared quality/contact budgets when changing this specimen.

## Verification and limits

Existing species checks:

Use the shared inspection and integration checks described in [development](../development.md); no slug-named test file was found.

After geometry changes, inspect front, side, 45°, macro, bud, half bloom and full bloom using the development inspection fixture on port 1607. Run the relevant geometry and integration checks from [development](../development.md). This documentation move does not add fresh visual, GPU or performance evidence.

Counts, dimensions, pigments, timing and mechanical constants are authored unless the research dossier explicitly establishes otherwise. Reversible bloom is an inspection control; geometry tests do not establish calibrated biology, photorealism or a measured frame rate. Consult the dossier for species-specific source conflicts, unavailable evidence and unimplemented behavior.
