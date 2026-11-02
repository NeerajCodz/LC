# Five distinct floral forms — validation record

Recorded 3 November 2026. [PR #10](https://github.com/NeerajCodz/LC/pull/10), open for review. [Plan](../plans/2026-11-02-five-distinct-floral-forms.md). Research and implementation companions: [Trillium](../research/trillium.md), [Datura](../research/datura.md), [Giant Allium](../research/allium.md), [Rosemary Grevillea](../research/grevillea.md) and [Yellow Slipperwort](../research/calceolaria.md).

## Implementation and checks

Dedicated geometry, foliage, attachments and typed catalog integration are implemented. Initial desktop specimen boards identified Grevillea’s cup-like perianth, Calceolaria’s broad opening and Trillium’s edge-on framing. These were corrected. A later Datura ray-visibility regression caught the macro camera looking through the wall rather than the mouth; revised framing now exposes the real lumen and included organs. All five have fresh specimen/overview seven-view boards in desktop Chromium and mobile WebKit, independently reviewed alongside Rose. No blocking anatomical or rendering defect was found in those sampled views. Overview Calceolaria pouches and Trillium leaf edges retain visible polygonal simplification in the diagnostic macro panel; focused views are smoother. Earlier boards remain before-change evidence.

The unchanged dynamics stress sequence initially failed Trillium’s recovery criterion: its almost collapsed tip placed nonadjacent nodes inside contact thickness. A finite blunt apex corrected the conflict. The fresh 15-test Trillium/whole-batch dynamics run passes at both budgets. Detailed cages contain 270/90 Trillium, 220/70 Datura, 864/432 Allium, **1,440/432 Grevillea**, and 864/288 Calceolaria nodes (desktop/constrained), within 2,048/512. These are authored discretizations, not measured biological meshes.

The first ten-model overview optimization census incorrectly assumed the instanced and direct paths shared the same axial grid. Small instances already use three intervals. The final change reduces only the default **direct floral** overview grid to four axial intervals; explicit landmarks/minima, leaves, all organs/instances, contact cages and focused tiers remain. Gazania/Echinacea fluted rays explicitly retain their reviewed six-row grids. Allium's pedicels retain their original carrier cross-section. The current census reports **4,161,096 dedicated-head indexed inputs / 353 head draws**, below the unchanged 4.3-million head ceiling. All 43 existing studies on the [affected-species list](data/distinct-floral-forms/overview-affected.json) pass fresh desktop/mobile overview inspection: **86/86 unique cases**, no errors, skips or flaky results; see [audit](data/distinct-floral-forms/overview-inspection.json). Independent static review covered all 602 panels and found no blocking anatomy loss, detached/inverted parts, holes or transition collapse. Magnifying this distant tier reveals coarser silhouettes/creases, especially in Carnation, Sweet Pea, Hellebore and Ranunculus; this review does not assert focused-macro smoothness.

The native development and production garden checks pass in Chromium and mobile WebKit: **7,999,626 submitted inputs, 1,674 draws, 50 linked shader programs**, at initial draw and after resize. Both report no context losses or duplicate live shader sources and at most one pending GPU fence. These are actual native render-boundary measurements, within the unchanged eight-million / 1,800-draw limits. The input budget has only **374 inputs of headroom**. See [development results](data/distinct-floral-forms/dev-native-garden.json) and [production results](data/distinct-floral-forms/production-native-garden.json). Inputs count submitted indices/vertices multiplied by instance count, not unique vertices or GPU completion time.

The first full sequential unit run completed **928 tests: 924 passed, four failed**. Failures exposed an implicit prior Echinacea ray grid, two angular-grid test fixtures tied to the old axial default, and Allium pedicels carrying an inappropriate narrow-organ hint. The ray grids were preserved explicitly; angular comparisons now hold their historical six-row reference fixed while retaining the exact assertions; pedicel sections were restored. A fresh focused 59-test run and subsequent full **932/932** sequential run pass. The later Datura camera change passes nine focused framing/visibility checks, including its new real-mesh line-of-sight regression. Final full-source verification passes **933/933**, no failures, cancellations or skips, in 491.427 seconds. Typecheck, lint and the production build pass. The [code-check proof](data/distinct-floral-forms/code-checks.json) retains commands, log hashes and summary output, and confirms all 404 source-manifest files still match.

Independent code review found an unmounted Allium supporting neck and Datura filament bases floating inside the tube. Both are corrected. Datura's new supported sleeve was checked with actual cage interpolation, nonzero free distal response, and the same render-used displacement/normal data as the shader; its roots stay within the existing 0.002 skin-distance tolerance through reverse bloom. A fresh four-test attachment run and 30-test attachment/dynamics/core-physics run pass. Equal-time 30/60/120 Hz comparisons match exact positions and velocities at both budgets for all five.

The first 20-case inspection run passed 19 cases; mobile Trillium specimen capture timed out in `locator.screenshot` while waiting for element stability. Final-source inspection then passed **22/24** cases: mobile Calceolaria specimen timed out before the inspection heading appeared, and its overview timed out during pixel readback. Both unchanged cases passed on an isolated retry. The accepted union therefore contains **24 unique cases across 26 attempts**, with two failures retained in the [inspection proof](data/distinct-floral-forms/inspection.json). This is not a clean first-attempt run. Free physical memory fell below 3 MB during the failed run; correlation does not establish the cause. Timeouts, readiness and pixel criteria have not been relaxed.

Inventory regeneration and audit pass: 396,788 taxa, 347,476 species, 430 families, 82 matched authored studies and 86 catalog studies. Four prior coverage gaps remain explicit; no biological simulation has been marked scientifically verified. Taxonomy tests pass **6/6**.

The [source manifest](data/distinct-floral-forms/source-manifest.json) records source commit `49da8396d9c39a2f120e3393f586c26295bdb83f`, Node v24.22.1 and SHA-256 hashes for 404 tracked source files. [CPU measurements](data/distinct-floral-forms/physics.json) contain 600 timed solver samples after warm-up on an Intel i7-13650HX. Both cage tiers run on this same workstation; these figures exclude render preparation, texture upload, browser/GPU cost and frame cadence.

| Study | Desktop median / p95 (ms) | Constrained median / p95 (ms) |
| --- | --- | --- |
| Trillium | 1.342 / 1.490 | 0.144 / 0.223 |
| Datura | 0.753 / 0.949 | 0.077 / 0.101 |
| Giant Allium | 3.344 / 3.838 | 0.427 / 0.601 |
| Grevillea | 11.668 / 13.932 | 0.958 / 1.160 |
| Calceolaria | 9.247 / 12.939 | 0.810 / 1.055 |

## Production browser verification

The initial production matrix completed **59/60 passing cases**. Mobile Datura completed its functional collection/garden assertions but failed its final health check with three RSC access-control page errors. An unchanged isolated retry passed in 45.4 seconds. The accepted union is **60 unique cases across 61 attempts**, with no skipped cases and the failed attempt preserved in the [production proof](data/distinct-floral-forms/production-browser.json). This is not a clean first-attempt matrix.

The [Datura trace diagnosis](data/distinct-floral-forms/datura-mobile-rsc-diagnosis.json) records exact events and the trace hash. The errors occurred 2–3 ms after the garden document request began, before navigation completed. Their cache-busting key matches the installed Next.js helper's old Datura tree-prefetch input. Those URLs have no recorded network entries; all 15 recorded RSC responses returned 200. Old-document cancellation is plausible but unproven. No request/error filtering, framework change, timeout increase or weaker pixel assertion was used, and the intermittent failure is not described as fixed.

Coverage comprises both projects for `distinct-floral-forms`, `document-lifecycle`, `garden-preparation`, `lifecycle`, `rendering-fallback`, `retention`, `scroll` and `shader-reuse`. It exercises all five canonical routes, query redirects, search, themes, keyboard pulse, reverse bloom, macro persistence, pause/resume, reduced motion, selected garden and its return, all-catalog retained pagination, native scrolling alignment, WebGPU-unavailable rendering, null/throwing WebGL probes, renderer initialization failure, real context loss/retry and draw-loop exceptions. Production runs on **port 1607**. Existing historical records retain earlier failures and device limits.

## Rendering measurements

[Twenty production samples](data/distinct-floral-forms/rendering.json) cover specimen and macro for all five in desktop Chromium and mobile WebKit emulation. Each flower/device pair uses a fresh browser process with the existing benchmark script and unchanged assertions. Optional WebGPU is disabled to exercise the real WebGL-compatible tissue/HDR fallback. Every sample records visible pixels, active detailed physics within its node ceiling, advancing solver steps, finite timing data, no runtime/shader errors and no context loss.

The table reports **approximate successful R3F advances per second**, specimen / macro. Measurement uses 30-frame published bins and 50 ms RPC polling after warm-up. It measures neither compositor presentation nor GPU time and is not a physical-phone benchmark or controlled comparison against Rose.

| Study | Desktop advances/s | Mobile emulation advances/s |
| --- | --- | --- |
| Trillium | 48.1 / 47.1 | 25.7 / 22.6 |
| Datura | 48.3 / 48.1 | 23.6 / 18.9 |
| Giant Allium | 47.2 / 42.0 | 22.7 / 19.8 |
| Grevillea | 16.1 / 14.6 | 8.3 / 11.7 |
| Calceolaria | 29.0 / 26.7 | 20.3 / 24.0 |

Grevillea remains the main measured performance limitation: its desktop live solver rolling mean is **50.28 / 49.68 ms**, and mobile emulation is **17.30 / 9.42 ms**. Calceolaria desktop is **30.72 / 34.67 ms**. Live CPU counters include the actual catch-up workload and carry across specimen/macro views; they are not directly comparable to the standalone fixed-input solver samples above. These measurements do not establish 60 FPS. All raw solver, transfer, buffer, renderer and step counters are retained.

Typecheck, lint, full unit checks, inventory/taxonomy audit, documentation links/companions and the production build are verified. WGSL and installed dependencies are unchanged; no new WGSL device-validation claim is made. Independent code review found no blocking issue after the attachment/framing fixes, and independent static review covered all new specimens plus affected overview boards.

## Limits

The models are authored procedural botanical studies. Counts, dimensions, palettes, tissue coefficients, stiffness, damping and reversible bloom timing are uncalibrated. Allium uses twelve contact-enabled flowers with 168 complete instanced flowers; its proportions are compressed and basal senescence is static. No species-specific oil-production mechanism is claimed for Calceolaria. Fine hair coats, seasonal physiology, fragrance, pollen transfer and seed/fruit development are outside these implementations. No photorealism or 60 FPS claim follows from unit or browser tests.
