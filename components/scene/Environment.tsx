import { Environment as Studio, Lightformer } from '@react-three/drei';
export function Environment() {
  return <Studio resolution={128} frames={1}>
    <Lightformer form="rect" intensity={1.3} color="#ffe8d4" position={[-3,4,2]} scale={[3,5,1]} rotation={[0,Math.PI/3,0]} />
    <Lightformer form="rect" intensity={.4} color="#b9cad1" position={[4,2,1]} scale={[2,4,1]} rotation={[0,-Math.PI/3,0]} />
    <Lightformer form="ring" intensity={1} position={[0,4,-4]} scale={3} />
  </Studio>;
}
