# Torenia — Torenia fournieri — specimen implementation

Route: `/flower/torenia/`. The [research dossier](../research/torenia.md) preserves source provenance, reviewed anatomy, authored construction choices and evidence gaps. This page is the maintenance map for that study.

## Anatomy to preserve

Keep one hollow bilateral corolla, broad notched upper roof, three lower lobes, paired anthers, a five-winged calyx and two stigma lamellae.

## Implementation map

- [Torenia.tsx](../../components/flowers/torenia/Torenia.tsx)
- [ToreniaFoliage.tsx](../../components/flowers/torenia/ToreniaFoliage.tsx)
- [toreniaGeometry.ts](../../components/flowers/torenia/toreniaGeometry.ts)
- [toreniaLeaf.ts](../../components/flowers/torenia/toreniaLeaf.ts)
- [toreniaStigmaGeometry.ts](../../components/flowers/torenia/toreniaStigmaGeometry.ts)
- [toreniaStigmaProbe.ts](../../components/flowers/torenia/toreniaStigmaProbe.ts)
- [ToreniaStigmas.tsx](../../components/flowers/torenia/ToreniaStigmas.tsx)
- [toreniaStigmaState.ts](../../components/flowers/torenia/toreniaStigmaState.ts)

The public typed dispatch is [Flower.tsx](../../components/flowers/Flower.tsx). Shared geometry and lifecycle behavior are documented in [development](../development.md) and [wind and contact](../architecture/wind-and-contact.md).

## Motion and construction constraints

Preserve asymmetric macro framing and independent touch-sensitive stigma state; avoid duplicate lip overlays and keep organs within closed buds.

Keep sealed positive-thickness surfaces, corresponding open/folded normals, initialized morph targets and explicit resource cleanup. Respect reduced motion and the shared quality/contact budgets when changing this specimen.

## Verification and limits

Existing species checks:

- [torenia-calyx-containment.test.ts](../../tests/torenia-calyx-containment.test.ts)
- [torenia-explicit-reset.test.ts](../../tests/torenia-explicit-reset.test.ts)
- [torenia-leaf.test.ts](../../tests/torenia-leaf.test.ts)
- [torenia-realism.test.ts](../../tests/torenia-realism.test.ts)
- [torenia-specimen.test.ts](../../tests/torenia-specimen.test.ts)
- [torenia-stigma-access.test.ts](../../tests/torenia-stigma-access.test.ts)
- [torenia-stigma-deformation.test.ts](../../tests/torenia-stigma-deformation.test.ts)
- [torenia-stigma-hit.test.ts](../../tests/torenia-stigma-hit.test.ts)
- [torenia-stigma-normals.test.ts](../../tests/torenia-stigma-normals.test.ts)
- [torenia-stigma-probe.test.ts](../../tests/torenia-stigma-probe.test.ts)
- [torenia-stigma-state.test.ts](../../tests/torenia-stigma-state.test.ts)

After geometry changes, inspect front, side, 45°, macro, bud, half bloom and full bloom using the development inspection fixture on port 1607. Run the relevant geometry and integration checks from [development](../development.md). This documentation move does not add fresh visual, GPU or performance evidence.

Counts, dimensions, pigments, timing and mechanical constants are authored unless the research dossier explicitly establishes otherwise. Reversible bloom is an inspection control; geometry tests do not establish calibrated biology, photorealism or a measured frame rate. Consult the dossier for species-specific source conflicts, unavailable evidence and unimplemented behavior.
