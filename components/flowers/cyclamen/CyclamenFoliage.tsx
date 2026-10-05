import { useEffect, useMemo } from "react";
import type { Quality } from "@/lib/flowers/types";
import { specimenGeometry } from "@/lib/three/specimenModel";
import { createSpecimenMaterial } from "@/lib/three/specimenMaterials";
import { CYCLAMEN_LEAF } from "./cyclamenLeaf";
export function CyclamenLeaf({ quality }: { quality: Quality }) {
  const geometry = useMemo(
    () => specimenGeometry(CYCLAMEN_LEAF, quality),
    [quality],
  );
  const material = useMemo(() => {
    const m = createSpecimenMaterial("cyclamen", "bract", "#3e684b"),
      previous = m.onBeforeCompile;
    m.roughness = 0.56;
    m.clearcoat = 0.07;
    m.onBeforeCompile = (s, r) => {
      previous.call(m, s, r);
      s.fragmentShader = s.fragmentShader.replace(
        "#include <roughnessmap_fragment>",
        `float cyAcross=abs(vPetalUv.x-.5)*2.;
      float cyVein=pow(.5+.5*cos((vPetalUv.y-cyAcross*.45)*53.),24.);
      float cyZone=smoothstep(.12,.20,cyAcross)* (1.-smoothstep(.62,.80,cyAcross));
      cyZone*=.55+.45*sin(vPetalUv.y*8.+cyAcross*9.);
      diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.49,.59,.54),cyZone*.78);
      diffuseColor.rgb*=1.-cyVein*.15;
      diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.20,.065,.11),step(vTissueSide,0.)*.8);
      #include <roughnessmap_fragment>`,
      );
    };
    m.customProgramCacheKey = () => "cyclamen-silver-leaf-v1";
    return m;
  }, []);
  useEffect(
    () => () => {
      geometry.dispose();
      material.dispose();
    },
    [geometry, material],
  );
  return (
    <mesh
      geometry={geometry}
      material={material}
      onUpdate={(m) => m.updateMorphTargets()}
      castShadow
      receiveShadow
    />
  );
}
