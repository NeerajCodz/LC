# Eastern purple coneflower · Echinacea purpurea — specimen implementation

Route: `/flower/echinacea/`. The [research dossier](../research/echinacea.md) preserves source provenance, reviewed anatomy, authored construction choices and evidence gaps. This page is the maintenance map for that study.

## Anatomy to preserve

Keep twenty-one drooping folded rays, 112 true disk florets on a cone, taller flattened orange paleae, phyllaries and serrated leaves with three raised veins.

## Implementation map

- [Echinacea.tsx](../../components/flowers/echinacea/Echinacea.tsx)
- [EchinaceaFoliage.tsx](../../components/flowers/echinacea/EchinaceaFoliage.tsx)
- [echinaceaGeometry.ts](../../components/flowers/echinacea/echinaceaGeometry.ts)
- [echinaceaLeaf.ts](../../components/flowers/echinacea/echinaceaLeaf.ts)

The public typed dispatch is [Flower.tsx](../../components/flowers/Flower.tsx). Shared geometry and lifecycle behavior are documented in [development](../development.md) and [wind and contact](../architecture/wind-and-contact.md).

## Motion and construction constraints

Preserve the insertion-centered head carrier, anchored stem and cone-centered macro target; ray cages and the receptacle obstacle share the existing budget.

Keep sealed positive-thickness surfaces, corresponding open/folded normals, initialized morph targets and explicit resource cleanup. Respect reduced motion and the shared quality/contact budgets when changing this specimen.

## Verification and limits

Existing species checks:

- [echinacea-specimen.test.ts](../../tests/echinacea-specimen.test.ts)
- [echinacea-tissue.test.ts](../../tests/echinacea-tissue.test.ts)

After geometry changes, inspect front, side, 45°, macro, bud, half bloom and full bloom using the development inspection fixture on port 1607. Run the relevant geometry and integration checks from [development](../development.md). This documentation move does not add fresh visual, GPU or performance evidence.

Counts, dimensions, pigments, timing and mechanical constants are authored unless the research dossier explicitly establishes otherwise. Reversible bloom is an inspection control; geometry tests do not establish calibrated biology, photorealism or a measured frame rate. Consult the dossier for species-specific source conflicts, unavailable evidence and unimplemented behavior.
