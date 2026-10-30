# Camellia — Camellia japonica — specimen implementation

Route: `/flower/camellia/`. The [research dossier](../research/camellia.md) preserves source provenance, reviewed anatomy, authored construction choices and evidence gaps. This page is the maintenance map for that study.

## Anatomy to preserve

Retain the selected single seven-petal flower, protective overlapping organs, basal filament collar, three style tips and leathery serrulate foliage.

## Implementation map

- [Camellia.tsx](../../components/flowers/camellia/Camellia.tsx)
- [CamelliaFoliage.tsx](../../components/flowers/camellia/CamelliaFoliage.tsx)
- [camelliaGeometry.ts](../../components/flowers/camellia/camelliaGeometry.ts)
- [camelliaLeaf.ts](../../components/flowers/camellia/camelliaLeaf.ts)

The public typed dispatch is [Flower.tsx](../../components/flowers/Flower.tsx). Shared geometry and lifecycle behavior are documented in [development](../development.md) and [wind and contact](../architecture/wind-and-contact.md).

## Motion and construction constraints

Opening preserves fused insertions while distal petals yield; the side bud stays attached to the woody shoot.

Keep sealed positive-thickness surfaces, corresponding open/folded normals, initialized morph targets and explicit resource cleanup. Respect reduced motion and the shared quality/contact budgets when changing this specimen.

## Verification and limits

Existing species checks:

- [camellia-specimen.test.ts](../../tests/camellia-specimen.test.ts)

After geometry changes, inspect front, side, 45°, macro, bud, half bloom and full bloom using the development inspection fixture on port 1607. Run the relevant geometry and integration checks from [development](../development.md). This documentation move does not add fresh visual, GPU or performance evidence.

Counts, dimensions, pigments, timing and mechanical constants are authored unless the research dossier explicitly establishes otherwise. Reversible bloom is an inspection control; geometry tests do not establish calibrated biology, photorealism or a measured frame rate. Consult the dossier for species-specific source conflicts, unavailable evidence and unimplemented behavior.
