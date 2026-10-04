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
  if (type === "sweet-pea" && (role === "wing" || role === "keel"))
    m.sheenColor.set("#795ca5");
  if (type === "plumeria" && !green) {
    m.roughness = 0.44;
    m.clearcoat = 0.1;
    m.clearcoatRoughness = 0.48;
  }
  m.onBeforeCompile = (s, r) => {
    previous.call(m, s, r);
    if (type === "sweet-pea" && (role === "wing" || role === "keel"))
      s.fragmentShader = s.fragmentShader.replace(
        "#include <roughnessmap_fragment>",
        "diffuseColor.rgb*=vec3(.70,.71,1.05);\n#include <roughnessmap_fragment>",
      );
    s.vertexShader = s.vertexShader
      .replace(
        "#include <common>",
        "#include <common>\nattribute float tissueSide; varying float vTissueSide;",
      )
      .replace(
        "#include <begin_vertex>",
        "#include <begin_vertex>\nvTissueSide=tissueSide;",
      );
    s.fragmentShader = s.fragmentShader.replace(
      "#include <common>",
      "#include <common>\nvarying float vTissueSide;",
    );
    if (type === "foxglove" && !green)
      s.fragmentShader = s.fragmentShader.replace(
        "#include <roughnessmap_fragment>",
        `float inside=step(vTissueSide,0.);
      vec2 cells=vPetalUv*vec2(15.,16.),id=floor(cells);
      vec2 jitter=vec2(hash21(id),hash21(id+12.));
      float spot=1.-smoothstep(.10,.19,length(fract(cells)-.25-jitter*.5));
      float halo=1.-smoothstep(.20,.28,length(fract(cells)-.25-jitter*.5));
      float mouth=smoothstep(.4,.72,vPetalUv.y)*inside;
      diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.75,.51,.60),mouth*.62);
      diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.92,.79,.79),halo*mouth*.6);
      diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.15,.035,.075),spot*mouth*.8);
      #include <roughnessmap_fragment>`,
      );
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
