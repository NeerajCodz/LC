import { useEffect, useMemo } from "react";
import { Color, type BufferGeometry } from "three";
import type { FlowerType, Quality, Vec3 } from "@/lib/flowers/types";
import { createSpecimenMaterial } from "@/lib/three/specimenMaterials";

export interface BladePigment {
  color: string;
  underside: string;
  vein: string;
  roughness: number;
  venation: "parallel" | "palmate" | "pinnate";
  pubescence?: number;
}
export interface BladePose {
  position: Vec3;
  rotation: Vec3;
  scale: number;
}
const SINGLE_BLADE: BladePose[] = [
  { position: [0, 0, 0], rotation: [0, 0, 0], scale: 1 },
];
/** Geometry and pigment are supplied by each species, with shared retention and cleanup. */
export function BotanicalBlade({
  type,
  quality,
  create,
  pigment,
  poses = SINGLE_BLADE,
}: {
  type: FlowerType;
  quality: Quality;
  create: (q: Quality) => BufferGeometry;
  pigment: BladePigment;
  poses?: BladePose[];
}) {
  const geometry = useMemo(() => create(quality), [create, quality]);
  const material = useMemo(() => {
    const m = createSpecimenMaterial(type, "bract", pigment.color, "leaf"),
      prev = m.onBeforeCompile;
    m.roughness = pigment.roughness;
    m.sheen = 0.07 + (pigment.pubescence ?? 0) * 0.2;
    const back = new Color(pigment.underside),
      vein = new Color(pigment.vein);
    const rgb = (c: Color) =>
      `vec3(${c.r.toFixed(6)},${c.g.toFixed(6)},${c.b.toFixed(6)})`;
    m.onBeforeCompile = (s, r) => {
      prev.call(m, s, r);
      const veins =
        pigment.venation === "parallel"
          ? `float bladeVein=pow(.5+.5*cos(vPetalUv.x*57.),22.);`
          : pigment.venation === "palmate"
            ? `float bladeVein=pow(.5+.5*cos(atan(vPetalUv.x-.5,max(.04,vPetalUv.y))*16.),25.);`
            : `float bladeVein=exp(-abs(vPetalUv.x-.5)*90.)+pow(.5+.5*cos((vPetalUv.y-abs(vPetalUv.x-.5)*.72)*53.),24.)*.4;`;
      s.fragmentShader = s.fragmentShader.replace(
        "#include <roughnessmap_fragment>",
        `${veins}
        diffuseColor.rgb=mix(diffuseColor.rgb,${rgb(vein)},clamp(bladeVein*.30,0.,.6));
        diffuseColor.rgb=mix(diffuseColor.rgb,${rgb(back)},step(vTissueSide,0.)*.7);
        #include <roughnessmap_fragment>`,
      );
    };
    m.customProgramCacheKey = () =>
      `botanical-blade-${type}-${pigment.venation}-${pigment.underside}-${pigment.vein}`;
    return m;
  }, [type, pigment]);
  useEffect(() => () => geometry.dispose(), [geometry]);
  useEffect(() => () => material.dispose(), [material]);
  return (
    <group dispose={null}>
      {poses.map((pose, i) => (
        <mesh
          key={i}
          position={pose.position}
          rotation={pose.rotation}
          scale={pose.scale}
          geometry={geometry}
          material={material}
          onUpdate={(m) => m.updateMorphTargets()}
          castShadow
          receiveShadow
        />
      ))}
    </group>
  );
}
