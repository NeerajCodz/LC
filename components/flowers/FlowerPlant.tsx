import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group } from 'three';
import type { FlowerProps, FlowerStructure } from '@/lib/flowers/types';
import { getFlower } from '@/lib/flowers/catalog';
import { hashString, layeredWind } from '@/lib/three/noise';
import { damp, stepSpring } from '@/lib/three/easing';
import { useBloomAnimation } from '@/hooks/useBloomAnimation';
import { PetalWhorl } from './PetalWhorl';
import { Stem } from './Stem';
import { FlowerCore } from './FlowerCore';
import { Branch } from './Branch';

export function FlowerPlant({ structure, type, color, bloom: target = 1, scale = 1, position = [0,0,0], rotation = [0,0,0], interactive = false, animationSpeed = 1, windStrength = 1, cursorStrength = 1, hovered = false, stem = true, leaves = true, quality = 'high', reducedMotion = false, paused = false, pulse = 0, onHover, onClick }: FlowerProps & { structure: FlowerStructure }) {
  const root = useRef<Group>(null), head = useRef<Group>(null);
  const time = useRef(0), growth = useRef(reducedMotion ? 1 : .03), pulseValue = useRef(0), cursor = useRef(0);
  const previousPulse = useRef(pulse), pulseTime = useRef(100);
  const springs = useRef({ x: { value: 0, velocity: 0 }, z: { value: 0, velocity: 0 } });
  const bloom = useBloomAnimation(Math.min(1, target + (hovered ? .025 : 0)), animationSpeed, reducedMotion, paused);
  const seed = useMemo(() => hashString(type), [type]);
  const wind = reducedMotion ? .04 : windStrength;
  useFrame(({ pointer }, dt) => {
    if (paused) return;
    const delta = Math.min(dt, .05); time.current += delta * animationSpeed;
    growth.current = damp(growth.current, 1, 1.7 * animationSpeed, delta);
    if (pulse !== previousPulse.current) { previousPulse.current = pulse; pulseTime.current = 0; }
    pulseTime.current += delta;
    pulseValue.current = reducedMotion ? 0 : Math.sin(pulseTime.current * 5 - .7) * Math.exp(-pulseTime.current * 1.8) * .9;
    const force = interactive && !reducedMotion ? cursorStrength : 0;
    stepSpring(springs.current.x, pointer.y * .065 * force, delta);
    stepSpring(springs.current.z, -pointer.x * .09 * force, delta);
    cursor.current = Math.atan2(pointer.x, pointer.y);
    const sway = layeredWind(time.current, seed % 31) * .024 * wind;
    if (root.current) { root.current.rotation.z = sway + springs.current.z.value; root.current.rotation.x = springs.current.x.value * .4; }
    if (head.current) {
      head.current.rotation.x = structure.headTilt + springs.current.x.value * .6 + layeredWind(time.current-.3, 1) * .016 * wind;
      head.current.rotation.z = sway * .4;
      head.current.position.y = -(1 - growth.current) * structure.stemLength;
    }
  });
  return <group position={position} rotation={rotation} scale={scale}>
    <group ref={root} onPointerOver={interactive ? e => { e.stopPropagation(); onHover?.(true); } : undefined} onPointerOut={interactive ? () => onHover?.(false) : undefined} onClick={interactive ? e => { e.stopPropagation(); onClick?.(); } : undefined}>
      {stem && <Stem structure={structure} quality={quality} growth={growth} time={time} wind={wind} leaves={leaves} />}
      <group ref={head} rotation={[structure.headTilt,0,0]}>
        {(structure.blossoms ?? [{position:[0,0,0],rotation:[0,0,0],scale:1}]).map((blossom,b)=><group key={b}>
          {structure.blossoms&&<Branch end={blossom.position} color={type==='cherry-blossom'?'#67503a':undefined}/>}
          <group position={blossom.position} rotation={blossom.rotation} scale={blossom.scale}>
            {structure.layers.map((layer,i)=><PetalWhorl key={i} layer={layer} seed={seed+i*127+b*721} color={color??getFlower(type).color} quality={quality} bloom={bloom} time={time} wind={wind} roughness={structure.roughness} sheen={structure.sheen} pulse={pulseValue} cursor={cursor}/>)}
            <FlowerCore structure={structure}/>
          </group>
        </group>)}
        <mesh position={[0,-.10,0]} scale={[.13,.16,.13]} castShadow><sphereGeometry args={[1,16,12]} /><meshStandardMaterial color="#425932" roughness={.8} /></mesh>
      </group>
    </group>
  </group>;
}
