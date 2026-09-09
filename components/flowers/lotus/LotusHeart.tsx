import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  type RefObject,
} from "react";
import { useActiveFrame as useFrame } from "@/hooks/useActiveFrame";
import {
  Group,
  InstancedMesh,
  MeshPhysicalMaterial,
  Object3D,
  SphereGeometry,
} from "three";
import type { Quality } from "@/lib/flowers/types";
import {
  createLotusReceptacle,
  createLotusStamenParts,
  lotusCarpels,
  lotusStamenLayout,
  receptacleTop,
} from "./lotusHeartGeometry";

export function LotusHeart({
  bloom,
  radius,
  height,
  quality,
}: {
  bloom: RefObject<number>;
  radius: number;
  height: number;
  quality: Quality;
}) {
  const root = useRef<Group>(null);
  const filaments = useRef<InstancedMesh>(null),
    anthers = useRef<InstancedMesh>(null),
    appendages = useRef<InstancedMesh>(null),
    stigmas = useRef<InstancedMesh>(null);
  const dummy = useMemo(() => new Object3D(), []);
  const carpels = useMemo(() => lotusCarpels(radius), [radius]);
  const stamens = useMemo(() => lotusStamenLayout(), []);
  const receptacle = useMemo(
    () => createLotusReceptacle(radius, height, quality),
    [radius, height, quality],
  );
  const parts = useMemo(() => createLotusStamenParts(quality), [quality]);
  const stigma = useMemo(() => new SphereGeometry(1, 16, 10), []);
  const material = useMemo(() => {
    const m = new MeshPhysicalMaterial({
      vertexColors: true,
      roughness: 0.64,
      sheen: 0.16,
      sheenRoughness: 0.85,
    });
    m.onBeforeCompile = (s) => {
      s.vertexShader = s.vertexShader
        .replace(
          "#include <common>",
          "#include <common>\nvarying vec3 vTissue;",
        )
        .replace(
          "#include <begin_vertex>",
          "#include <begin_vertex>\nvTissue=position;",
        );
      s.fragmentShader = s.fragmentShader
        .replace(
          "#include <common>",
          "#include <common>\nvarying vec3 vTissue;",
        )
        .replace(
          "#include <roughnessmap_fragment>",
          `#include <roughnessmap_fragment>
      float grain=sin(vTissue.x*2300.)*sin(vTissue.y*1900.)*sin(vTissue.z*2700.);
      roughnessFactor=clamp(roughnessFactor+grain*.08,.4,.9);`,
        );
    };
    m.customProgramCacheKey = () => "lotus-living-tissue-v1";
    return m;
  }, []);
  useLayoutEffect(() => {
    carpels.forEach((carpel, i) => {
      dummy.position.set(
        carpel.x,
        receptacleTop(carpel.x, carpel.z, radius, height, carpels) + 0.003,
        carpel.z,
      );
      dummy.scale.set(carpel.radius * 0.46, 0.003, carpel.radius * 0.46);
      dummy.rotation.set(0, i * 2.4, 0);
      dummy.updateMatrix();
      stigmas.current?.setMatrixAt(i, dummy.matrix);
    });
    if (stigmas.current) stigmas.current.instanceMatrix.needsUpdate = true;
  }, [carpels, radius, height, dummy]);
  useEffect(
    () => () => {
      receptacle.dispose();
      Object.values(parts).forEach((g) => g.dispose());
      material.dispose();
      stigma.dispose();
    },
    [receptacle, parts, material, stigma],
  );
  useFrame(() => {
    const open = bloom.current;
    if (root.current)
      root.current.scale.set(
        0.19 + open * 0.81,
        0.35 + open * 0.65,
        0.19 + open * 0.81,
      );
    stamens.forEach((stamen, i) => {
      dummy.position.set(
        Math.sin(stamen.angle) * stamen.radius,
        stamen.y,
        Math.cos(stamen.angle) * stamen.radius,
      );
      dummy.rotation.set(0, stamen.angle, 0);
      dummy.rotateX(stamen.opening * open - 0.09 * (1 - open));
      dummy.rotateZ(Math.sin(stamen.phase) * 0.055 * open);
      dummy.scale.set(1, stamen.length, 1);
      dummy.updateMatrix();
      filaments.current?.setMatrixAt(i, dummy.matrix);
      anthers.current?.setMatrixAt(i, dummy.matrix);
      appendages.current?.setMatrixAt(i, dummy.matrix);
    });
    if (filaments.current) filaments.current.instanceMatrix.needsUpdate = true;
    if (anthers.current) anthers.current.instanceMatrix.needsUpdate = true;
    if (appendages.current)
      appendages.current.instanceMatrix.needsUpdate = true;
  });
  return (
    <group ref={root}>
      <mesh
        geometry={receptacle}
        material={material}
        castShadow
        receiveShadow
      />
      <instancedMesh
        ref={filaments}
        args={[parts.filament, material, stamens.length]}
        frustumCulled={false}
        castShadow
      />
      <instancedMesh
        ref={anthers}
        args={[parts.anther, material, stamens.length]}
        frustumCulled={false}
        castShadow
        receiveShadow
      />
      <instancedMesh
        ref={appendages}
        args={[parts.appendage, material, stamens.length]}
        frustumCulled={false}
        castShadow
      />
      <instancedMesh
        ref={stigmas}
        args={[stigma, undefined, carpels.length]}
        frustumCulled={false}
      >
        <meshPhysicalMaterial color="#8f802b" roughness={0.7} />
      </instancedMesh>
    </group>
  );
}
