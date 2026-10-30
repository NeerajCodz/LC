# Anemone — Anemone coronaria — specimen implementation

Route: `/flower/anemone/`. The [research dossier](../research/anemone.md) preserves source provenance, reviewed anatomy, authored construction choices and evidence gaps. This page is the maintenance map for that study.

## Anatomy to preserve

The colored display is eight petaloid sepals around a dark carpel/anther center; keep divided basal foliage and the leafy involucre.

## Implementation map

- [Anemone.tsx](../../components/flowers/anemone/Anemone.tsx)
- [AnemoneFoliage.tsx](../../components/flowers/anemone/AnemoneFoliage.tsx)
- [anemoneGeometry.ts](../../components/flowers/anemone/anemoneGeometry.ts)
- [anemoneLeaf.ts](../../components/flowers/anemone/anemoneLeaf.ts)

The public typed dispatch is [Flower.tsx](../../components/flowers/Flower.tsx). Shared geometry and lifecycle behavior are documented in [development](../development.md) and [wind and contact](../architecture/wind-and-contact.md).

## Motion and construction constraints

Cupped buds open to a shallow bowl; the anchored peduncle sways more than the receptacle.

Keep sealed positive-thickness surfaces, corresponding open/folded normals, initialized morph targets and explicit resource cleanup. Respect reduced motion and the shared quality/contact budgets when changing this specimen.

## Verification and limits

Existing species checks:

- [anemone-specimen.test.ts](../../tests/anemone-specimen.test.ts)

After geometry changes, inspect front, side, 45°, macro, bud, half bloom and full bloom using the development inspection fixture on port 1607. Run the relevant geometry and integration checks from [development](../development.md). This documentation move does not add fresh visual, GPU or performance evidence.

Counts, dimensions, pigments, timing and mechanical constants are authored unless the research dossier explicitly establishes otherwise. Reversible bloom is an inspection control; geometry tests do not establish calibrated biology, photorealism or a measured frame rate. Consult the dossier for species-specific source conflicts, unavailable evidence and unimplemented behavior.
