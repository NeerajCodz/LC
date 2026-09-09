import { Bloom, DepthOfField, EffectComposer, Vignette } from '@react-three/postprocessing';
export function PostProcessing({ macro = false }: { macro?: boolean }) {
  return <EffectComposer multisampling={4}>
    <Bloom luminanceThreshold={1.8} intensity={.09} mipmapBlur />
    <DepthOfField target={[0,.45,0]} focalLength={macro ? .09 : .16} bokehScale={macro ? 1.6 : .65} height={360} />
    <Vignette offset={.25} darkness={.38} />
  </EffectComposer>;
}
