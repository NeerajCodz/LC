# Nasturtium — Tropaeolum majus — specimen implementation

Route: `/flower/nasturtium/`. The [research dossier](../research/nasturtium.md) preserves source provenance, reviewed anatomy, authored construction choices and evidence gaps. This page is the maintenance map for that study.

## Anatomy to preserve

Retain the hollow calyx spur, two broad upper petals, three fringed lower petals, eight stamens and peltate leaves.

## Implementation map

- [Nasturtium.tsx](../../components/flowers/nasturtium/Nasturtium.tsx)
- [NasturtiumFoliage.tsx](../../components/flowers/nasturtium/NasturtiumFoliage.tsx)
- [nasturtiumGeometry.ts](../../components/flowers/nasturtium/nasturtiumGeometry.ts)
- [nasturtiumLeaf.ts](../../components/flowers/nasturtium/nasturtiumLeaf.ts)

The public typed dispatch is [Flower.tsx](../../components/flowers/Flower.tsx). Shared geometry and lifecycle behavior are documented in [development](../development.md) and [wind and contact](../architecture/wind-and-contact.md).

## Motion and construction constraints

Upper and lower petals flex differently while spur insertions stay fixed; the leaf petiole meets the interior of its disk.

Keep sealed positive-thickness surfaces, corresponding open/folded normals, initialized morph targets and explicit resource cleanup. Respect reduced motion and the shared quality/contact budgets when changing this specimen.

## Verification and limits

Existing species checks:

- [nasturtium-specimen.test.ts](../../tests/nasturtium-specimen.test.ts)

After geometry changes, inspect front, side, 45°, macro, bud, half bloom and full bloom using the development inspection fixture on port 1607. Run the relevant geometry and integration checks from [development](../development.md). This documentation move does not add fresh visual, GPU or performance evidence.

Counts, dimensions, pigments, timing and mechanical constants are authored unless the research dossier explicitly establishes otherwise. Reversible bloom is an inspection control; geometry tests do not establish calibrated biology, photorealism or a measured frame rate. Consult the dossier for species-specific source conflicts, unavailable evidence and unimplemented behavior.
