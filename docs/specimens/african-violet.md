# African Violet — Streptocarpus ionanthus — specimen implementation

Route: `/flower/african-violet/`. The [research dossier](../research/african-violet.md) preserves source provenance, reviewed anatomy, authored construction choices and evidence gaps. This page is the maintenance map for that study.

## Anatomy to preserve

Retain short fused bilateral corollas, two joined yellow anthers, five sepals and a thick hairy basal rosette.

## Implementation map

- [AfricanViolet.tsx](../../components/flowers/african-violet/AfricanViolet.tsx)
- [AfricanVioletFoliage.tsx](../../components/flowers/african-violet/AfricanVioletFoliage.tsx)
- [africanVioletGeometry.ts](../../components/flowers/african-violet/africanVioletGeometry.ts)
- [africanVioletLeaf.ts](../../components/flowers/african-violet/africanVioletLeaf.ts)

The public typed dispatch is [Flower.tsx](../../components/flowers/Flower.tsx). Shared geometry and lifecycle behavior are documented in [development](../development.md) and [wind and contact](../architecture/wind-and-contact.md).

## Motion and construction constraints

Flower stalks move independently; rosette response and corolla-rim flex stay restrained.

Keep sealed positive-thickness surfaces, corresponding open/folded normals, initialized morph targets and explicit resource cleanup. Respect reduced motion and the shared quality/contact budgets when changing this specimen.

## Verification and limits

Existing species checks:

- [african-violet-specimen.test.ts](../../tests/african-violet-specimen.test.ts)

After geometry changes, inspect front, side, 45°, macro, bud, half bloom and full bloom using the development inspection fixture on port 1607. Run the relevant geometry and integration checks from [development](../development.md). This documentation move does not add fresh visual, GPU or performance evidence.

Counts, dimensions, pigments, timing and mechanical constants are authored unless the research dossier explicitly establishes otherwise. Reversible bloom is an inspection control; geometry tests do not establish calibrated biology, photorealism or a measured frame rate. Consult the dossier for species-specific source conflicts, unavailable evidence and unimplemented behavior.
