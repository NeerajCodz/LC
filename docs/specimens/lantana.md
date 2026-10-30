# Lantana — Lantana camara — specimen implementation

Route: `/flower/lantana/`. The [research dossier](../research/lantana.md) preserves source provenance, reviewed anatomy, authored construction choices and evidence gaps. This page is the maintenance map for that study.

## Anatomy to preserve

Keep clustered small fused bilateral flowers, persistent calyces, woody branched supports and opposite rough toothed leaves.

## Implementation map

- [Lantana.tsx](../../components/flowers/lantana/Lantana.tsx)
- [LantanaFoliage.tsx](../../components/flowers/lantana/LantanaFoliage.tsx)
- [lantanaGeometry.ts](../../components/flowers/lantana/lantanaGeometry.ts)
- [lantanaLeaf.ts](../../components/flowers/lantana/lantanaLeaf.ts)
- [LantanaStem.tsx](../../components/flowers/lantana/LantanaStem.tsx)

The public typed dispatch is [Flower.tsx](../../components/flowers/Flower.tsx). Shared geometry and lifecycle behavior are documented in [development](../development.md) and [wind and contact](../architecture/wind-and-contact.md).

## Motion and construction constraints

Preserve each cluster's real branch junction and local carrier; age-dependent flower color and mechanical response remain authored.

Keep sealed positive-thickness surfaces, corresponding open/folded normals, initialized morph targets and explicit resource cleanup. Respect reduced motion and the shared quality/contact budgets when changing this specimen.

## Verification and limits

Existing species checks:

- [lantana-leaf.test.ts](../../tests/lantana-leaf.test.ts)
- [lantana-specimen.test.ts](../../tests/lantana-specimen.test.ts)

After geometry changes, inspect front, side, 45°, macro, bud, half bloom and full bloom using the development inspection fixture on port 1607. Run the relevant geometry and integration checks from [development](../development.md). This documentation move does not add fresh visual, GPU or performance evidence.

Counts, dimensions, pigments, timing and mechanical constants are authored unless the research dossier explicitly establishes otherwise. Reversible bloom is an inspection control; geometry tests do not establish calibrated biology, photorealism or a measured frame rate. Consult the dossier for species-specific source conflicts, unavailable evidence and unimplemented behavior.
