# Magnolia — Magnolia grandiflora — specimen implementation

Route: `/flower/magnolia/`. The [research dossier](../research/magnolia.md) preserves source provenance, reviewed anatomy, authored construction choices and evidence gaps. This page is the maintenance map for that study.

## Anatomy to preserve

Keep nine substantial tepals, the elongated receptacle, real instanced stamens/carpels and glossy leaves with rusty undersides.

## Implementation map

- [Magnolia.tsx](../../components/flowers/magnolia/Magnolia.tsx)
- [MagnoliaFoliage.tsx](../../components/flowers/magnolia/MagnoliaFoliage.tsx)
- [magnoliaGeometry.ts](../../components/flowers/magnolia/magnoliaGeometry.ts)
- [magnoliaLeaf.ts](../../components/flowers/magnolia/magnoliaLeaf.ts)

The public typed dispatch is [Flower.tsx](../../components/flowers/Flower.tsx). Shared geometry and lifecycle behavior are documented in [development](../development.md) and [wind and contact](../architecture/wind-and-contact.md).

## Motion and construction constraints

Massive tepals open slowly and resist high-frequency flutter; woody attachments remain anchored.

Keep sealed positive-thickness surfaces, corresponding open/folded normals, initialized morph targets and explicit resource cleanup. Respect reduced motion and the shared quality/contact budgets when changing this specimen.

## Verification and limits

Existing species checks:

- [magnolia-specimen.test.ts](../../tests/magnolia-specimen.test.ts)

After geometry changes, inspect front, side, 45°, macro, bud, half bloom and full bloom using the development inspection fixture on port 1607. Run the relevant geometry and integration checks from [development](../development.md). This documentation move does not add fresh visual, GPU or performance evidence.

Counts, dimensions, pigments, timing and mechanical constants are authored unless the research dossier explicitly establishes otherwise. Reversible bloom is an inspection control; geometry tests do not establish calibrated biology, photorealism or a measured frame rate. Consult the dossier for species-specific source conflicts, unavailable evidence and unimplemented behavior.
