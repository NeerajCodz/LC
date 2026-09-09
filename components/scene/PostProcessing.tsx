import { EffectComposer, Vignette, N8AO } from "@react-three/postprocessing";
import { useTheme } from "@/hooks/useTheme";
export function PostProcessing() {
  const { theme } = useTheme();
  return (
    <EffectComposer multisampling={4}>
      <N8AO
        aoRadius={0.14}
        distanceFalloff={1}
        intensity={0.9}
        quality="high"
      />
      <Vignette offset={0.25} darkness={theme === "white" ? 0.06 : 0.3} />
    </EffectComposer>
  );
}
