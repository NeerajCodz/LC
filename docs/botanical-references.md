# Botanical reference notes

Project LC aims to bring every single flower in the world to life in 3D. These notes cover the specimens developed so far and expand with the collection; they do not define the limits of the project.

Botanical sources reviewed September 9, 2026; implementation notes updated September 10, 2026. The collection uses authored procedural geometry rather than photographic textures or scanned plants. The references below guide organ arrangement, surface character, and foliage. Cultivar variation is substantial: the Rose, Peony, Dahlia, and Chrysanthemum represent ornamental double forms, not every form of their species.

See [README](../README.md) for architecture and the public Flower API, [development notes](development.md) for inspection steps, and [AGENTS.md](../AGENTS.md) for implementation requirements.

| Specimen | Construction and foliage reference | Source |
| --- | --- | --- |
| Rose | Nested petals in a double bloom; five sepals; compound, toothed leaflets. | [NC State: Rosa](https://plants.ces.ncsu.edu/plants/rosa/) |
| Lotus | Broad tapered tepals; upward-widening receptacle; slender filaments, linear anthers, and curved club-like connective tips; peltate leaves. | [Flora of China: Nelumbo](https://www.iplant.cn/foc/pdf/Nelumbo.pdf), [Missouri Botanical Garden lotus collection](https://www.missouribotanicalgarden.org/gardens-gardening/our-garden/notable-plant-collections/lotus) |
| Marigold | Dense double flower heads; divided foliage with narrow toothed leaflets. | [NC State: Tagetes erecta](https://plants.ces.ncsu.edu/plants/tagetes-erecta/) |
| Sunflower | Ray flowers surrounding a disk; broad, rough foliage. The central phyllotaxis is an authored mathematical arrangement. | [NC State: Helianthus annuus](https://plants.ces.ncsu.edu/plants/helianthus-annuus/) |
| Tulip | Six tepals in two whorls; dark anthers; broad, glaucous, clasping leaves. | [NC State: Tulipa](https://plants.ces.ncsu.edu/plants/tulipa/) |
| Lily | Six recurved, spotted tepals and six filaments; one central style; narrow foliage with parallel veins. | [NC State: Lilium](https://plants.ces.ncsu.edu/plants/lilium/) |
| Jasmine | Small white flowers in groups; compound foliage. | [NC State: Jasminum officinale](https://plants.ces.ncsu.edu/plants/jasminum-officinale/) |
| Orchid | Phalaenopsis-inspired bilateral flower, differentiated lip, and broad basal foliage. | [NC State: Phalaenopsis](https://plants.ces.ncsu.edu/plants/phalaenopsis/) |
| Hibiscus | Broad petals around a prominent fused staminal tube; toothed glossy foliage. | [NC State: Hibiscus rosa-sinensis](https://plants.ces.ncsu.edu/plants/hibiscus-rosa-sinensis/) |
| Dahlia | Dense layered ornamental head; divided toothed foliage. | [NC State: Dahlia](https://plants.ces.ncsu.edu/plants/dahlia/) |
| Peony | Broad overlapping petals in double forms; compound leaves with sometimes lobed leaflets. | [NC State: herbaceous Paeonia](https://plants.ces.ncsu.edu/plants/paeonia-herbaceous-types/) |
| Lavender | Many small flowers distributed along terminal spikes; narrow grey-green foliage. | [NC State: Lavandula angustifolia](https://plants.ces.ncsu.edu/plants/lavandula-angustifolia/) |
| Chrysanthemum | Dense ornamental ray-floret head; lobed, toothed foliage. | [NC State: Chrysanthemum × morifolium](https://plants.ces.ncsu.edu/plants/chrysanthemum-x-morifolium/) |
| Daisy | White rays surrounding a yellow disk; narrower toothed stem leaves. | [NC State: Leucanthemum vulgare](https://plants.ces.ncsu.edu/plants/leucanthemum-vulgare/) |
| Cherry Blossom | Five notched petals in the single-flowered form; grouped blossoms and serrated elliptical foliage. | [NC State: Prunus serrulata](https://plants.ces.ncsu.edu/plants/prunus-serrulata/) |

## Lotus center revision

The yellow structures around the receptacle are stamens, which carry pollen. A flower at anthesis should not have the conspicuous mature seed pattern of a dry seed head. The model now has shallow carpel sockets and small stigma tips on a continuous, tapered receptacle, surrounded by 156 individually posed stamens with paired anther chambers and pale connective appendages. The count and dimensions are artistic choices, not a species-wide anatomical constant.

The lotus leaf is a curved, sealed, circular blade with radial veins and a separate petiole rising from the plant base, independent of the flower stalk.

## Rendering and interpretation

Macro views keep high pixel density and use finer petal subdivisions. Depth-of-field and glow effects are omitted to preserve visible organ detail. Pigments, subtle papillae, vein relief, and back-light response remain real-time material approximations. Flowering is a reversible artistic animation, not a time-resolved biological simulation.

WebGL 2 renders these structures and their physical materials. vgpu supplies procedural tissue data and studio HDR illumination when WebGPU is available; matching GLSL/CPU fallbacks preserve viewing on WebGL-only devices. These generated textures encode surface properties and light, not images of flowers.

The header/favicon flower emblem and the blooming SVG loading ornament are interface graphics. The loader intentionally depicts a stylized flower rather than a particular species; it is separate from the modeled specimens and is not a botanical reference.

The collection is a botanical art experience. It is not a scientific identification key, a measured anatomical reconstruction, or a claim of photographic equivalence.
