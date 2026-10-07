import { useEffect, useMemo } from "react";
import type { Quality } from "@/lib/flowers/types";
import { specimenGeometry } from "@/lib/three/specimenModel";
import { createSpecimenMaterial } from "@/lib/three/specimenMaterials";
import { BEGONIA_LEAF } from "./begoniaLeaf";
export function BegoniaLeaf({ quality }: { quality: Quality }) {
  const geometry = useMemo(
    () => specimenGeometry(BEGONIA_LEAF, quality),
    [quality],
  );
  const material = useMemo(() => {
    const m = createSpecimenMaterial("hardy-begonia", "bract", "#426b44"),
      previous = m.onBeforeCompile;
    m.roughness = 0.71;
    m.sheen = 0.12;
    m.onBeforeCompile = (s, r) => {
      previous.call(m, s, r);
      s.fragmentShader = s.fragmentShader.replace(
        "#include <roughnessmap_fragment>",
        `float bgAcross=abs(vPetalUv.x-.5);
      float bgMid=exp(-bgAcross*95.);
      float bgBranch=pow(.5+.5*cos((vPetalUv.y-bgAcross*.7)*61.),28.);
      diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.31,.065,.085),(bgMid*.65+bgBranch*.23));
      diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.25,.075,.10),step(vTissueSide,0.)*.75);
      #include <roughnessmap_fragment>`,
      );
    };
    m.customProgramCacheKey = () => "begonia-asymmetric-leaf-v1";
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
