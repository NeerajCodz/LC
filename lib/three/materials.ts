import { Color, MeshPhysicalMaterial, DoubleSide, FrontSide } from "three";
import type { PetalPalette } from "../flowers/palettes";

/** Veins and papillae are evaluated in petal UV space; no image assets are used. */
export function createPetalMaterial(
  color: string,
  roughness: number,
  sheen: number,
  spots = 0,
  palette?: PetalPalette,
  layerDepth = 0,
) {
  const body = new Color(palette?.body ?? color);
  const root = palette
    ? new Color(palette.root)
    : body.clone().multiplyScalar(0.48);
  const tip = palette
    ? new Color(palette.tip)
    : body.clone().lerp(new Color("#fff0e3"), 0.14);
  const vein = palette
    ? new Color(palette.vein)
    : body.clone().multiplyScalar(0.7);
  const material = new MeshPhysicalMaterial({
    color: "#ffffff",
    roughness,
    metalness: 0,
    sheen: sheen * 0.45,
    sheenColor: body.clone().lerp(new Color("#fff1df"), 0.08),
    sheenRoughness: 0.75,
    side: DoubleSide,
    shadowSide: FrontSide,
    vertexColors: true,
    clearcoat: 0.015,
    clearcoatRoughness: 0.65,
  });
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uSpots = { value: spots };
    shader.uniforms.uPigmentRoot = { value: root };
    shader.uniforms.uPigmentBody = { value: body };
    shader.uniforms.uPigmentTip = { value: tip };
    shader.uniforms.uPigmentVein = { value: vein };
    shader.uniforms.uRootFalloff = { value: palette?.rootFalloff ?? 0.5 };
    shader.uniforms.uTipStart = { value: palette?.tipStart ?? 0.7 };
    shader.uniforms.uVeinStrength = { value: palette?.veinStrength ?? 0.07 };
    shader.uniforms.uLayerDepth = { value: layerDepth };
    shader.vertexShader = shader.vertexShader.replace(
      "#include <common>",
      "#include <common>\nvarying vec2 vPetalUv;",
    );
    shader.vertexShader = shader.vertexShader.replace(
      "#include <begin_vertex>",
      "#include <begin_vertex>\nvPetalUv = uv;",
    );
    shader.fragmentShader = shader.fragmentShader.replace(
      "#include <common>",
      `#include <common>
      varying vec2 vPetalUv; uniform float uSpots;
      uniform vec3 uPigmentRoot, uPigmentBody, uPigmentTip, uPigmentVein;
      uniform float uRootFalloff, uTipStart, uVeinStrength, uLayerDepth;
      float hash21(vec2 p) { return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453); }
      float tissueNoise(vec2 p) {
        vec2 i=floor(p), f=fract(p); f=f*f*(3.-2.*f);
        return mix(mix(hash21(i),hash21(i+vec2(1,0)),f.x),mix(hash21(i+vec2(0,1)),hash21(i+vec2(1,1)),f.x),f.y);
      }`,
    );
    shader.fragmentShader = shader.fragmentShader.replace(
      "#include <color_fragment>",
      `#include <color_fragment>
      float v = vPetalUv.y;
      float u = abs(vPetalUv.x-.5)*2.0;
      float veinPhase=(vPetalUv.x-.5)*93.0+sin(v*7.0)*1.8+tissueNoise(vPetalUv*8.)*.65;
      float veinVisibility=1.-smoothstep(.2,1.2,fwidth(veinPhase));
      float veins = pow(abs(sin(veinPhase)),20.0)*veinVisibility;
      float edgePigment = smoothstep(uTipStart,1.0,v) * (.8 + .2*u*u);
      vec3 pigment = mix(uPigmentRoot,uPigmentBody,smoothstep(0.0,uRootFalloff,v));
      pigment = mix(pigment,uPigmentTip,edgePigment);
      pigment = mix(pigment,uPigmentVein,veins*uVeinStrength*sin(v*3.14159));
      float mottling = tissueNoise(vPetalUv*vec2(11.,18.))-.5;
      pigment *= (1.0 + mottling*.07) * (1.0-uLayerDepth*.15);
      diffuseColor.rgb *= pigment;
      vec2 cell = vPetalUv * vec2(17., 22.);
      vec2 id = floor(cell);
      float speckle = smoothstep(.15,.07,length(fract(cell)-vec2(hash21(id),hash21(id+7.))));
      diffuseColor.rgb *= 1.0 - speckle * uSpots * .75 * (1.0-smoothstep(.5,.85,v));`,
    );
    shader.fragmentShader = shader.fragmentShader.replace(
      "#include <roughnessmap_fragment>",
      `#include <roughnessmap_fragment>
      float cellVisibility=1.-smoothstep(.003,.012,length(fwidth(vPetalUv)));
      roughnessFactor = clamp(roughnessFactor + (tissueNoise(vPetalUv * 340.0) - .5) * .09 * cellVisibility, .3, .95);`,
    );
    shader.fragmentShader = shader.fragmentShader.replace(
      "#include <normal_fragment_maps>",
      `#include <normal_fragment_maps>
      float ridge = sin(veinPhase);
      float microHeight = ridge * .000085 * sin(vPetalUv.y*3.14159) * veinVisibility
        + (tissueNoise(vPetalUv*340.)-.5)*.000014*cellVisibility;
      vec3 dpdx=dFdx(-vViewPosition), dpdy=dFdy(-vViewPosition);
      vec3 r1=cross(dpdy,normal), r2=cross(normal,dpdx);
      float determinant=dot(dpdx,r1);
      normal=normalize(abs(determinant)*normal-sign(determinant)*(dFdx(microHeight)*r1+dFdy(microHeight)*r2));`,
    );
    shader.fragmentShader = shader.fragmentShader.replace(
      "#include <lights_physical_pars_fragment>",
      `#include <lights_physical_pars_fragment>
      void RE_Direct_Botanical(const in IncidentLight light, const in vec3 gp, const in vec3 gn, const in vec3 gv, const in vec3 gc, const in PhysicalMaterial pm, inout ReflectedLight reflected) {
        RE_Direct_Physical(light,gp,gn,gv,gc,pm,reflected);
        float scatter=pow(clamp(dot(-gn,light.direction)+.22,0.0,1.0),2.0);
        reflected.directDiffuse+=light.color*pm.diffuseColor*scatter*.11;
      }
      #undef RE_Direct
      #define RE_Direct RE_Direct_Botanical`,
    );
  };
  material.customProgramCacheKey = () => "botanical-pigment-v4";
  return material;
}
