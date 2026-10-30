# Chinese Wisteria — Wisteria sinensis — specimen implementation

Route: `/flower/wisteria/`. The [research dossier](../research/wisteria.md) preserves source provenance, reviewed anatomy, authored construction choices and evidence gaps. This page is the maintenance map for that study.

## Anatomy to preserve

Retain banner, wings and keel on hanging pea flowers, enclosed stamens/style and eleven-leaflet compound foliage on a twining woody shoot.

## Implementation map

- [Wisteria.tsx](../../components/flowers/wisteria/Wisteria.tsx)
- [WisteriaFoliage.tsx](../../components/flowers/wisteria/WisteriaFoliage.tsx)
- [wisteriaGeometry.ts](../../components/flowers/wisteria/wisteriaGeometry.ts)
- [wisteriaLeaf.ts](../../components/flowers/wisteria/wisteriaLeaf.ts)

The public typed dispatch is [Flower.tsx](../../components/flowers/Flower.tsx). Shared geometry and lifecycle behavior are documented in [development](../development.md) and [wind and contact](../architecture/wind-and-contact.md).

## Motion and construction constraints

Keep the support fixed, pendant flowers independent and wing/keel depression coupled; no tendrils or dynamic support acquisition.

Keep sealed positive-thickness surfaces, corresponding open/folded normals, initialized morph targets and explicit resource cleanup. Respect reduced motion and the shared quality/contact budgets when changing this specimen.

## Verification and limits

Existing species checks:

- [wisteria-specimen.test.ts](../../tests/wisteria-specimen.test.ts)

After geometry changes, inspect front, side, 45°, macro, bud, half bloom and full bloom using the development inspection fixture on port 1607. Run the relevant geometry and integration checks from [development](../development.md). This documentation move does not add fresh visual, GPU or performance evidence.

Counts, dimensions, pigments, timing and mechanical constants are authored unless the research dossier explicitly establishes otherwise. Reversible bloom is an inspection control; geometry tests do not establish calibrated biology, photorealism or a measured frame rate. Consult the dossier for species-specific source conflicts, unavailable evidence and unimplemented behavior.
