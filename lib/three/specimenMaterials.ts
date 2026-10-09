import type { FlowerType } from "../flowers/types";
import { PETAL_PALETTES } from "../flowers/palettes";
import { createPetalMaterial } from "./materials";
import type { SpecimenSurface } from "./specimenModel";
import {
  TISSUE_RESPONSE,
  specimenTissueColor,
  specimenTissueKind,
  specimenTissueRegion,
  SHARED_SPECIMEN_TISSUE_SHADER,
} from "./specimenTissue";

/** Species optics compose the shared tissue atlas and its GLSL fallback. */
export function createSpecimenMaterial(
  type: FlowerType,
  role: SpecimenSurface["role"],
  color?: string,
  tissue?: SpecimenSurface["tissue"],
) {
  const green = role === "calyx";
  const cream =
    (type === "bougainvillea" && role === "tube") ||
    (type === "king-protea" && role !== "bract" && !green);
  const tissueColor = specimenTissueColor(type, tissue);
  const leafPalette =
    tissue === "leaf" && color
      ? {
          root: color,
          body: color,
          tip: color,
          vein: color,
          rootFalloff: 0.2,
          tipStart: 0.8,
          veinStrength: 0,
        }
      : undefined;
  const m = createPetalMaterial(
    green
      ? "#608065"
      : cream
        ? "#f4ecd8"
        : (tissueColor ?? color ?? PETAL_PALETTES[type].body),
    green ? 0.78 : 0.63,
    green ? 0.2 : 0.5,
    0,
    leafPalette ??
      (green || cream || color || tissueColor
        ? undefined
        : PETAL_PALETTES[type]),
  );
  const response = TISSUE_RESPONSE[type];
  if (response && !green && tissue !== "leaf") {
    m.roughness = response.roughness;
    m.sheen = response.sheen;
    m.clearcoat = response.coat;
  }
  const previous = m.onBeforeCompile;
  if (type === "king-protea" && !green) {
    m.roughness = role === "bract" ? 0.66 : 0.78;
    m.sheen = role === "bract" ? 0.3 : 0.38;
    m.sheenColor.set("#d8d4cb");
    m.clearcoat = 0.015;
  }
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
    if (type === "zinnia" && green)
      s.fragmentShader = s.fragmentShader.replace(
        "#include <roughnessmap_fragment>",
        `diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.19,.10,.075),smoothstep(.54,.88,vPetalUv.y)*.46);
      #include <roughnessmap_fragment>`,
      );
    if (type === "king-protea" && !green)
      s.fragmentShader = s.fragmentShader
        .replace(
          "#include <roughnessmap_fragment>",
          `float proteaFibers=pow(.5+.5*sin(vPetalUv.x*145.+vPetalUv.y*9.),18.);
      diffuseColor.rgb*=1.-proteaFibers*.07;
      #include <roughnessmap_fragment>`,
        )
        .replace("scatter*.11", "scatter*.045")
        .replace("ridge * .000085", "ridge * .00006");
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
    if (response && !green && tissue !== "leaf") {
      s.uniforms.uSpecimenKind = { value: specimenTissueKind(type) };
      s.uniforms.uSpecimenRegion = { value: specimenTissueRegion(tissue) };
      s.uniforms.uSpecimenScatter = { value: response.scatter };
      s.fragmentShader = s.fragmentShader.replace(
        "scatter*.11",
        "scatter*uSpecimenScatter",
      );
      s.fragmentShader = s.fragmentShader
        .replace(
          "#include <common>",
          "#include <common>\nuniform int uSpecimenKind, uSpecimenRegion; uniform float uSpecimenScatter;",
        )
        .replace(
          "#include <roughnessmap_fragment>",
          `${SHARED_SPECIMEN_TISSUE_SHADER}\n#include <roughnessmap_fragment>`,
        );
    }
  };
  m.customProgramCacheKey = () => {
    if (green)
      return type === "zinnia"
        ? "specimen-calyx-zinnia-v2"
        : "specimen-calyx-v2";
    if (!green && tissue === "leaf" && response) return "specimen-calyx-v2";
    // Pigments are uniforms. Organ names alone must not compile duplicate programs.
    if (!green && response) return "specimen-shared-tissue-v3";
    // Legacy organs also share a program when only their uniform pigments differ.
    // Three adds material features (sheen, clearcoat, morphs, instancing) itself.
    if (type === "king-protea") return "specimen-protea-fibers-v2";
    if (type === "hydrangea" && role === "bract")
      return "specimen-hydrangea-veins-v2";
    if (type === "hardy-begonia") return "specimen-begonia-tissue-v2";
    if (type === "snapdragon") return "specimen-snapdragon-guides-v2";
    if (type === "cyclamen") return "specimen-cyclamen-tissue-v2";
    if (type === "bougainvillea" && role === "bract")
      return "specimen-bract-veins-v2";
    if (type === "sweet-pea" && (role === "wing" || role === "keel"))
      return "specimen-pea-wings-v2";
    if (type === "foxglove") return "specimen-foxglove-interior-v2";
    if (type === "plumeria") return "specimen-plumeria-margins-v2";
    if (type === "carnation") return "specimen-carnation-folds-v2";
    return "specimen-calyx-v2";
  };
  return m;
}
