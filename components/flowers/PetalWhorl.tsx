import { useEffect, useLayoutEffect, useMemo, useRef, type RefObject } from 'react';
import { useFrame } from '@react-three/fiber';
import { Color, DynamicDrawUsage, InstancedMesh, Mesh, Object3D } from 'three';
import type { PetalLayer, Quality } from '@/lib/flowers/types';
import { createPetalGeometry } from '@/lib/three/geometry';
import { createPetalMaterial } from '@/lib/three/materials';
import { seededRandom } from '@/lib/three/noise';
import { petalOpenness } from '@/lib/three/easing';

interface Props { layer: PetalLayer; color: string; seed: number; quality: Quality; bloom: RefObject<number>; time: RefObject<number>; wind: number; roughness: number; sheen: number; pulse: RefObject<number>; cursor: RefObject<number> }
export function PetalWhorl({ layer, color, seed, quality, bloom, time, wind, roughness, sheen, pulse, cursor }: Props) {
  const mesh = useRef<InstancedMesh>(null);
  const dummy = useMemo(() => new Object3D(), []);
  const geometry = useMemo(() => createPetalGeometry(layer.profile, seed, quality), [layer.profile, seed, quality]);
  const material = useMemo(() => createPetalMaterial(layer.color ?? color, roughness, sheen, layer.profile.spots), [layer.color, color, roughness, sheen, layer.profile.spots]);
  const morph = useMemo(() => new Mesh(geometry, material), [geometry, material]);
  const petals = useMemo(() => {
    const random = seededRandom(seed);
    return Array.from({ length: layer.count }, (_, i) => ({
      theta: i / layer.count * Math.PI * 2 + (layer.offset ?? 0) + (random() - .5) * .12,
      length: 1 + (random() - .5) * (layer.variation ?? .15),
      width: .94 + random() * .12, tilt: (random() - .5) * .12,
      twist: (random() - .5) * .17, shade: .88 + random() * .19, phase: random() * 6.28,
    }));
  }, [layer, seed]);
  useLayoutEffect(() => {
    if (!mesh.current) return;
    mesh.current.instanceMatrix.setUsage(DynamicDrawUsage);
    const tint = new Color();
    petals.forEach((p, i) => { mesh.current!.setColorAt(i, tint.setRGB(p.shade, p.shade, p.shade)); morph.morphTargetInfluences![0] = 1; mesh.current!.setMorphAt(i, morph); });
    if (mesh.current.instanceColor) mesh.current.instanceColor.needsUpdate = true;
  }, [petals, morph]);
  useEffect(() => () => { geometry.dispose(); material.dispose(); }, [geometry, material]);
  useFrame(() => {
    if (!mesh.current) return;
    petals.forEach((p, i) => {
      const open = petalOpenness(bloom.current, layer.delay ?? 0, p.phase);
      const flutter = Math.sin(time.current * 1.6 + p.phase) * .012 * wind * open;
      const response = Math.cos(p.theta - cursor.current) * .01 * open;
      dummy.position.set(Math.sin(p.theta) * layer.radius * (.3 + .7 * open), layer.height * (.55 + .45 * open), Math.cos(p.theta) * layer.radius * (.3 + .7 * open));
      dummy.rotation.set(0, p.theta, 0);
      dummy.rotateX(-.12 + (layer.angle + .12 + p.tilt) * open + flutter + response + pulse.current * .075 * open);
      dummy.rotateZ(p.twist * (.2 + .8 * open));
      dummy.scale.set(p.width * (.6 + .4 * open), p.length * (.9 + .1 * open), .65 + .35 * open);
      dummy.updateMatrix(); mesh.current!.setMatrixAt(i, dummy.matrix);
      morph.morphTargetInfluences![0] = 1 - open;
      mesh.current!.setMorphAt(i, morph);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
    if (mesh.current.morphTexture) mesh.current.morphTexture.needsUpdate = true;
  });
  return <instancedMesh ref={mesh} args={[geometry, material, layer.count]} castShadow frustumCulled={false} />;
}
