# Amaryllis — Hippeastrum puniceum — specimen implementation

Route: `/flower/amaryllis/`. The [research dossier](../research/amaryllis.md) preserves source provenance, reviewed anatomy, authored construction choices and evidence gaps. This page is the maintenance map for that study.

## Anatomy to preserve

Retain six unequal tepals above a short tube, six arched stamens, a short three-lobed stigma, two shared spathes and basal strap leaves.

## Implementation map

- [Amaryllis.tsx](../../components/flowers/amaryllis/Amaryllis.tsx)
- [AmaryllisFoliage.tsx](../../components/flowers/amaryllis/AmaryllisFoliage.tsx)
- [amaryllisGeometry.ts](../../components/flowers/amaryllis/amaryllisGeometry.ts)
- [amaryllisLeaf.ts](../../components/flowers/amaryllis/amaryllisLeaf.ts)

The public typed dispatch is [Flower.tsx](../../components/flowers/Flower.tsx). Shared geometry and lifecycle behavior are documented in [development](../development.md) and [wind and contact](../architecture/wind-and-contact.md).

## Motion and construction constraints

Heavy flowers nod slowly while their rims yield; pedicels converge at one umbel insertion. Common-name Amaryllis denotes Hippeastrum here.

Keep sealed positive-thickness surfaces, corresponding open/folded normals, initialized morph targets and explicit resource cleanup. Respect reduced motion and the shared quality/contact budgets when changing this specimen.

## Verification and limits

Existing species checks:

- [amaryllis-specimen.test.ts](../../tests/amaryllis-specimen.test.ts)

After geometry changes, inspect front, side, 45°, macro, bud, half bloom and full bloom using the development inspection fixture on port 1607. Run the relevant geometry and integration checks from [development](../development.md). This documentation move does not add fresh visual, GPU or performance evidence.

Counts, dimensions, pigments, timing and mechanical constants are authored unless the research dossier explicitly establishes otherwise. Reversible bloom is an inspection control; geometry tests do not establish calibrated biology, photorealism or a measured frame rate. Consult the dossier for species-specific source conflicts, unavailable evidence and unimplemented behavior.
