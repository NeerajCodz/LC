import {
  Bloom,
  DepthOfField,
  EffectComposer,
  Vignette,
  N8AO,
} from "@react-three/postprocessing";
export function PostProcessing({ macro = false }: { macro?: boolean }) {
  return (
    <EffectComposer multisampling={4}>
      <N8AO
        aoRadius={0.22}
        distanceFalloff={1}
        intensity={1.2}
        quality="medium"
        halfRes
      />
      <Bloom luminanceThreshold={1.8} intensity={0.09} mipmapBlur />
      <DepthOfField
        target={[0, 0.45, 0]}
        focalLength={macro ? 0.09 : 0.16}
        bokehScale={macro ? 1.6 : 0.65}
        height={360}
      />
      <Vignette offset={0.25} darkness={0.38} />
    </EffectComposer>
  );
}
