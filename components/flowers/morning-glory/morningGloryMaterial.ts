import { Color, MeshPhysicalMaterial } from "three";
import { tissueUniforms } from "@/lib/gpu/tissue-atlas";

export function createMorningCorollaMaterial(color = "#7650af") {
  const uniforms = {
    uMorningTime: { value: 0 },
    uMorningWind: { value: 0 },
    uMorningPulse: { value: 0 },
    uMorningCursor: { value: 0 },
    uMorningProximity: { value: 0 },
  };
  const material = new MeshPhysicalMaterial({
    roughness: 0.69,
    sheen: 0.24,
    sheenRoughness: 0.88,
    sheenColor: "#ada0c8",
  });
  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, tissueUniforms);
    shader.uniforms.uMorningPigment = { value: new Color(color) };
    shader.uniforms.uMorningThroat = { value: new Color("#eee8dd") };
    shader.uniforms.uMorningRib = {
      value: new Color(color).lerp(new Color("#74395c"), 0.48),
    };
    Object.assign(shader.uniforms, uniforms);
    shader.vertexShader = shader.vertexShader
      .replace(
        "#include <common>",
        `#include <common>
      varying vec2 vMorningUv, vMorningDirection;
      uniform float uMorningTime,uMorningWind,uMorningPulse,uMorningCursor,uMorningProximity;
    `,
      )
      .replace(
        "#include <begin_vertex>",
        `#include <begin_vertex>
      vMorningUv=uv; vMorningDirection=vec2(sin(uv.x*6.2831853),cos(uv.x*6.2831853));
    `,
      )
      .replace(
        "#include <morphtarget_vertex>",
        `#include <morphtarget_vertex>
      float wave=sin(uv.x*31.4159-uMorningTime*2.1)*.003*uMorningWind;
      float nearCursor=max(0.,cos(uv.x*6.2831853-uMorningCursor))*uMorningProximity*.008;
      transformed.y+=(wave+nearCursor+uMorningPulse*.008)*pow(uv.y,6.);
    `,
      );
    shader.fragmentShader = shader.fragmentShader
      .replace(
        "#include <common>",
        `#include <common>
      varying vec2 vMorningUv, vMorningDirection;
      uniform sampler2D uTissueAtlas; uniform bool uTissueReady;
      uniform vec3 uMorningPigment, uMorningThroat, uMorningRib;
      float morningNoise(vec2 p) {return sin(p.x*13.+sin(p.y*7.))*sin(p.y*19.+sin(p.x*11.))*.5+.5;}
    `,
      )
      .replace(
        "#include <color_fragment>",
        `#include <color_fragment>
      float t=vMorningUv.y, angle=atan(vMorningDirection.x,vMorningDirection.y);
      float rib=pow(.5+.5*cos(angle*5.+.12*sin(angle*2.)),18.);
      float throat=smoothstep(.38,.80,t);
      vec2 tissueUv=vec2(cos(angle),sin(angle))*(.3+t*.7);
      vec3 tissue=uTissueReady ? texture2D(uTissueAtlas,tissueUv).rgb : vec3(morningNoise(tissueUv*70.),morningNoise(tissueUv*33.),morningNoise(tissueUv*210.));
      vec3 pigment=mix(uMorningThroat,uMorningPigment,throat);
      pigment=mix(pigment,uMorningRib,rib*.43*throat);
      float veinPhase=angle*105.+sin(t*12.)*.8;
      float vein=pow(.5+.5*sin(veinPhase),20.)*(1.-smoothstep(.3,1.5,fwidth(veinPhase)));
      diffuseColor.rgb*=pigment*(.98+(tissue.g-.5)*.06-vein*.035);
    `,
      )
      .replace(
        "#include <roughnessmap_fragment>",
        `#include <roughnessmap_fragment>
      roughnessFactor=clamp(roughnessFactor+(tissue.b-.5)*.12,.52,.86);
    `,
      )
      .replace(
        "#include <normal_fragment_maps>",
        `#include <normal_fragment_maps>
      float visibility=1.-smoothstep(.004,.02,length(fwidth(vMorningUv)));
      float height=(tissue.b-.5)*.0003*visibility;
      vec3 dx=dFdx(-vViewPosition),dy=dFdy(-vViewPosition),r1=cross(dy,normal),r2=cross(normal,dx);
      float determinant=dot(dx,r1);
      normal=normalize(abs(determinant)*normal-sign(determinant)*(dFdx(height)*r1+dFdy(height)*r2));
    `,
      );
  };
  material.customProgramCacheKey = () => "morning-glory-fused-corolla-v1";
  return { material, uniforms };
}
