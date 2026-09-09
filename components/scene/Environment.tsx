import { Environment as Studio, Lightformer } from "@react-three/drei";
export function Environment({ resolution = 128 }: { resolution?: number }) {
  return (
    <Studio resolution={resolution} frames={1}>
      <Lightformer
        form="rect"
        intensity={0.85}
        color="#fff6ee"
        position={[-3, 4, 2]}
        scale={[3, 5, 1]}
        rotation={[0, Math.PI / 3, 0]}
      />
      <Lightformer
        form="rect"
        intensity={0.4}
        color="#d8e2ed"
        position={[4, 2, 1]}
        scale={[2, 4, 1]}
        rotation={[0, -Math.PI / 3, 0]}
      />
      <Lightformer form="ring" intensity={1} position={[0, 4, -4]} scale={3} />
    </Studio>
  );
}
