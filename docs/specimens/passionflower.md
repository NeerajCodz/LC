# Blue passionflower — specimen implementation

Route: `/flower/passionflower/`. The [research dossier](../research/passionflower.md) preserves source provenance, reviewed anatomy, authored construction choices and evidence gaps. This page is the maintenance map for that study.

## Anatomy to preserve

Retain five sepals and five petals, dorsal sepal awns, four corona series, raised reproductive axis and continuous five-lobed leaves on a supported vine.

## Implementation map

- [PassionCorolla.tsx](../../components/flowers/passionflower/PassionCorolla.tsx)
- [Passionflower.tsx](../../components/flowers/passionflower/Passionflower.tsx)
- [passionflowerGeometry.ts](../../components/flowers/passionflower/passionflowerGeometry.ts)
- [passionflowerMaterial.ts](../../components/flowers/passionflower/passionflowerMaterial.ts)
- [PassionHeart.tsx](../../components/flowers/passionflower/PassionHeart.tsx)
- [PassionVine.tsx](../../components/flowers/passionflower/PassionVine.tsx)

The public typed dispatch is [Flower.tsx](../../components/flowers/Flower.tsx). Shared geometry and lifecycle behavior are documented in [development](../development.md) and [wind and contact](../architecture/wind-and-contact.md).

## Motion and construction constraints

The support stays fixed; only the free shoot bends. Independently delayed organs and corona roots must fit inside the enclosing bud.

Keep sealed positive-thickness surfaces, corresponding open/folded normals, initialized morph targets and explicit resource cleanup. Respect reduced motion and the shared quality/contact budgets when changing this specimen.

## Verification and limits

Existing species checks:

- [passionflower.test.ts](../../tests/passionflower.test.ts)

After geometry changes, inspect front, side, 45°, macro, bud, half bloom and full bloom using the development inspection fixture on port 1607. Run the relevant geometry and integration checks from [development](../development.md). This documentation move does not add fresh visual, GPU or performance evidence.

Counts, dimensions, pigments, timing and mechanical constants are authored unless the research dossier explicitly establishes otherwise. Reversible bloom is an inspection control; geometry tests do not establish calibrated biology, photorealism or a measured frame rate. Consult the dossier for species-specific source conflicts, unavailable evidence and unimplemented behavior.
