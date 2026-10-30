# Jasmine tobacco — Nicotiana alata — specimen implementation

Route: `/flower/nicotiana/`. The [research dossier](../research/nicotiana.md) preserves source provenance, reviewed anatomy, authored construction choices and evidence gaps. This page is the maintenance map for that study.

## Anatomy to preserve

Keep long continuous salverform tubes, five-lobed white limbs, included stamens/style, persistent calyces and pubescent foliage.

## Implementation map

- [Nicotiana.tsx](../../components/flowers/nicotiana/Nicotiana.tsx)
- [NicotianaFoliage.tsx](../../components/flowers/nicotiana/NicotianaFoliage.tsx)
- [nicotianaGeometry.ts](../../components/flowers/nicotiana/nicotianaGeometry.ts)
- [nicotianaLeaf.ts](../../components/flowers/nicotiana/nicotianaLeaf.ts)

The public typed dispatch is [Flower.tsx](../../components/flowers/Flower.tsx). Shared geometry and lifecycle behavior are documented in [development](../development.md) and [wind and contact](../architecture/wind-and-contact.md).

## Motion and construction constraints

Retain branch/flower attachments, matched morph normals and existing cage budgets; pigments, inclination and opening remain authored.

Keep sealed positive-thickness surfaces, corresponding open/folded normals, initialized morph targets and explicit resource cleanup. Respect reduced motion and the shared quality/contact budgets when changing this specimen.

## Verification and limits

Existing species checks:

- [nicotiana-leaf.test.ts](../../tests/nicotiana-leaf.test.ts)
- [nicotiana-specimen.test.ts](../../tests/nicotiana-specimen.test.ts)
- [salvia-nicotiana-quality.test.ts](../../tests/salvia-nicotiana-quality.test.ts)

After geometry changes, inspect front, side, 45°, macro, bud, half bloom and full bloom using the development inspection fixture on port 1607. Run the relevant geometry and integration checks from [development](../development.md). This documentation move does not add fresh visual, GPU or performance evidence.

Counts, dimensions, pigments, timing and mechanical constants are authored unless the research dossier explicitly establishes otherwise. Reversible bloom is an inspection control; geometry tests do not establish calibrated biology, photorealism or a measured frame rate. Consult the dossier for species-specific source conflicts, unavailable evidence and unimplemented behavior.
