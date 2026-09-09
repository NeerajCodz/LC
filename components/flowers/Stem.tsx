import { useMemo, useEffect, useRef, type RefObject } from 'react';
import { useFrame } from '@react-three/fiber';
import { BufferGeometry, Float32BufferAttribute, Group, MeshStandardMaterial } from 'three';
import type { FlowerStructure, Quality } from '@/lib/flowers/types';
import { createPetalGeometry, PETAL } from '@/lib/three/geometry';
import { layeredWind } from '@/lib/three/noise';

function stemGeometry(length: number, radius: number) {
  const p: number[] = [], uv: number[] = [], ix: number[] = [];
  for (let j = 0; j <= 28; j++) for (let i = 0; i <= 10; i++) {
    const t = j / 28, a = i / 10 * Math.PI * 2, r = radius * (1.35 - .45 * t);
    p.push(Math.cos(a) * r + Math.sin(t * 3.14) * .07, -length * (1 - t), Math.sin(a) * r); uv.push(i / 10, t);
    if (j < 28 && i < 10) { const k = j * 11 + i; ix.push(k, k + 1, k + 12, k, k + 12, k + 11); }
  }
  const g = new BufferGeometry(); g.setAttribute('position', new Float32BufferAttribute(p, 3)); g.setAttribute('uv', new Float32BufferAttribute(uv, 2)); g.setIndex(ix); g.computeVertexNormals(); return g;
}
export function Stem({ structure, quality, growth, time, wind, leaves }: { structure: FlowerStructure; quality: Quality; growth: RefObject<number>; time: RefObject<number>; wind: number; leaves: boolean }) {
  const root = useRef<Group>(null);
  const leafRefs = useRef<(Group | null)[]>([]);
  const geometry = useMemo(() => stemGeometry(structure.stemLength, structure.stemRadius), [structure]);
  const leaf = useMemo(() => createPetalGeometry({ ...PETAL, length: structure.leafShape === 'needle' ? .55 : .82, width: structure.leafShape === 'broad' ? .68 : structure.leafShape === 'needle' ? .055 : .37, taper: structure.leafShape === 'round' ? .35 : .85, cup: .18, curl: .27, edge: .05, thickness: .009, ripple: structure.leafShape === 'serrated' ? .014 : .003 }, 73, quality), [structure.leafShape, quality]);
  const material = useMemo(() => {
    const m = new MeshStandardMaterial({ color: '#3d602b', roughness: .74, vertexColors: true });
    m.onBeforeCompile = (s) => {
      s.vertexShader = s.vertexShader.replace('#include <common>', '#include <common>\nvarying vec2 vLeafUv;').replace('#include <begin_vertex>', '#include <begin_vertex>\nvLeafUv = uv;');
      s.fragmentShader = s.fragmentShader.replace('#include <common>', '#include <common>\nvarying vec2 vLeafUv;').replace('#include <color_fragment>', `#include <color_fragment>
        float midrib = exp(-abs(vLeafUv.x-.5)*120.);
        float veins = pow(abs(cos((vLeafUv.y - abs(vLeafUv.x-.5)*.5)*115.)),24.);
        diffuseColor.rgb *= .85 + midrib * .45 + veins * .14;`);
    }; return m;
  }, []);
  useEffect(() => () => { geometry.dispose(); leaf.dispose(); material.dispose(); }, [geometry, leaf, material]);
  useFrame(() => {
    if (root.current) root.current.scale.y = .03 + .97 * growth.current;
    leafRefs.current.forEach((group, i) => {
      if (!group) return;
      const unfold = Math.max(.025, Math.min(1, (growth.current - .25) / .75));
      group.rotation.x = (.22 + unfold * .82) + layeredWind(time.current - i * .2, i * 2) * .045 * wind;
      group.scale.setScalar(unfold);
    });
  });
  return <group ref={root}>
    <mesh geometry={geometry} castShadow><meshStandardMaterial color="#405335" roughness={.88} /></mesh>
    {leaves && Array.from({ length: structure.leafCount }, (_, i) => <group key={i} position={[0, -structure.stemLength * (.32 + i * .19), 0]} rotation={[0, i * 2.4 + .7, 0]}>
      <group ref={el => { leafRefs.current[i] = el; }}><mesh geometry={leaf} material={material} onUpdate={m=>m.updateMorphTargets()} castShadow receiveShadow /></group>
    </group>)}
  </group>;
}
