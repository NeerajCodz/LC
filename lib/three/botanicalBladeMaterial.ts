import { Color } from "three";
import type { FlowerType } from "../flowers/types";
import { createSpecimenMaterial } from "./specimenMaterials";

export interface BladePigment {
  color: string;
  underside: string;
  vein: string;
  roughness: number;
  venation: "parallel" | "palmate" | "pinnate";
  pubescence?: number;
}

/** Pigment lives in per-material uniforms; only venation changes shader source. */
export function createBotanicalBladeMaterial(
  type: FlowerType,
  pigment: BladePigment,
) {
  const material = createSpecimenMaterial(type, "bract", pigment.color, "leaf");
  const previous = material.onBeforeCompile;
  const baseKey = material.customProgramCacheKey();
  const underside = new Color(pigment.underside),
    vein = new Color(pigment.vein);
  material.roughness = pigment.roughness;
  material.sheen = 0.07 + (pigment.pubescence ?? 0) * 0.2;
  const veins =
    pigment.venation === "parallel"
      ? `float bladeVein=pow(.5+.5*cos(vPetalUv.x*57.),22.);`
      : pigment.venation === "palmate"
        ? `float bladeVein=pow(.5+.5*cos(atan(vPetalUv.x-.5,max(.04,vPetalUv.y))*16.),25.);`
        : `float bladeVein=exp(-abs(vPetalUv.x-.5)*90.)+pow(.5+.5*cos((vPetalUv.y-abs(vPetalUv.x-.5)*.72)*53.),24.)*.4;`;
  material.onBeforeCompile = (shader, renderer) => {
    previous.call(material, shader, renderer);
    shader.uniforms.uBladeUnderside = { value: underside };
    shader.uniforms.uBladeVein = { value: vein };
    shader.fragmentShader = shader.fragmentShader
      .replace(
        "#include <common>",
        "#include <common>\nuniform vec3 uBladeUnderside; uniform vec3 uBladeVein;",
      )
      .replace(
        "#include <roughnessmap_fragment>",
        `${veins}
        diffuseColor.rgb=mix(diffuseColor.rgb,uBladeVein,clamp(bladeVein*.30,0.,.6));
        diffuseColor.rgb=mix(diffuseColor.rgb,uBladeUnderside,step(vTissueSide,0.)*.7);
        #include <roughnessmap_fragment>`,
      );
  };
  material.customProgramCacheKey = () =>
    `${baseKey}-blade-${pigment.venation}-v2`;
  return material;
}
