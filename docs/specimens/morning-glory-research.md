# Common morning glory research

Target: _Ipomoea purpurea_ (L.) Roth. Research only; this species is not yet an implemented public specimen. Sources reviewed September 13, 2026.

## Anatomy and implementation direction

[NC State](https://plants.ces.ncsu.edu/plants/ipomoea-purpurea/) describes a twining annual with a fused, flared corolla, pale throat, alternate cordate leaves and pubescent stems. Its plant and side-view photographs are useful for checking the attachment and funnel depth. Build the corolla as a continuous thick shell with a narrow tube, expanded limb and independently shaped midpetaline regions. A radial set of separate petals would misrepresent the fused flower. Represent the vine by a stem winding around support; do not reuse Passionflower's tendrils or palmate foliage.

[Flora of North America](https://efloras.org/florataxon.aspx?flora_id=1&taxon_id=210000743) provides sepal and corolla dimensions, while [Kew's compiled descriptions](https://powo.science.kew.org/taxon/urn%3Alsid%3Aipni.org%3Anames%3A30043043-2/general-information) record variation in leaf lobing, flower color and inflorescence. Review the full descriptions and select a documented form before authoring proportions; do not equate every horticultural morning glory with this species.

## Optical evidence to evaluate

Bei et al., [Light Adaptations of Ipomoea purpurea](https://doi.org/10.3390/plants14060862), _Plants_ 14(6), 862 (2025), reports surface morphology and optical observations. The [PubMed abstract](https://pubmed.ncbi.nlm.nih.gov/40265780/) is available; review full methods, specimen identity and figure scales before deriving shader parameters. The abstract's tendril terminology conflicts with the botanical description of stem twining, so it must not determine climbing anatomy without clarification. No numeric material or mechanical parameter has been imported from this paper.

Opening trajectories, elastic constants, drag, damping and tissue thickness remain uncalibrated. Investigate a continuous folded/expanded shell with matched normals, actual enclosed reproductive organs, a supported twining shoot and quality-scaled pubescence. Require geometry tests, all inspection angles/states, mobile pixel checks and normal/macro transitions before catalog registration.
