# Hyacinth — Hyacinthus orientalis — specimen implementation

Route: `/flower/hyacinth/`. The [research dossier](../research/hyacinth.md) preserves source provenance, reviewed anatomy, authored construction choices and evidence gaps. This page is the maintenance map for that study.

## Anatomy to preserve

Keep continuous six-lobed flowers, included stamens, the superior ovary, spike attachments and fleshy strap foliage.

## Implementation map

- [Hyacinth.tsx](../../components/flowers/hyacinth/Hyacinth.tsx)
- [HyacinthFoliage.tsx](../../components/flowers/hyacinth/HyacinthFoliage.tsx)
- [hyacinthGeometry.ts](../../components/flowers/hyacinth/hyacinthGeometry.ts)
- [hyacinthLeaf.ts](../../components/flowers/hyacinth/hyacinthLeaf.ts)

The public typed dispatch is [Flower.tsx](../../components/flowers/Flower.tsx). Shared geometry and lifecycle behavior are documented in [development](../development.md) and [wind and contact](../architecture/wind-and-contact.md).

## Motion and construction constraints

Flowers retain independent attached motion while the spike bends; folded organs remain inside their enclosing perianths.

Keep sealed positive-thickness surfaces, corresponding open/folded normals, initialized morph targets and explicit resource cleanup. Respect reduced motion and the shared quality/contact budgets when changing this specimen.

## Verification and limits

Existing species checks:

- [hyacinth-specimen.test.ts](../../tests/hyacinth-specimen.test.ts)

After geometry changes, inspect front, side, 45°, macro, bud, half bloom and full bloom using the development inspection fixture on port 1607. Run the relevant geometry and integration checks from [development](../development.md). This documentation move does not add fresh visual, GPU or performance evidence.

Counts, dimensions, pigments, timing and mechanical constants are authored unless the research dossier explicitly establishes otherwise. Reversible bloom is an inspection control; geometry tests do not establish calibrated biology, photorealism or a measured frame rate. Consult the dossier for species-specific source conflicts, unavailable evidence and unimplemented behavior.
