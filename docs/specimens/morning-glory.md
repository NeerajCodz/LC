# Common morning glory — specimen implementation

Route: `/flower/morning-glory/`. The [research dossier](../research/morning-glory.md) preserves source provenance, reviewed anatomy, authored construction choices and evidence gaps. This page is the maintenance map for that study.

## Anatomy to preserve

Preserve one periodic sealed funnel, a twisted five-region bud, included organs, cordate leaves and pubescent twining shoot; there are no tendrils.

## Implementation map

- [MorningGlory.tsx](../../components/flowers/morning-glory/MorningGlory.tsx)
- [morningGloryGeometry.ts](../../components/flowers/morning-glory/morningGloryGeometry.ts)
- [morningGloryMaterial.ts](../../components/flowers/morning-glory/morningGloryMaterial.ts)
- [MorningVine.tsx](../../components/flowers/morning-glory/MorningVine.tsx)

The public typed dispatch is [Flower.tsx](../../components/flowers/Flower.tsx). Shared geometry and lifecycle behavior are documented in [development](../development.md) and [wind and contact](../architecture/wind-and-contact.md).

## Motion and construction constraints

Only the free shoot above the fixed support bends; rim flex preserves the fused limb. Reverse UI bloom does not simulate mature senescent closure.

Keep sealed positive-thickness surfaces, corresponding open/folded normals, initialized morph targets and explicit resource cleanup. Respect reduced motion and the shared quality/contact budgets when changing this specimen.

## Verification and limits

Existing species checks:

- [morning-glory.test.ts](../../tests/morning-glory.test.ts)

After geometry changes, inspect front, side, 45°, macro, bud, half bloom and full bloom using the development inspection fixture on port 1607. Run the relevant geometry and integration checks from [development](../development.md). This documentation move does not add fresh visual, GPU or performance evidence.

Counts, dimensions, pigments, timing and mechanical constants are authored unless the research dossier explicitly establishes otherwise. Reversible bloom is an inspection control; geometry tests do not establish calibrated biology, photorealism or a measured frame rate. Consult the dossier for species-specific source conflicts, unavailable evidence and unimplemented behavior.
