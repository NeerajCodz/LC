# Next batch — working validation record

Started 8 October 2026 from main `414edf9`, after the user explicitly requested
merging PR #3 with its documented WebKit stress failure still open.

The chosen batch is Ranunculus, Anemone, Crocus, Freesia, Lisianthus, Camellia,
Magnolia, Gardenia, Nasturtium and Cosmos. All ten have research dossiers.
All ten now have dedicated geometry, foliage, pigments and anchored interaction.
Work continued in the same `E:\codz\Projects\lc` repository on the user-requested
`codex/complete-next-ten-specimens` branch. The eight initial research/Ranunculus
commits are preserved. See the [working plan](../plans/next-ten-realistic-specimens.md).

## Dedicated anatomy and review

Anemone retains eight petaloid sepals, dark stamens, individual carpels and divided
involucral/basal leaves. Crocus has six tepals, three stamens, three stigma branches
and a diagnostic white leaf stripe; review shortened the bare tubes to keep its
flowers close to the basal foliage. Freesia keeps a bent unilateral spike, six-lobed
continuous funnels, bifid style branches and a five-blade leaf fan. Lisianthus
has five lobes on short fused bases, paired stigmas and clasping opposite foliage;
review softened repeated folds.

Camellia's seven-petalled single form includes fused petal/filament collars and
protective scales. Magnolia retains nine thick tepals, 179 instanced stamens and
60 carpels on a scaled floral torus, with glossy leaves and rough rusty undersides.
Review reduced the torus, moved reproductive organs outside its surface and
closed the axis apex. Gardenia has a long tube, six overlapping limbs, included
anthers, an inferior ovary and separate pointed stipules. Nasturtium has two
upper/three fringed lower petals, eight stamens, a hollow calyx spur and curved
peltate leaves with interior petiole insertions. Cosmos keeps eight neuter rays,
80 real five-lobed bisexual disk florets, two bract ranks and sealed bipinnate
filiform foliage; review compacted and closed its buds.

Head orientations pivot around their anatomical insertions; macro targets come
from the same transformed coordinates. The stem and planting point remain fixed.
No whole-plant head rotation, blurred macro treatment, photographed texture or
generic substitute model was introduced. Counts/compositions, palettes, dimensions
and mechanical constants remain authored as documented in the source dossiers.

Rose plus all ten were captured in the development fixture at front, side, 45°,
macro, bud, half and side bud: 11/11 captures passed and were inspected. Eight
corrected specimens were recaptured (8/8), followed by the final two closure
recaptures (2/2). These views complement numerical checks and do not establish
photographic equivalence.

At the original production-sweep checkpoint, the feature tree passed 250 unit
tests, typecheck and full lint.
Inventory generation/audit and six taxonomy tests pass: 56 catalog studies and
52 unambiguous exact-name candidates, preserving four existing naming gaps and
the false scientific-simulation flag. The production build passes with 56 flower
routes / 63 static pages. The browser results and measured costs are recorded below.

## Original production browser sweep

The 52-case sweep against the production build completed in 36.2 minutes:
**41 passed / 11 failed**. Desktop Chromium passed all 26 cases. Emulated
iPhone 13 WebKit on Windows passed 15 of 26. This is not an all-green mobile result.
The files exercised the new specimens, retention, rendering fallback, scrolling,
lifecycle and the complete collection-to-garden performance journey.

Both projects passed the focused loop through all ten species, including actual
flower pixels, detailed cage limits, macro retention, keyboard/pointer pulse,
pause/resume and reduced motion. Desktop also passed every individual species'
bloom/theme/search/selected-garden journey and the full retained collection.
Mobile Freesia and Nasturtium passed their individual journeys.

The ten graphics failures have explicit `WebGL: context lost.` messages in their
saved traces:

- Ranunculus and Anemone reached the garden but its loading overlay did not clear.
- Crocus, Lisianthus, Camellia, Magnolia, Gardenia and Cosmos failed the actual
  garden-pixel assertion after context loss. Several then logged invalid-object
  deletion messages during cleanup; these follow the loss rather than establish
  its underlying cause.
- The mobile performance journey and retention round trip both lost their context
  in the collection and failed at Gardenia's missing rendered-preview marker.
  The performance journey did not reach its garden stage.

The eleventh failure, the simulated throwing WebGL probe, completed DOM browsing
and retry assertions but collected a Next.js Marigold route-prefetch fetch error
reported by WebKit as an access-control failure. It is separate from context loss;
the error collection assertion remains intact. A fresh isolated rerun passed
(1/1 in 5.6 seconds), without changing source or filtering errors. The original
sweep remains recorded as 41/52; one isolated pass does not erase that failure.

This extends the previously disclosed Windows WebKit collection/garden limitation.
The first failing preview does not establish Gardenia as the sole cause: individual
focused rendering passed, while retained accumulation and complete-garden startup
remain unresolved. No scene-unmount workaround, weakened pixel assertion or
error filter was introduced. Physical iPhone Safari is unmeasured, and Windows
WebKit's reported `Apple GPU` is not evidence of a physical Apple device.

## Initial Ranunculus slice (historical checks)

- Dedicated cultivated-double anatomy: 48 cupped sealed petals in four layers,
  five protective sepals and enclosed carpels. Macro geometry preserves thickness
  and matching open/folded normals; deterministic surfaces and bloom transitions
  remain nondegenerate.
- Dedicated deeply divided foliage with three leaflets per petiole, apricot
  pigment zones, subtle vein treatment and shared tissue/fallback resources.
- Anchored stem response and detailed XPBD interaction in focused/selected views.
  Cages use 1,212 desktop and 414 constrained nodes, below the existing ceilings.
  Previews/full garden stay ambient; automatic airborne pollen is suppressed.
- Initial review exposed an elongated bud and short protective sepals. A failing
  proportion/enclosure regression preceded their correction. Corrected captures
  show a rounded bud surrounded by longer green sepals; mature geometry is retained.

## Checks completed before the remaining nine were implemented

- Typecheck and full repository lint pass.
- **171 unit tests pass**, including sealed/thickness/normal/count checks,
  paired anther attachments and Ranunculus transformed cage stress through
  gusts, reverse bloom, release and reduced-motion settling at both budgets.
- **Six taxonomy tests pass**. Inventory generation/audit pass: 47 authored
  catalog studies and 43 unambiguous exact-name candidates. The four existing
  naming gaps and the explicit false scientific-simulation flag remain.
- The production build passes with 47 canonical flower routes / 54 static pages.
  Port 1607, installed dependencies and permanent configuration are preserved.
- **Four production browser cases pass** after the bud correction: two desktop
  Chromium and two emulated iPhone WebKit cases. They exercise rendered pixels,
  macro cage retention, keyboard/pointer pulses, pause/resume, reduced motion,
  bloom, all three themes, catalog search and selected garden rendering.
- Front, orbit 45-degree, side, macro, bud, half and full captures were inspected;
  corrected desktop bud/half and emulated-mobile macro/bud were reviewed again.
  The exact seven-camera comparison with Rose had not yet run at this checkpoint;
  it is now recorded in the completed review above.

These initial cases did not resolve PR #3's full retained-gallery-to-garden WebKit
stress failure. The final sweep above exercises that journey and broad collection/
fallback scenarios against all ten implemented models. The earlier four passing
cases do not establish a fix.

## Measured CPU contact costs

Measured on Windows with an Intel Core i7-13650HX (14 cores / 20 threads),
Node 24.19.0 and the committed `benchmark-petal-physics.ts` driver. Each sample
uses 30 warmup frames followed by 60 measured `step(1/60)` calls at full bloom,
wind 0.7 and proximity 0.8. Desktop integrates at 1/120 second; constrained at
1/60. Matrices use the final authored head poses and constrained midribs remain
pinned. These are CPU solver timings, excluding drawing and texture preparation;
they are not whole-app frame times.

| Species    | Desktop nodes | Median / p95 ms | Constrained nodes | Median / p95 ms |
| ---------- | ------------: | --------------: | ----------------: | --------------: |
| Ranunculus |          1212 | 22.894 / 27.565 |               414 |   3.079 / 4.531 |
| Anemone    |           280 |   3.219 / 4.173 |               120 |   0.546 / 1.333 |
| Crocus     |           672 | 11.518 / 15.246 |               336 |   1.732 / 2.599 |
| Freesia    |           728 | 15.951 / 17.511 |               294 |   1.465 / 1.832 |
| Lisianthus |          1020 | 12.974 / 15.738 |               410 |   1.461 / 1.902 |
| Camellia   |           850 | 21.924 / 27.557 |               348 |   2.464 / 5.006 |
| Magnolia   |           385 |   5.581 / 7.659 |               138 |   0.797 / 1.160 |
| Gardenia   |           792 | 21.103 / 24.302 |               312 |   1.944 / 2.929 |
| Nasturtium |          1040 | 17.007 / 19.779 |               392 |   1.615 / 2.670 |
| Cosmos     |           608 |   6.533 / 8.696 |               274 |   1.041 / 1.433 |

Dense Ranunculus, Camellia and Gardenia desktop contact work alone exceeds a
16.7 ms frame budget in this sample. Bounded node counts do not guarantee 60 FPS.
Full garden and previews retain ambient motion; detailed contact runs only in
focused/selected specimens. Fine instanced reproductive organs follow their
carrier; they do not each own a cage, and sub-cage tissue detail is not guaranteed
collision-free. Compliance and biological opening delays remain authored.

## Rendering measurements

The committed `benchmark-specimen-rendering.ts` driver completed all 40 samples:
10 specimens, two views and two browser targets. No sampled page errors or context
loss occurred. Each species uses a fresh page; specimen and macro share that page.
Optional WebGPU is disabled, so both tissue and studio lighting report their
WebGL fallbacks. All samples report detailed physics and the expected desktop or
mobile render budget.

After at least 60 warm frames and a new 30-frame counter boundary, each sample
measures 120 subsequent draw-counter advances. Cadence includes CPU simulation,
texture preparation and rendering; it is not isolated GPU execution or presented
frames. The reported solver/transfer means are the renderer's latest batched
telemetry. Transfer measures CPU displacement/normal texture preparation, excluding
GPU upload execution. Slow frames may take more bounded fixed solver substeps
than the single-input Node benchmark, so those figures are not directly equivalent.
These are single sequential samples, not statistical device guarantees.

Desktop Chromium used ANGLE / NVIDIA GeForce RTX 3050 6GB Laptop GPU / D3D11,
a 1600 x 1000 CSS viewport and a budgeted 3098 x 1936 drawing buffer. Mobile used
Playwright iPhone 13 WebKit emulation on Windows, a 390 x 440 specimen drawing buffer
and the browser's `Apple GPU` renderer label. That label does not identify a real
phone. Both buffers stayed unchanged between specimen and macro.

### Desktop Chromium

| Species    | Specimen / macro cadence FPS | Specimen / macro solver ms | Specimen / macro texture preparation ms |
| ---------- | ---------------------------: | -------------------------: | --------------------------------------: |
| Ranunculus |                  26.1 / 24.8 |              37.10 / 36.10 |                             0.13 / 0.13 |
| Anemone    |                  48.1 / 48.0 |                4.50 / 3.84 |                             0.05 / 0.04 |
| Crocus     |                  49.2 / 48.0 |                9.55 / 8.13 |                             0.04 / 0.04 |
| Freesia    |                  47.9 / 47.2 |               9.79 / 10.80 |                             0.03 / 0.04 |
| Lisianthus |                  48.7 / 49.1 |               10.22 / 9.60 |                             0.06 / 0.06 |
| Camellia   |                  47.4 / 48.4 |              15.42 / 15.67 |                             0.05 / 0.04 |
| Magnolia   |                  48.0 / 47.9 |                4.03 / 3.93 |                             0.03 / 0.03 |
| Gardenia   |                  49.2 / 48.0 |              12.84 / 12.26 |                             0.04 / 0.04 |
| Nasturtium |                  47.2 / 48.0 |               9.90 / 10.84 |                             0.05 / 0.06 |
| Cosmos     |                  48.1 / 48.0 |                5.11 / 5.91 |                             0.06 / 0.04 |

Navigation to 30 draw-counter frames ranged from 2.01 to 8.02 seconds.

### Windows mobile WebKit emulation

| Species    | Specimen / macro cadence FPS | Specimen / macro solver ms | Specimen / macro texture preparation ms |
| ---------- | ---------------------------: | -------------------------: | --------------------------------------: |
| Ranunculus |                  20.0 / 18.7 |                5.74 / 5.34 |                             0.05 / 0.05 |
| Anemone    |                  26.3 / 24.1 |                0.93 / 0.93 |                             0.01 / 0.00 |
| Crocus     |                  25.7 / 26.2 |                2.31 / 2.34 |                             0.02 / 0.03 |
| Freesia    |                   12.5 / 9.6 |              14.17 / 17.36 |                             0.54 / 0.52 |
| Lisianthus |                  23.6 / 19.3 |                2.91 / 4.19 |                             0.09 / 0.20 |
| Camellia   |                   15.4 / 9.4 |              12.15 / 17.09 |                             0.48 / 0.60 |
| Magnolia   |                  26.2 / 26.9 |                1.32 / 1.16 |                             0.03 / 0.02 |
| Gardenia   |                  24.9 / 25.3 |                3.06 / 2.41 |                             0.05 / 0.05 |
| Nasturtium |                  24.8 / 23.5 |                4.20 / 2.62 |                             0.20 / 0.07 |
| Cosmos     |                  25.0 / 23.8 |                1.60 / 1.46 |                             0.04 / 0.02 |

Navigation to 30 draw-counter frames ranged from 5.13 to 7.91 seconds.

Focused-page samples do not resolve the retained collection/garden failures.
Desktop cadence ranged from 24.8-49.2 FPS; mobile emulation from 9.4-26.9 FPS,
including slow Freesia and Camellia macro samples. Neither result supports a
sustained universal 60 FPS claim.

Physical-phone measurements and isolated GPU timing remain unavailable. No WGSL
changed; actual WebGL pixel checks exercised the updated GLSL materials. Logs,
raw benchmark JSON, traces and screenshots remain at
`F:/codex-lc-validation/next-ten-specimens-2026-10-08/`, outside Git. The production
app continued to run on port 1607 for review. At that checkpoint the PR remained
a draft while the mobile collection/garden failures were unresolved. The geometry, sources and
review captures represent authored botanical art, not a scientifically validated
simulation or a claim of photographic equivalence.

## Recovery measurements — 9 October 2026

Recovery work retains the CPU scenes, geometry, morphs, materials and animation
refs. Native geometry buffers are released for previews outside the actual
viewport and for hidden garden plants. Hidden garden materials also release
their native program references, retaining uniforms, shader hooks and shared
atlas textures for garden return. A real native-allocation regression failed
before each release change and passes afterward; identity and resume checks
remain in place.

The CPU tissue atlas now exists before the first tissue program compiles and
matches the optional GPU field to within one byte. Compatible tissue programs
share their source while retaining species-specific uniforms. Stable shadow
configuration avoids unnecessary program variants. Distant shells share meshes,
with independent bloom and pressure attributes in color and shadow passes.

Constrained gardens submit at most one unfinished GPU frame. Visible material
programs prepare inside Three r185's actual color pass; readiness is polled from
the guarded clock and resets on context loss, document exit and unmount. The
preparation view does not reparent objects or add a render target. Early selection
and real context loss/retry have dedicated browser cases. The rejected earlier
preparation experiment generated 94 programs and was reverted; this implementation
uses 47 in the native constrained-garden sample.

| Native measurement                                                    | Full garden | Rose close-up |
| --------------------------------------------------------------------- | ----------: | ------------: |
| Desktop geometry buffer bytes, before the final density reduction     |  58,842,884 |     3,766,084 |
| Desktop live programs                                                 |          66 |            22 |
| Constrained geometry buffer bytes, before the final density reduction |  58,837,892 |     2,441,732 |
| Constrained live programs                                             |          47 |             6 |

These are measured native allocations/program counts, not estimates of total GPU
memory. Shared atlas and environment resources remain available. Returning to the
garden reuploads geometry and recompiles needed programs while retaining the
same CPU geometry identities.

The full-catalog constrained draw initially submitted 10,067,520 indexed vertices
per frame. Bounding only distant petal and tiny-organ tessellation reduces this
to **6,522,204**, retaining all plants, petals, florets, paired anthers and
appendages. Close-up quality levels retain their existing sampling. Native
Chromium and WebKit checks enforce an 8,000,000 input ceiling, observe 1,456 draw
calls, 47 shader programs, no duplicate sources, one pending frame and no context
loss in these samples. Actual garden and close-up compositor PNG checks pass.
The new Lotus prototype test retains all 156 stamens, closed surfaces, paired
anthers, appendages and matching extents.

Playwright is pinned to `1.65.0-alpha-2026-10-08` / WebKit 2373. A plain WebGL
control reproduced Windows WebKit 2359's blank capture after buffer resize; the
[upstream native display-buffer fix](https://github.com/WebKit/WebKit/pull/75957)
and a raw resize/compositor regression distinguish that engine issue from LC's
resource work. No context reset or pixel-check relaxation substitutes for that fix.

Shared-process Windows WebKit sequences still produced intermittent context loss
between tests, including retry after interrupted preparation. Driver diagnostics
on an isolated passing reproduction found no cross-context resource mismatches.
Tracing on/off and filmstrip-only changes did not explain the failure; explicit
blank-document teardown stalled a later sequence and was removed. Each of the
eight targeted cases passes with normal tracing in a fresh browser process.
The complete production matrix and development inspection matrix use this same
process isolation, with every assertion intact. Shared-process failures remain
historical evidence and are not a claim of a resolved browser-driver issue.

## Final recovery validation — 9 October 2026

| Check                                                              | Result                                                              |
| ------------------------------------------------------------------ | ------------------------------------------------------------------- |
| TypeScript and full ESLint                                         | Passed                                                              |
| Geometry, contact, motion, material and lifecycle unit tests       | 273/273 passed; no skips                                            |
| Production browser matrix, desktop Chromium                        | 66/66 passed                                                        |
| Production browser matrix, Windows mobile WebKit emulation         | 66/66 passed                                                        |
| Development seven-view inspection, desktop Chromium                | 28/28 passed                                                        |
| Development seven-view inspection, Windows mobile WebKit emulation | 28/28 passed                                                        |
| Overview rendering captures, desktop and mobile emulation          | All 56 catalog specimens per engine rendered; no page/shader errors |
| Actual WebGPU shader validation and GPU reference tests            | 2/2 and 2/2 passed                                                  |
| Taxonomy tests and generated inventory audit                       | 6/6 passed; inventory audit passed                                  |
| Production build                                                   | Passed; all canonical specimen routes generated                     |

The **188 browser cases** span every case in 25 files: 22 production files and
three development inspection files. Each case uses a fresh native browser process,
the installed Playwright project options, normal retain-on-failure tracing, one
worker and its original assertions. There are no retries, skipped, flaky or
unexpected cases, or report-level errors. Within-case journeys still exercise
the entire retained catalog, multi-specimen physics, garden selection/return,
renderer failure/retry and context loss. This is a complete process-isolated
matrix, not a passing default shared-process WebKit sweep.

The committed `test:browser:isolated` command derives cases from Playwright's
JSON listing, checks that every subprocess executes exactly one case and retains
its report. During private validation the uniqueness guard caught an unbounded
Rose selector also matching Primrose; after adding a title boundary, the affected
case and remaining matrix completed without duplicate selection. An integration
run of the committed runner independently passed each of the three Rose cases
and selected no Primrose case. The earlier 41/52 sweep and shared-process failures
remain recorded above rather than being replaced by isolated passes.

The ten new species and Rose were visually reviewed in both engines at front,
side, 45 degrees, macro, bud, half bloom and side bud. The overview capture set
adds all catalog species, with front/45-degree/bud/half contact-sheet review in
both engines. It preserves distinctive silhouettes, counts and attachments;
numerical tests cover sealed shells, folded normals and repeated organ extents.
The fixture's inherited fixed framing crops the upper portions of several older
upright specimens, including Tulip; these overview captures are not evidence of
complete visual coverage of every organ of those older specimens. The focused
public pages and new-specimen review have their separate framing checks.

Final reports are retained outside Git under
`F:/codex-lc-validation/next-ten-specimens-2026-10-08/`: the
`recovery-per-case-production/` and `recovery-per-case-inspection/` folders contain
per-case JSON, captures and aggregate results; `overview-review-desktop/` and
`overview-review-mobile/` contain the additional quality-tier review. Unit, GPU,
build and native-resource logs accompany them. The local production app uses
port 1607. Physical-phone validation and isolated GPU timing remain unavailable;
the measurements above do not support a universal 60 FPS claim.
