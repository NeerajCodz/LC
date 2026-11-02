import { useEffect, useMemo } from "react";
import { Vector3 } from "three";
import type { StemProps } from "../Stem";
import { BotanicalStem, type StemAnatomy } from "../BotanicalStem";
import { DaturaLeaf } from "./DaturaFoliage";
import {
  DATURA_FORKS,
  DATURA_FOLIAGE_NODES,
  DATURA_LEAF_TILT,
} from "./daturaLeaf";
import { specimenOrganGeometry } from "@/lib/three/specimenModel";
import { joinOrgans } from "@/lib/three/floralOrgans";
import { useActiveFrame } from "@/hooks/useActiveFrame";
import { writeDaturaBranchVertex } from "./daturaAttachments";
const anatomy: StemAnatomy = {
  color: "#80945e",
  nodes: DATURA_FOLIAGE_NODES,
  leafTilt: DATURA_LEAF_TILT,
};
export function DaturaStem(props: StemProps) {
  const data = useMemo(() => {
    const geometry = joinOrgans(
      DATURA_FORKS.map((o) => specimenOrganGeometry(o, props.quality)),
    );
    geometry.computeBoundingSphere();
    geometry.boundingSphere!.radius += 2;
    return {
      geometry,
      positions: geometry.getAttribute("position").array.slice(),
      normals: geometry.getAttribute("normal").array.slice(),
      p: new Vector3(),
      n: new Vector3(),
    };
  }, [props.quality]);
  useEffect(() => () => data.geometry.dispose(), [data]);
  useActiveFrame(() => {
    const p = data.geometry.getAttribute("position"),
      n = data.geometry.getAttribute("normal");
    for (let i = 0; i < p.count; i++) {
      data.p.fromArray(data.positions, i * 3);
      data.n.fromArray(data.normals, i * 3);
      writeDaturaBranchVertex(
        data.p,
        data.n,
        props.growth.current,
        props.motion.current,
      );
      p.setXYZ(i, data.p.x, data.p.y, data.p.z);
      n.setXYZ(i, data.n.x, data.n.y, data.n.z);
    }
    p.needsUpdate = n.needsUpdate = true;
  });
  return (
    <>
      <BotanicalStem {...props} anatomy={anatomy} LeafComponent={DaturaLeaf} />
      <mesh
        geometry={data.geometry}
        castShadow
        receiveShadow
        frustumCulled={false}
      >
        <meshStandardMaterial vertexColors roughness={0.8} />
      </mesh>
    </>
  );
}
