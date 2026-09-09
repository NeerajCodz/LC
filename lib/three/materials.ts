import { Color, MeshPhysicalMaterial, DoubleSide, FrontSide } from "three";

/** Veins and papillae are evaluated in petal UV space; no image assets are used. */
export function createPetalMaterial(
  color: string,
  roughness: number,
  sheen: number,
  spots = 0,
) {
  const material = new MeshPhysicalMaterial({
    color,
    roughness,
    metalness: 0,
    sheen,
    sheenColor: new Color(color).lerp(new Color("#fff1df"), 0.55),
    sheenRoughness: 0.75,
    side: DoubleSide,
    shadowSide: FrontSide,
    vertexColors: true,
    clearcoat: 0.025,
    clearcoatRoughness: 0.65,
  });
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uSpots = { value: spots };
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
      float hash21(vec2 p) { return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453); }`,
    );
    shader.fragmentShader = shader.fragmentShader.replace(
      "#include <color_fragment>",
      `#include <color_fragment>
      float v = vPetalUv.y;
      float veins = pow(abs(sin((vPetalUv.x - .5) * 93.0 + sin(v * 7.0) * 1.8)), 16.0);
      diffuseColor.rgb *= 1.0 - veins * .055 * sin(v * 3.14159);
      diffuseColor.rgb = mix(diffuseColor.rgb * vec3(.72,.55,.61), diffuseColor.rgb, smoothstep(.0,.6,v));
      vec2 cell = vPetalUv * vec2(17., 22.);
      vec2 id = floor(cell);
      float speckle = smoothstep(.15,.07,length(fract(cell)-vec2(hash21(id),hash21(id+7.))));
      diffuseColor.rgb *= 1.0 - speckle * uSpots * .75 * (1.0-smoothstep(.5,.85,v));`,
    );
    shader.fragmentShader = shader.fragmentShader.replace(
      "#include <roughnessmap_fragment>",
      `#include <roughnessmap_fragment>
      roughnessFactor = clamp(roughnessFactor + (hash21(floor(vPetalUv * 850.0)) - .5) * .075, .3, .95);`,
    );
    shader.fragmentShader = shader.fragmentShader.replace(
      "#include <normal_fragment_maps>",
      `#include <normal_fragment_maps>
      float ridge = sin((vPetalUv.x-.5)*93.0+sin(vPetalUv.y*7.0)*1.8);
      float microHeight = ridge * .0007 * sin(vPetalUv.y*3.14159);
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
  material.customProgramCacheKey = () => `botanical-surface-v2-${spots}`;
  return material;
}
