# Canna — Canna indica — specimen implementation

Route: `/flower/canna/`. The [research dossier](../research/canna.md) preserves source provenance, reviewed anatomy, authored construction choices and evidence gaps. This page is the maintenance map for that study.

## Anatomy to preserve

Differentiate true petals, showy staminodes, reflexed labellum, petaloid style and the single fertile half-stamen; preserve large sheathing leaves.

## Implementation map

- [Canna.tsx](../../components/flowers/canna/Canna.tsx)
- [CannaFoliage.tsx](../../components/flowers/canna/CannaFoliage.tsx)
- [cannaGeometry.ts](../../components/flowers/canna/cannaGeometry.ts)
- [cannaLeaf.ts](../../components/flowers/canna/cannaLeaf.ts)

The public typed dispatch is [Flower.tsx](../../components/flowers/Flower.tsx). Shared geometry and lifecycle behavior are documented in [development](../development.md) and [wind and contact](../architecture/wind-and-contact.md).

## Motion and construction constraints

Staminodes, substantial leaves and the heavy shoot need distinct responses; do not substitute a six-petal lily form.

Keep sealed positive-thickness surfaces, corresponding open/folded normals, initialized morph targets and explicit resource cleanup. Respect reduced motion and the shared quality/contact budgets when changing this specimen.

## Verification and limits

Existing species checks:

- [canna-specimen.test.ts](../../tests/canna-specimen.test.ts)

After geometry changes, inspect front, side, 45°, macro, bud, half bloom and full bloom using the development inspection fixture on port 1607. Run the relevant geometry and integration checks from [development](../development.md). This documentation move does not add fresh visual, GPU or performance evidence.

Counts, dimensions, pigments, timing and mechanical constants are authored unless the research dossier explicitly establishes otherwise. Reversible bloom is an inspection control; geometry tests do not establish calibrated biology, photorealism or a measured frame rate. Consult the dossier for species-specific source conflicts, unavailable evidence and unimplemented behavior.
