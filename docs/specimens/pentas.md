# Pentas — Pentas lanceolata — specimen implementation

Route: `/flower/pentas/`. The [research dossier](../research/pentas.md) preserves source provenance, reviewed anatomy, authored construction choices and evidence gaps. This page is the maintenance map for that study.

## Anatomy to preserve

Keep five-lobed star limbs on long tubes, bearded throats, five stamens, bifid styles, unequal calyces and hairy opposite foliage.

## Implementation map

- [Pentas.tsx](../../components/flowers/pentas/Pentas.tsx)
- [PentasFoliage.tsx](../../components/flowers/pentas/PentasFoliage.tsx)
- [pentasGeometry.ts](../../components/flowers/pentas/pentasGeometry.ts)
- [pentasLeaf.ts](../../components/flowers/pentas/pentasLeaf.ts)
- [pentasPubescence.ts](../../components/flowers/pentas/pentasPubescence.ts)

The public typed dispatch is [Flower.tsx](../../components/flowers/Flower.tsx). Shared geometry and lifecycle behavior are documented in [development](../development.md) and [wind and contact](../architecture/wind-and-contact.md).

## Motion and construction constraints

Closed sectors meet edge-to-edge in a valvate bud; subordinate cyme motion stays rooted and must not become Ixora's contorted overlap.

Keep sealed positive-thickness surfaces, corresponding open/folded normals, initialized morph targets and explicit resource cleanup. Respect reduced motion and the shared quality/contact budgets when changing this specimen.

## Verification and limits

Existing species checks:

- [pentas-leaf.test.ts](../../tests/pentas-leaf.test.ts)
- [pentas-specimen.test.ts](../../tests/pentas-specimen.test.ts)

After geometry changes, inspect front, side, 45°, macro, bud, half bloom and full bloom using the development inspection fixture on port 1607. Run the relevant geometry and integration checks from [development](../development.md). This documentation move does not add fresh visual, GPU or performance evidence.

Counts, dimensions, pigments, timing and mechanical constants are authored unless the research dossier explicitly establishes otherwise. Reversible bloom is an inspection control; geometry tests do not establish calibrated biology, photorealism or a measured frame rate. Consult the dossier for species-specific source conflicts, unavailable evidence and unimplemented behavior.
