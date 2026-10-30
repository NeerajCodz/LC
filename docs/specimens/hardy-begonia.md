# Hardy Begonia — Begonia grandis — specimen implementation

Route: `/flower/hardy-begonia/`. The [research dossier](../research/hardy-begonia.md) preserves source provenance, reviewed anatomy, authored construction choices and evidence gaps. This page is the maintenance map for that study.

## Anatomy to preserve

Keep male and female floral structures distinct, including the female winged inferior ovary, and continuous asymmetric leaves.

## Implementation map

- [BegoniaFoliage.tsx](../../components/flowers/hardy-begonia/BegoniaFoliage.tsx)
- [begoniaGeometry.ts](../../components/flowers/hardy-begonia/begoniaGeometry.ts)
- [begoniaLeaf.ts](../../components/flowers/hardy-begonia/begoniaLeaf.ts)
- [HardyBegonia.tsx](../../components/flowers/hardy-begonia/HardyBegonia.tsx)

The public typed dispatch is [Flower.tsx](../../components/flowers/Flower.tsx). Shared geometry and lifecycle behavior are documented in [development](../development.md) and [wind and contact](../architecture/wind-and-contact.md).

## Motion and construction constraints

Preserve separate flower attachments and folded normals; do not turn asymmetric blades into compound foliage.

Keep sealed positive-thickness surfaces, corresponding open/folded normals, initialized morph targets and explicit resource cleanup. Respect reduced motion and the shared quality/contact budgets when changing this specimen.

## Verification and limits

Existing species checks:

Use the shared inspection and integration checks described in [development](../development.md); no slug-named test file was found.

After geometry changes, inspect front, side, 45°, macro, bud, half bloom and full bloom using the development inspection fixture on port 1607. Run the relevant geometry and integration checks from [development](../development.md). This documentation move does not add fresh visual, GPU or performance evidence.

Counts, dimensions, pigments, timing and mechanical constants are authored unless the research dossier explicitly establishes otherwise. Reversible bloom is an inspection control; geometry tests do not establish calibrated biology, photorealism or a measured frame rate. Consult the dossier for species-specific source conflicts, unavailable evidence and unimplemented behavior.
