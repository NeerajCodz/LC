# Yellow Slipperwort — specimen implementation

Route: `/flower/calceolaria/`. [Research and evidence gaps](../research/calceolaria.md).

## Implementation map

- [Calceolaria.tsx](../../components/flowers/calceolaria/Calceolaria.tsx) composes four mature and two younger pouches with carried stalks.
- [calceolariaGeometry.ts](../../components/flowers/calceolaria/calceolariaGeometry.ts) defines one continuous hollow bilateral corolla per flower, four sepals, two stamens with paired thecae and a central pistil.
- [CalceolariaFoliage.tsx](../../components/flowers/calceolaria/CalceolariaFoliage.tsx) and [calceolariaLeaf.ts](../../components/flowers/calceolaria/calceolariaLeaf.ts) provide rugose opposite leaf pairs.

Preserve the inflated lower pouch, small upper hood and narrow opening. The younger/closed pose substantially reduces inflation while keeping positive thickness. Do not widen the mouth into a cup or add a spotted florist-hybrid pattern. Included organs must clear the actual low/overview inner wall throughout bloom. No species-specific oil pad is implemented or claimed.

## Verification

[Specimen tests](../../tests/calceolaria-specimen.test.ts) cover mouth/body proportion, real generated inner-wall clearance, organ count and nondegenerate bloom. [Foliage tests](../../tests/calceolaria-leaf.test.ts), [batch dynamics](../../tests/distinct-floral-forms-dynamics.test.ts) and [tissue checks](../../tests/distinct-floral-forms-tissue.test.ts) cover integration. Inspect all seven views at both detail modes. [Batch validation](../validation/distinct-floral-forms-validation.md) records checks and limitations. Model scale and mechanical/optical parameters are authored.
