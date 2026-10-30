# Pincushion Flower — Scabiosa columbaria — specimen implementation

Route: `/flower/scabiosa/`. The [research dossier](../research/scabiosa.md) preserves source provenance, reviewed anatomy, authored construction choices and evidence gaps. This page is the maintenance map for that study.

## Anatomy to preserve

Keep enlarged marginal and smaller central fused bilateral florets, four stamens per flower, calyx bristles and opposite divided foliage.

## Implementation map

- [Scabiosa.tsx](../../components/flowers/scabiosa/Scabiosa.tsx)
- [ScabiosaFoliage.tsx](../../components/flowers/scabiosa/ScabiosaFoliage.tsx)
- [scabiosaGeometry.ts](../../components/flowers/scabiosa/scabiosaGeometry.ts)
- [scabiosaLeaf.ts](../../components/flowers/scabiosa/scabiosaLeaf.ts)

The public typed dispatch is [Flower.tsx](../../components/flowers/Flower.tsx). Shared geometry and lifecycle behavior are documented in [development](../development.md) and [wind and contact](../architecture/wind-and-contact.md).

## Motion and construction constraints

Marginal florets flex independently around pinned tubes; protruding organs follow their corresponding floret.

Keep sealed positive-thickness surfaces, corresponding open/folded normals, initialized morph targets and explicit resource cleanup. Respect reduced motion and the shared quality/contact budgets when changing this specimen.

## Verification and limits

Existing species checks:

- [scabiosa-junction-checks.ts](../../tests/scabiosa-junction-checks.ts)
- [scabiosa-junction-dynamics.test.ts](../../tests/scabiosa-junction-dynamics.test.ts)
- [scabiosa-specimen.test.ts](../../tests/scabiosa-specimen.test.ts)

After geometry changes, inspect front, side, 45°, macro, bud, half bloom and full bloom using the development inspection fixture on port 1607. Run the relevant geometry and integration checks from [development](../development.md). This documentation move does not add fresh visual, GPU or performance evidence.

Counts, dimensions, pigments, timing and mechanical constants are authored unless the research dossier explicitly establishes otherwise. Reversible bloom is an inspection control; geometry tests do not establish calibrated biology, photorealism or a measured frame rate. Consult the dossier for species-specific source conflicts, unavailable evidence and unimplemented behavior.
