# Hardy fuchsia — specimen implementation

Route: `/flower/fuchsia/`. The [research dossier](../research/fuchsia.md) preserves source provenance, reviewed anatomy, authored construction choices and evidence gaps. This page is the maintenance map for that study.

## Anatomy to preserve

Keep the inferior ovary above a cylindrical red hypanthium, narrow spreading sepals, shorter purple petals, eight unequal stamens and four stigma lobes.

## Implementation map

- [Fuchsia.tsx](../../components/flowers/fuchsia/Fuchsia.tsx)
- [fuchsiaGeometry.ts](../../components/flowers/fuchsia/fuchsiaGeometry.ts)
- [fuchsiaMotion.ts](../../components/flowers/fuchsia/fuchsiaMotion.ts)
- [FuchsiaOrgans.tsx](../../components/flowers/fuchsia/FuchsiaOrgans.tsx)
- [FuchsiaStem.tsx](../../components/flowers/fuchsia/FuchsiaStem.tsx)

The public typed dispatch is [Flower.tsx](../../components/flowers/Flower.tsx). Shared geometry and lifecycle behavior are documented in [development](../development.md) and [wind and contact](../architecture/wind-and-contact.md).

## Motion and construction constraints

Each pendant has bounded gravity-restored angular motion; the woody branch and opposite serrate leaves share the rooted bend.

Keep sealed positive-thickness surfaces, corresponding open/folded normals, initialized morph targets and explicit resource cleanup. Respect reduced motion and the shared quality/contact budgets when changing this specimen.

## Verification and limits

Existing species checks:

- [fuchsia.test.ts](../../tests/fuchsia.test.ts)

After geometry changes, inspect front, side, 45°, macro, bud, half bloom and full bloom using the development inspection fixture on port 1607. Run the relevant geometry and integration checks from [development](../development.md). This documentation move does not add fresh visual, GPU or performance evidence.

Counts, dimensions, pigments, timing and mechanical constants are authored unless the research dossier explicitly establishes otherwise. Reversible bloom is an inspection control; geometry tests do not establish calibrated biology, photorealism or a measured frame rate. Consult the dossier for species-specific source conflicts, unavailable evidence and unimplemented behavior.
