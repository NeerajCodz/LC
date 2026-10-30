# Agapanthus — Agapanthus praecox — specimen implementation

Route: `/flower/agapanthus/`. The [research dossier](../research/agapanthus.md) preserves source provenance, reviewed anatomy, authored construction choices and evidence gaps. This page is the maintenance map for that study.

## Anatomy to preserve

Keep the pedicellate umbel of six-lobed blue funnels and basal strap foliage; the selected study is A. praecox.

## Implementation map

- [Agapanthus.tsx](../../components/flowers/agapanthus/Agapanthus.tsx)
- [AgapanthusFoliage.tsx](../../components/flowers/agapanthus/AgapanthusFoliage.tsx)
- [agapanthusGeometry.ts](../../components/flowers/agapanthus/agapanthusGeometry.ts)
- [agapanthusLeaf.ts](../../components/flowers/agapanthus/agapanthusLeaf.ts)

The public typed dispatch is [Flower.tsx](../../components/flowers/Flower.tsx). Shared geometry and lifecycle behavior are documented in [development](../development.md) and [wind and contact](../architecture/wind-and-contact.md).

## Motion and construction constraints

Independent nodding must preserve each pedicel's common umbel insertion.

Keep sealed positive-thickness surfaces, corresponding open/folded normals, initialized morph targets and explicit resource cleanup. Respect reduced motion and the shared quality/contact budgets when changing this specimen.

## Verification and limits

Existing species checks:

- [agapanthus-specimen.test.ts](../../tests/agapanthus-specimen.test.ts)

After geometry changes, inspect front, side, 45°, macro, bud, half bloom and full bloom using the development inspection fixture on port 1607. Run the relevant geometry and integration checks from [development](../development.md). This documentation move does not add fresh visual, GPU or performance evidence.

Counts, dimensions, pigments, timing and mechanical constants are authored unless the research dossier explicitly establishes otherwise. Reversible bloom is an inspection control; geometry tests do not establish calibrated biology, photorealism or a measured frame rate. Consult the dossier for species-specific source conflicts, unavailable evidence and unimplemented behavior.
