# Great White Trillium — specimen implementation

Route: `/flower/trillium/`. [Research and evidence gaps](../research/trillium.md).

## Implementation map

- [Trillium.tsx](../../components/flowers/trillium/Trillium.tsx) frames the elevated three-petalled face and supplies dedicated foliage.
- [trilliumGeometry.ts](../../components/flowers/trillium/trilliumGeometry.ts) builds three separate petals, alternating sepals, six stamens, angular ovary and three stigma branches.
- [TrilliumFoliage.tsx](../../components/flowers/trillium/TrilliumFoliage.tsx) and [trilliumLeaf.ts](../../components/flowers/trillium/trilliumLeaf.ts) place three sessile, veined bracts at one insertion above a bare scape.

Keep the finite blunt petal apex wider than its contact clearance. Collapsing its nonadjacent cage nodes produced false self-contact and failed recovery. The whole-model dynamics regression covers release, fixed insertions, pause, reduced motion, extreme inputs and reverse bloom at both budgets. Do not loosen that test to accommodate a collapsed tip.

The specimen uses `FlowerPlant` and `SpecimenAssembly`; shared tissue, corresponding folded normals, shadow deformation, disposal and retained detailed physics apply. See [wind/contact](../architecture/wind-and-contact.md).

## Verification

[Specimen tests](../../tests/trillium-specimen.test.ts), [foliage tests](../../tests/trillium-leaf.test.ts), [batch dynamics](../../tests/distinct-floral-forms-dynamics.test.ts) and [tissue checks](../../tests/distinct-floral-forms-tissue.test.ts) cover generated anatomy. Inspect front, side, 45°, macro, bud, half and full bloom at specimen/overview tiers on port 1607. Consult [batch validation](../validation/distinct-floral-forms-validation.md) for execution evidence. Mechanics and optical constants are authored, not calibrated.
