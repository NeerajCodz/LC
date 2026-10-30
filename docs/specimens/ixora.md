# Ixora — Ixora coccinea — specimen implementation

Route: `/flower/ixora/`. The [research dossier](../research/ixora.md) preserves source provenance, reviewed anatomy, authored construction choices and evidence gaps. This page is the maintenance map for that study.

## Anatomy to preserve

Keep four-lobed long-tubed flowers, included style/stamens, contorted buds and opposite substantial foliage with interpetiolar stipules.

## Implementation map

- [Ixora.tsx](../../components/flowers/ixora/Ixora.tsx)
- [IxoraFoliage.tsx](../../components/flowers/ixora/IxoraFoliage.tsx)
- [ixoraGeometry.ts](../../components/flowers/ixora/ixoraGeometry.ts)
- [ixoraLeaf.ts](../../components/flowers/ixora/ixoraLeaf.ts)

The public typed dispatch is [Flower.tsx](../../components/flowers/Flower.tsx). Shared geometry and lifecycle behavior are documented in [development](../development.md) and [wind and contact](../architecture/wind-and-contact.md).

## Motion and construction constraints

Cyme attachments follow the rooted bend; closed overlapping sectors must remain distinct from Pentas's valvate bud construction.

Keep sealed positive-thickness surfaces, corresponding open/folded normals, initialized morph targets and explicit resource cleanup. Respect reduced motion and the shared quality/contact budgets when changing this specimen.

## Verification and limits

Existing species checks:

- [ixora-leaf.test.ts](../../tests/ixora-leaf.test.ts)
- [ixora-specimen.test.ts](../../tests/ixora-specimen.test.ts)

After geometry changes, inspect front, side, 45°, macro, bud, half bloom and full bloom using the development inspection fixture on port 1607. Run the relevant geometry and integration checks from [development](../development.md). This documentation move does not add fresh visual, GPU or performance evidence.

Counts, dimensions, pigments, timing and mechanical constants are authored unless the research dossier explicitly establishes otherwise. Reversible bloom is an inspection control; geometry tests do not establish calibrated biology, photorealism or a measured frame rate. Consult the dossier for species-specific source conflicts, unavailable evidence and unimplemented behavior.
