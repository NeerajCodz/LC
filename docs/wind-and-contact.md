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

Additional species response classes and construction limits are described in the [expanded forms dossier](specimens/expanded-forms.md). Garden framing follows the actual envelope extent as the catalog grows.

On portrait screens, controls occupy their own space below the garden canvas. Camera framing accounts for the canvas aspect ratio. Macro targets include each non-radial head's authored center; the full garden returns without changing fixed planting points.

## Implementation

`WIND_PROFILES` defines compliance, spring stiffness, damping, and petal flutter for each species. Spatially phased wind has moderated quadratic drag. Springs use bounded substeps. Stem displacement follows `h²(3-h)/2`: displacement and slope are both zero at the root. Stem normals are transformed with the bend, and leaf attachments and the flower head follow the same curve. Lotus foliage retains its own anchored petiole.

Blue Passionflower introduces an ideal fixed vine support. `supportedBendWeight` and `supportedBendSlope` map the free segment above `supportHeight` onto the same cantilever curve; everything below that attachment has zero displacement and slope. Head tilt, displacement bounds and geometric shortening use `freeStemLength`. The custom `PassionVine` stem follows that curve with transformed normals, while leaves have smaller independent motion. The existing unsupported case remains mathematically unchanged. See the [passionflower dossier](specimens/passionflower-research.md) for the authored support, tendril and motion limitations.

`<Flower rooted position={[x, ground, z]} />` treats position as the planting point. Without `rooted`, the existing head-origin API remains available for previews. `GardenDynamics` advances shared wind, then plant poses, then contact constraints before stem and petal updates. A passing breeze triggers a soft gust instead of synchronously pulsing every bloom.

Garden placement reserves mature bloom envelopes before planting, with depth and height variation. During motion, conservative flattened bloom envelopes gently separate contacting heads according to compliance; nearby petals yield slightly and relax. Roots stay planted. This is lightweight head contact, not triangle-level cloth, leaf collision, crushing, or tearing. Both layouts derive from the full catalog. Mobile uses smaller specimens in its own portrait composition, retaining every species.

Hardy Fuchsia adds independently suspended flowers beneath its woody shoot. `stepFuchsiaPendant` uses a bounded gravity-restored angular response, substepped to 1/240 second, driven by scene time so pauses do not accumulate a large step. Effective length, damping and forcing are authored; a published stem bending-failure study does not calibrate flower-stalk or petal dynamics. Root and leaf attachments continue to follow the shared clamped curve. See the [fuchsia dossier](specimens/fuchsia-research.md).

## Flexible surface contact

The flexible specimens add opt-in surface contact beneath the shared anchored plant response. `PetalDynamics` uses XPBD stretch links and two-row distance constraints for bending, damped velocities and botanical rest-shape constraints. Plumeria's fleshy lobes restore curvature more firmly than the papery surfaces. A fixed spatial hash rejects separated bounds before thickness-aware vertex/triangle and warp/weft edge contacts. Each node has a per-substep contact projection budget of one tissue thickness, preventing dense redundant constraints or vanishing effective mass near a pin from producing runaway displacement. Further separation converges over subsequent fixed steps. Artificial triangulation diagonals are excluded from segment contact; triangular faces still participate in vertex contact. Calyx/throat/floral-tube obstacles are fully pinned; Bougainvillea bract midribs also remain constrained.

Whole-plant cages stay below 2,048 nodes on desktop and 512 on constrained devices. Integration uses fixed 1/120- or 1/60-second steps, bounded to four or two substeps per frame. Excess inactive time is discarded. Forces and local displacement/velocity have finite bounds. These are visual material approximations rather than calibrated tissue models: no tearing, crush damage, continuous swept collision or biological growth is predicted. Very thin, sub-cage details such as petal fringes inherit interpolated deformation rather than independent collision nodes.

`CageDeformation` transfers local displacement and normal delta in a two-row float texture. Four bilinear cage samples drive both shell sides and matching depth/distance shadow materials. Render tessellation may change without replacing a cage; switching device constraints rebuilds within the new ceiling. Only focused specimens run these cages. Organ inputs include physics mode, anchored plant motion, reduced-motion state and a retained local pointer tuple. Macro remains sharp; no WebGPU context, per-frame bake or readback is involved.

## Mobile budgets

Device constraints are resolved before detailed geometry mounts. Mobile uses low geometry, medium for the single-specimen macro view, and low for gallery previews. A simple invisible interaction envelope avoids touch raycasts through all petal triangles. Heavy shadow and postprocessing passes are omitted and pollen density is reduced.

`RenderBudget` caps mobile drawing at 30 frames per second, 1.5 million backing pixels, and 4096 pixels per dimension (or the lower GPU limit). Desktop budgets are 6 million pixels and 8192 per dimension. These are framebuffer bounds, not a cap on total VRAM. Hidden documents and inactive scenes stop advancing. Retained gallery scenes keep geometry and animation state without a canvas for each flower.

Mobile uses the same DPR request of 1 in normal and macro views, reduced further for oversized surfaces. Fractional macro upscaling reproduced a blank composited canvas in mobile WebKit even with valid draw calls. Keeping the backing surface stable avoids that failure and additional fill cost while macro still upgrades geometry. Browser checks sample flower pixels and verify unchanged normal/macro buffer dimensions; physical-phone performance remains unmeasured.

The optional vgpu tissue bake uses 512² on mobile and the HDR bake 256×128. The two jobs run serially and are cached; Three.js continues rendering through WebGL 2 with complete fallbacks. No bake/readback occurs each frame. This follows [MDN WebGL best practices](https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/WebGL_best_practices) on pixel budgets and batching, and the installed vgpu performance playbook on reusing static inputs. Inspect it with `npx vgpu docs cat /guides/performance-playbook.docs.md`; see also the [vgpu web guide](https://vgpu.sh/docs/get-started/web).

## Verification

`tests/wind.test.ts` checks anchored roots, bounded spring recovery, contact separation, and mature layout clearance. `tests/performance.test.ts` checks backing-buffer bounds and bake queue recovery. The mobile browser scenario visits specimen, macro, the full current collection, and garden and checks ongoing frames and bounded buffers. The development inspection fixture includes a Wind study toggle. Browser emulation does not establish performance on every physical phone; measure actual devices before claiming a frame rate or universal crash fix.

`SpecimenSurface.pressureSample` optionally supplies a full-open depressed pose. Snapdragon blends this pose into both visible position/normal morphs and cage rest, weighted by bloom, so pressure cannot open a folded bud or move its pinned insertion. The retained cluster spring returns the lower palate on release; these response coefficients are authored. Hydrangea sepal and Protea bract midribs constrain their blades. Dense true florets share instanced carriers and bloom morphs without individual collision cages. Custom basal leaf pitch composes before shoot yaw; their petioles and insertion points follow the anchored curve.
