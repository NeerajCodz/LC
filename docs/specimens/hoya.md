# Hoya — Hoya carnosa (L.f.) R.Br. — specimen implementation

Route: `/flower/hoya/`. The [research dossier](../research/hoya.md) preserves source provenance, reviewed anatomy, authored construction choices and evidence gaps. This page is the maintenance map for that study.

## Anatomy to preserve

Preserve the pendant umbel, thick five-lobed corollas and distinct raised coronas with enclosed reproductive structures; leaves are fleshy and opposite.

## Implementation map

- [Hoya.tsx](../../components/flowers/hoya/Hoya.tsx)
- [HoyaFoliage.tsx](../../components/flowers/hoya/HoyaFoliage.tsx)
- [hoyaGeometry.ts](../../components/flowers/hoya/hoyaGeometry.ts)
- [hoyaLeaf.ts](../../components/flowers/hoya/hoyaLeaf.ts)

The public typed dispatch is [Flower.tsx](../../components/flowers/Flower.tsx). Shared geometry and lifecycle behavior are documented in [development](../development.md) and [wind and contact](../architecture/wind-and-contact.md).

## Motion and construction constraints

Umbel and flower motion must retain their pedicel attachments; stiff waxy tissue should not behave like papery petals.

Keep sealed positive-thickness surfaces, corresponding open/folded normals, initialized morph targets and explicit resource cleanup. Respect reduced motion and the shared quality/contact budgets when changing this specimen.

## Verification and limits

Existing species checks:

- [hoya-ambient-batch.test.ts](../../tests/hoya-ambient-batch.test.ts)
- [hoya-cage-attachment.test.ts](../../tests/hoya-cage-attachment.test.ts)
- [hoya-specimen.test.ts](../../tests/hoya-specimen.test.ts)
- [hoya-valvate-finish.test.ts](../../tests/hoya-valvate-finish.test.ts)

After geometry changes, inspect front, side, 45°, macro, bud, half bloom and full bloom using the development inspection fixture on port 1607. Run the relevant geometry and integration checks from [development](../development.md). This documentation move does not add fresh visual, GPU or performance evidence.

Counts, dimensions, pigments, timing and mechanical constants are authored unless the research dossier explicitly establishes otherwise. Reversible bloom is an inspection control; geometry tests do not establish calibrated biology, photorealism or a measured frame rate. Consult the dossier for species-specific source conflicts, unavailable evidence and unimplemented behavior.
