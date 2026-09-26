# Common morning glory

Modeled taxon: _Ipomoea purpurea_ (L.) Roth. Public route: `/flower/morning-glory/`. Sources reviewed September 26, 2026. This is an authored specimen of a violet form, not a scan, cultivar identification or calibrated biomechanical simulation.

## Botanical evidence

- [Flora of North America](https://www.efloras.org/florataxon.aspx?flora_id=1&taxon_id=210000743) describes a twining annual, variable cordate leaves and a funnel-shaped corolla, commonly 40–60 mm long, with a pale inner tube. Its recorded limb-width range is broad; one shape cannot represent every plant.
- [Flora of New Zealand](https://www.nzflora.info/factsheet/taxon/Ipomoea-purpurea.html) describes violet-purple flowers with darker midpetaline bands, stamens enclosed in the corolla, a longer style, and hairy stems, petioles, leaves and sepals. Its treatment supplies the main reference for this specimen's organ placement and pigmentation.
- [NC State Extension](https://plants.ces.ncsu.edu/plants/ipomoea-purpurea/) documents fused petals, alternate cordate foliage and stem twining. The model uses a single fused surface and a climbing shoot, without Passionflower tendrils.
- [The 2021 closure study](https://www.frontiersin.org/journals/plant-science/articles/10.3389/fpls.2021.697764/full) observes inward curling initiated at the midribs and subsequent folding of the corolla. Mature closure and bud opening are different processes. The reversible UI unfold is an inspection control, not simulated senescence or a claim that one mature flower repeatedly reopens.

## Geometry and materials

`morningGloryGeometry.ts` builds a periodic, sealed shell around the complete funnel. It has inner and outer surfaces joined at the narrow basal opening and the limb, with physical thickness tapered from 0.009 to 0.005 scene units. A five-region twisted bud supplies matched morph positions and normals. The mature limb radius is about 1.12 units and corolla length about 1.59; these proportions and thickness are authored within a stylized scene scale, not measured tissue data. No individual petal cards, cone primitives or photographs form the flower.

Five unequal stamens have paired anther chambers inside the throat, alongside a style with three stigma lobes and a basal ovary. Five separately sampled sepals surround the tube. The flower's limb remains continuous through every bloom state. Tiny asynchronous rim displacement responds to wind, cursor proximity and pulse without splitting its fused sectors.

`morningGloryMaterial.ts` supplies an ivory throat, violet limb, darker fivefold bands, filtered fine veins, cellular roughness and restrained sheen. Angular shader coordinates interpolate direction vectors to avoid a UV seam across the periodic surface. The existing vgpu atlas is reused when available, with a complete procedural GLSL fallback. There is no glow, depth-of-field or extra per-frame bake/readback. Optical constants and scattering are artistic approximations.

`MorningVine` winds the main shoot around a woody support, tapering into a free peduncle. Only the segment above the support boundary responds to the shared clamped wind curve. Alternate long-petioled leaves use a continuous cordate blade profile. Seeded tapered trichomes grow from actual stem, leaf and sepal geometry; the mobile setting reduces their density. Fixed support contacts do not slide in the breeze. Growth is an illustrative reveal, not a time-lapse of circumnutation.

## Verification and limits

`morning-glory.test.ts` checks closed winding, thickness, deterministic geometry, finite unit normals, nondegenerate triangles at several bloom values, corolla proportions, included reproductive organs and bounded low-quality geometry. Visual review uses front, side, 45-degree, macro, bud, half-bloom and full-bloom views. Browser checks cover real pixels, reverse/forward bloom, macro, themes and garden selection on desktop and mobile emulation.

Opening trajectories, elastic constants, aerodynamic drag, vein stiffness and tissue optics remain uncalibrated. The supported stem and soft rim response are species-informed approximations, not an exact physical reproduction. Full membrane self-contact and mature corolla senescence are not implemented.

Bei et al., [Light Adaptations of Ipomoea purpurea](https://doi.org/10.3390/plants14060862), _Plants_ 14(6), 862 (2025), remains a source to investigate further. The [abstract](https://pubmed.ncbi.nlm.nih.gov/40265780/) uses tendril terminology that conflicts with botanical descriptions of stem twining. No numeric material or mechanical parameter from that paper has been adopted; the full methods were not available during this review.
