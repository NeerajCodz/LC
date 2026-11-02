# Giant Allium — Allium giganteum

Reviewed 2 November 2026. Taxon: *Allium giganteum*, Amaryllidaceae. [Implementation guide](../specimens/allium.md).

## Evidence and reference proportions

[NC State Extension](https://plants.ces.ncsu.edu/plants/allium-giganteum/) describes a dense spherical umbel of small six-parted flowers above a naked scape, with basal gray-green leaves that begin dying back during flowering. Its reference plants can reach six feet tall. [RHS](https://www.rhs.org.uk/plants/829/allium-giganteum/details) provides another species account. The flower-bearing globe consists of individual pedicellate flowers, rather than petals arranged around one central disk.

## Authored study

The head contains **180 complete flowers**, each with six separate pointed tepals, six stamens with paired anther chambers, a superior ovary, style and stigma. Twelve distributed flowers provide individual flexible shells; 168 retain the complete anatomical prototype through instancing. All pedicels and two papery spathe remnants remain real geometry at every tier. No flowers are removed for mobile rendering.

The naked 2.25-unit scape, roughly 1.8-unit head diameter, four curved basal straps, flower count and lilac pigment are composed for a compact botanical study. The head-to-stem ratio is compressed relative to a mature garden plant. Muted leaves suggest flowering-stage senescence but do not change seasonally. The dry spathe uses roughness 0.87; living tepals use 0.59 with restrained scattering. These values are authored, not measured.

Opening spreads each star from a furled form and moves its actual organs. Ambient wind carries the globe and small flowers; detailed contact is limited to the twelve sampled flowers, within 864 / 432 nodes. Instanced flowers do not each have a separate physical cage.

## Evidence gaps and verification

No bulb, full growing season, leaf dieback progression, pollination or seed maturation is modeled. The display density and contact subset are computational choices. See [batch validation](../validation/distinct-floral-forms-validation.md) for topology, count, rendering and cost evidence. Spherical packing and shader parameters are not a scan or measured optical model.
