# Gladiolus — Gladiolus communis — specimen implementation

Route: `/flower/gladiolus/`. The [research dossier](../research/gladiolus.md) preserves source provenance, reviewed anatomy, authored construction choices and evidence gaps. This page is the maintenance map for that study.

## Anatomy to preserve

Retain the weakly two-ranked spike, bilateral six-tepal funnels, reproductive organs, protective bracts and sword-like leaves.

## Implementation map

- [Gladiolus.tsx](../../components/flowers/gladiolus/Gladiolus.tsx)
- [GladiolusFoliage.tsx](../../components/flowers/gladiolus/GladiolusFoliage.tsx)
- [gladiolusGeometry.ts](../../components/flowers/gladiolus/gladiolusGeometry.ts)
- [gladiolusLeaf.ts](../../components/flowers/gladiolus/gladiolusLeaf.ts)

The public typed dispatch is [Flower.tsx](../../components/flowers/Flower.tsx). Shared geometry and lifecycle behavior are documented in [development](../development.md) and [wind and contact](../architecture/wind-and-contact.md).

## Motion and construction constraints

Opening progresses along the spike with authored delays; individual flowers stay attached to their axis during local motion.

Keep sealed positive-thickness surfaces, corresponding open/folded normals, initialized morph targets and explicit resource cleanup. Respect reduced motion and the shared quality/contact budgets when changing this specimen.

## Verification and limits

Existing species checks:

Use the shared inspection and integration checks described in [development](../development.md); no slug-named test file was found.

After geometry changes, inspect front, side, 45°, macro, bud, half bloom and full bloom using the development inspection fixture on port 1607. Run the relevant geometry and integration checks from [development](../development.md). This documentation move does not add fresh visual, GPU or performance evidence.

Counts, dimensions, pigments, timing and mechanical constants are authored unless the research dossier explicitly establishes otherwise. Reversible bloom is an inspection control; geometry tests do not establish calibrated biology, photorealism or a measured frame rate. Consult the dossier for species-specific source conflicts, unavailable evidence and unimplemented behavior.
