import { MeshPhysicalMaterial } from "three";
import { tissueUniforms } from "@/lib/gpu/tissue-atlas";

/** Fine reproductive tissue: matte microrelief without emissive glow or blur. */
export function createPassionOrganMaterial() {
  const material = new MeshPhysicalMaterial({
    vertexColors: true,
    roughness: 0.72,
    sheen: 0.08,
    sheenRoughness: 0.85,
  });
  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, tissueUniforms);
    shader.vertexShader = shader.vertexShader.replace(
      "#include <common>",
      "#include <common>\nvarying vec3 vOrganPosition;",
    );
    shader.vertexShader = shader.vertexShader.replace(
      "#include <project_vertex>",
      "vOrganPosition = transformed;\n#include <project_vertex>",
    );
    shader.fragmentShader = shader.fragmentShader.replace(
      "#include <common>",
      `#include <common>
      varying vec3 vOrganPosition;
      uniform sampler2D uTissueAtlas; uniform bool uTissueReady;
      float organHash(vec3 p) {
        p = fract(p * .1031); p += dot(p, p.yzx + 33.33);
        return fract((p.x + p.y) * p.z);
      }
      float organNoise(vec3 p) {
        vec3 i = floor(p), f = fract(p); f = f*f*(3.-2.*f);
        return mix(mix(mix(organHash(i),organHash(i+vec3(1,0,0)),f.x),
          mix(organHash(i+vec3(0,1,0)),organHash(i+vec3(1,1,0)),f.x),f.y),
          mix(mix(organHash(i+vec3(0,0,1)),organHash(i+vec3(1,0,1)),f.x),
          mix(organHash(i+vec3(0,1,1)),organHash(i+vec3(1,1,1)),f.x),f.y),f.z);
      }`,
    );
    shader.fragmentShader = shader.fragmentShader.replace(
      "#include <color_fragment>",
      `#include <color_fragment>
      float detailVisibility = 1.-smoothstep(.003,.015,length(fwidth(vOrganPosition)));
      float cells = uTissueReady ? texture2D(uTissueAtlas, fract(vOrganPosition.xy*2.3+vOrganPosition.z*.7)).b
        : organNoise(vOrganPosition*230.);
      float mottling = organNoise(vOrganPosition*45.);
      diffuseColor.rgb *= .97 + .045*mottling;`,
    );
    shader.fragmentShader = shader.fragmentShader.replace(
      "#include <roughnessmap_fragment>",
      `#include <roughnessmap_fragment>
      roughnessFactor = clamp(roughnessFactor + (cells-.5)*.16*detailVisibility,.5,.95);`,
    );
    shader.fragmentShader = shader.fragmentShader.replace(
      "#include <normal_fragment_maps>",
      `#include <normal_fragment_maps>
      float relief = (cells-.5)*.0002*detailVisibility;
      vec3 dx=dFdx(-vViewPosition), dy=dFdy(-vViewPosition);
      vec3 r1=cross(dy,normal), r2=cross(normal,dx);
      float determinant=dot(dx,r1);
      normal=normalize(abs(determinant)*normal-sign(determinant)*(dFdx(relief)*r1+dFdy(relief)*r2));`,
    );
  };
  material.customProgramCacheKey = () => "passionflower-reproductive-tissue-v1";
  return material;
}
