# Torenia — Torenia fournieri

Modeled taxon: _Torenia fournieri_ Linden ex E.Fourn. Research reviewed
October 13, 2026. The exact species is `wfo-0000458503` in the pinned inventory.
This is an implemented unnamed single-flowered study, without cultivar or hybrid
identification. Registration and bounded desktop and constrained visual
assessment are complete; the [validation record](cymes-and-spikes-validation.md)
records the captured-view evidence and its visibility, botanical and device limits.

## Source-backed traits

[Kew accepts the species and places it in Linderniaceae](https://powo.science.kew.org/taxon/urn%3Alsid%3Aipni.org%3Anames%3A810406-1).
[Flora of China](https://www.iplant.cn/foc/pdf/Torenia.pdf) describes erect
quadrangular shoots, opposite petiolate ovate leaves with coarse teeth,
commonly terminal racemes and individual pedicels. The calyx is an ellipsoid
fused enclosure with five substantial wings. The continuous bilateral corolla
has an erect, broad, notched upper lip and three subequal rounded lower lobes;
the middle lower lobe carries a yellow patch. Four stamens have anthers
connivent in pairs; posterior stamens are included, and this species lacks
the filament appendages present in several congeners.

[A Singapore specimen-based treatment](https://lkcnhm.nus.edu.sg/app/uploads/2018/08/2018nis063-075.pdf)
corroborates didynamous stamens, an undivided emarginate upper lip and three lower
lobes, while identifying its photographed material as a cultivar or hybrid.

[Zhou et al., Nature Communications 16, 6296 (2025)](https://www.nature.com/articles/s41467-025-61770-6)
document a bilobed touch-sensitive stigma covered by the corolla. Only the
touched lobe moves, and only its inner/adaxial face is sensitive. Closure occurs
within seconds. In development, flower-bud opening precedes separation of the
two stigma lobes. These observations support a localized stigma response, not
whole-corolla snapping or measured spring mechanics.

## Authored construction and behavior

Build a real hollow bilateral trumpet with a broad fused upper roof, three
rounded lower lobes, paired anther structures beneath the roof and a two-lamellate
stigma. Preserve the five-winged calyx as substantial connected tissue, angular
stem character, real pedicels, opposite toothed leaves and differentiated lip
pigments. Avoid a radial five-petal rosette and Snapdragon's strongly closed
lower palate. Use an asymmetric macro target.

Corolla opening, curled volumetric bud tissue and stigma maturation need distinct
states. An optional touch response may close only the inner stigma lobe that is
actually reached by the contact. Contact with outer faces, petals or empty
space must not be described as a biological trigger. An accessible pulse action
may reset illustrated closure through an explicitly authored control. Reset timing
and reopening after UI contact are artistic conventions, not demonstrated
natural recovery. The paper's reopening under a hypoosmotic solution does not
establish ordinary timed reopening after touch.

Flower and leaf counts, pigments, thickness, dimensions, onset thresholds,
response amplitudes, opening delays and all mechanical constants are authored.
Rooted stems and attachments use the shared clamped bend. Preserve matched
folded normals, positive thickness, focused contact budgets, reduced motion,
explicit cleanup and sharp macro detail.

## Evidence gaps and verification

The NParks summary mentions two stamens; that account must not override the
four-stamen flora and specimen evidence. The conspicuous wishbone shape is an
arrangement of organs, not justification for deleting the second pair.
No measured whole-flower elasticity, exact contact force, spectral pigment data
or calibrated growth trajectory has been adopted. Pollen delivery, fertilization
and senescence remain outside the study.

Check the bilateral lips, paired reproductive organs, internal stigma, winged
calyx, closed bud containment and foliage in all seven inspection views. A touch
implementation requires independent inner-face/lobe checks, paused and
reduced-motion settling, and an explicitly authored reset.

The authored model retains three flowers and two buds, four explicitly
bloom-carried filaments with paired anther chambers, superior ovaries, a
five-winged fused calyx and two thick stigma lamellae. CPU tests check real
included-organ partitions, matched folded normals, persistent-bud containment,
upper-lip notch, inner versus outer stigma triangles, independent lobe state
and rejection of an actual opaque occluder. Corolla cages use 640 desktop and
240 constrained nodes.

The implemented ToreniaStigmas renderer removes lamellae from SpecimenAssembly
and draws them once with the same corolla bloom carrier. Detailed interactive
views register an optional ray probe through the existing picking envelope;
an actual inner-face hit is followed by a rare occlusion query. Paused,
offscreen, reduced-motion and young-bud views cannot trigger it. Only the
external UI pulse serial resets closure; elapsed time never resets its target.
The damping constant and maturity threshold remain authored. Six opposite
toothed leaves are rendered. The full production browser suite passed all 218
cases (109 desktop and 109 mobile), with zero errors, skips or flaky results;
the [validation record](cymes-and-spikes-validation.md) records that acceptance
separately from the completed bounded visual assessment. Actual browser pointer
contact with an inner stigma face remains unverified. CPU inner-face and
occlusion checks establish the tested geometry and probe behavior, not that
end-to-end browser hit.
