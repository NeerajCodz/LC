import { useMemo, useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Color, InstancedMesh, Object3D } from 'three';
import { GOLDEN_ANGLE, seededRandom } from '@/lib/three/noise';
import type { FlowerStructure } from '@/lib/flowers/types';

export function FlowerCore({ structure }: { structure: FlowerStructure }) {
  const mesh = useRef<InstancedMesh>(null);
  const filaments = useRef<InstancedMesh>(null);
  const { center, centerRadius: r, centerHeight: h } = structure;
  const count = center === 'seeds' ? 610 : center === 'florets' ? 230 : center === 'pod' ? 21 : center === 'column' ? 65 : center === 'stamens' ? (r > .23 ? 6 : 27) : 0;
  const stamens = center === 'stamens' || center === 'column';
  const data = useMemo(() => {
    const random = seededRandom(825); const dummy = new Object3D();
    return Array.from({ length: count }, (_, i) => {
      const radius = Math.sqrt((i + .5) / count) * r, a = i * GOLDEN_ANGLE;
      const y = center === 'column' ? h + i / count * .48 : h + (stamens ? .12 + random() * .34 : Math.sqrt(1 - radius * radius / (r * r)) * r * .31);
      const x = Math.cos(a) * radius, z = Math.sin(a) * radius;
      dummy.position.set(x, y, z); dummy.rotation.set(stamens ? .25 : radius * .5, a, 0);
      const size = stamens ? .032 : r / Math.sqrt(count) * .83;
      dummy.scale.set(size, size * (stamens ? 1.8 : .85 + random() * .5), size * .7); dummy.updateMatrix();
      return { matrix: dummy.matrix.clone(), x, y, z, shade: random() };
    });
  }, [count, r, h, stamens, center]);
  useEffect(() => {
    const dummy = new Object3D(), tint = new Color();
    data.forEach((d, i) => {
      mesh.current?.setMatrixAt(i, d.matrix);
      mesh.current?.setColorAt(i, tint.set(center === 'seeds' ? '#32201a' : center === 'pod' ? '#756837' : '#e8b951').multiplyScalar(.6 + d.shade * .6));
      dummy.position.set(d.x * .5, d.y * .5, d.z * .5); dummy.rotation.set(Math.atan2(d.z, d.y), 0, -Math.atan2(d.x, d.y)); dummy.scale.set(.008, Math.sqrt(d.x*d.x+d.y*d.y+d.z*d.z), .008); dummy.updateMatrix(); filaments.current?.setMatrixAt(i, dummy.matrix);
    });
    if (mesh.current) { mesh.current.instanceMatrix.needsUpdate = true; if (mesh.current.instanceColor) mesh.current.instanceColor.needsUpdate = true; }
    if (filaments.current) filaments.current.instanceMatrix.needsUpdate = true;
  }, [data, center]);
  // Keep instance bounds valid after initialization without allocating per frame.
  useFrame(() => { if (mesh.current && !mesh.current.boundingSphere) mesh.current.computeBoundingSphere(); });
  if (!count) return null;
  return <group>
    {(center === 'seeds' || center === 'florets') && <mesh position={[0,h-.025,0]} scale={[r,.11,r]} castShadow receiveShadow><sphereGeometry args={[1,40,20]} /><meshStandardMaterial color={center === 'seeds' ? '#291d12' : '#b78720'} roughness={.92} /></mesh>}
    {center === 'pod' && <mesh position={[0,h-.045,0]}><cylinderGeometry args={[r*1.08,r*.63,.16,40]} /><meshStandardMaterial color="#b5a748" roughness={.64} /></mesh>}
    {center === 'column' && <mesh position={[0,h*.5+.15,0]}><cylinderGeometry args={[.025,.044,h+.3,12]} /><meshStandardMaterial color="#f0b5a2" roughness={.67} /></mesh>}
    <instancedMesh ref={mesh} args={[undefined,undefined,count]} castShadow frustumCulled={false}><sphereGeometry args={[1,8,6]} /><meshStandardMaterial roughness={.86} /></instancedMesh>
    {stamens && <instancedMesh ref={filaments} args={[undefined,undefined,count]}><cylinderGeometry args={[.65,1,1,6]} /><meshStandardMaterial color="#e4c8ad" roughness={.7} /></instancedMesh>}
  </group>;
}
