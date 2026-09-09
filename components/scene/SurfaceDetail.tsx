import { useEffect } from "react";
import { useThree } from "@react-three/fiber";
import { prepareTissueAtlas } from "@/lib/gpu/tissue-atlas";

/** The optional WebGPU bake never delays Canvas mounting or flower animation. */
export function SurfaceDetail() {
  const gl = useThree((state) => state.gl);
  const invalidate = useThree((state) => state.invalidate);
  useEffect(() => {
    let mounted = true;
    void prepareTissueAtlas().then((backend) => {
      if (!mounted) return;
      gl.domElement.dataset.surfaceDetail = backend;
      invalidate();
    });
    return () => {
      mounted = false;
    };
  }, [gl, invalidate]);
  return null;
}
