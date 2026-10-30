# Scarlet sage — Salvia splendens

Evidence reviewed 29 October 2026. This specimen represents a scarlet, single-flowered form of _Salvia splendens_, not the genus as a whole or every garden cultivar.

## Realism review — 30 October 2026

A fresh comparison with [Gardens by the Bay's photographed scarlet sage](https://www.gardensbythebay.com.sg/en/learn-with-us/explore-resources/whats-blooming/scarlet-sage-salvia-splendens.html), [Native Plant Trust's flower photographs](https://gobotany.nativeplanttrust.org/species/salvia/splendens/), and [NParks' species account](https://www.nparks.gov.sg/florafaunaweb/flora/2/4/2414) identified narrow cylindrical calyces, repeated steeply ascending corollas and an exposed green terminal axis in the previous inspection boards. NParks supports densely packed whorls and persistent calyces. The flora descriptions below support bilateral mouths, three lower lip lobes and scarlet calyces; photographed horticultural forms also show substantial variation in the calyx and the inclination of mature flowers. A photograph is a shape reference, not a calibrated dimensional or reflectance measurement.

The refined twenty-flower spike retains five tiers of four and the same simulation and distant-render grids. Broader bilabiate calyx shells carry eight shallow longitudinal ridges. Mature lower flowers spread outward with small inclination differences, while younger terminal buds are more erect; a shorter axis finishes among their actual insertions. Each continuous corolla has a laterally narrow upper hood, a wider three-part lower lip, shallow mouth relief and a slight downward bow. Included organs follow that bow and pack below the closed rim. Exact widths, inclination, tier offsets, color and curvature remain authored choices. The new source evidence does not establish measured tissue constants or a universal cultivar geometry.

Focused CPU verification now includes actual calyx breadth and bilateral mouth buffers, graded flower orientation, terminal-axis attachment and ray intersections against the actual inner tube wall for mature and young reproductive meshes at bud, half and full bloom. Every quality retains sealed walls, matched finite normals, positive skin separation and nondegenerate interpolated triangles. These checks do not replace the coordinated browser view inspection.

## Botanical evidence

[Native Plant Trust, Go Botany](https://gobotany.nativeplanttrust.org/species/salvia/splendens/) supports opposite toothed leaves, bilateral fused flowers, two prominent lips, colored fused sepals, a superior ovary and reduced staminal organs. Its character ranges should not be interpreted as exact organ counts for every cultivated flower.

[Flora of Bhutan, reproduced by the Bhutan Biodiversity Portal](https://biodiversity.bt/species/show/5810), describes ovate, serrate, petiolate leaves, two to six flowers in each verticillaster, scarlet calyces and scarlet corollas. Its Salvia genus account supports the three-lobed lower lip, two functional stamens with extended connectives and sterile appendages, two reduced staminodes, and a bifid style. The implementation distinguishes those functional stamens from the smaller sterile parts.

[NSW Flora Online](https://plantnet.rbgsyd.nsw.gov.au/cgi-bin/NSWfl.pl?lvl=sp&name=Salvia~splendens&page=nswfl) supports terminal spike-like flowering groups and an eight-veined calyx resembling the corolla in color. Its displayed corolla-length entry appears inconsistent with other floras; that number was not used to establish the model's proportions.

## Construction and authored interpretation

Twenty flowers occupy five tiers of four around a single terminal axis. Those numbers, tier spacing, yaw, scale, leaf-node positions and the four young terminal buds are authored composition choices. Each insertion has a real pedicel meeting the flower's cluster origin. The entire positive flowering axis belongs to the identity head carrier, so it is transformed once; the shoot below it remains rooted through BotanicalStem's clamped bend.

Each corolla is one sealed periodic shell. Its distal circumference produces a narrow upper hood and a smaller three-part lower lip; there are no overlapping mouth overlays or separate radial petals. A second, permanently developed shell forms the bilabiate scarlet calyx. Two filaments, fertile anthers, connectives with sterile appendages, two reduced staminodes, a gynobasic style with paired stigma branches and a four-lobed ovary sit inside the tube. Their authored dimensions preserve a readable macro structure without claiming a scanned specimen or a calibrated staminal lever mechanism.

Opposite pairs of ovate, coarsely serrated leaves alternate their orientation at consecutive nodes. Finite petiole geometry meets each blade's insertion. Forty-four axial rows preserve serrations even in overview; four fine stem ridges suggest the mint-family quadrangular shoot. Blade pigmentation uses pinnate veins, a paler underside and restrained pubescence. Scarlet corolla and darker, less glossy red calyx remain distinct tissues; their pigments and shader relief are authored.

## Motion, budgets and verification

The continuous tube is the only flexible surface per flower. Its 12-by-4 desktop cage produces 1,200 whole-plant nodes; its 8-by-2 constrained cage produces 480, below the 2,048/512 ceilings. Opening interpolates explicit open and folded positions and normals. The four youngest flowers retain a narrow folded tube. Reversing the bloom slider is an inspection animation, not a claim that mature flowers biologically close and reopen.

`salvia-specimen.test.ts` checks actual sealed geometry, deterministic surfaces, wall separation, open/folded normals, exact functional organ counts, connected pedicels, bilateral hood projection and cage ceilings. `salvia-leaf.test.ts` checks actual margin teeth at every tier, opposing leaf pairs, petiole junctions and sealed foliage. Renderer resource retention, cleanup, morph initialization, reduced motion and contact raycasts are inherited from the shared assemblies. Browser angle, macro, bud and half-bloom inspection remains part of integration verification; geometry tests alone do not establish final visual quality or measured frame rate.
