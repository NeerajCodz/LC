# Scarlet sage — Salvia splendens — specimen implementation

Route: `/flower/salvia/`. The [research dossier](../research/salvia.md) preserves source provenance, reviewed anatomy, authored construction choices and evidence gaps. This page is the maintenance map for that study.

## Anatomy to preserve

Keep continuous bilateral tubes, separate scarlet bilabiate calyces, two functional stamens, reduced staminodes, bifid styles and opposite toothed leaves.

## Implementation map

- [Salvia.tsx](../../components/flowers/salvia/Salvia.tsx)
- [SalviaFoliage.tsx](../../components/flowers/salvia/SalviaFoliage.tsx)
- [salviaGeometry.ts](../../components/flowers/salvia/salviaGeometry.ts)
- [salviaLeaf.ts](../../components/flowers/salvia/salviaLeaf.ts)

The public typed dispatch is [Flower.tsx](../../components/flowers/Flower.tsx). Shared geometry and lifecycle behavior are documented in [development](../development.md) and [wind and contact](../architecture/wind-and-contact.md).

## Motion and construction constraints

The whole flowering axis uses one head carrier; preserve attached pedicels, persistent young buds, folded normals and the existing tube cage budgets.

Keep sealed positive-thickness surfaces, corresponding open/folded normals, initialized morph targets and explicit resource cleanup. Respect reduced motion and the shared quality/contact budgets when changing this specimen.

## Verification and limits

Existing species checks:

- [salvia-leaf.test.ts](../../tests/salvia-leaf.test.ts)
- [salvia-nicotiana-quality.test.ts](../../tests/salvia-nicotiana-quality.test.ts)
- [salvia-specimen.test.ts](../../tests/salvia-specimen.test.ts)

After geometry changes, inspect front, side, 45°, macro, bud, half bloom and full bloom using the development inspection fixture on port 1607. Run the relevant geometry and integration checks from [development](../development.md). This documentation move does not add fresh visual, GPU or performance evidence.

Counts, dimensions, pigments, timing and mechanical constants are authored unless the research dossier explicitly establishes otherwise. Reversible bloom is an inspection control; geometry tests do not establish calibrated biology, photorealism or a measured frame rate. Consult the dossier for species-specific source conflicts, unavailable evidence and unimplemented behavior.
