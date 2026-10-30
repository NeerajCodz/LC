# Lisianthus — Eustoma russellianum — specimen implementation

Route: `/flower/lisianthus/`. The [research dossier](../research/lisianthus.md) preserves source provenance, reviewed anatomy, authored construction choices and evidence gaps. This page is the maintenance map for that study.

## Anatomy to preserve

Keep the selected overlapping corolla form, included reproductive organs, persistent calyx and opposite glaucous leaves.

## Implementation map

- [Lisianthus.tsx](../../components/flowers/lisianthus/Lisianthus.tsx)
- [LisianthusFoliage.tsx](../../components/flowers/lisianthus/LisianthusFoliage.tsx)
- [lisianthusGeometry.ts](../../components/flowers/lisianthus/lisianthusGeometry.ts)
- [lisianthusLeaf.ts](../../components/flowers/lisianthus/lisianthusLeaf.ts)

The public typed dispatch is [Flower.tsx](../../components/flowers/Flower.tsx). Shared geometry and lifecycle behavior are documented in [development](../development.md) and [wind and contact](../architecture/wind-and-contact.md).

## Motion and construction constraints

Bloom timing, petal flex and stem response remain authored; retain each flower's real branch insertion.

Keep sealed positive-thickness surfaces, corresponding open/folded normals, initialized morph targets and explicit resource cleanup. Respect reduced motion and the shared quality/contact budgets when changing this specimen.

## Verification and limits

Existing species checks:

- [lisianthus-specimen.test.ts](../../tests/lisianthus-specimen.test.ts)

After geometry changes, inspect front, side, 45°, macro, bud, half bloom and full bloom using the development inspection fixture on port 1607. Run the relevant geometry and integration checks from [development](../development.md). This documentation move does not add fresh visual, GPU or performance evidence.

Counts, dimensions, pigments, timing and mechanical constants are authored unless the research dossier explicitly establishes otherwise. Reversible bloom is an inspection control; geometry tests do not establish calibrated biology, photorealism or a measured frame rate. Consult the dossier for species-specific source conflicts, unavailable evidence and unimplemented behavior.
