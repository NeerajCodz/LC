# Hoya — Hoya carnosa (L.f.) R.Br.

Research reviewed 13 October 2026. This is an authored botanical art study;
taxonomic inventory mapping and visual resemblance do not establish validation.

## Source-backed traits

[Flora of Taiwan, second edition](https://tai2.ntu.edu.tw/species/515%20010%2001%200)
describes a climber with opposite fleshy elliptic leaves and many-flowered umbels.
Each flower has a five-lobed calyx, five ovate-triangular corolla lobes with
papillate inner surfaces, and five ridged waxy corona lobes with acute apices
spreading as a star.
Pollinia are oblong; the stigma head is flat. Its flower stalks converge into a
peduncle rather than attaching to a solid spherical receptacle.

[Flora of China, Hoya genus treatment](https://www.iplant.cn/foc/pdf/Hoya.pdf)
supports the fleshy corolla, five-part corona surrounding the gynostegium, short
connate stamens and paired pollinia. This reproductive description is explicitly
genus-level evidence. Keep the small anther membranes appressed around the stigma
head; do not substitute long free stamens or an exposed pollen bouquet.

[PlantNET, Flora of New South Wales, Hoya genus treatment](https://plantnet.rbgsyd.nsw.gov.au/cgi-bin/NSWfl.pl?lvl=gn&name=Hoya&page=nswfl)
describes valvate corolla lobes in bud and five fleshy, jug-shaped corona segments
alternating with the corolla lobes. Valvation and alternating orientation are
used here as genus-level evidence, distinct from the Taiwan species account's
acute, ridged corona description.

[Royal Botanic Gardens Victoria HortFlora](https://hortflora.rbg.vic.gov.au/taxon/ad9dbbfe-5340-11e7-b82b-005056b0018f)
records a wiry twiner, convex tight umbels, silvery-white papillose corollas and
silvery-white to red coronas. It warns about cultivation misidentification and
cites a treatment originally under Hoya motoskei; use the Taiwan account for
primary structural identity rather than assigning a named cultivar.

## Authored implementation

Select an unnamed pale pink-white, red-centered study. Use nineteen complete
flowers in a convex umbel with three smaller adjacent younger buds. Every flower
has a short continuous corolla cup joined to five complete valvate limbs, five separately sealed fleshy ridged
corona limbs, a small gynostegium, paired pollinia and five small calyx lobes.
Pedicels converge at one insertion; the umbel follows the supported shoot.
Opposite thick leaves have entire margins and subtle pinnate veins; their current
material has no distinct silver-fleck field. A fixed support and free upper shoot
use the existing anchored bend hierarchy; neither the support nor planting point moves.

Counts, spacing, model dimensions, color values, corona proportions, the
papillae approximation and all roughness/scatter/mechanics coefficients are
authored choices.
Bud sectors close with finite thickness rather than collapsed triangles. Tissue
and shadow deformation share the same contact transfer. Full garden and retained
previews remain ambient; focused/selected cages respect 2,048/512 node ceilings.

The earlier overlapping terminal sectors visibly produced raised pinwheel lips
in buds and doubled white-lobe rims at full bloom. They have been replaced by
the actual five corolla limbs: each starts in the basal cup, closes along its
neighbors in bud, and becomes the complete exposed limb at full bloom. There is
no extra distal shell over the open corolla. Finite rounded terminal edges and
taper-dependent curvature retain positive tissue volume and avoid pinched inner
skins during the linear inspection morph. The three smaller persistent buds
remain closed throughout the UI bloom control; their opening is not simulated.

The five corona limbs have narrow finite inner and outer tips, a raised median
ridge and an acute outline. They alternate with the outer corolla. The appressed
anther membranes and paired pollinia follow the same angular staggering; all
five corona limbs, five anther membranes and ten pollinia per flower remain.
The dimensions, slight finite tip rounding and opening trajectory are authored,
not measurements from the floras.

Five root-pinned flexible patches per flower use 1 by 4 desktop and 1 by 1
constrained grids, retaining exactly 1,100 / 440 simulation nodes for the whole
head. The fixed cup and lobe roots share their actual sampled insertion ring.
Explicit same-flower cohorts share row displacement while their lobes are closed,
preserving the meeting valvate seams and pinned insertion. The three persistent
young buds retain this coupling at every UI setting. Mature coupling fades with
a smooth cubic curve over actual lobe openness from zero to 0.25; independent
seam-contact correction rises by the complementary amount. External contacts stay
active throughout: the contacted node receives the full correction, while shared
row propagation fades continuously. At full release, ordinary independent tissue
motion and contact are unchanged. Cohorts, release interval, stiffness and the
shared-row mechanical approximation are authored choices, not measured Hoya
biomechanics or claims that natural buds reopen.

Actual-mesh tests cover the mature closed and persistent young apex, cup/root
intersection, one front/back shell per open limb, smooth closed-apex height
around azimuths, acute alternating corona buffers, positive volume and opposite
inner/outer triangle orientation at seven morph fractions in all five tiers.
The original three visible defects were reproduced as failing mesh regressions
against the previous geometry. Static and whole-model bounded-motion checks pass.
Actual displaced high/low tissue retains the strict cup intersection and closed
apex ray coverage under bounded wind, pulse and contact for mature and persistent
young flowers, with both simulation budgets. Fresh targeted images remain pending;
CPU mesh checks alone do not establish the final visible macro finish.

## Behavior and evidence gaps

Local pedicel nodding, slow lobe expansion and fleshy corona resistance are
growth-habit-informed interpretations, without measured elasticity or opening
kinematics. The reversible bloom UI does not simulate natural repeated reopening.
No nectar droplets, fragrance particles, pollinator actions or pollinarium removal
are inferred from these accounts. Floral-carrier motion is separate from a fixed
vine support. No tissue scans, measured spectra or species-calibrated force laws
are available. Inspect every standard angle and bud/half/full stage against the
sources, especially corona separation, genuine cavity detail and stalk junctions.

Inner-corolla papillae are approximated through the material's fine pigment and
shared tissue-detail fields, rather than individual geometric protuberances.
This is a surface microdetail limitation; the five-lobed corolla, ridged corona,
gynostegium and paired pollinia are real retained geometry.

Pinned WFO June 2026 exact-name candidate: wfo-0000725176.
