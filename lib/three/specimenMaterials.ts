import type { FlowerType } from "../flowers/types";
import { PETAL_PALETTES } from "../flowers/palettes";
import { createPetalMaterial } from "./materials";
import type { SpecimenSurface } from "./specimenModel";

/** Species optics compose the shared tissue atlas and its GLSL fallback. */
export function createSpecimenMaterial(
  type: FlowerType,
  role: SpecimenSurface["role"],
  color?: string,
) {
  const green = role === "calyx";
  const m = createPetalMaterial(
    green ? "#608065" : (color ?? PETAL_PALETTES[type].body),
    green ? 0.78 : 0.63,
    green ? 0.2 : 0.5,
    0,
    green || color ? undefined : PETAL_PALETTES[type],
  );
  const previous = m.onBeforeCompile;
  if (type === "plumeria" && !green) {
    m.roughness = 0.44;
    m.clearcoat = 0.1;
    m.clearcoatRoughness = 0.48;
  }
  m.onBeforeCompile = (s, r) => {
    previous.call(m, s, r);
    if (type === "plumeria" && !green)
      s.fragmentShader = s.fragmentShader
        .replace(
          "smoothstep(uTipStart,1.0,v) * (.8 + .2*u*u)",
          "smoothstep(.72,1.0,u)*smoothstep(.35,.8,v)*.7+smoothstep(.9,1.0,v)*.15",
        )
        .replace("scatter*.11", "scatter*.055");
    if (type === "carnation" && !green)
      s.fragmentShader = s.fragmentShader.replace(
        "#include <color_fragment>",
        `#include <color_fragment>
      diffuseColor.rgb*=1.-.055*pow(abs(sin(vPetalUv.x*35.+vPetalUv.y*7.)),8.);`,
      );
  };
  m.customProgramCacheKey = () => `specimen-${type}-${role}-v1`;
  return m;
}
