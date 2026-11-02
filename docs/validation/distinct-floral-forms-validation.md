# Five distinct floral forms — validation record

Work in progress, 3 November 2026. [Plan](../plans/2026-11-02-five-distinct-floral-forms.md). Research and implementation companions: [Trillium](../research/trillium.md), [Datura](../research/datura.md), [Giant Allium](../research/allium.md), [Rosemary Grevillea](../research/grevillea.md) and [Yellow Slipperwort](../research/calceolaria.md).

## Evidence recorded so far

Dedicated geometry, foliage, attachments and typed catalog integration are implemented. Initial desktop specimen boards identified Grevillea’s cup-like perianth, Calceolaria’s broad opening and Trillium’s edge-on framing. These were corrected. A later Datura ray-visibility regression caught the macro camera looking through the wall rather than the mouth; revised framing now exposes the real lumen and included organs. All five have fresh specimen/overview seven-view boards in desktop Chromium and mobile WebKit, independently reviewed alongside Rose. No blocking anatomical or rendering defect was found in those sampled views. Overview Calceolaria pouches and Trillium leaf edges retain visible polygonal simplification in the diagnostic macro panel; focused views are smoother. Earlier boards remain before-change evidence.

The unchanged dynamics stress sequence initially failed Trillium’s recovery criterion: its almost collapsed tip placed nonadjacent nodes inside contact thickness. A finite blunt apex corrected the conflict. The fresh 15-test Trillium/whole-batch dynamics run passes at both budgets. Detailed cages contain 270/90 Trillium, 220/70 Datura, 864/432 Allium, **1,440/432 Grevillea**, and 864/288 Calceolaria nodes (desktop/constrained), within 2,048/512. These are authored discretizations, not measured biological meshes.

The first ten-model overview optimization census incorrectly assumed the instanced and direct paths shared the same axial grid. Small instances already use three intervals. The final change reduces only the default **direct floral** overview grid to four axial intervals; explicit landmarks/minima, leaves, all organs/instances, contact cages and focused tiers remain. Gazania/Echinacea fluted rays explicitly retain their reviewed six-row grids. Allium's pedicels retain their original carrier cross-section. The current census reports **4,161,096 dedicated-head indexed inputs / 353 head draws**, below the unchanged 4.3-million head ceiling. The [affected-species list](data/distinct-floral-forms/overview-affected.json) identifies 43 existing studies requiring fresh overview review.

The native development garden check passes in Chromium and mobile WebKit: **7,999,626 submitted inputs, 1,674 draws, 50 linked shader programs**, at initial draw and after resize. Both report no context losses or duplicate live shader sources and at most one pending GPU fence. These are actual native render-boundary measurements, within the unchanged eight-million / 1,800-draw limits. See [raw development results](data/distinct-floral-forms/dev-native-garden.json). Production verification remains pending.

The first full sequential unit run completed **928 tests: 924 passed, four failed**. Failures exposed an implicit prior Echinacea ray grid, two angular-grid test fixtures tied to the old axial default, and Allium pedicels carrying an inappropriate narrow-organ hint. The ray grids were preserved explicitly; angular comparisons now hold their historical six-row reference fixed while retaining the exact assertions; pedicel sections were restored. A fresh focused 59-test run and subsequent full **932/932** sequential run pass. The later Datura camera change passes nine focused framing/visibility checks, including its new real-mesh line-of-sight regression. Final full-source verification remains pending.

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

## Pending final verification

Affected collection overview review, production interaction/fallback suites, production native costs, final full unit run, production build and rendering measurements remain to be recorded. Typecheck and lint pass after the Datura camera change. Documentation links/companions pass; rerun after final records. No unrun check is counted as passing. Existing historical records retain earlier unrelated failures and device limits.

## Limits

The models are authored procedural botanical studies. Counts, dimensions, palettes, tissue coefficients, stiffness, damping and reversible bloom timing are uncalibrated. Allium uses twelve contact-enabled flowers with 168 complete instanced flowers; its proportions are compressed and basal senescence is static. No species-specific oil-production mechanism is claimed for Calceolaria. Fine hair coats, seasonal physiology, fragrance, pollen transfer and seed/fruit development are outside these implementations. No photorealism or 60 FPS claim follows from unit or browser tests.
