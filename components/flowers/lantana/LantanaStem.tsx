import { useEffect, useMemo } from "react";
import { MeshStandardMaterial } from "three";
import type { StemProps } from "@/components/flowers/Stem";
import {
  BotanicalStem,
  type StemAnatomy,
} from "@/components/flowers/BotanicalStem";
import { useActiveFrame } from "@/hooks/useActiveFrame";
import { supportedBendSlope, supportedBendWeight } from "@/lib/flowers/wind";
import { LANTANA_STALKS } from "./lantanaGeometry";
import {
  createLantanaShoot,
  LANTANA_LEAF_TILT,
  LANTANA_LEAF_NODES,
} from "./lantanaLeaf";
import { LantanaLeaf } from "./LantanaFoliage";
const anatomy: StemAnatomy = {
  axis: false,
  color: "#857057",
  leafTilt: LANTANA_LEAF_TILT,
  headExtras: LANTANA_STALKS,
  nodes: LANTANA_LEAF_NODES,
};
function LantanaAxis({
  quality,
  length,
  radius,
  growth,
  motion,
}: {
  quality: StemProps["quality"];
  length: number;
  radius: number;
  growth: StemProps["growth"];
  motion: StemProps["motion"];
}) {
  const resources = useMemo(() => {
      const geometry = createLantanaShoot(quality, length, radius);
      return {
        geometry,
        p: Float32Array.from(geometry.getAttribute("position").array),
        n: Float32Array.from(geometry.getAttribute("normal").array),
      };
    }, [quality, length, radius]),
    material = useMemo(
      () => new MeshStandardMaterial({ vertexColors: true, roughness: 0.88 }),
      [],
    );
  useEffect(() => () => resources.geometry.dispose(), [resources]);
  useEffect(() => () => material.dispose(), [material]);
  useActiveFrame(() => {
    const p = resources.geometry.getAttribute("position"),
      n = resources.geometry.getAttribute("normal"),
      g = Math.max(0.03, growth.current),
      m = motion.current;
    for (let i = 0; i < p.count; i++) {
      const k = i * 3,
        t = Math.max(0, Math.min(1, (resources.p[k + 1] + length) / length)),
        w = supportedBendWeight(t, 0),
        s = supportedBendSlope(t, 0) / length,
        nx = resources.n[k],
        nz = resources.n[k + 2],
        ny =
          (resources.n[k + 1] - s * (nx * m.x + nz * m.z)) /
          Math.max(0.02, g - m.drop * s),
        inv = 1 / Math.hypot(nx, ny, nz);
      p.setXYZ(
        i,
        resources.p[k] + m.x * w,
        -length + (resources.p[k + 1] + length) * g - m.drop * w,
        resources.p[k + 2] + m.z * w,
      );
      n.setXYZ(i, nx * inv, ny * inv, nz * inv);
    }
    p.needsUpdate = n.needsUpdate = true;
  }, -0.2);
  return (
    <group dispose={null}>
      <mesh
        geometry={resources.geometry}
        material={material}
        castShadow
        receiveShadow
        frustumCulled={false}
      />
    </group>
  );
}
export function LantanaStem(props: StemProps) {
  return (
    <group>
      <LantanaAxis
        quality={props.quality}
        length={props.structure.stemLength}
        radius={props.structure.stemRadius}
        growth={props.growth}
        motion={props.motion}
      />
      <BotanicalStem {...props} anatomy={anatomy} LeafComponent={LantanaLeaf} />
    </group>
  );
}
