# Five distinct floral forms — validation record

Work in progress, 2 November 2026. [Plan](../plans/2026-11-02-five-distinct-floral-forms.md). Research and implementation companions: [Trillium](../research/trillium.md), [Datura](../research/datura.md), [Giant Allium](../research/allium.md), [Rosemary Grevillea](../research/grevillea.md) and [Yellow Slipperwort](../research/calceolaria.md).

## Evidence recorded so far

Dedicated geometry, foliage, attachments and typed catalog integration are implemented. Initial desktop specimen boards rendered for all five; their review identified Grevillea’s cup-like perianth, Calceolaria’s broad opening and Trillium’s edge-on framing. Geometry/framing changes require fresh visual verification. Earlier images are before-change evidence.

The unchanged dynamics stress sequence initially failed Trillium’s recovery criterion: its almost collapsed tip placed nonadjacent nodes inside contact thickness. A finite blunt apex corrected the conflict. The fresh 15-test Trillium/whole-batch dynamics run passes at both budgets. Detailed cages contain 270/90 Trillium, 220/70 Datura, 864/432 Allium, **1,440/432 Grevillea**, and 864/288 Calceolaria nodes (desktop/constrained), within 2,048/512. These are authored discretizations, not measured biological meshes.

The first ten-model overview optimization census incorrectly assumed the instanced and direct paths shared the same axial grid. Small instances already use three intervals. The final change reduces only the default **direct floral** overview grid to four axial intervals; explicit landmarks/minima, leaves, all organs/instances, contact cages and focused tiers remain. The fresh eight-test overview run reports **4,149,888 dedicated-head indexed inputs / 353 head draws**, below the unchanged 4.3-million head ceiling. Native whole-garden measurement remains required against the unchanged eight-million/1,800-draw limits.

## Pending final verification

Fresh desktop/mobile specimen and overview seven-view boards, affected collection overview review, production interaction/fallback suites, whole-garden native costs, full unit/type/lint checks, production build, documentation/taxonomy/inventory audits and CPU/render measurements remain to be recorded. No unrun check is counted as passing. Existing historical records retain earlier unrelated failures and device limits.

## Limits

The models are authored procedural botanical studies. Counts, dimensions, palettes, tissue coefficients, stiffness, damping and reversible bloom timing are uncalibrated. Allium uses twelve contact-enabled flowers with 168 complete instanced flowers; its proportions are compressed and basal senescence is static. No species-specific oil-production mechanism is claimed for Calceolaria. Fine hair coats, seasonal physiology, fragrance, pollen transfer and seed/fruit development are outside these implementations. No photorealism or 60 FPS claim follows from unit or browser tests.
