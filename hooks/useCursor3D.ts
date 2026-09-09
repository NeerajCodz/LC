import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Plane, Vector3, Vector2 } from 'three';
import { damp } from '@/lib/three/easing';

export function useCursor3D() {
  const data = useRef({ point: new Vector3(100, 100, 0), previous: new Vector2(), velocity: 0, plane: new Plane(new Vector3(0, 0, 1), 0), initialized: false });
  useFrame(({ raycaster, pointer, camera }, dt) => {
    const d = data.current;
    raycaster.setFromCamera(pointer, camera);
    raycaster.ray.intersectPlane(d.plane, d.point);
    const velocity = d.initialized ? pointer.distanceTo(d.previous) / Math.max(dt, .008) : 0;
    d.velocity = damp(d.velocity, Math.min(velocity, 8), 4, dt);
    d.previous.copy(pointer); d.initialized = true;
  });
  return data;
}
