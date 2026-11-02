# Rosemary Grevillea — specimen implementation

Route: `/flower/grevillea/`. [Research and evidence gaps](../research/grevillea.md).

## Implementation map

- [Grevillea.tsx](../../components/flowers/grevillea/Grevillea.tsx) composes twelve paired spider-flowers and carried stalks.
- [grevilleaGeometry.ts](../../components/flowers/grevillea/grevilleaGeometry.ts) builds four curling perianth sections and four attached anthers per flower, red curved styles and lateral flattened presenters.
- [GrevilleaFoliage.tsx](../../components/flowers/grevillea/GrevilleaFoliage.tsx) and [grevilleaLeaf.ts](../../components/flowers/grevillea/grevilleaLeaf.ts) retain alternate narrow leaves with revolute margins.

Keep the distal perianth sections separated and curled below their crest at full bloom. They must not complete a cup. Cream tips are shader pigment on the original wall, not overlapping patches. Presenter orientation is lateral; the species has compact spider-flower clusters rather than a toothbrush raceme. Stalk geometry stays on the anchored carrier independently of the flower nod.

## Verification

[Specimen tests](../../tests/grevillea-specimen.test.ts) check perianth curl, original-wall count and anther attachment through both morph endpoints. [Foliage tests](../../tests/grevillea-leaf.test.ts), [batch dynamics](../../tests/distinct-floral-forms-dynamics.test.ts) and [tissue checks](../../tests/distinct-floral-forms-tissue.test.ts) cover the other subsystems. Review all seven views at specimen/overview detail; [batch validation](../validation/distinct-floral-forms-validation.md) records evidence. Counts, mechanics and pigments remain authored.
