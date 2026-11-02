# Giant Allium — specimen implementation

Route: `/flower/allium/`. [Research and evidence gaps](../research/allium.md).

## Implementation map

- [Allium.tsx](../../components/flowers/allium/Allium.tsx) composes the spherical umbel above its naked scape.
- [alliumGeometry.ts](../../components/flowers/allium/alliumGeometry.ts) preserves 180 complete six-tepalled flowers, real pedicels, stamens/anther chambers, central organs and papery spathe remnants.
- [AlliumFoliage.tsx](../../components/flowers/allium/AlliumFoliage.tsx) and [alliumLeaf.ts](../../components/flowers/allium/alliumLeaf.ts) provide four curved basal straps with muted senescent pigment.

Twelve distributed flowers have individually simulated petals; 168 complete flowers share instanced geometry. Keep every flower and organ at constrained/overview tiers. Each tepal is a separate sealed blade, not a continuous web between six points. The dry spathe has its own tissue response rather than inheriting the living tepals’ sheen.

## Verification

[Specimen tests](../../tests/allium-specimen.test.ts), [foliage tests](../../tests/allium-leaf.test.ts), [batch dynamics](../../tests/distinct-floral-forms-dynamics.test.ts) and [tissue checks](../../tests/distinct-floral-forms-tissue.test.ts) cover generated anatomy and budgets. Inspect all seven views at both detail modes. [Batch validation](../validation/distinct-floral-forms-validation.md) separates measured costs from biological evidence. Head/stem proportions and senescent color are authored; no seasonal dieback progression is simulated.
