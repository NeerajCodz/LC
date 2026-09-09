import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { InstancedMesh, Object3D } from "three";
import { seededRandom } from "@/lib/three/noise";
import { useCursor3D } from "@/hooks/useCursor3D";
export function Pollen({
  count = 70,
  bloom,
  pulse,
  paused = false,
}: {
  count?: number;
  bloom: number;
  pulse: number;
  paused?: boolean;
}) {
  const mesh = useRef<InstancedMesh>(null),
    time = useRef(0),
    burst = useRef(10),
    previous = useRef(pulse);
  const cursor = useCursor3D();
  const dummy = useMemo(() => new Object3D(), []);
  const points = useMemo(() => {
    const random = seededRandom(93);
    return Array.from({ length: count }, () => ({
      x: (random() - 0.5) * 7,
      y: (random() - 0.5) * 5,
      z: (random() - 0.5) * 5,
      size: 0.003 + random() * 0.009,
      phase: random() * 6.28,
      speed: 0.06 + random() * 0.05,
    }));
  }, [count]);
  useFrame((_, dt) => {
    if (!mesh.current || paused) return;
    time.current += Math.min(dt, 0.05);
    burst.current += dt;
    if (previous.current !== pulse) {
      previous.current = pulse;
      burst.current = 0;
    }
    points.forEach((p, i) => {
      const t = time.current,
        wave = Math.exp(-burst.current * 1.4) * Math.sin(burst.current * 2.3);
      dummy.position.set(
        p.x + Math.sin(t * 0.16 + p.phase) * 0.24 + wave * p.x * 0.12,
        ((p.y + t * p.speed + 3) % 6) - 3,
        p.z + Math.cos(t * 0.13 + p.phase) * 0.2,
      );
      const proximity = Math.max(
        0,
        1 - dummy.position.distanceTo(cursor.current.point) / 2,
      );
      dummy.position.x += proximity * cursor.current.velocity * 0.025;
      dummy.scale.setScalar(p.size * Math.max(0, bloom - 0.25) * (1 + wave));
      dummy.updateMatrix();
      mesh.current!.setMatrixAt(i, dummy.matrix);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
  });
  return (
    <instancedMesh
      ref={mesh}
      args={[undefined, undefined, count]}
      frustumCulled={false}
    >
      <icosahedronGeometry args={[1, 0]} />
      <meshStandardMaterial
        color="#cfbd8e"
        emissive="#bc9c62"
        emissiveIntensity={0.16}
        roughness={0.7}
        transparent
        opacity={0.48}
      />
    </instancedMesh>
  );
}
