# Cosmos — Cosmos bipinnatus — specimen implementation

Route: `/flower/cosmos/`. The [research dossier](../research/cosmos.md) preserves source provenance, reviewed anatomy, authored construction choices and evidence gaps. This page is the maintenance map for that study.

## Anatomy to preserve

Retain eight neuter rays, real bisexual disk florets, two involucral ranks and opposite bipinnately divided foliage.

## Implementation map

- [Cosmos.tsx](../../components/flowers/cosmos/Cosmos.tsx)
- [CosmosFoliage.tsx](../../components/flowers/cosmos/CosmosFoliage.tsx)
- [cosmosGeometry.ts](../../components/flowers/cosmos/cosmosGeometry.ts)
- [cosmosLeaf.ts](../../components/flowers/cosmos/cosmosLeaf.ts)

The public typed dispatch is [Flower.tsx](../../components/flowers/Flower.tsx). Shared geometry and lifecycle behavior are documented in [development](../development.md) and [wind and contact](../architecture/wind-and-contact.md).

## Motion and construction constraints

Rays flutter on the anchored swaying head; central florets follow their carrier without independent full cages.

Keep sealed positive-thickness surfaces, corresponding open/folded normals, initialized morph targets and explicit resource cleanup. Respect reduced motion and the shared quality/contact budgets when changing this specimen.

## Verification and limits

Existing species checks:

- [cosmos-specimen.test.ts](../../tests/cosmos-specimen.test.ts)

After geometry changes, inspect front, side, 45°, macro, bud, half bloom and full bloom using the development inspection fixture on port 1607. Run the relevant geometry and integration checks from [development](../development.md). This documentation move does not add fresh visual, GPU or performance evidence.

Counts, dimensions, pigments, timing and mechanical constants are authored unless the research dossier explicitly establishes otherwise. Reversible bloom is an inspection control; geometry tests do not establish calibrated biology, photorealism or a measured frame rate. Consult the dossier for species-specific source conflicts, unavailable evidence and unimplemented behavior.
