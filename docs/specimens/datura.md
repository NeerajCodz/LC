# Devil’s Trumpet — specimen implementation

Route: `/flower/datura/`. [Research and evidence gaps](../research/datura.md).

## Implementation map

- [Datura.tsx](../../components/flowers/datura/Datura.tsx) registers the hollow upright trumpet and its framing.
- [daturaGeometry.ts](../../components/flowers/datura/daturaGeometry.ts) retains a continuous five-fold corolla, five-toothed calyx and included reproductive organs.
- [DaturaStem.tsx](../../components/flowers/datura/DaturaStem.tsx) and [daturaAttachments.ts](../../components/flowers/datura/daturaAttachments.ts) move branch vertices and exact leaf insertions through the same anchored growth/wind transform.
- [DaturaFoliage.tsx](../../components/flowers/datura/DaturaFoliage.tsx) and [daturaLeaf.ts](../../components/flowers/datura/daturaLeaf.ts) preserve coarse teeth, petioles and the required axial samples.

The +Y corolla’s first offset skin is physically outside. Preserve this tissue-side identification; reversed labels incorrectly put exterior pigment inside. Keep the true narrow trumpet and projecting five teeth rather than substituting a pendent bell. Branch updates reuse scratch vectors and existing geometry buffers.

The authored 0.9-radian viewing elevation exposes the lumen and included organs; side diagnostics retain their low elevation. Portrait x/z bounds are ±1.15, covering the measured foliage radius plus the 0.18 motion allowance. The framing regression ray-tests the real corolla mesh from the macro camera to each included anther and stigma, instead of only asserting a camera constant.

Filament bases are sampled from the actual inner offset skin, not placed freely in the lumen. The authored basal support sleeve keeps their displacement interpolation pinned while distal tube nodes respond. [Attachment tests](../../tests/distinct-floral-forms-attachments.test.ts) include the render-used displacement and normal field at both cage resolutions. Keep the existing strict clearance for distal filaments, anthers, style and stigma; only the basal insertion strip joins the wall.

## Verification

[Specimen tests](../../tests/datura-specimen.test.ts), [foliage tests](../../tests/datura-leaf.test.ts) and [branch attachment tests](../../tests/datura-branch-attachments.test.ts), [batch dynamics](../../tests/distinct-floral-forms-dynamics.test.ts) and [tissue checks](../../tests/distinct-floral-forms-tissue.test.ts) cover actual geometry and transformations. Review all seven views at specimen/overview detail; [batch validation](../validation/distinct-floral-forms-validation.md) records results. Preserve thickness, morph initialization, folded normals, cleanup, shared shadows and reduced-motion settlement. Reverse bloom is a display control, not biological reopening.
