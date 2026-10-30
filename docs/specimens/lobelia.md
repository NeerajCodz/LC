# Lobelia — Lobelia erinus — specimen implementation

Route: `/flower/lobelia/`. The [research dossier](../research/lobelia.md) preserves source provenance, reviewed anatomy, authored construction choices and evidence gaps. This page is the maintenance map for that study.

## Anatomy to preserve

Keep the bilateral split-tube corolla with two upper and three lower lobes, its reproductive column and species foliage.

## Implementation map

- [Lobelia.tsx](../../components/flowers/lobelia/Lobelia.tsx)
- [LobeliaFoliage.tsx](../../components/flowers/lobelia/LobeliaFoliage.tsx)
- [lobeliaGeometry.ts](../../components/flowers/lobelia/lobeliaGeometry.ts)
- [lobeliaLeaf.ts](../../components/flowers/lobelia/lobeliaLeaf.ts)
- [lobeliaLeafAttachments.ts](../../components/flowers/lobelia/lobeliaLeafAttachments.ts)

The public typed dispatch is [Flower.tsx](../../components/flowers/Flower.tsx). Shared geometry and lifecycle behavior are documented in [development](../development.md) and [wind and contact](../architecture/wind-and-contact.md).

## Motion and construction constraints

Preserve the asymmetric macro target and flower attachments; opening must retain the split corolla instead of adding radial petal overlays.

Keep sealed positive-thickness surfaces, corresponding open/folded normals, initialized morph targets and explicit resource cleanup. Respect reduced motion and the shared quality/contact budgets when changing this specimen.

## Verification and limits

Existing species checks:

- [lobelia-leaf-attachments.test.ts](../../tests/lobelia-leaf-attachments.test.ts)
- [lobelia-leaf.test.ts](../../tests/lobelia-leaf.test.ts)
- [lobelia-specimen.test.ts](../../tests/lobelia-specimen.test.ts)

After geometry changes, inspect front, side, 45°, macro, bud, half bloom and full bloom using the development inspection fixture on port 1607. Run the relevant geometry and integration checks from [development](../development.md). This documentation move does not add fresh visual, GPU or performance evidence.

Counts, dimensions, pigments, timing and mechanical constants are authored unless the research dossier explicitly establishes otherwise. Reversible bloom is an inspection control; geometry tests do not establish calibrated biology, photorealism or a measured frame rate. Consult the dossier for species-specific source conflicts, unavailable evidence and unimplemented behavior.
