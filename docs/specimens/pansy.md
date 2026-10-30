# Pansy — Viola tricolor — specimen implementation

Route: `/flower/pansy/`. The [research dossier](../research/pansy.md) preserves source provenance, reviewed anatomy, authored construction choices and evidence gaps. This page is the maintenance map for that study.

## Anatomy to preserve

Preserve the bilateral five-petal flower with its lower spur, differentiated petal markings, included organs and species foliage.

## Implementation map

- [Pansy.tsx](../../components/flowers/pansy/Pansy.tsx)
- [PansyFoliage.tsx](../../components/flowers/pansy/PansyFoliage.tsx)
- [pansyGeometry.ts](../../components/flowers/pansy/pansyGeometry.ts)
- [pansyLeaf.ts](../../components/flowers/pansy/pansyLeaf.ts)

The public typed dispatch is [Flower.tsx](../../components/flowers/Flower.tsx). Shared geometry and lifecycle behavior are documented in [development](../development.md) and [wind and contact](../architecture/wind-and-contact.md).

## Motion and construction constraints

Petals retain their distinct attachments and authored flex; reversible opening does not establish natural reopening or pollination mechanics.

Keep sealed positive-thickness surfaces, corresponding open/folded normals, initialized morph targets and explicit resource cleanup. Respect reduced motion and the shared quality/contact budgets when changing this specimen.

## Verification and limits

Existing species checks:

- [pansy-specimen.test.ts](../../tests/pansy-specimen.test.ts)

After geometry changes, inspect front, side, 45°, macro, bud, half bloom and full bloom using the development inspection fixture on port 1607. Run the relevant geometry and integration checks from [development](../development.md). This documentation move does not add fresh visual, GPU or performance evidence.

Counts, dimensions, pigments, timing and mechanical constants are authored unless the research dossier explicitly establishes otherwise. Reversible bloom is an inspection control; geometry tests do not establish calibrated biology, photorealism or a measured frame rate. Consult the dossier for species-specific source conflicts, unavailable evidence and unimplemented behavior.
