# Crimson Bottlebrush — Melaleuca citrina — specimen implementation

Route: `/flower/bottlebrush/`. The [research dossier](../research/bottlebrush.md) preserves source provenance, reviewed anatomy, authored construction choices and evidence gaps. This page is the maintenance map for that study.

## Anatomy to preserve

The red brush consists of stamens on true flowers around a woody shoot, with narrow alternate leaves.

## Implementation map

- [Bottlebrush.tsx](../../components/flowers/bottlebrush/Bottlebrush.tsx)
- [BottlebrushFoliage.tsx](../../components/flowers/bottlebrush/BottlebrushFoliage.tsx)
- [bottlebrushGeometry.ts](../../components/flowers/bottlebrush/bottlebrushGeometry.ts)
- [bottlebrushLeaf.ts](../../components/flowers/bottlebrush/bottlebrushLeaf.ts)

The public typed dispatch is [Flower.tsx](../../components/flowers/Flower.tsx). Shared geometry and lifecycle behavior are documented in [development](../development.md) and [wind and contact](../architecture/wind-and-contact.md).

## Motion and construction constraints

Slender filaments bend independently; protect hypanthial attachments without giving every fine anther a contact cage.

Keep sealed positive-thickness surfaces, corresponding open/folded normals, initialized morph targets and explicit resource cleanup. Respect reduced motion and the shared quality/contact budgets when changing this specimen.

## Verification and limits

Existing species checks:

- [bottlebrush-specimen.test.ts](../../tests/bottlebrush-specimen.test.ts)

After geometry changes, inspect front, side, 45°, macro, bud, half bloom and full bloom using the development inspection fixture on port 1607. Run the relevant geometry and integration checks from [development](../development.md). This documentation move does not add fresh visual, GPU or performance evidence.

Counts, dimensions, pigments, timing and mechanical constants are authored unless the research dossier explicitly establishes otherwise. Reversible bloom is an inspection control; geometry tests do not establish calibrated biology, photorealism or a measured frame rate. Consult the dossier for species-specific source conflicts, unavailable evidence and unimplemented behavior.
