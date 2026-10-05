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
  const cream = type === "bougainvillea" && role === "tube";
  const m = createPetalMaterial(
    green
      ? "#608065"
      : cream
        ? "#f4ecd8"
        : (color ?? PETAL_PALETTES[type].body),
    green ? 0.78 : 0.63,
    green ? 0.2 : 0.5,
    0,
    green || cream || color ? undefined : PETAL_PALETTES[type],
  );
  const previous = m.onBeforeCompile;
  if (type === "hydrangea" && !green) {
    m.roughness = 0.72;
    m.sheen = 0.14;
    m.clearcoat = 0;
  }
  if (type === "hardy-begonia" && !green) {
    m.roughness = 0.59;
    m.sheen = 0.23;
    m.clearcoat = 0.025;
  }
  if (type === "snapdragon" && !green) {
    m.roughness = 0.64;
    m.sheen = 0.18;
  }
  if (type === "cyclamen" && !green) {
    m.roughness = 0.57;
    m.sheen = 0.2;
  }
  if (type === "bougainvillea" && role === "bract") {
    m.roughness = 0.79;
    m.clearcoat = 0;
    m.sheen = 0.16;
  }
  if (type === "sweet-pea" && (role === "wing" || role === "keel"))
    m.sheenColor.set("#795ca5");
  if (type === "plumeria" && !green) {
    m.roughness = 0.44;
    m.clearcoat = 0.1;
    m.clearcoatRoughness = 0.48;
  }
  m.onBeforeCompile = (s, r) => {
    previous.call(m, s, r);
    if (type === "hydrangea" && role === "bract")
      s.fragmentShader = s.fragmentShader
        .replace(
          "#include <roughnessmap_fragment>",
          `float hydAcross=abs(vPetalUv.x-.5);
      float hydMid=exp(-hydAcross*100.);
      float hydBranch=pow(.5+.5*cos((vPetalUv.y-hydAcross*.72)*58.),25.);
      diffuseColor.rgb*=1.-hydMid*.09-hydBranch*.065;
      #include <roughnessmap_fragment>`,
        )
        .replace("scatter*.11", "scatter*.055");
    if (type === "hardy-begonia" && !green)
      s.fragmentShader = s.fragmentShader
        .replace("scatter*.11", "scatter*.075")
        .replace("ridge * .000085", "ridge * .000055");
    if (type === "snapdragon" && !green)
      s.fragmentShader = s.fragmentShader.replace(
        "#include <roughnessmap_fragment>",
        `float snapLower=smoothstep(.52,.70,vPetalUv.x)*(1.-smoothstep(.82,.96,vPetalUv.x));
      float snapPalate=snapLower*smoothstep(.55,.78,vPetalUv.y);
      diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.91,.67,.25),snapPalate*.80);
      diffuseColor.rgb*=1.-.065*pow(.5+.5*sin(vPetalUv.y*90.),16.);
      #include <roughnessmap_fragment>`,
      );
    if (type === "cyclamen" && !green)
      s.fragmentShader = s.fragmentShader
        .replace("scatter*.11", "scatter*.065")
        .replace("ridge * .000085", "ridge * .00007");
    if (type === "bougainvillea" && role === "bract")
      s.fragmentShader = s.fragmentShader
        .replace(
          "#include <roughnessmap_fragment>",
          `float lateral=abs(vPetalUv.x-.5), midrib=exp(-lateral*110.);
      float branch=pow(.5+.5*cos((vPetalUv.y-lateral*.72)*73.),30.)*smoothstep(.015,.065,lateral);
      diffuseColor.rgb*=1.-midrib*.18-branch*.12;
      #include <roughnessmap_fragment>`,
        )
        .replace("ridge * .000085", "ridge * .00012");
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
      vec2 cells=vPetalUv*vec2(15.,16.),foxCellId=floor(cells);
      vec2 jitter=vec2(hash21(foxCellId),hash21(foxCellId+12.));
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
