# Blue passionflower research

Specimen: _Passiflora caerulea_ L., available at `/flower/passionflower/`, in the collection and in the garden. Sources reviewed September 13, 2026. This is an authored botanical study, not a calibrated reconstruction of an individual plant.

## Construction evidence

[Passiflora Society's species account](https://passiflorasociety.org/wp-content/uploads/CH_caerulea.pdf) describes white inner tepal surfaces, a green sepal exterior with a dorsal keel and awn, and four corona series. The longer outer corona filaments have purple bases, pale middles and blue tips; the inner series are shorter and upright. The nectar ring, operculum and raised reproductive axis need separate structures. Leaves are deeply palmately divided, commonly into five lobes, with variation; petioles carry glands. Tendrils and climbing stems must be represented as vine organs, rather than treating this species as a freestanding herb.

[NC State's species page](https://plants.ces.ncsu.edu/plants/passiflora-caerulea/) supplies independent whole-plant, flower and foliage views for checking proportions and attachments. Use those views to check anatomy; no source photographs become rendered specimen assets.

## Implemented construction

- `PassionCorolla` creates five independently opening sepals, five alternating petals and three basal bracts. The sepal exterior carries green pigment; the inner surface is ivory. Separate dorsal awns deform with their sepals. The default calyx is replaced by these organs.
- `PassionHeart` renders four instanced corona series with tapered, curved, sealed tubes. The long series have three longitudinal pigment zones; the short series remain upright. A nectar ridge, pale inner collar, operculum fringe and elevated androgynophore sit below five pivoting stamens with paired anther chambers, an ovoid ovary and three spreading styles with receptive pads.
- `PassionVine` supplies a grooved green shoot, a woody support, coiled tendrils, small stipules, gland-bearing petioles and alternate simple leaves. Each leaf is one connected, thick, five-lobed blade, with geometric primary ridges and finer pigment veins. Leaves unfold and move independently of the supported shoot.
- The authored flower spans approximately 2.6 scene units. Reading that span as an approximately 9 cm flower gives a modeling reference scale of about 3.5 cm per unit. The modeled shoot is a cropped presentation of a vine, not its whole mature extent. Organ proportions, corona counts and local variation are selected visual parameters; the published dimensional ranges do not establish one universal plant.
- Bloom uses local rotations, normal-aware morphs and independently delayed organs. The corona roots contract inside the bud, and the inner petals compact behind the enclosing sepals. Cursor response, a restrained bloom pulse and filament flutter use existing interaction refs. Opening/closing remains an artistic reversible sequence.
- The supported portion stays fixed during wind. A normalized support at 0.73 of the shoot height defines the free peduncle. Displacement and slope are zero at that boundary; head tilt and shortening use the free length. This represents an ideal fixed support, not elastic tendril/support coupling or a measured vine model.

## Rendering and verification

All parts render in WebGL 2. Petal tissue detail uses the existing vgpu tissue atlas when available, with GLSL fallback; the shared optional HDR bake supplies studio illumination. Fine organs use vertex pigment and physical materials. Reproductive tissue adds filtered microrelief and roughness variation from the shared atlas, with procedural GLSL noise when the atlas is unavailable. No extra GPU bake, imported plant asset, depth-of-field or glow is introduced.

Quality levels retain all corona and reproductive organs while reducing tessellation. Four corona instanced meshes contain fewer than 16,000 submitted vertices at low quality. Materials and geometry are memoized and disposed, morphs initialize before drawing, and frame callbacks reuse scratch objects. Mobile continues to use the shared framebuffer and frame scheduling budgets.

`tests/passionflower.test.ts` checks sealed and consistently wound shells, finite unit normals in open/folded states, deterministic construction, five connected leaf lobes, corona pigment zones and the supported boundary's derivative. The browser expansion scenario includes the specimen's route, reverse bloom, macro controls and garden selection. Use the seven-view inspection fixture after geometry changes and the public route for mobile/render-budget checks. Passing these tests does not prove anatomical perfection, calibrated physics or real-device frame rates.

## Physics evidence still needed

The above sources describe anatomy, not calibrated elastic moduli, damping, drag coefficients, petal opening trajectories or pollen release rates. Exact biological simulation remains unverified. Any interim motion parameters must be labeled authored, with support constraints and organ-specific motion tested separately. A rendered model or a passing numerical test alone cannot close this evidence gap.
