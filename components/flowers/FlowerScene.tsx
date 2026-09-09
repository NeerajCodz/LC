'use client';
import { Suspense, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { AdaptiveDpr, ContactShadows, PerformanceMonitor } from '@react-three/drei';
import { ACESFilmicToneMapping, PCFSoftShadowMap } from 'three';
import type { FlowerType } from '@/lib/flowers/types';
import { useExperienceSettings } from '@/hooks/useExperienceSettings';
import { Lighting } from '../scene/Lighting';
import { Environment } from '../scene/Environment';
import { CameraRig, type ViewAngle } from '../scene/CameraRig';
import { PostProcessing } from '../scene/PostProcessing';
import { Pollen } from '../scene/Pollen';
import { Flower } from './Flower';

export interface SceneProps { type: FlowerType; bloom: number; macro?: boolean; paused?: boolean; pulse?: number; angle?: ViewAngle; onFlowerClick?: () => void; onReady?: () => void }
export default function FlowerScene({ type, bloom, macro=false, paused=false, pulse=0, angle, onFlowerClick, onReady }: SceneProps) {
  const {quality,reducedMotion}=useExperienceSettings();
  const [hovered,setHovered]=useState(false),[degraded,setDegraded]=useState(false);
  const [available]=useState(()=>{const context=document.createElement('canvas').getContext('webgl2');const supported=!!context;context?.getExtension('WEBGL_lose_context')?.loseContext();return supported;});
  if(!available) return <div className="webgl-message"><p>This collection needs WebGL 2.</p><span>Enable hardware acceleration in your browser, then reload.</span><button onClick={()=>location.reload()}>Try again</button></div>;
  return <Canvas className={hovered?'flower-canvas is-hovered':'flower-canvas'} shadows={quality!=='low'} dpr={quality==='low'||degraded?1:[1,1.75]} camera={{position:[0,1.5,7.5],fov:38,near:.1,far:45}} gl={{antialias:true,alpha:false,powerPreference:'high-performance',toneMapping:ACESFilmicToneMapping,toneMappingExposure:1.05}} onCreated={({gl})=>{gl.shadowMap.type=PCFSoftShadowMap;onReady?.();}}>
    <color attach="background" args={['#101713']} />
    <fog attach="fog" args={['#101713',11,25]} />
    <Suspense fallback={null}>
      <Lighting shadows={quality!=='low'} /><Environment />
      <Flower key={type} type={type} position={[0,.5,0]} bloom={bloom} quality={degraded?'medium':quality} windStrength={.8} interactive hovered={hovered} reducedMotion={reducedMotion} paused={paused} pulse={pulse} onHover={setHovered} onClick={onFlowerClick} />
      <ContactShadows position={[0,-1.78,0]} opacity={.22} scale={14} blur={3.5} far={5} resolution={256} frames={1} />
      {!reducedMotion&&<Pollen count={quality==='low'?22:80} bloom={bloom} pulse={pulse} paused={paused} />}
      {quality==='high'&&!degraded&&<PostProcessing macro={macro} />}
    </Suspense>
    <CameraRig macro={macro} reducedMotion={reducedMotion} paused={paused} angle={angle} />
    <AdaptiveDpr pixelated /><PerformanceMonitor onDecline={()=>setDegraded(true)} />
  </Canvas>;
}
