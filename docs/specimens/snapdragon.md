# Snapdragon — Antirrhinum majus — specimen implementation

Route: `/flower/snapdragon/`. The [research dossier](../research/snapdragon.md) preserves source provenance, reviewed anatomy, authored construction choices and evidence gaps. This page is the maintenance map for that study.

## Anatomy to preserve

Keep a hollow bilateral tube with vaulted upper lip and raised lower palate, included organs, persistent calyx and narrow foliage.

## Implementation map

- [Snapdragon.tsx](../../components/flowers/snapdragon/Snapdragon.tsx)
- [snapdragonGeometry.ts](../../components/flowers/snapdragon/snapdragonGeometry.ts)

The public typed dispatch is [Flower.tsx](../../components/flowers/Flower.tsx). Shared geometry and lifecycle behavior are documented in [development](../development.md) and [wind and contact](../architecture/wind-and-contact.md).

## Motion and construction constraints

Mouth depression is separate from bud opening; pointer or accessible pulse loads the lower lip and it recovers elastically.

Keep sealed positive-thickness surfaces, corresponding open/folded normals, initialized morph targets and explicit resource cleanup. Respect reduced motion and the shared quality/contact budgets when changing this specimen.

## Verification and limits

Existing species checks:

- [snapdragon-pressure.test.ts](../../tests/snapdragon-pressure.test.ts)

After geometry changes, inspect front, side, 45°, macro, bud, half bloom and full bloom using the development inspection fixture on port 1607. Run the relevant geometry and integration checks from [development](../development.md). This documentation move does not add fresh visual, GPU or performance evidence.

Counts, dimensions, pigments, timing and mechanical constants are authored unless the research dossier explicitly establishes otherwise. Reversible bloom is an inspection control; geometry tests do not establish calibrated biology, photorealism or a measured frame rate. Consult the dossier for species-specific source conflicts, unavailable evidence and unimplemented behavior.
