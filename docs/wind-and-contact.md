# Wind, contact, and mobile rendering

Project LC models a gentle breeze with a fixed planting point. The stem bends above the ground; the whole plant no longer rotates around its flower head. This is an artistic mechanical approximation, not a simulation of storms or uprooting.

## Botanical basis

Reviewed September 10, 2026. [de Langre, Effects of Wind on Plants](https://doi.org/10.1146/annurev.fluid.40.111406.102135) discusses plant motion, aerodynamic reconfiguration, and coupling between wind and flexible vegetation. The [NC State sources for every current specimen](botanical-references.md) inform the response classes below. Numeric spring parameters are authored, not measured species-specific elastic constants.

| Flower         | Habit or structural cue used for motion                                                                                                                                           |
| -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Rose           | Woody stems resist bending; softer petals move independently.                                                                                                                     |
| Lotus          | Rhizomes anchor in mud; flower stalks and leaf petioles bend separately. [NC State](https://plants.ces.ncsu.edu/plants/nelumbo-nucifera/) recommends shelter from wind and waves. |
| Marigold       | Heavy heads load herbaceous stems; tall forms can need support.                                                                                                                   |
| Sunflower      | Coarse stems carry broad leaves and a large head; taller cultivars need wind protection.                                                                                          |
| Tulip          | Erect flowering stem and clasping leaves support a smooth cup.                                                                                                                    |
| Lily           | Tall stems can require stakes; long tepals have secondary motion.                                                                                                                 |
| Jasmine        | Woody climbing habit with delicate grouped flowers.                                                                                                                               |
| Orchid         | Arching Phalaenopsis flowering stems carry broad flowers.                                                                                                                         |
| Hibiscus       | Woody support with broad petals that respond more readily.                                                                                                                        |
| Dahlia         | Large heads load stems; taller forms commonly need support.                                                                                                                       |
| Peony          | Heavy flowers and cultivar-dependent stem strength suggest a slower damped response.                                                                                              |
| Lavender       | A branched shrub carries slender flowering spikes.                                                                                                                                |
| Chrysanthemum  | Branched stems support dense ornamental heads.                                                                                                                                    |
| Daisy          | Slender flowering stalks rise from a rhizomatous base.                                                                                                                            |
| Cherry Blossom | A stiff woody twig carries light blossom groups.                                                                                                                                  |

## Implementation

`WIND_PROFILES` defines compliance, spring stiffness, damping, and petal flutter for each species. Spatially phased wind has moderated quadratic drag. Springs use bounded substeps. Stem displacement follows `h²(3-h)/2`: displacement and slope are both zero at the root. Stem normals are transformed with the bend, and leaf attachments and the flower head follow the same curve. Lotus foliage retains its own anchored petiole.

`<Flower rooted position={[x, ground, z]} />` treats position as the planting point. Without `rooted`, the existing head-origin API remains available for previews. `GardenDynamics` advances shared wind, then plant poses, then contact constraints before stem and petal updates. A passing breeze triggers a soft gust instead of synchronously pulsing every bloom.

Garden placement reserves mature bloom envelopes before planting, with depth and height variation. During motion, conservative flattened bloom envelopes gently separate contacting heads according to compliance; nearby petals yield slightly and relax. Roots stay planted. This is lightweight head contact, not triangle-level cloth, leaf collision, crushing, or tearing. Both layouts derive from the full catalog. Mobile uses smaller specimens in its own portrait composition, retaining every species.

## Mobile budgets

Device constraints are resolved before detailed geometry mounts. Mobile uses low geometry, medium for the single-specimen macro view, and low for gallery previews. A simple invisible interaction envelope avoids touch raycasts through all petal triangles. Heavy shadow and postprocessing passes are omitted and pollen density is reduced.

`RenderBudget` caps mobile drawing at 30 frames per second, 1.5 million backing pixels, and 4096 pixels per dimension (or the lower GPU limit). Desktop budgets are 6 million pixels and 8192 per dimension. These are framebuffer bounds, not a cap on total VRAM. Hidden documents and inactive scenes stop advancing. Retained gallery scenes keep geometry and animation state without a canvas for each flower.

The optional vgpu tissue bake uses 512² on mobile and the HDR bake 256×128. The two jobs run serially and are cached; Three.js continues rendering through WebGL 2 with complete fallbacks. No bake/readback occurs each frame. This follows [MDN WebGL best practices](https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/WebGL_best_practices) on pixel budgets and batching, and the installed vgpu performance playbook on reusing static inputs. Inspect it with `npx vgpu docs cat /guides/performance-playbook.docs.md`; see also the [vgpu web guide](https://vgpu.sh/docs/get-started/web).

## Verification

`tests/wind.test.ts` checks anchored roots, bounded spring recovery, contact separation, and mature layout clearance. `tests/performance.test.ts` checks backing-buffer bounds and bake queue recovery. The mobile browser scenario visits specimen, macro, the full current collection, and garden and checks ongoing frames and bounded buffers. The development inspection fixture includes a Wind study toggle. Browser emulation does not establish performance on every physical phone; measure actual devices before claiming a frame rate or universal crash fix.
