import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Vector3 } from 'three';
import { damp } from '@/lib/three/easing';
export type ViewAngle = 'portrait' | 'front' | 'side' | 'three-quarter';
export function CameraRig({ macro = false, reducedMotion = false, paused = false, angle = 'portrait', garden = false }: { macro?: boolean; reducedMotion?: boolean; paused?: boolean; angle?: ViewAngle; garden?: boolean }) {
  const target = useRef(new Vector3()), elapsed = useRef(0);
  const { size } = useThree();
  useFrame(({ camera, pointer }, dt) => {
    if (!paused) elapsed.current += Math.min(dt,.05);
    const mobile = size.width < 700;
    const distance = garden ? (mobile ? 14 : 10) : macro ? 3.0 : mobile ? 7.6 : 6.15;
    const intro = reducedMotion ? 0 : Math.exp(-elapsed.current*.5)*1.2;
    const azimuth = angle === 'side' ? Math.PI/2 : angle === 'three-quarter' ? Math.PI/4 : 0;
    const parallax = reducedMotion || paused ? 0 : .17;
    camera.position.x = damp(camera.position.x, Math.sin(azimuth)*distance+pointer.x*parallax, 2, dt);
    camera.position.y = damp(camera.position.y, (garden ? 3.6 : macro ? 1.55 : 1.5)+pointer.y*parallax, 2, dt);
    camera.position.z = damp(camera.position.z, Math.cos(azimuth)*distance+intro, 2, dt);
    const tx = garden || macro || mobile ? 0 : -.75;
    target.current.x = damp(target.current.x, tx, 2, dt);
    target.current.y = damp(target.current.y, garden ? -.3 : macro ? .55 : -.14, 2, dt);
    camera.lookAt(target.current);
  });
  return null;
}
