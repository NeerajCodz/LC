# Treasure flower · Gazania rigens — specimen implementation

Route: `/flower/gazania/`. The [research dossier](../research/gazania.md) preserves source provenance, reviewed anatomy, authored construction choices and evidence gaps. This page is the maintenance map for that study.

## Anatomy to preserve

Keep the ray limbs distinct from true disk florets, the involucre and species foliage; preserve authored ray basal pigment zones and relief.

## Implementation map

- [Gazania.tsx](../../components/flowers/gazania/Gazania.tsx)
- [GazaniaFoliage.tsx](../../components/flowers/gazania/GazaniaFoliage.tsx)
- [gazaniaGeometry.ts](../../components/flowers/gazania/gazaniaGeometry.ts)
- [gazaniaLeaf.ts](../../components/flowers/gazania/gazaniaLeaf.ts)

The public typed dispatch is [Flower.tsx](../../components/flowers/Flower.tsx). Shared geometry and lifecycle behavior are documented in [development](../development.md) and [wind and contact](../architecture/wind-and-contact.md).

## Motion and construction constraints

Retain anchored carriers and existing contact budgets through reversible opening; the realism refinement belongs to the research dossier.

Keep sealed positive-thickness surfaces, corresponding open/folded normals, initialized morph targets and explicit resource cleanup. Respect reduced motion and the shared quality/contact budgets when changing this specimen.

## Verification and limits

Existing species checks:

- [gazania-specimen.test.ts](../../tests/gazania-specimen.test.ts)

After geometry changes, inspect front, side, 45°, macro, bud, half bloom and full bloom using the development inspection fixture on port 1607. Run the relevant geometry and integration checks from [development](../development.md). This documentation move does not add fresh visual, GPU or performance evidence.

Counts, dimensions, pigments, timing and mechanical constants are authored unless the research dossier explicitly establishes otherwise. Reversible bloom is an inspection control; geometry tests do not establish calibrated biology, photorealism or a measured frame rate. Consult the dossier for species-specific source conflicts, unavailable evidence and unimplemented behavior.
