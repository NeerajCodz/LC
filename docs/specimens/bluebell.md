# English Bluebell — Hyacinthoides non-scripta — specimen implementation

Route: `/flower/bluebell/`. The [research dossier](../research/bluebell.md) preserves source provenance, reviewed anatomy, authored construction choices and evidence gaps. This page is the maintenance map for that study.

## Anatomy to preserve

Preserve a one-sided raceme of continuous six-lobed bells, unequal included filaments with white anthers and basal strap leaves.

## Implementation map

- [Bluebell.tsx](../../components/flowers/bluebell/Bluebell.tsx)
- [BluebellFoliage.tsx](../../components/flowers/bluebell/BluebellFoliage.tsx)
- [bluebellGeometry.ts](../../components/flowers/bluebell/bluebellGeometry.ts)
- [bluebellLeaf.ts](../../components/flowers/bluebell/bluebellLeaf.ts)

The public typed dispatch is [Flower.tsx](../../components/flowers/Flower.tsx). Shared geometry and lifecycle behavior are documented in [development](../development.md) and [wind and contact](../architecture/wind-and-contact.md).

## Motion and construction constraints

Bells nod independently on attached pedicels; reflexed tips deform without replacing the English bluebell with an upright Spanish form.

Keep sealed positive-thickness surfaces, corresponding open/folded normals, initialized morph targets and explicit resource cleanup. Respect reduced motion and the shared quality/contact budgets when changing this specimen.

## Verification and limits

Existing species checks:

- [bluebell-specimen.test.ts](../../tests/bluebell-specimen.test.ts)

After geometry changes, inspect front, side, 45°, macro, bud, half bloom and full bloom using the development inspection fixture on port 1607. Run the relevant geometry and integration checks from [development](../development.md). This documentation move does not add fresh visual, GPU or performance evidence.

Counts, dimensions, pigments, timing and mechanical constants are authored unless the research dossier explicitly establishes otherwise. Reversible bloom is an inspection control; geometry tests do not establish calibrated biology, photorealism or a measured frame rate. Consult the dossier for species-specific source conflicts, unavailable evidence and unimplemented behavior.
